"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CelebrationOverlayProps {
  show: boolean;
}

const CONFETTI_EMOJIS = ["⭐", "✨", "🌟", "💫", "🎯"];
const CONFETTI_COUNT = 20;

interface ConfettiParticle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  rotate: number;
  delay: number;
}

/**
 * Génère les particules une seule fois
 */
function generateParticles(): ConfettiParticle[] {
  return Array.from({ length: CONFETTI_COUNT }).map((_, i) => ({
    id: i,
    emoji: CONFETTI_EMOJIS[Math.floor(Math.random() * CONFETTI_EMOJIS.length)],
    x: Math.random() * 400 - 200,
    y: Math.random() * 400 - 200,
    rotate: Math.random() * 360,
    delay: Math.random() * 0.2,
  }));
}

// Particules pré-générées au chargement du module
const STATIC_PARTICLES = generateParticles();

/**
 * Overlay de célébration avec confettis animés
 * Accessible avec role="status" pour les lecteurs d'écran
 */
export function CelebrationOverlay({ show }: CelebrationOverlayProps) {
  // State pour les particules - initialisé avec les particules statiques
  const [particles] = useState<ConfettiParticle[]>(STATIC_PARTICLES);
  const [announced, setAnnounced] = useState(false);

  // Annoncer le succès une seule fois quand show devient true
  useEffect(() => {
    if (show && !announced) {
      setAnnounced(true);
    }
    if (!show) {
      setAnnounced(false);
    }
  }, [show, announced]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          role="status"
          aria-live="polite"
          aria-label="Félicitations ! Lettre validée avec succès"
        >
          {/* Emoji principal */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            className="text-8xl"
            aria-hidden="true"
          >
            🎉
          </motion.div>

          {/* Confettis - purement décoratifs */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                opacity: 1,
                y: 0,
                x: 0,
                scale: 1,
              }}
              animate={{
                opacity: 0,
                y: particle.y,
                x: particle.x,
                scale: 0,
                rotate: particle.rotate,
              }}
              transition={{ duration: 1, delay: particle.delay }}
              className="absolute text-2xl"
              style={{
                left: "50%",
                top: "50%",
              }}
              aria-hidden="true"
            >
              {particle.emoji}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
