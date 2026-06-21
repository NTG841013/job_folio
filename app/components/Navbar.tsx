'use client';

import { useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge-client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, User, LogOut } from 'lucide-react';
import { signOutAction } from '@/app/auth/actions';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    
    async function loadUser() {
      try {
        const { data: { user }, error } = await insforge.auth.getCurrentUser();
        if (error) {
          console.warn("[Navbar] getCurrentUser error:", error.message);
        }
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

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="w-full bg-surface border-b border-border-muted h-16 flex items-center sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Image src="/logo.png" alt="JobFolio Logo" width={32} height={32} className="rounded-lg" />
          <span className="text-lg font-bold text-text-darkest leading-7">JobFolio</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              isActive('/dashboard') ? 'text-accent' : 'text-text-dark hover:text-accent'
            }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link 
            href="/find-jobs" 
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              isActive('/find-jobs') ? 'text-accent' : 'text-text-dark hover:text-accent'
            }`}
          >
            <Briefcase size={18} />
            Find Jobs
          </Link>
          <Link 
            href="/profile" 
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              isActive('/profile') ? 'text-accent' : 'text-text-dark hover:text-accent'
            }`}
          >
            <User size={18} />
            Profile
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {!user ? (
            <Link 
              href="/login" 
              className="btn-primary px-5 py-2.5 text-sm font-semibold rounded-lg shadow-xs active:scale-[0.98] transition-all"
            >
              Start for free
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                href="/profile" 
                className="w-9 h-9 bg-accent-light rounded-full flex items-center justify-center text-accent font-bold text-xs border border-accent/20 hover:bg-accent/10 transition-colors overflow-hidden shrink-0"
              >
                {user.email?.[0].toUpperCase() || 'U'}
              </Link>
              <button 
                onClick={() => signOutAction()}
                className="flex items-center gap-2 text-sm font-medium text-text-dark hover:text-error transition-colors cursor-pointer"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
