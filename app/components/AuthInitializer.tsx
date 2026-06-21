"use client";

import { useEffect, ReactNode, useState } from "react";
import { insforge } from "@/lib/insforge-client";
import posthog from "posthog-js";

interface AuthInitializerProps {
  user: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  accessToken: string | null;
  refreshToken: string | null;
  children: ReactNode;
}

export function AuthInitializer({ user, accessToken, refreshToken, children }: AuthInitializerProps) {
  const [lastPrimedToken, setLastPrimedToken] = useState<string | null>(null);

  // Prime client SDK during render for immediate availability to children
  if (typeof window !== 'undefined' && accessToken && accessToken !== lastPrimedToken) {
    console.log("[AuthInitializer] Priming client SDK with server-side session");
    const auth = (insforge as any).auth; // eslint-disable-line @typescript-eslint/no-explicit-any
    const sessionData = { user, accessToken, refreshToken };
    
    if (auth.saveSessionFromResponse) {
      auth.saveSessionFromResponse(sessionData);
    } else if ((insforge as any).tokenManager?.saveSession) { // eslint-disable-line @typescript-eslint/no-explicit-any
      (insforge as any).tokenManager.saveSession(sessionData); // eslint-disable-line @typescript-eslint/no-explicit-any
      (insforge as any).http?.setAuthToken(accessToken); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    setLastPrimedToken(accessToken);
  }

  useEffect(() => {
    if (user) {
      posthog.identify(user.id, {
        email: user.email,
      });
      posthog.capture('login_success');
    } else {
      posthog.reset();
    }
  }, [user]);

  return <>{children}</>;
}
