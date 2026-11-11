"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { loadModel, predict, drawLandmarks, Landmark } from '@/lib/onnx-classifier';

// Types MediaPipe
interface MediaPipeHands {
  setOptions: (options: Record<string, unknown>) => void;
  onResults: (callback: (results: MediaPipeResults) => void) => void;
  send: (input: { image: HTMLVideoElement }) => Promise<void>;
  close: () => void;
}

interface MediaPipeResults {
  multiHandLandmarks?: Landmark[][];
}

interface UseMediaPipeHandsReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isStreaming: boolean;
  isLoading: boolean;
  loadingStep: string;
  loadingProgress: number;
  error: string | null;
  predictedLetter: string | null;
  confidence: number;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

// Throttle framerate pour économiser des ressources (30 FPS max)
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

/**
 * Hook gérant MediaPipe Hands + modèle ONNX pour la détection ASL.
 * Optimisé pour les performances.
 */
export function useMediaPipeHands(): UseMediaPipeHandsReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<MediaPipeHands | null>(null);
  const animationRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);
  const lastFrameTimeRef = useRef(0);
  const isPredictingRef = useRef(false);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [predictedLetter, setPredictedLetter] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);

  // Traiter les résultats MediaPipe (optimisé)
  const processResults = useCallback(async (results: MediaPipeResults) => {
    // Éviter les traitements concurrents
    if (isPredictingRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;
    
    const ctx = canvas.getContext('2d', { 
      alpha: false, // Désactiver la transparence pour de meilleures perfs
      desynchronized: true // Mode asynchrone pour éviter le blocking
    });
    if (!ctx) return;

    // Redimensionner le canvas une seule fois si nécessaire
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Mirror le flux vidéo
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks: Landmark[] = results.multiHandLandmarks[0];
      
      // Mirror les landmarks pour correspondre au flux
      const mirroredLandmarks = landmarks.map((lm: Landmark) => ({
        x: 1 - lm.x,
        y: lm.y,
        z: lm.z,
      }));
      
      // Dessiner les landmarks
      drawLandmarks(ctx, mirroredLandmarks, canvas.width, canvas.height);
      
      // Prédire avec le modèle ONNX (non-bloquant)
      isPredictingRef.current = true;
      try {
        const result = await predict(mirroredLandmarks);
        
        if (result) {
          setPredictedLetter(result.letter);
          setConfidence(Math.round(result.confidence * 100));
        } else {
          setPredictedLetter(null);
          setConfidence(0);
        }
      } finally {
        isPredictingRef.current = false;
      }
    } else {
      setPredictedLetter(null);
      setConfidence(0);
    }
  }, []);

  // Initialiser MediaPipe Hands + ONNX
  const initMediaPipe = useCallback(async () => {
    if (handsRef.current) return handsRef.current;
    
    try {
      // Charger le modèle ONNX
      await loadModel();
      
      // Charger MediaPipe Hands
      const { Hands } = await import('@mediapipe/hands');
      
      const hands = new Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0, // 0 = Lite (plus rapide), 1 = Full
        minDetectionConfidence: 0.6, // Un peu plus permissif
        minTrackingConfidence: 0.5,
      });

      handsRef.current = hands as MediaPipeHands;
      return hands as MediaPipeHands;
    } catch (err) {
      console.error('Failed to load MediaPipe:', err);
      throw new Error('Impossible de charger les modèles');
    }
  }, []);

  // Démarrer la caméra
  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadingProgress(0);
      setLoadingStep("Initialisation...");
      
      // Vérifier que les refs sont disponibles
      if (!videoRef.current) {
        console.error('videoRef not available');
        throw new Error('Élément vidéo non disponible');
      }
      
      // Étape 1: Charger le modèle IA
      setLoadingStep("Chargement du modèle IA...");
      setLoadingProgress(15);
      
      // Initialiser MediaPipe et définir le callback
      const hands = await initMediaPipe();
      hands.onResults(processResults);
      
      setLoadingProgress(50);
      setLoadingStep("Accès à la webcam...");
      
      // Étape 2: Obtenir le flux vidéo
      let stream: MediaStream;
      
      // Détecter si on est sur mobile pour adapter la résolution
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const videoConstraints = isMobile 
        ? {
            width: { ideal: 480 },
            height: { ideal: 360 },
            frameRate: { ideal: 24 },
            facingMode: 'user',
          }
        : {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 30 },
            facingMode: 'user',
          };
      
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
        });
      } catch {
        // Fallback : contraintes minimales si les premières échouent
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
      }

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      setLoadingProgress(75);
      setLoadingStep("Préparation de la vidéo...");
      
      // Attendre que la vidéo soit prête
      await new Promise<void>((resolve, reject) => {
        const video = videoRef.current;
        if (!video) {
          reject(new Error('Video element lost'));
          return;
        }
        
        video.onloadedmetadata = async () => {
          try {
            await video.play();
            console.log('Video playing:', video.videoWidth, 'x', video.videoHeight);
            resolve();
          } catch (e) {
            reject(e);
          }
        };
        
        video.onerror = () => reject(new Error('Video error'));
      });
      
      setLoadingProgress(100);
      setLoadingStep("C'est prêt !");
      
      // Marquer comme actif AVANT de démarrer la boucle
      isRunningRef.current = true;
      setIsStreaming(true);
      setIsLoading(false);
      setLoadingStep("");
      setLoadingProgress(0);
      
      // Boucle de détection avec throttling
      const runDetection = async (timestamp: number) => {
        // Vérifier si on doit continuer
        if (!isRunningRef.current) return;
        
        // Throttle: limiter à TARGET_FPS
        const elapsed = timestamp - lastFrameTimeRef.current;
        if (elapsed < FRAME_INTERVAL) {
          animationRef.current = requestAnimationFrame(runDetection);
          return;
        }
        lastFrameTimeRef.current = timestamp;
        
        const video = videoRef.current;
        const handsInstance = handsRef.current;
        
        if (video && handsInstance && video.readyState >= 2) {
          try {
            await handsInstance.send({ image: video });
          } catch (err) {
            console.error('Detection error:', err);
          }
        }
        
        // Continuer la boucle si toujours actif
        if (isRunningRef.current) {
          animationRef.current = requestAnimationFrame(runDetection);
        }
      };
      
      // Démarrer la boucle
      animationRef.current = requestAnimationFrame(runDetection);
    } catch (err) {
      console.error('startCamera error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur caméra';
      const errorName = err instanceof Error ? err.name : '';
      
      if (errorMessage.includes('NotAllowed') || errorMessage.includes('Permission')) {
        setError('Accès à la caméra refusé. Veuillez autoriser l\'accès.');
      } else if (errorMessage.includes('NotFound')) {
        setError('Aucune caméra détectée.');
      } else if (errorName === 'OverconstrainedError' || errorMessage.includes('Overconstrained')) {
        setError('Caméra déjà utilisée par un autre onglet ou application.');
      } else {
        setError(`Erreur: ${errorMessage}`);
      }
      
      isRunningRef.current = false;
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [initMediaPipe, processResults]);

  // Arrêter la caméra
  const stopCamera = useCallback(() => {
    // Arrêter la boucle de détection
    isRunningRef.current = false;
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Arrêter le flux vidéo
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsStreaming(false);
    setPredictedLetter(null);
    setConfidence(0);
  }, []);

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (handsRef.current) {
        handsRef.current.close();
        handsRef.current = null;
      }
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    isStreaming,
    isLoading,
    loadingStep,
    loadingProgress,
    error,
    predictedLetter,
    confidence,
    startCamera,
    stopCamera,
  };
}
