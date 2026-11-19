import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero";
import dynamic from "next/dynamic";
import Script from "next/script";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "Parle avec tes mains",
      "url": "https://www.parle-avec-tes-mains.fr",
      "description": "Application web d'apprentissage de l'alphabet en langue des signes française (LSF) avec reconnaissance en temps réel par webcam.",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR"
      },
      "author": {
        "@type": "Person",
        "name": "Maxime Martin"
      },
      "inLanguage": "fr"
    },
    {
      "@type": "HowTo",
      "name": "Comment apprendre l'alphabet en langue des signes française",
      "description": "Apprenez les 26 lettres de l'alphabet LSF grâce à la reconnaissance par webcam.",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Activer la webcam",
          "text": "Autorisez l'accès à votre webcam. Tout le traitement se fait localement, aucune donnée n'est envoyée."
        },
        {
          "@type": "HowToStep",
          "name": "Choisir un mode",
          "text": "Sélectionnez le mode Pratique libre pour apprendre à votre rythme, ou Sprint A→Z pour vous chronométrer."
        },
        {
          "@type": "HowToStep",
          "name": "Reproduire les signes",
          "text": "Placez votre main devant la caméra et reproduisez la lettre affichée. L'IA détecte votre geste en temps réel."
        },
        {
          "@type": "HowToStep",
          "name": "Progresser",
          "text": "Gagnez de l'XP, débloquez des badges et suivez votre progression dans les statistiques."
        }
      ],
      "totalTime": "PT10M"
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Est-ce que l'application est gratuite ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oui, Parle avec tes mains est 100% gratuit et le restera."
          }
        },
        {
          "@type": "Question",
          "name": "Mes données vidéo sont-elles envoyées sur un serveur ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Non, tout le traitement de l'image se fait localement dans votre navigateur. Aucune donnée vidéo n'est transmise."
          }
        },
        {
          "@type": "Question",
          "name": "Quelles lettres puis-je apprendre ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "L'application permet d'apprendre les 26 lettres de l'alphabet dactylologique de la langue des signes française (LSF)."
          }
        },
        {
          "@type": "Question",
          "name": "Faut-il créer un compte ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Non, vous pouvez utiliser l'application sans inscription. Un compte est optionnel pour sauvegarder votre progression et participer aux duels."
          }
        }
      ]
    }
  ]
};

// Lazy load les sections sous le fold pour améliorer le LCP
const GameModesSection = dynamic(
  () => import("@/components/sections/game-modes").then((mod) => mod.GameModesSection),
  { loading: () => <div className="py-24 px-4 bg-neutral-50 dark:bg-neutral-900/50" aria-hidden="true" /> }
);

const InteractiveDemo = dynamic(
  () => import("@/components/sections/interactive-demo").then((mod) => mod.InteractiveDemo),
  { loading: () => <div className="py-24 px-4" aria-hidden="true" /> }
);

const RoadmapSection = dynamic(
  () => import("@/components/sections/roadmap").then((mod) => mod.RoadmapSection),
  { loading: () => <div className="py-24 px-4" aria-hidden="true" /> }
);

const AboutSection = dynamic(
  () => import("@/components/sections/about").then((mod) => mod.AboutSection),
  { loading: () => <div className="py-24 px-4 bg-neutral-50 dark:bg-neutral-900/50" aria-hidden="true" /> }
);

const FaqSection = dynamic(
  () => import("@/components/sections/faq").then((mod) => mod.FaqSection),
  { loading: () => <div className="py-24 px-4" aria-hidden="true" /> }
);

export default function Home() {
  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />
      <main id="main-content" role="main">
        <HeroSection />
        <InteractiveDemo />
        <GameModesSection />
        <RoadmapSection />
        <AboutSection />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}
