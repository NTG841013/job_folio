"use client";

import { useEffect, ReactNode } from "react";
import { insforge } from "@/lib/insforge-client";

interface AuthInitializerProps {
  user: any;
  accessToken: string | null;
  children: ReactNode;
}

export function AuthInitializer({ user, accessToken, children }: AuthInitializerProps) {
  useEffect(() => {
    if (user && accessToken) {
      console.log("[AuthInitializer] Priming client SDK with server-side session");
      // Use the internal tokenManager to save the session
      // This avoids the initial refreshSession call in getCurrentUser()
      (insforge as any).tokenManager.saveSession({
        accessToken,
        user
      });
      // Also set the http client token
      (insforge as any).http.setAuthToken(accessToken);
    }
  }, [user, accessToken]);

  return <>{children}</>;
}
