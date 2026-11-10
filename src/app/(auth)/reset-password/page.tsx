"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingCode, setValidatingCode] = useState(true);
  const [email, setEmail] = useState("");
  const [invalidCode, setInvalidCode] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  // Vérifier le code au chargement
  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        setInvalidCode(true);
        setValidatingCode(false);
        return;
      }

      try {
        const userEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(userEmail);
        setValidatingCode(false);
      } catch (err) {
        setInvalidCode(true);
        setValidatingCode(false);
      }
    };

    verifyCode();
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode!, password);
      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
      if (errorMessage.includes("expired-action-code")) {
        setError("Le lien a expire. Demande un nouveau lien.");
      } else if (errorMessage.includes("invalid-action-code")) {
        setError("Le lien est invalide. Demande un nouveau lien.");
      } else if (errorMessage.includes("weak-password")) {
        setError("Le mot de passe est trop faible");
      } else {
        setError("Erreur lors de la reinitialisation");
      }
    } finally {
      setLoading(false);
    }
  };

  // État de chargement
  if (validatingCode) {
    return (
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-neutral-500">Verification du lien...</p>
      </div>
    );
  }

  // Lien invalide
  if (invalidCode) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-black mb-2">Lien invalide</h1>
        <p className="text-neutral-500 mb-6">
          Ce lien de reinitialisation est invalide ou a expire. 
          Demande un nouveau lien.
        </p>
        
        <Link
          href="/forgot-password"
          className="inline-block px-6 py-3 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold hover:opacity-90 transition-opacity"
        >
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  // Succès
  if (success) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-black mb-2">Mot de passe modifie</h1>
        <p className="text-neutral-500 mb-6">
          Ton mot de passe a ete reinitialise avec succes. 
          Tu peux maintenant te connecter.
        </p>
        
        <Link
          href="/login"
          className="inline-block px-6 py-3 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold hover:opacity-90 transition-opacity"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  // Formulaire
  return (
    <div className="w-full max-w-sm">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-black">
          Parle avec tes mains
        </Link>
        <p className="text-neutral-500 mt-2">
          Nouveau mot de passe pour <span className="font-medium">{email}</span>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Nouveau mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-transparent focus:border-orange-500 focus:outline-none transition-colors"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-transparent focus:border-orange-500 focus:outline-none transition-colors"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Modification..." : "Modifier le mot de passe"}
        </button>
      </form>

      {/* Back to login */}
      <p className="text-center text-sm text-neutral-500 mt-6">
        <Link href="/login" className="text-orange-500 font-medium hover:underline">
          ← Retour a la connexion
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">Chargement...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
