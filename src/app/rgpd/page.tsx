import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité | Parle avec tes mains",
  description: "Politique de confidentialité et protection des données personnelles.",
};

export default function RGPDPage() {
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

        <h1 className="text-4xl sm:text-5xl font-black mb-4">Politique de confidentialité</h1>
        <p className="text-neutral-500 mb-12">
          Comment vos données sont utilisées (spoiler : elles ne le sont pas).
        </p>

        {/* En bref */}
        <section className="mb-12 p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900">
          <h2 className="text-xl font-bold mb-4">En bref</h2>
          <div className="text-neutral-600 dark:text-neutral-400 space-y-4">
            <p>
              <strong className="text-neutral-900 dark:text-white">Ce site ne collecte aucune donnée personnelle.</strong>
            </p>
            <p>
              Pas de cookies, pas de tracking, pas d&apos;analytics. Le flux de votre webcam 
              est traité uniquement dans votre navigateur et n&apos;est jamais envoyé à un serveur.
            </p>
          </div>
        </section>

        {/* Responsable */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Responsable du traitement</h2>
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Nom</p>
                <p className="font-medium">Maxime Martin</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">Localisation</p>
                <p className="font-medium">Haute-Savoie, France</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 mb-1">Site</p>
                <p className="font-medium">
                  <a 
                    href="https://www.webamax.fr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:underline"
                  >
                    webamax.fr
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Données collectées */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Données collectées</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <p className="font-semibold mb-1">Automatiquement</p>
              <p className="text-neutral-500">Rien. Zéro cookie, zéro analytics, zéro pixel de suivi.</p>
            </div>
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <p className="font-semibold mb-1">Flux webcam</p>
              <p className="text-neutral-500">
                Traité 100% localement dans votre navigateur. Jamais envoyé, jamais stocké.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <p className="font-semibold mb-1">Progression / Score</p>
              <p className="text-neutral-500">
                Stocké uniquement dans votre navigateur (session). Perdu à la fermeture.
              </p>
            </div>
          </div>
        </section>

        {/* Webcam */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Utilisation de la webcam</h2>
          <div className="text-neutral-600 dark:text-neutral-400 space-y-4">
            <p>
              Quand vous activez votre webcam, le flux vidéo est analysé par{" "}
              <strong>MediaPipe</strong> (Google) et un modèle de machine learning 
              qui tournent <strong>directement dans votre navigateur</strong>.
            </p>
            <p>
              Aucune image n&apos;est envoyée à un serveur externe. Tout le traitement 
              se fait en local sur votre appareil.
            </p>
          </div>
        </section>

        {/* Vos droits */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Vos droits RGPD</h2>
          <div className="text-neutral-600 dark:text-neutral-400 space-y-4">
            <p>
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Droit d&apos;accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l&apos;effacement</li>
              <li>Droit à la portabilité</li>
              <li>Droit d&apos;opposition</li>
            </ul>
            <p>
              Comme nous ne collectons aucune donnée, ces droits sont automatiquement 
              respectés.
            </p>
          </div>
        </section>

        {/* Services tiers */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Services tiers</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <p className="font-semibold mb-1">Vercel</p>
              <p className="text-neutral-500">Hébergement du site (serveurs edge globaux).</p>
            </div>
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <p className="font-semibold mb-1">jsDelivr CDN</p>
              <p className="text-neutral-500">Distribution des fichiers MediaPipe.</p>
            </div>
          </div>
        </section>

        {/* Réclamation */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Réclamation</h2>
          <div className="text-neutral-600 dark:text-neutral-400 space-y-4">
            <p>
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez 
              introduire une réclamation auprès de la CNIL :
            </p>
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <p className="font-semibold mb-1">CNIL</p>
              <p className="text-neutral-500">
                3 Place de Fontenoy, TSA 80715<br />
                75334 Paris Cedex 07<br />
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                  www.cnil.fr
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Date */}
        <div className="text-center text-sm text-neutral-500 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          Dernière mise à jour : Novembre 2024
        </div>
      </div>
    </main>
  );
}
