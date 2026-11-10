"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Utiliser notre API qui envoie via Resend
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok && data.error) {
        throw new Error(data.error);
      }
      
      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          {/* Success icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-black mb-2">Email envoye</h1>
          <p className="text-neutral-500 mb-6">
            Un email de reinitialisation a ete envoye a <span className="font-medium text-neutral-900 dark:text-white">{email}</span>. 
            Verifie ta boite de reception.
          </p>
          
          <Link
            href="/login"
            className="inline-block px-6 py-3 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold hover:opacity-90 transition-opacity"
          >
            Retour a la connexion
          </Link>
          
          <p className="text-sm text-neutral-400 mt-6">
            Pas recu l'email ?{" "}
            <button 
              onClick={() => setSuccess(false)}
              className="text-orange-500 hover:underline"
            >
              Renvoyer
            </button>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black">
            Parle avec tes mains
          </Link>
          <p className="text-neutral-500 mt-2">Reinitialise ton mot de passe</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-transparent focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="ton@email.fr"
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
            {loading ? "Envoi en cours..." : "Envoyer le lien"}
          </button>
        </form>

        {/* Back to login */}
        <p className="text-center text-sm text-neutral-500 mt-6">
          <Link href="/login" className="text-orange-500 font-medium hover:underline">
            ← Retour a la connexion
          </Link>
        </p>
      </div>
    </main>
  );
}
