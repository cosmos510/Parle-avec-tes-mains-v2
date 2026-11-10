"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getBadgeById, getRarityColor, Badge } from "@/lib/badges";

export default function ProfilePage() {
  const { user, profile, loading, signOut, updateProfile } = useAuth();
  const router = useRouter();
  
  // États pour l'édition du profil
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  
  // États pour les modales RGPD
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Modification du nom d'affichage
  const handleEditName = () => {
    setNewDisplayName(user?.displayName || "");
    setIsEditingName(true);
    setNameError(null);
  };

  const handleSaveName = async () => {
    if (!newDisplayName.trim()) {
      setNameError("Le nom ne peut pas être vide");
      return;
    }
    
    if (newDisplayName.trim().length < 2) {
      setNameError("Le nom doit faire au moins 2 caractères");
      return;
    }

    setIsSavingName(true);
    setNameError(null);

    try {
      await updateProfile({ displayName: newDisplayName.trim() });
      setIsEditingName(false);
    } catch (error) {
      setNameError("Erreur lors de la mise à jour");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setNewDisplayName("");
    setNameError(null);
  };

  // Export des données RGPD
  const handleExportData = async () => {
    if (!user) return;
    
    setIsExporting(true);
    setActionError(null);
    
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/user/export", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'export");
      }

      const result = await response.json();
      
      // Télécharger directement les données
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `parle-avec-tes-mains-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportSuccess(true);
      setTimeout(() => {
        setShowExportModal(false);
        setExportSuccess(false);
      }, 2000);
    } catch (error) {
      setActionError("Erreur lors de l'export des données");
    } finally {
      setIsExporting(false);
    }
  };

  // Suppression du compte RGPD
  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmText !== "SUPPRIMER") return;
    
    setIsDeleting(true);
    setActionError(null);
    
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/user/delete", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      // Déconnexion et redirection
      await signOut();
      router.push("/?deleted=true");
    } catch (error) {
      setActionError("Erreur lors de la suppression du compte");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white rounded-full animate-spin" />
      </main>
    );
  }

  if (!user || !profile) {
    return null;
  }

  // Calculate level progress
  const xpForNextLevel = profile.currentLevel * 100;
  const xpProgress = (profile.totalXp % 100) / 100 * 100;

  // Get user badges
  const userBadges: (Badge | undefined)[] = (profile.badges || [])
    .map((id: string) => getBadgeById(id))
    .filter(Boolean)
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/" 
            className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            ← Retour
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm text-red-500 hover:text-red-600"
          >
            Déconnexion
          </button>
        </div>

        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
            {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1">
            {isEditingName ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 bg-transparent focus:border-orange-500 focus:outline-none text-lg font-bold"
                  placeholder="Ton nom"
                  autoFocus
                />
                {nameError && (
                  <p className="text-red-500 text-sm">{nameError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveName}
                    disabled={isSavingName}
                    className="px-3 py-1 text-sm rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 disabled:opacity-50"
                  >
                    {isSavingName ? "..." : "Enregistrer"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSavingName}
                    className="px-3 py-1 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="group">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black">{user.displayName || "Utilisateur"}</h1>
                  <button
                    onClick={handleEditName}
                    className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                    title="Modifier le nom"
                  >
                    <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                <p className="text-neutral-500">{user.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 text-center">
            <p className="text-3xl font-black text-orange-500">{profile.currentLevel}</p>
            <p className="text-sm text-neutral-500">Niveau</p>
          </div>
          <div className="p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 text-center">
            <p className="text-3xl font-black">{profile.totalXp}</p>
            <p className="text-sm text-neutral-500">XP Total</p>
          </div>
          <div className="p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 text-center">
            <p className="text-3xl font-black">{profile.currentStreak}</p>
            <p className="text-sm text-neutral-500">Série</p>
          </div>
          <div className="p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 text-center">
            <p className="text-3xl font-black">{profile.lettersMastered.length}</p>
            <p className="text-sm text-neutral-500">Lettres</p>
          </div>
        </div>

        {/* Level progress */}
        <div className="p-6 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold">Progression niveau {profile.currentLevel + 1}</p>
            <p className="text-sm text-neutral-500">{profile.totalXp % 100} / {xpForNextLevel} XP</p>
          </div>
          <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>

        {/* Letters mastered */}
        <div className="p-6 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 mb-8">
          <h2 className="font-semibold mb-4">Lettres maîtrisées</h2>
          {profile.lettersMastered.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.lettersMastered.map((letter) => (
                <span
                  key={letter}
                  className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center font-bold"
                >
                  {letter}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-sm">
              Aucune lettre maîtrisée pour l&apos;instant. <Link href="/practice" className="text-orange-500 hover:underline">Commence à pratiquer !</Link>
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="p-6 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Badges</h2>
            <Link href="/badges" className="text-sm text-orange-500 hover:underline">
              Voir tous →
            </Link>
          </div>
          {userBadges.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {userBadges.map((badge) => badge && (
                <div
                  key={badge.id}
                  className={`px-3 py-2 rounded-xl border ${getRarityColor(badge.rarity)} flex items-center gap-2`}
                >
                  <span className="text-xl">{badge.icon}</span>
                  <span className="text-sm font-medium">{badge.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-sm">
              Aucun badge pour l&apos;instant. <Link href="/practice" className="text-orange-500 hover:underline">Continue à pratiquer !</Link>
            </p>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link
            href="/practice"
            className="flex-1 px-6 py-4 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-center hover:opacity-90 transition-opacity"
          >
            Continuer à pratiquer
          </Link>
          <Link
            href="/friends"
            className="flex-1 px-6 py-4 rounded-full border-2 border-neutral-200 dark:border-neutral-800 font-semibold text-center hover:border-orange-500 transition-colors"
          >
            Mes amis
          </Link>
        </div>

        {/* Section RGPD */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-bold mb-2">Gestion des données</h2>
          <p className="text-sm text-neutral-500 mb-6">
            Conformément au RGPD, tu peux exporter ou supprimer tes données à tout moment.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 font-medium hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exporter mes données
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-red-200 dark:border-red-900/50 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Supprimer mon compte
            </button>
          </div>
        </div>

        {/* Legal links */}
        <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800 text-center">
          <Link href="/mentions-legales" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
            Mentions légales et politique de confidentialité
          </Link>
        </div>
      </div>

      {/* Modal Export */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => !isExporting && setShowExportModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-modal-title"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl"
            >
              {exportSuccess ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Export réussi !</h3>
                  <p className="text-neutral-500 mt-2">Tes données ont été téléchargées.</p>
                </div>
              ) : (
                <>
                  <h3 id="export-modal-title" className="text-xl font-bold mb-2">Exporter mes données</h3>
                  <p className="text-neutral-500 mb-6">
                    Tu vas télécharger un fichier JSON contenant toutes tes données personnelles :
                    profil, progression, badges, statistiques, etc.
                  </p>

                  {actionError && (
                    <p className="text-red-500 text-sm mb-4">{actionError}</p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowExportModal(false)}
                      disabled={isExporting}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 font-medium hover:border-neutral-400 transition-colors disabled:opacity-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="flex-1 px-4 py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isExporting ? "Export en cours..." : "Télécharger"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Suppression */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 id="delete-modal-title" className="text-xl font-bold text-center mb-2">Supprimer mon compte</h3>
              <p id="delete-modal-description" className="text-neutral-500 text-center mb-6">
                Cette action est <strong>irréversible</strong>. Tes données personnelles seront anonymisées 
                conformément au RGPD. Tes scores pourront être conservés de manière anonyme.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Tape <strong>SUPPRIMER</strong> pour confirmer
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="SUPPRIMER"
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-transparent focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>

              {actionError && (
                <p className="text-red-500 text-sm mb-4">{actionError}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText("");
                  }}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 font-medium hover:border-neutral-400 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmText !== "SUPPRIMER"}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:bg-red-300"
                >
                  {isDeleting ? "Suppression..." : "Supprimer définitivement"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
