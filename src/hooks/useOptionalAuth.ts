"use client";

import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook pour pages qui peuvent fonctionner avec ou sans auth.
 * Ne redirige pas vers login - la page fonctionne même sans connexion.
 * Les fonctionnalités liées au profil sont simplement désactivées.
 * 
 * @returns {Object} - user (ou null), loading, isAuthenticated, profile, refreshProfile
 */
export function useOptionalAuth() {
  const { user, loading, profile, refreshProfile } = useAuth();

  return { 
    user, 
    profile,
    loading, 
    isAuthenticated: !!user,
    refreshProfile,
  };
}
