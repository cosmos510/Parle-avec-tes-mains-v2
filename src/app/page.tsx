import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero";
import { RoadmapSection } from "@/components/sections/roadmap";
import { AboutSection } from "@/components/sections/about";

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
