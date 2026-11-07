/**
 * Classificateur ASL utilisant ton modèle ONNX
 * 
 * MediaPipe détecte les landmarks → on extrait les features → ONNX prédit la lettre
 * 
 * Optimisé pour les performances avec WASM SIMD et caching.
 */

import * as ort from 'onnxruntime-web';

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

let session: ort.InferenceSession | null = null;
let isLoading = false;

// Cache pour réutiliser les tensors
let cachedInputTensor: ort.Tensor | null = null;
let cachedFeatureArray: Float32Array | null = null;
const FEATURE_COUNT = 87; // 63 + 9 + 10 + 5

/**
 * Charge le modèle ONNX avec configuration optimisée
 */
export async function loadModel(): Promise<void> {
  if (session || isLoading) return;
  isLoading = true;

  try {
    // Configuration ONNX Runtime optimisée
    ort.env.wasm.numThreads = navigator.hardwareConcurrency || 4;
    ort.env.wasm.simd = true;
    
    // Charger le modèle ONNX avec options de performance
    session = await ort.InferenceSession.create('/model.onnx', {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
      enableCpuMemArena: true,
      enableMemPattern: true,
    });
    
    // Pré-allouer le buffer pour les features
    cachedFeatureArray = new Float32Array(FEATURE_COUNT);
    
    console.log('✅ Modèle ONNX chargé (optimisé)');
  } catch (error) {
    console.warn('⚠️ Modèle ONNX non disponible, utilisation du fallback géométrique', error);
  } finally {
    isLoading = false;
  }
}

/**
 * Extrait les features des landmarks (optimisé avec buffer réutilisable)
 */
