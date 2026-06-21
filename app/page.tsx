'use client';

import Navbar from './components/Navbar';
import Image from 'next/image';
import Link from "next/link";
import { useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge-client';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let isSubscribed = true;

    async function loadUser() {
      try {
        const { data: { user } } = await insforge.auth.getCurrentUser();
        if (isSubscribed) {
          setUser(user);
          setLoading(false);
        }
      } catch (e) {
        console.error("[Home] loadUser failed:", e);
        if (isSubscribed) setLoading(false);
      }
    }
    
    loadUser();
    
    return () => { 
      isSubscribed = false; 
    };
  }, []);

  const ctaHref = user ? "/dashboard" : "/login";

  // Prevent hydration mismatch by waiting for mount
  if (!mounted) return null;

  return (
    <div className="relative min-h-screen flex flex-col items-center">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-200 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[60%] h-[80%] bg-info-light blur-[120px] rounded-full opacity-60" />
        <div className="absolute top-[-10%] right-[10%] w-[50%] h-[70%] bg-accent-light blur-[120px] rounded-full opacity-60" />
      </div>

      <Navbar />


      <main className="w-full max-w-7xl mx-auto px-6 pt-20 flex flex-col items-center text-center">
        {/* Hero Section */}
        <section className="mb-20">
          <h1 className="text-[56px] md:text-[72px] font-bold text-text-darkest leading-[1.1] tracking-tight mb-6">
            Job hunting is hard.<br />
            Your tools shouldn&apos;t be.
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10">
            Stop applying blind. JobFolio finds the jobs, researches the companies, and gives you everything you need to stand out.
          </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href={ctaHref} className="btn-primary px-8 py-3.5 flex items-center gap-2 rounded-lg font-semibold shadow-lg active:scale-[0.98] transition-all">
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : user ? "Go to Dashboard" : "Get Started"}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href={user ? "/find-jobs" : "/login"} className="btn-secondary px-8 py-3.5 rounded-lg font-semibold shadow-xs active:scale-[0.98] transition-all">
              Find Your First Match
            </Link>
          </div>

          {/* Dashboard Preview */}
          <div className="relative w-full max-w-5xl mx-auto">
            <div className="bg-surface rounded-2xl shadow-2xl p-2 border border-border-muted overflow-hidden">
              <Image 
                src="/images/dashboard-demo.png" 
                alt="JobFolio Dashboard" 
                width={1200} 
                height={800} 
                className="w-full h-auto rounded-xl"
                style={{ width: "100%", height: "auto" }}
                priority
              />
            </div>
          </div>
        </section>

        {/* Feature 1: Manage Your Job Search */}
        <section className="w-full py-24 grid md:grid-cols-2 gap-16 items-center border-t border-border-muted">
          <div className="text-left">
            <h2 className="text-4xl font-bold text-text-darkest mb-8 leading-tight">
              Manage Your Job<br />Search With Ease
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div className="p-6 bg-surface border border-border rounded-xl shadow-sm hover:border-accent transition-all cursor-default group">
                <h3 className="text-lg font-bold text-text-darkest mb-2 group-hover:text-accent transition-colors">Find jobs that actually fit</h3>
                <p className="text-text-secondary">Search by title and location in over 10 jurisdictions. Get matched roles you can quickly scan.</p>
              </div>
              <div className="p-6 bg-surface border border-border rounded-xl shadow-sm hover:border-accent transition-all cursor-default group">
                <h3 className="text-lg font-bold text-text-darkest mb-2 group-hover:text-accent transition-colors">Know the Company Before You Apply</h3>
                <p className="text-text-secondary">Stop guessing what a company is about. JobFolio browses their site and gives you everything you need to apply with confidence.</p>
              </div>
              <div className="p-6 bg-surface border border-border rounded-xl shadow-sm hover:border-accent transition-all cursor-default group">
                <h3 className="text-lg font-bold text-text-darkest mb-2 group-hover:text-accent transition-colors">Keep track of every application</h3>
                <p className="text-text-secondary">Keep a clear view of every job you&apos;ve found, tailored. Your activity and progress all stay in one simple place.</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <Image 
              src="/images/jobs-lists.png" 
              alt="Job Lists Interface" 
              width={600} 
              height={500} 
              className="w-full h-auto"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        </section>

        {/* Feature 2: Apply With More Confidence */}
        <section className="w-full py-24 grid md:grid-cols-2 gap-16 items-center border-t border-border-muted">
          <div className="order-2 md:order-1 relative">
            <Image 
              src="/images/agnet-log.png" 
              alt="AI Agent Log" 
              width={600} 
              height={500} 
              className="w-full h-auto"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
          <div className="text-left order-1 md:order-2">
            <h2 className="text-4xl font-bold text-text-darkest mb-8 leading-tight">
              Apply With More<br />Confidence, Every Time
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div className="p-6 bg-surface border border-border rounded-xl shadow-sm hover:border-accent transition-all cursor-default group">
                <h3 className="text-lg font-bold text-text-darkest mb-2 group-hover:text-accent transition-colors">Understand your match score</h3>
                <p className="text-text-secondary">See how your profile lines up with each role before you apply. Get a clear breakdown of what fits and what&apos;s missing.</p>
              </div>
              <div className="p-6 bg-surface border border-border rounded-xl shadow-sm hover:border-accent transition-all cursor-default group">
                <h3 className="text-lg font-bold text-text-darkest mb-2 group-hover:text-accent transition-colors">AI-Powered Job Matching</h3>
                <p className="text-text-secondary">Stop guessing which jobs are worth applying to. JobFolio scores every role against your actual skills so you focus on the ones that matter.</p>
              </div>
              <div className="p-6 bg-surface border border-border rounded-xl shadow-sm hover:border-accent transition-all cursor-default group">
                <h3 className="text-lg font-bold text-text-darkest mb-2 group-hover:text-accent transition-colors">Focus on the right roles</h3>
                <p className="text-text-secondary">Filter out low fit jobs and stay on the ones that actually matter. Spend less time sorting and more time applying.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="w-full py-24 border-t border-border-muted flex flex-col items-center">
          <span className="text-xs font-bold text-accent uppercase tracking-widest mb-6">Success Stories</span>
          <div className="max-w-4xl w-full bg-surface border border-border rounded-2xl p-10 shadow-sm flex flex-col items-center text-center">
            <blockquote className="text-2xl md:text-3xl font-medium text-text-darkest mb-10 leading-snug italic">
              &ldquo;I used to spend my evenings copy-pasting resumes. Now I open Jobfolio to see which roles actually fit, so I dont waste time on those that dont. It feels like cheating. Had 3 offers on the table simultaneously.&rdquo;
            </blockquote>
            <div className="flex items-center gap-4">
              <Image 
                src="/images/user-icon.png" 
                alt="Tom Wilson" 
                width={48} 
                height={48} 
                className="rounded-full"
                style={{ width: "48px", height: "auto" }}
              />
              <div className="text-left">
                <div className="font-bold text-text-darkest">Tom Wilson</div>
                <div className="text-sm text-text-secondary">Junior Developer</div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="w-full mb-24 relative overflow-hidden rounded-3xl bg-transparent">
          <div className="absolute inset-0 -z-10 bg-linear-to-br from-accent-light to-info-light opacity-60" />
          <div className="py-20 px-6 flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-bold text-text-darkest mb-6 max-w-2xl leading-tight">
              Your next job search can feel a lot less overwhelming
            </h2>
            <p className="text-lg text-text-secondary mb-10 max-w-xl">
              Set up your profile, upload your resume, and start finding matches in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href={ctaHref} className="btn-primary px-8 py-3.5 flex items-center gap-2 rounded-lg font-semibold shadow-lg active:scale-[0.98] transition-all">
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : user ? "Go to Dashboard" : "Get Started"}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link href={user ? "/find-jobs" : "/login"} className="btn-secondary px-8 py-3.5 rounded-lg font-semibold shadow-xs active:scale-[0.98] transition-all">
                Find Your First Match
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-12 border-t border-border-muted flex flex-col md:flex-row items-center justify-between gap-8">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Image src="/logo.png" alt="JobFolio Logo" width={32} height={32} className="rounded-lg" />
          <span className="text-[19px] font-bold text-text-darkest leading-7">JobFolio</span>
        </Link>
        <div className="flex items-center gap-8">
          <Link href="#" className="text-sm text-text-secondary hover:text-accent transition-colors">Dashboard</Link>
          <Link href="#" className="text-sm text-text-secondary hover:text-accent transition-colors">Privacy Policy</Link>
          <Link href="#" className="text-sm text-text-secondary hover:text-accent transition-colors">Terms & Condition</Link>
        </div>
      </footer>
    </div>
  );
}
