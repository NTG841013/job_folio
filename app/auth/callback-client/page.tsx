"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { insforge } from "@/lib/insforge-client";
import posthog from "posthog-js";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Processing login...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function completeOAuth() {
      const code = searchParams.get("code");
      const nextPath = "/"; // Always redirect to homepage after login as requested

      if (!code) {
        setError("Missing OAuth code. Please try again.");
        return;
      }

      try {
        const { data, error: authError } = await insforge.auth.exchangeOAuthCode(code);

        if (authError) {
          console.error("Client callback exchange failed:", authError);
          posthog.capture('login_failed', { error: authError.message });
          setError(authError.message ?? "Unable to complete login.");
          return;
        }

        if (!data) {
          posthog.capture('login_failed', { error: 'No session data' });
          setError("Unable to complete login. No session data was returned.");
          return;
        }

        // Identify user in PostHog
        if (data.user?.id) {
          posthog.identify(data.user.id, {
            email: data.user.email,
          });
          posthog.capture('login_success');
        }

        // SDK standard cookie names (underscore versions as per DEFAULT_ACCESS_TOKEN_COOKIE)
        const isSecure = window.location.protocol === "https:";
        const sameSite = isSecure ? "None" : "Lax";
        const secureFlag = isSecure ? "; Secure" : "";

        const accessTokenName = "insforge_access_token";
        const refreshTokenName = "insforge_refresh_token";

        console.log("Setting cookies manually for SDK compatibility:", data.accessToken.substring(0, 10) + "...");
        document.cookie = `${accessTokenName}=${data.accessToken}; path=/; max-age=${3600*24*7}; SameSite=${sameSite}${secureFlag}`;
        if (data.refreshToken) {
          // Use HttpOnly if we could, but we can't from JS. 
          // The server-side callback/middleware will set the real HttpOnly one.
          document.cookie = `${refreshTokenName}=${data.refreshToken}; path=/; max-age=${3600*24*30}; SameSite=${sameSite}${secureFlag}`;
        }
        
        // Also set a temporary dummy cookie to trigger proxy/middleware to see we are logging in
        document.cookie = `insforge_auth_event=login; path=/; max-age=10; SameSite=${sameSite}${secureFlag}`;
        
        // Use the SDK's saveSessionFromResponse to prime everything properly
        // This handles tokenManager, http client, and CSRF automatically
        if ((insforge.auth as any).saveSessionFromResponse) {
          console.log("Syncing client SDK session via saveSessionFromResponse");
          (insforge.auth as any).saveSessionFromResponse(data);
        } else if (insforge.setAccessToken && data.accessToken) {
          console.log("Syncing client SDK session via setAccessToken");
          insforge.setAccessToken(data.accessToken);
        }

        console.log("Redirecting to:", nextPath);
        window.location.assign(nextPath);
      } catch (unexpected) {
        console.error("Unexpected callback error:", unexpected);
        setError("Unable to complete login. Please try again.");
      }
    }

    completeOAuth();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-10 shadow-lg">
        <h1 className="text-2xl font-semibold text-text-primary mb-4">Finishing sign in</h1>
        <p className="text-sm text-text-secondary mb-6">We are completing your OAuth login in the same browser session.</p>

        {error ? (
          <div className="rounded-lg border border-border-light bg-surface-secondary p-4 text-sm text-text-secondary">
            <p className="font-medium text-text-dark">{error}</p>
            <p className="mt-2">If this keeps happening, return to the login page and try again.</p>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-text-secondary">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent" />
            <span>{status}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackClientPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-accent" /></div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
