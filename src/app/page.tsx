import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero";
import dynamic from "next/dynamic";

// Lazy load les sections sous le fold pour améliorer le LCP
const RoadmapSection = dynamic(
  () => import("@/components/sections/roadmap").then((mod) => mod.RoadmapSection),
  { loading: () => <div className="py-24 px-4" aria-hidden="true" /> }
);

const AboutSection = dynamic(
  () => import("@/components/sections/about").then((mod) => mod.AboutSection),
  { loading: () => <div className="py-24 px-4 bg-neutral-50 dark:bg-neutral-900/50" aria-hidden="true" /> }
);

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content" role="main">
        <HeroSection />
        <RoadmapSection />
        <AboutSection />
      </main>
      <Footer />
    </>
  );
}
