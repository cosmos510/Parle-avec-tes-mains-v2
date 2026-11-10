"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { DuelInviteToast } from "@/components/notifications/DuelInviteToast";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <SocketProvider>
        {children}
        <DuelInviteToast />
      </SocketProvider>
    </AuthProvider>
  );
}
