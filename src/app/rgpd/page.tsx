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
          Comment tes données sont collectées, utilisées et protégées.
        </p>

        {/* En bref */}
        <section className="mb-12 p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900">
          <h2 className="text-xl font-bold mb-4">En bref</h2>
          <div className="text-neutral-600 dark:text-neutral-400 space-y-4">
            <p>
              <strong className="text-neutral-900 dark:text-white">Tes données t&apos;appartiennent.</strong>
            </p>
            <p>
              Si tu crées un compte, nous stockons uniquement les données nécessaires au fonctionnement 
              de l&apos;application. Tu peux les exporter ou supprimer ton compte à tout moment depuis ton profil.
            </p>
            <p>
              Le flux de ta webcam est traité uniquement dans ton navigateur et n&apos;est jamais envoyé à un serveur.
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
          
          <h3 className="font-semibold text-lg mb-3 mt-6">Sans compte (visiteur)</h3>
          <div className="space-y-3 mb-6">
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <p className="font-semibold mb-1">Cookies et tracking</p>
              <p className="text-neutral-500">Aucun. Zéro cookie, zéro analytics, zéro pixel de suivi.</p>
            </div>
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <p className="font-semibold mb-1">Flux webcam</p>
              <p className="text-neutral-500">
                Traité 100% localement dans ton navigateur. Jamais envoyé, jamais stocké.
              </p>
            </div>
          </div>

          <h3 className="font-semibold text-lg mb-3">Avec un compte</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <p className="font-semibold mb-1">Données d&apos;identification</p>
              <p className="text-neutral-500">
                Email, nom d&apos;affichage, photo de profil (si connexion Google).
              </p>
            </div>
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <p className="font-semibold mb-1">Progression et statistiques</p>
              <p className="text-neutral-500">
                Lettres maîtrisées, XP, niveau, série de jours, badges obtenus.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <p className="font-semibold mb-1">Scores et classements</p>
              <p className="text-neutral-500">
                Scores des modes Sprint et Challenge pour les leaderboards.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <p className="font-semibold mb-1">Relations sociales</p>
              <p className="text-neutral-500">
                Liste d&apos;amis et demandes d&apos;amis pour les fonctionnalités de duel.
              </p>
            </div>
          </div>
        </section>

        {/* Finalités */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Pourquoi on collecte ces données</h2>
          <div className="text-neutral-600 dark:text-neutral-400 space-y-4">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Authentification :</strong> pour te permettre de te connecter</li>
              <li><strong>Sauvegarde :</strong> pour conserver ta progression entre les sessions</li>
              <li><strong>Classements :</strong> pour afficher les leaderboards</li>
              <li><strong>Social :</strong> pour les fonctionnalités d&apos;amis et de duel</li>
              <li><strong>Gamification :</strong> pour les badges et niveaux</li>
            </ul>
            <p className="mt-4">
              Nous ne vendons jamais tes données et ne les utilisons pas à des fins publicitaires.
            </p>
          </div>
        </section>

        {/* Webcam */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Utilisation de la webcam</h2>
          <div className="text-neutral-600 dark:text-neutral-400 space-y-4">
            <p>
              Quand tu actives ta webcam, le flux vidéo est analysé par{" "}
              <strong>MediaPipe</strong> (Google) et un modèle de machine learning 
              qui tournent <strong>directement dans ton navigateur</strong>.
            </p>
            <p>
              Aucune image n&apos;est envoyée à un serveur externe. Tout le traitement 
              se fait en local sur ton appareil.
            </p>
          </div>
        </section>

        {/* Conservation */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Durée de conservation</h2>
          <div className="text-neutral-600 dark:text-neutral-400 space-y-4">
            <p>
              Tes données sont conservées tant que ton compte est actif. 
            </p>
            <p>
              En cas de suppression de compte, tes données personnelles sont <strong>anonymisées</strong> conformément 
              au RGPD. Les scores peuvent être conservés de manière anonyme pour les classements.
            </p>
          </div>
        </section>

        {/* Vos droits */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Tes droits RGPD</h2>
          <div className="text-neutral-600 dark:text-neutral-400 space-y-4">
            <p>
              Conformément au RGPD, tu disposes des droits suivants :
            </p>
            <div className="space-y-3 mt-4">
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <p className="font-semibold mb-1">Droit d&apos;accès et de portabilité</p>
                <p className="text-neutral-500">
                  Tu peux exporter toutes tes données au format JSON depuis ton profil.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <p className="font-semibold mb-1">Droit de rectification</p>
                <p className="text-neutral-500">
                  Tu peux modifier tes informations depuis ton profil.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <p className="font-semibold mb-1">Droit à l&apos;effacement</p>
                <p className="text-neutral-500">
                  Tu peux supprimer ton compte depuis ton profil. Tes données seront anonymisées.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <p className="font-semibold mb-1">Droit d&apos;opposition</p>
                <p className="text-neutral-500">
                  Tu peux utiliser le site sans compte pour éviter toute collecte de données.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comment exercer */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Comment exercer tes droits</h2>
          <div className="text-neutral-600 dark:text-neutral-400 space-y-4">
            <p>
              La plupart des droits peuvent être exercés directement depuis{" "}
              <Link href="/profile" className="text-orange-500 hover:underline">
                ton profil
              </Link>{" "}
              (section &quot;Gestion des données&quot;).
            </p>
            <p>
              Pour toute autre demande, tu peux me contacter via{" "}
              <a 
                href="https://www.webamax.fr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-500 hover:underline"
              >
                webamax.fr
              </a>.
            </p>
          </div>
        </section>

        {/* Services tiers */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Services tiers</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <p className="font-semibold mb-1">Firebase (Google)</p>
              <p className="text-neutral-500">
                Authentification et base de données. Serveurs en Europe (europe-west1).
              </p>
            </div>
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <p className="font-semibold mb-1">Vercel</p>
              <p className="text-neutral-500">Hébergement du site (serveurs edge globaux).</p>
            </div>
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <p className="font-semibold mb-1">Resend</p>
              <p className="text-neutral-500">Envoi d&apos;emails transactionnels (réinitialisation mot de passe, notifications).</p>
            </div>
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <p className="font-semibold mb-1">jsDelivr CDN</p>
              <p className="text-neutral-500">Distribution des fichiers MediaPipe.</p>
            </div>
          </div>
        </section>

        {/* Sécurité */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Sécurité</h2>
          <div className="text-neutral-600 dark:text-neutral-400 space-y-4">
            <p>
              Nous mettons en œuvre des mesures techniques pour protéger tes données :
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Connexion HTTPS chiffrée</li>
              <li>Authentification sécurisée via Firebase</li>
              <li>Mots de passe hashés (jamais stockés en clair)</li>
              <li>Tokens d&apos;accès à durée limitée</li>
            </ul>
          </div>
        </section>

        {/* Réclamation */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Réclamation</h2>
          <div className="text-neutral-600 dark:text-neutral-400 space-y-4">
            <p>
              Si tu estimes que tes droits ne sont pas respectés, tu peux 
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
          Dernière mise à jour : Novembre 2026
        </div>
      </div>
    </main>
  );
}
