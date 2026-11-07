"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 px-4 border-t border-border" ref={ref}>
      <div className="max-w-5xl mx-auto">
        {/* Big stat with animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <motion.p 
            className="text-8xl sm:text-9xl md:text-[12rem] font-bold tracking-tighter leading-none"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            70<span className="text-muted-foreground/20">M</span>
          </motion.p>
          <motion.p 
            className="text-xl sm:text-2xl text-muted-foreground mt-4 max-w-lg"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            de personnes communiquent en langue des signes. 
            Apprendre l&apos;alphabet, c&apos;est un premier pas.
          </motion.p>
        </motion.div>

        {/* How it works - with fun tech reveal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid sm:grid-cols-2 gap-16 sm:gap-8"
        >
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Comment ça marche
            </h3>
            <p className="text-lg leading-relaxed mb-4">
              Ta webcam capte ta main. MediaPipe trouve les 21 points. 
              Un modèle devine la lettre. Tout ça en local, dans ton navigateur.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Temps réel
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted">
                ~30ms
              </span>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Pourquoi c&apos;est gratuit
            </h3>
            <p className="text-lg leading-relaxed mb-4">
              Projet open source. Pas de serveur, pas de compte, pas de tracking. 
              Le code est sur{" "}
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                GitHub
              </a>.
            </p>
            <p className="text-sm text-muted-foreground">
              Fait par quelqu&apos;un qui voulait juste apprendre à signer.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
