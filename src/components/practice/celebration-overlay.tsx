"use client";

import { useState } from "react";
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
 */
export function CelebrationOverlay({ show }: CelebrationOverlayProps) {
  // State pour les particules - initialisé avec les particules statiques
  const [particles] = useState<ConfettiParticle[]>(STATIC_PARTICLES);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
        >
          {/* Emoji principal */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            className="text-8xl"
          >
            🎉
          </motion.div>

          {/* Confettis */}
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
            >
              {particle.emoji}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
