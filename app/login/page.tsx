'use client';

import { insforge } from "@/lib/insforge-client";
import posthog from "posthog-js";
import Image from "next/image";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function LoginContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const errorDetails = searchParams.get("details");
  const [loading, setLoading] = useState<string | null>(null);

  const handleLogin = async (provider: 'google' | 'github') => {
    setLoading(provider);
    posthog.capture('login_started', { provider });
    
    const next = "/"; // Always redirect to homepage after login as requested
    
    const { data, error } = await insforge.auth.signInWithOAuth(provider, {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      skipBrowserRedirect: true,
    });

    if (error) {
      console.error(`${provider} login error:`, error.message);
      setLoading(null);
      return;
    }

    if (data?.codeVerifier) {
      // Store code verifier in a cookie for the callback to use.
      // In production, cross-site OAuth redirects require SameSite=None with Secure.
      const isSecure = window.location.protocol === "https:";
      const sameSite = isSecure ? "None" : "Lax";
      const secureFlag = isSecure ? "; Secure" : "";
      
      // Set both hyphen and underscore versions for maximum compatibility
      document.cookie = `insforge-code-verifier=${data.codeVerifier}; path=/; max-age=3600; SameSite=${sameSite}${secureFlag}`;
    }

    if (data?.url) {
      console.log(`[Login] Redirecting to: ${data.url}`);
      window.location.assign(data.url);
    } else {
      console.error("No redirect URL returned from signInWithOAuth");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">
      {/* Left Pane - Branding & Value Proposition */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent relative flex-col justify-between p-12 text-accent-foreground overflow-hidden">
        {/* Abstract shapes for background */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-surface/10 rounded-full -mr-96 -mt-96 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-dark/20 rounded-full -ml-48 -mb-48 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-24 hover:opacity-90 transition-opacity">
            <Image src="/logo.png" alt="JobFolio Logo" width={40} height={40} className="rounded-xl shadow-lg" />
            <span className="text-2xl font-bold tracking-tight">JobFolio</span>
          </Link>

          <div className="max-w-md">
            <h1 className="text-5xl font-bold leading-[1.1] mb-6 tracking-tight">
              Land your dream job with AI precision.
            </h1>
            <p className="text-xl text-accent-light/90 leading-relaxed font-medium">
              Automate your job search, tailor your resumes, and track every application in one place.
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-auto">
          <div className="grid grid-cols-2 gap-12 border-t border-white/10 pt-8">
            <div>
              <div className="text-4xl font-bold mb-1">10k+</div>
              <div className="text-accent-light/70 text-sm font-medium uppercase tracking-wider">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-1">500k+</div>
              <div className="text-accent-light/70 text-sm font-medium uppercase tracking-wider">Jobs Found</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-24 bg-surface relative">
        {/* Mobile Background Shapes */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[100%] h-[50%] bg-accent-light/30 blur-[120px] rounded-full opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[50%] bg-accent-muted blur-[120px] rounded-full opacity-60" />
        </div>

        <div className="w-full max-w-[400px] flex flex-col">
          <div className="lg:hidden flex items-center gap-2 mb-12">
            <Image src="/logo.png" alt="JobFolio Logo" width={40} height={40} className="rounded-xl shadow-md" />
            <span className="text-2xl font-bold text-text-darkest">JobFolio</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-text-primary mb-3 tracking-tight">Welcome back</h2>
            <p className="text-text-secondary font-medium">
              Enter your credentials to access your account
            </p>
          </div>

          {errorParam && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-sm text-error">
              <p className="font-bold mb-1">Login Failed</p>
              <p>{errorDetails || "An error occurred during authentication. Please try again."}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => handleLogin('google')}
              disabled={!!loading}
              className="btn-secondary w-full flex items-center justify-center gap-3 py-3 rounded-lg !text-text-dark font-semibold shadow-xs active:scale-[0.98] transition-all"
            >
              {loading === 'google' ? (
                 <div className="w-5 h-5 border-2 border-border border-t-accent rounded-full animate-spin" />
              ) : (
                <Image src="/icons/google.svg" alt="Google" width={20} height={20} />
              )}
              Continue with Google
            </button>

            <button
              onClick={() => handleLogin('github')}
              disabled={!!loading}
              className="btn-secondary w-full flex items-center justify-center gap-3 py-3 rounded-lg !text-text-dark font-semibold shadow-xs active:scale-[0.98] transition-all"
            >
              {loading === 'github' ? (
                <div className="w-5 h-5 border-2 border-border border-t-accent rounded-full animate-spin" />
              ) : (
                <Image src="/icons/github.svg" alt="GitHub" width={20} height={20} />
              )}
              Continue with GitHub
            </button>
          </div>

          <div className="relative w-full my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-semibold tracking-widest">
              <span className="bg-surface px-4 text-text-muted">Or continue with</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary" htmlFor="email">Email address</label>
              <input 
                id="email"
                type="email" 
                placeholder="name@example.com" 
                className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent transition-all text-sm font-medium placeholder:text-text-muted"
              />
            </div>
            <button 
              className="btn-primary w-full py-3.5 rounded-lg shadow-lg text-base font-semibold active:scale-[0.98] transition-all"
              onClick={() => alert('Email login not implemented yet. Use Social Auth.')}
            >
              Sign in with Email
            </button>
          </div>

          <p className="mt-12 text-sm text-text-secondary text-center leading-relaxed">
            By continuing, you agree to our{" "}
            <a href="#" className="text-accent font-semibold hover:underline">Terms of Service</a> and{" "}
            <a href="#" className="text-accent font-semibold hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-accent" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
