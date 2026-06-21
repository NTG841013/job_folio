'use client';

import Navbar from '../components/Navbar';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge-client';
import { formatDistanceToNow } from '@/lib/utils';
import ActivityItem from '../components/dashboard/ActivityItem';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface Activity {
  id: string;
  type: 'job_found' | 'company_researched' | 'resume_tailored';
  title: string;
  time: string;
  rawTime: number;
}

export default function ActivityPage() {
  const [mounted, setMounted] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function loadActivities() {
      try {
        const { data: { user: currentUser } } = await insforge.auth.getCurrentUser();
        if (!currentUser) {
          setLoading(false);
          return;
        }

        // Fetch activities with a higher limit
        const [runsRes, jobsRes] = await Promise.all([
          insforge.database
            .from('agent_runs')
            .select('id, job_title_searched, jobs_found, completed_at, country_searched')
            .eq('user_id', currentUser.id)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(50),
          insforge.database
            .from('jobs')
            .select('id, company, company_research, found_at')
            .eq('user_id', currentUser.id)
            .not('company_research', 'is', null)
            .order('found_at', { ascending: false })
            .limit(50)
        ]);

        const formattedRuns = (runsRes.data || [])
          .filter((run: { job_title_searched: string | null }) => !run.job_title_searched?.startsWith('Research:'))
          .map((run: { id: string; jobs_found: number | null; job_title_searched: string | null; completed_at: string; country_searched: string | null }) => ({
            id: `run-${run.id}`,
            type: 'job_found' as const,
            title: `Found ${run.jobs_found || 0} jobs for ${run.job_title_searched} in ${run.country_searched?.toUpperCase() || 'US'}`,
            time: formatDistanceToNow(run.completed_at),
            rawTime: new Date(run.completed_at).getTime()
          }));

        const formattedJobs = (jobsRes.data || []).map((job: { id: string; company: string | null; found_at: string }) => ({
          id: `job-${job.id}`,
          type: 'company_researched' as const,
          title: `Researched ${job.company || 'Unknown Company'}`,
          time: formatDistanceToNow(job.found_at),
          rawTime: new Date(job.found_at).getTime()
        }));

        const combined = [...formattedRuns, ...formattedJobs]
          .sort((a, b) => b.rawTime - a.rawTime);

        setActivities(combined);
      } catch (e) {
        console.error("[Activity] loadActivities failed:", e);
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/dashboard" 
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">All Activity</h1>
            <p className="text-sm text-text-secondary">Keep track of your job searches and research</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-surface-secondary/30">
            <h3 className="text-base font-bold text-text-primary">Recent History</h3>
          </div>

          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-accent" size={32} />
                <p className="text-sm text-text-secondary">Loading your activity...</p>
              </div>
            ) : activities.length > 0 ? (
              <div className="divide-y divide-border">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-6 hover:bg-surface-secondary/20 transition-colors">
                    <ActivityItem 
                      type={activity.type} 
                      title={activity.title} 
                      time={activity.time} 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <p className="text-text-secondary mb-4">No activity recorded yet.</p>
                <Link href="/find-jobs" className="btn-primary">
                  Start searching
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full max-w-7xl mx-auto px-6 py-12 border-t border-border-muted flex flex-col md:flex-row items-center justify-between gap-8 mt-auto">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-text-darkest">JobFolio</span>
        </Link>
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-sm text-text-secondary hover:text-accent transition-colors">Dashboard</Link>
          <Link href="#" className="text-sm text-text-secondary hover:text-accent transition-colors">Privacy Policy</Link>
          <Link href="#" className="text-sm text-text-secondary hover:text-accent transition-colors">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
