"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const faqs = [
  {
    question: "Est-ce que l'application est gratuite ?",
    answer: "Oui, Parle avec tes mains est 100% gratuit et le restera.",
  },
  {
    question: "Mes données vidéo sont-elles envoyées sur un serveur ?",
    answer: "Non, tout le traitement de l'image se fait localement dans votre navigateur. Aucune donnée vidéo n'est transmise.",
  },
  {
    question: "Quelles lettres puis-je apprendre ?",
    answer: "L'application permet d'apprendre les 26 lettres de l'alphabet dactylologique de la langue des signes française (LSF).",
  },
  {
    question: "Faut-il créer un compte ?",
    answer: "Non, vous pouvez utiliser l'application sans inscription. Un compte est optionnel pour sauvegarder votre progression et participer aux duels.",
  },
];

function FaqItem({ question, answer, isOpen, onClick }: { 
  question: string; 
  answer: string; 
  isOpen: boolean; 
  onClick: () => void;
}) {
  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800">
      <button
        onClick={onClick}
        className="w-full py-5 flex justify-between items-center text-left gap-4"
        aria-expanded={isOpen}
      >
        <span className="font-medium">{question}</span>
        <span className="text-2xl text-neutral-400 shrink-0" aria-hidden="true">
          {isOpen ? "−" : "+"}
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-40 pb-5" : "max-h-0"}`}
      >
        <p className="text-neutral-600 dark:text-neutral-400">{answer}</p>
      </div>
    </div>
  );
}

export function FaqSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      ref={ref}
      id="faq"
      className="py-24 px-4"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 id="faq-heading" className="text-3xl sm:text-4xl font-black mb-2">
            Questions fréquentes
          </h2>
          <p className="text-neutral-500 mb-10">
            Tout ce que vous devez savoir pour commencer.
          </p>

          <div>
            {faqs.map((faq, i) => (
              <FaqItem
                key={i}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === i}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
