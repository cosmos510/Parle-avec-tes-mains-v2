/**
 * Classificateur ASL utilisant ton modèle ONNX
 * 
 * MediaPipe détecte les landmarks → on extrait les features → ONNX prédit la lettre
 */

import * as ort from 'onnxruntime-web';

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

// Labels des lettres - utilisé uniquement pour référence
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

let session: ort.InferenceSession | null = null;
let scalerParams: { center_: number[]; scale_: number[] } | null = null;

/**
 * Charge le modèle ONNX et les paramètres du scaler
 */
export async function loadModel(): Promise<void> {
  if (session) return;

  try {
    // Charger le modèle ONNX
    session = await ort.InferenceSession.create('/model.onnx');
    console.log('✅ Modèle ONNX chargé');

    // Charger les paramètres du scaler (si disponibles)
    try {
      const response = await fetch('/model_scaler.json');
      if (response.ok) {
        scalerParams = await response.json();
        console.log('✅ Scaler params chargés');
      }
    } catch {
      console.log('ℹ️ Pas de scaler externe');
    }
  } catch {
    console.warn('⚠️ Modèle ONNX non disponible, utilisation du fallback géométrique');
    // Ne pas throw - on utilise le fallback
  }
}

/**
 * Extrait les features des landmarks (même logique que ton Python)
 */
export function extractFeatures(landmarks: Landmark[]): number[] {
  const wrist = landmarks[0];

  // 1. Coordonnées normalisées par rapport au poignet (21 * 3 = 63 features)
  const normalizedFeatures: number[] = [];
  for (const lm of landmarks) {
    normalizedFeatures.push(lm.x - wrist.x);
    normalizedFeatures.push(lm.y - wrist.y);
    normalizedFeatures.push(lm.z - wrist.z);
  }

  // 2. Distances entre points clés (9 features)
  const keyPoints: [number, number][] = [
    [4, 8], [8, 12], [12, 16], [16, 20],
    [4, 12], [4, 16], [4, 20], [0, 9], [0, 17]
  ];

  const distances: number[] = [];
  for (const [p1, p2] of keyPoints) {
    const dist = Math.sqrt(
      Math.pow(landmarks[p1].x - landmarks[p2].x, 2) +
      Math.pow(landmarks[p1].y - landmarks[p2].y, 2) +
      Math.pow(landmarks[p1].z - landmarks[p2].z, 2)
    );
    distances.push(dist);
  }

  // 3. Angles entre doigts (10 features)
  const fingerTips = [4, 8, 12, 16, 20];
  const fingerBases = [2, 5, 9, 13, 17];
  const angles: number[] = [];

  for (let i = 0; i < fingerTips.length; i++) {
    for (let j = i + 1; j < fingerTips.length; j++) {
      const tip1 = fingerTips[i], tip2 = fingerTips[j];
      const base1 = fingerBases[i], base2 = fingerBases[j];

      const v1 = [
        landmarks[tip1].x - landmarks[base1].x,
        landmarks[tip1].y - landmarks[base1].y
      ];
      const v2 = [
        landmarks[tip2].x - landmarks[base2].x,
        landmarks[tip2].y - landmarks[base2].y
      ];

      const dot = v1[0] * v2[0] + v1[1] * v2[1];
      const norm1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
      const norm2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
      const cosAngle = dot / (norm1 * norm2 + 1e-8);
      const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
      angles.push(angle);
    }
  }

  // 4. Courbures des doigts (5 features)
  const fingers = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 16],
    [17, 18, 19, 20]
  ];
  const curvatures: number[] = [];

  for (const finger of fingers) {
    const p1 = [landmarks[finger[0]].x, landmarks[finger[0]].y];
    const p2 = [landmarks[finger[1]].x, landmarks[finger[1]].y];
    const p3 = [landmarks[finger[2]].x, landmarks[finger[2]].y];

    const v1 = [p2[0] - p1[0], p2[1] - p1[1]];
    const v2 = [p3[0] - p2[0], p3[1] - p2[1]];

    const dot = v1[0] * v2[0] + v1[1] * v2[1];
    const norm1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
    const norm2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
    const cosAngle = dot / (norm1 * norm2 + 1e-8);
    const curvature = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
    curvatures.push(curvature);
  }

  // Total: 63 + 9 + 10 + 5 = 87 features
  return [...normalizedFeatures, ...distances, ...angles, ...curvatures];
}

/**
 * Applique le scaling (si paramètres disponibles)
 */
function applyScaling(features: number[]): number[] {
  if (!scalerParams || !scalerParams.center_ || !scalerParams.scale_) {
    return features;
  }

  return features.map((f, i) => {
    const center = scalerParams!.center_[i] || 0;
    const scale = scalerParams!.scale_[i] || 1;
    return (f - center) / scale;
  });
}

