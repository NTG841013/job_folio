'use client';

import { useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge-client';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    
    async function loadUser() {
      try {
        const { data: { user }, error } = await insforge.auth.getCurrentUser();
        if (error) {
          console.warn("[Navbar] getCurrentUser error:", error.message);
        }
        console.log("[Navbar] Initial User state:", user ? user.email : "null");
        if (mounted) {
          setUser(user);
        }
      } catch (e) {
        console.error("[Navbar] loadUser failed:", e);
      }
    }
    
    loadUser();
    
    return () => { 
      mounted = false; 
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const { signOutAction } = await import('@/app/auth/actions');
      await signOutAction();
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <nav className="w-full bg-surface border-b border-border-muted h-16 flex items-center">
      <div className="flex items-center justify-between px-6 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
            <Image src="/logo.png" alt="JobFolio Logo" width={24} height={24} className="invert brightness-0" style={{ width: '22px', height: 'auto' }} />
          </div>
          <span className="text-[19px] font-bold text-text-darkest leading-7">JobFolio</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/dashboard" className="text-sm font-medium text-text-dark hover:text-accent transition-colors">Dashboard</Link>
          <Link href="/find-jobs" className="text-sm font-medium text-text-dark hover:text-accent transition-colors">Find Jobs</Link>
          <Link href="/profile" className="text-sm font-medium text-text-dark hover:text-accent transition-colors">Profile</Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="btn-primary px-5 py-2.5 text-sm font-semibold rounded-lg shadow-xs active:scale-[0.98] transition-all"
          >
            Start for free
          </Link>
        </div>
      </div>
    </nav>
  );
}
