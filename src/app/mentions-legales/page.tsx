import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales | Parle avec tes mains",
  description: "Mentions légales et informations juridiques du site Parle avec tes mains.",
};

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 pt-16 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-8"
        >
          ← Retour à l&apos;accueil
        </Link>

        <h1 className="text-4xl sm:text-5xl font-black mb-4">Mentions légales</h1>
        <p className="text-neutral-500 mb-12">
          Informations légales du site parle-avec-tes-mains.fr
        </p>

        {/* Éditeur */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Éditeur du site</h2>
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Nom</p>
                <p className="font-medium">Maxime Martin</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">Statut</p>
                <p className="font-medium">Entrepreneur individuel</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">Activité</p>
                <p className="font-medium">Développement web</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">Société</p>
                <p className="font-medium">
                  <a 
                    href="https://www.webamax.fr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:underline"
                  >
                    Webamax
                  </a>
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">Localisation</p>
                <p className="font-medium">Haute-Savoie, France</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">SIRET</p>
                <p className="font-medium font-mono">894 776 431 00025</p>
              </div>
            </div>
          </div>
        </section>

        {/* Hébergement */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Hébergement</h2>
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <p className="font-semibold mb-2">Vercel Inc.</p>
            <p className="text-neutral-500">
              440 N Barranca Ave #4133<br />
              Covina, CA 91723<br />
              États-Unis
            </p>
          </div>
        </section>

        {/* Propriété intellectuelle */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Propriété intellectuelle</h2>
          <div className="text-neutral-600 dark:text-neutral-400 space-y-4">
            <p>
              Ce projet est open source et disponible sur{" "}
              <a 
                href="https://github.com/cosmos510/parle-avec-tes-mains-v2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-500 hover:underline"
              >
                GitHub
              </a>.
            </p>
            <p>
              Le code source est sous licence MIT. Vous êtes libre de l&apos;utiliser, 
              le modifier et le redistribuer.
            </p>
          </div>
        </section>

        {/* Responsabilité */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Limitation de responsabilité</h2>
          <div className="text-neutral-600 dark:text-neutral-400 space-y-4">
            <p>
              Les informations contenues sur ce site sont fournies à titre indicatif. 
              L&apos;éditeur ne saurait garantir l&apos;exactitude, la complétude ou l&apos;actualité 
              des informations diffusées.
            </p>
            <p>
              Ce site est un outil d&apos;apprentissage et ne remplace pas un cours de 
              langue des signes avec un professionnel qualifié.
            </p>
          </div>
        </section>

        {/* Liens */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Liens hypertextes</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Le site peut contenir des liens vers d&apos;autres sites. L&apos;éditeur n&apos;exerce 
            aucun contrôle sur ces sites tiers et décline toute responsabilité quant 
            à leur contenu.
          </p>
        </section>

        {/* Crédits */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Crédits</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <p className="text-sm text-neutral-500 mb-1">Design & Développement</p>
              <p className="font-medium">Maxime Martin</p>
            </div>
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <p className="text-sm text-neutral-500 mb-1">Technologies</p>
              <p className="font-medium">Next.js · MediaPipe · ONNX</p>
            </div>
          </div>
        </section>

        {/* Lien vers RGPD */}
        <div className="text-center pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <Link 
            href="/rgpd"
            className="inline-flex px-6 py-3 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium hover:border-orange-500 transition-colors"
          >
            Voir la politique de confidentialité
          </Link>
        </div>
      </div>
    </main>
  );
}