/**
 * Prédit la lettre à partir des landmarks
 */
export async function predict(landmarks: Landmark[]): Promise<{ letter: string; confidence: number } | null> {
  if (landmarks.length !== 21) {
    return null;
  }

  // Si le modèle ONNX est chargé, l'utiliser
  if (session) {
    try {
      let features = extractFeatures(landmarks);
      features = applyScaling(features);

      const inputTensor = new ort.Tensor('float32', Float32Array.from(features), [1, features.length]);
      
      // Ne demander que output_label (pas output_probability qui est un Map non supporté)
      const results = await session.run(
        { input: inputTensor },
        ['output_label'] // Spécifier uniquement les outputs qu'on veut
      );

      const labelOutput = results['output_label'];
      
      if (labelOutput && labelOutput.data) {
        const letter = String(labelOutput.data[0]);
        // Confidence fixe car on ne peut pas lire les probas du Map
        return { letter, confidence: 0.95 };
      }

      return null;
    } catch (error) {
      console.error('Erreur prédiction ONNX:', error);
      // Fallback vers les règles géométriques
      return fallbackClassify(landmarks);
    }
  }

  // Fallback: règles géométriques si pas de modèle ONNX
  return fallbackClassify(landmarks);
}

/**
 * Classification de fallback basée sur des règles géométriques simples
 */
function fallbackClassify(landmarks: Landmark[]): { letter: string; confidence: number } | null {
  // Vérifier quels doigts sont étendus
  const fingers = getFingerStates(landmarks);
  
  // Quelques règles simples
  if (fingers.thumb && !fingers.index && !fingers.middle && !fingers.ring && fingers.pinky) {
    return { letter: 'Y', confidence: 0.85 };
  }
  if (!fingers.thumb && fingers.index && fingers.middle && !fingers.ring && !fingers.pinky) {
    return { letter: 'V', confidence: 0.85 };
  }
  if (fingers.thumb && fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
    return { letter: 'L', confidence: 0.80 };
  }
  if (!fingers.thumb && fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
    return { letter: 'D', confidence: 0.75 };
  }
  if (!fingers.thumb && !fingers.index && !fingers.middle && !fingers.ring && fingers.pinky) {
    return { letter: 'I', confidence: 0.85 };
  }
  if (fingers.index && fingers.middle && fingers.ring && !fingers.pinky && !fingers.thumb) {
    return { letter: 'W', confidence: 0.80 };
  }
  if (fingers.index && fingers.middle && fingers.ring && fingers.pinky && !fingers.thumb) {
    return { letter: 'B', confidence: 0.80 };
  }
  
  return null;
}

/**
 * Détecte si chaque doigt est étendu
 */
function getFingerStates(landmarks: Landmark[]): {
  thumb: boolean;
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
} {
  const isExtended = (tipIdx: number, pipIdx: number): boolean => {
    return landmarks[tipIdx].y < landmarks[pipIdx].y;
  };

  const thumbExtended = (): boolean => {
    const thumbTip = landmarks[4];
    const indexMcp = landmarks[5];
    const pinkyMcp = landmarks[17];
    const palmWidth = Math.abs(indexMcp.x - pinkyMcp.x);
    const thumbDist = Math.abs(thumbTip.x - indexMcp.x);
    return thumbDist > palmWidth * 0.5;
  };

  return {
    thumb: thumbExtended(),
    index: isExtended(8, 6),
    middle: isExtended(12, 10),
    ring: isExtended(16, 14),
    pinky: isExtended(20, 18),
  };
}

/**
 * Dessine les landmarks sur un canvas
 */
export function drawLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  width: number,
  height: number
): void {
  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [9, 10], [10, 11], [11, 12],
    [0, 13], [13, 14], [14, 15], [15, 16],
    [0, 17], [17, 18], [18, 19], [19, 20],
    [5, 9], [9, 13], [13, 17],
  ];

  // Connexions
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
  ctx.lineWidth = 3;

  for (const [i, j] of connections) {
    ctx.beginPath();
    ctx.moveTo(landmarks[i].x * width, landmarks[i].y * height);
    ctx.lineTo(landmarks[j].x * width, landmarks[j].y * height);
    ctx.stroke();
  }

  // Points
  for (const lm of landmarks) {
    ctx.fillStyle = 'rgba(99, 102, 241, 0.9)';
    ctx.beginPath();
    ctx.arc(lm.x * width, lm.y * height, 6, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(lm.x * width, lm.y * height, 3, 0, 2 * Math.PI);
    ctx.fill();
  }
}
