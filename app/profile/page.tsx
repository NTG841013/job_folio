'use client';

import { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge-client";
import Navbar from "@/app/components/Navbar";
import { signOutAction } from "@/app/auth/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import posthog from "posthog-js";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const { data: { user }, error } = await insforge.auth.getCurrentUser();
        if (error) {
          console.warn("[Profile] getCurrentUser error:", error.message);
        }
        console.log("[Profile] Initial User state:", user ? user.email : "null");
        if (mounted) {
          setUser(user);
          setLoading(false);
        }
      } catch (e) {
        console.error("[Profile] loadUser failed:", e);
        if (mounted) setLoading(false);
      }
    }
    
    loadUser();
    
    return () => { 
      mounted = false; 
    };
  }, []);

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      posthog.capture('user_signout');
      posthog.reset();
      await signOutAction();
      // Force a full refresh to clear any client-side caches
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col items-center">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-200 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-20%] left-[10%] w-[60%] h-[80%] bg-info-light blur-[120px] rounded-full opacity-60" />
          <div className="absolute top-[-10%] right-[10%] w-[50%] h-[70%] bg-accent-light blur-[120px] rounded-full opacity-60" />
        </div>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-accent" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-200 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[60%] h-[80%] bg-info-light blur-[120px] rounded-full opacity-60" />
        <div className="absolute top-[-10%] right-[10%] w-[50%] h-[70%] bg-accent-light blur-[120px] rounded-full opacity-60" />
      </div>

      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-6 pt-20 flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <h1 className="text-4xl font-bold text-text-darkest mb-8 leading-tight">
            Profile Settings
          </h1>

          <div className="card-premium p-8 mb-8">
            {user ? (
              <>
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-accent text-2xl font-bold border border-accent/20">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-darkest">
                      {user.email}
                    </h2>
                    <p className="text-text-secondary">
                      Manage your account details and preferences.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="pb-6 border-b border-border-muted">
                    <label className="block text-sm font-medium text-text-darkest mb-2">Email Address</label>
                    <div className="text-text-dark">{user.email}</div>
                  </div>
                  
                  <div className="pb-6 border-b border-border-muted">
                    <label className="block text-sm font-medium text-text-darkest mb-2">User ID</label>
                    <div className="text-sm font-mono text-text-secondary">{user.id}</div>
                  </div>

                  <div>
                    <div className="flex flex-col gap-4">
                      <form onSubmit={handleSignOut}>
                        <button type="submit" className="btn-secondary w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold shadow-xs active:scale-[0.98] transition-all text-error hover:text-error-foreground hover:bg-error border-error/20">
                          Sign Out
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </>
            ) : !loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto mb-6 border border-accent/20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-text-darkest mb-2">Welcome to JobFolio</h3>
                <p className="text-text-secondary mb-8 max-w-sm mx-auto">Create an account or sign in to manage your profile and job applications.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/login" className="btn-primary w-full sm:w-auto px-8 py-2.5 rounded-lg font-semibold shadow-md active:scale-[0.98] transition-all">
                    Sign In
                  </Link>
                  <Link href="/login" className="btn-secondary w-full sm:w-auto px-8 py-2.5 rounded-lg font-semibold shadow-xs active:scale-[0.98] transition-all">
                    Create Account
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          <div className="card-premium p-8 opacity-50 grayscale pointer-events-none">
            <h3 className="text-lg font-bold text-text-darkest mb-4">Job Search Preferences</h3>
            <p className="text-text-secondary mb-6">Coming soon: Set your desired titles, locations, and salary range.</p>
            <div className="h-4 bg-surface-dark/10 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-surface-dark/10 rounded w-1/2"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
