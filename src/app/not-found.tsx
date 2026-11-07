import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <h1 className="text-[12rem] sm:text-[16rem] font-bold leading-none tracking-tighter">
        404
      </h1>
      <p className="text-muted-foreground text-lg mb-8">
        Cette page n'existe pas
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
