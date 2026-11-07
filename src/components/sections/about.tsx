"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 px-4 bg-neutral-50 dark:bg-neutral-900/50" ref={ref}>
      <div className="max-w-4xl mx-auto">
        
        {/* Big statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight">
            70 millions
            <span className="block text-2xl sm:text-3xl font-normal text-neutral-500 mt-2">
              de personnes communiquent en langue des signes.
            </span>
          </p>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid sm:grid-cols-2 gap-12 mb-16"
        >
          <div>
            <h3 className="text-xl font-bold mb-3">Comment ça marche</h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Ta webcam capte ta main. MediaPipe trouve les 21 points clés. 
              Un modèle IA devine la lettre. Tout ça en ~30ms, directement 
              dans ton navigateur.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3">Pourquoi c&apos;est gratuit</h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Projet perso devenu open source. Pas de serveur à payer, 
              pas de données à stocker. Le code est sur{" "}
              <a 
                href="https://github.com/cosmos510/parle-avec-tes-mains-v2"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-orange-500 transition-colors"
              >
                GitHub
              </a>.
            </p>
          </div>
        </motion.div>

        {/* Features as simple list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap gap-3"
        >
          {[
            "Temps réel",
            "Sans inscription",
            "100% privé",
            "Fonctionne hors ligne",
            "Open source",
          ].map((feature) => (
            <span
              key={feature}
              className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm"
            >
              {feature}
            </span>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
