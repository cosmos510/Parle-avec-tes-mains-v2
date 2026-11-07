import Link from "next/link";

export default function NotFound() {
  return (
    <main 
      className="min-h-screen bg-background flex flex-col items-center justify-center px-4"
      role="main"
      aria-labelledby="not-found-heading"
    >
      <h1 
        id="not-found-heading"
        className="text-[12rem] sm:text-[16rem] font-bold leading-none tracking-tighter"
        aria-label="Erreur 404 - Page non trouvée"
      >
        404
      </h1>
      <p className="text-muted-foreground text-lg mb-8">
        Cette page n&apos;existe pas
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
        aria-label="Retourner à la page d'accueil"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