export function extractFeatures(landmarks: Landmark[]): Float32Array {
  const features = cachedFeatureArray || new Float32Array(FEATURE_COUNT);
  let idx = 0;
  
  const wrist = landmarks[0];
  const wristX = wrist.x;
  const wristY = wrist.y;
  const wristZ = wrist.z;

  // 1. Coordonnées normalisées par rapport au poignet (21 * 3 = 63 features)
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    features[idx++] = lm.x - wristX;
    features[idx++] = lm.y - wristY;
    features[idx++] = lm.z - wristZ;
  }

  // 2. Distances entre points clés (9 features)
  const keyPoints: [number, number][] = [
    [4, 8], [8, 12], [12, 16], [16, 20],
    [4, 12], [4, 16], [4, 20], [0, 9], [0, 17]
  ];

  for (let i = 0; i < keyPoints.length; i++) {
    const [p1, p2] = keyPoints[i];
    const dx = landmarks[p1].x - landmarks[p2].x;
    const dy = landmarks[p1].y - landmarks[p2].y;
    const dz = landmarks[p1].z - landmarks[p2].z;
    features[idx++] = Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // 3. Angles entre doigts (10 features)
  const fingerTips = [4, 8, 12, 16, 20];
  const fingerBases = [2, 5, 9, 13, 17];

  for (let i = 0; i < fingerTips.length; i++) {
    for (let j = i + 1; j < fingerTips.length; j++) {
      const tip1 = fingerTips[i], tip2 = fingerTips[j];
      const base1 = fingerBases[i], base2 = fingerBases[j];

      const v1x = landmarks[tip1].x - landmarks[base1].x;
      const v1y = landmarks[tip1].y - landmarks[base1].y;
      const v2x = landmarks[tip2].x - landmarks[base2].x;
      const v2y = landmarks[tip2].y - landmarks[base2].y;

      const dot = v1x * v2x + v1y * v2y;
      const norm1 = Math.sqrt(v1x * v1x + v1y * v1y);
      const norm2 = Math.sqrt(v2x * v2x + v2y * v2y);
      const cosAngle = dot / (norm1 * norm2 + 1e-8);
      features[idx++] = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
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

  for (let i = 0; i < fingers.length; i++) {
    const finger = fingers[i];
    const p1x = landmarks[finger[0]].x, p1y = landmarks[finger[0]].y;
    const p2x = landmarks[finger[1]].x, p2y = landmarks[finger[1]].y;
    const p3x = landmarks[finger[2]].x, p3y = landmarks[finger[2]].y;

    const v1x = p2x - p1x, v1y = p2y - p1y;
    const v2x = p3x - p2x, v2y = p3y - p2y;

    const dot = v1x * v2x + v1y * v2y;
    const norm1 = Math.sqrt(v1x * v1x + v1y * v1y);
    const norm2 = Math.sqrt(v2x * v2x + v2y * v2y);
    const cosAngle = dot / (norm1 * norm2 + 1e-8);
    features[idx++] = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
  }

  return features;
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
      const features = extractFeatures(landmarks);
      
      // Réutiliser ou créer le tensor
      if (!cachedInputTensor || cachedInputTensor.dims[1] !== features.length) {
        cachedInputTensor?.dispose();
        cachedInputTensor = new ort.Tensor('float32', features, [1, features.length]);
      } else {
        // Copier les nouvelles données dans le tensor existant
        const data = cachedInputTensor.data as Float32Array;
        data.set(features);
      }
      
      // Ne demander que output_label
      const results = await session.run(
        { input: cachedInputTensor },
        ['output_label']
      );

      const labelOutput = results['output_label'];
      
      if (labelOutput && labelOutput.data) {
        const letter = String(labelOutput.data[0]);
        return { letter, confidence: 0.95 };
      }

      return null;
    } catch (error) {
      console.error('Erreur prédiction ONNX:', error);
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
  const fingers = getFingerStates(landmarks);
  
  // Règles simples optimisées avec lookup table
  const state = (fingers.thumb ? 16 : 0) + 
                (fingers.index ? 8 : 0) + 
                (fingers.middle ? 4 : 0) + 
                (fingers.ring ? 2 : 0) + 
                (fingers.pinky ? 1 : 0);
  
  const rules: Record<number, { letter: string; confidence: number }> = {
    17: { letter: 'Y', confidence: 0.85 },    // thumb + pinky
    12: { letter: 'V', confidence: 0.85 },    // index + middle
    24: { letter: 'L', confidence: 0.80 },    // thumb + index
    8: { letter: 'D', confidence: 0.75 },     // index only
    1: { letter: 'I', confidence: 0.85 },     // pinky only
    14: { letter: 'W', confidence: 0.80 },    // index + middle + ring
    15: { letter: 'B', confidence: 0.80 },    // index + middle + ring + pinky
  };
  
  return rules[state] || null;
}

/**
 * Détecte si chaque doigt est étendu (optimisé)
 */
function getFingerStates(landmarks: Landmark[]): {
  thumb: boolean;
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
} {
  // Thumb detection
  const thumbTip = landmarks[4];
  const indexMcp = landmarks[5];
  const pinkyMcp = landmarks[17];
  const palmWidth = Math.abs(indexMcp.x - pinkyMcp.x);
  const thumbDist = Math.abs(thumbTip.x - indexMcp.x);
  
  return {
    thumb: thumbDist > palmWidth * 0.5,
    index: landmarks[8].y < landmarks[6].y,
    middle: landmarks[12].y < landmarks[10].y,
    ring: landmarks[16].y < landmarks[14].y,
    pinky: landmarks[20].y < landmarks[18].y,
  };
}

/**
 * Dessine les landmarks sur un canvas (optimisé)
 */
export function drawLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  width: number,
  height: number
): void {
  // Connexions pré-définies
  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [9, 10], [10, 11], [11, 12],
    [0, 13], [13, 14], [14, 15], [15, 16],
    [0, 17], [17, 18], [18, 19], [19, 20],
    [5, 9], [9, 13], [13, 17],
  ];

  // Batch drawing pour les connexions
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
  ctx.lineWidth = 3;

  for (let i = 0; i < connections.length; i++) {
    const [a, b] = connections[i];
    ctx.moveTo(landmarks[a].x * width, landmarks[a].y * height);
    ctx.lineTo(landmarks[b].x * width, landmarks[b].y * height);
  }
  ctx.stroke();

  // Batch drawing pour les points extérieurs
  ctx.fillStyle = 'rgba(99, 102, 241, 0.9)';
  ctx.beginPath();
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    const x = lm.x * width;
    const y = lm.y * height;
    ctx.moveTo(x + 6, y);
    ctx.arc(x, y, 6, 0, Math.PI * 2);
  }
  ctx.fill();

  // Batch drawing pour les points intérieurs
  ctx.fillStyle = 'white';
  ctx.beginPath();
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    const x = lm.x * width;
    const y = lm.y * height;
    ctx.moveTo(x + 3, y);
    ctx.arc(x, y, 3, 0, Math.PI * 2);
  }
  ctx.fill();
}

// Cleanup lors du déchargement de la page
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cachedInputTensor?.dispose();
    session?.release();
  });
}
