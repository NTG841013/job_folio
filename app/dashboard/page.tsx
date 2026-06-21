'use client';

import Navbar from '../components/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge-client';
import { formatDistanceToNow } from '@/lib/utils';
import StatCard from '../components/dashboard/StatCard';
import ActivityItem from '../components/dashboard/ActivityItem';
import ResearchChart from '../components/dashboard/ResearchChart';
import JobsFoundChart from '../components/dashboard/JobsFoundChart';
import MatchScoreChart from '../components/dashboard/MatchScoreChart';
import { AlertCircle, ChevronRight } from 'lucide-react';


export default function DashboardPage() {
  const [profileComplete, setProfileComplete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activities, setActivities] = useState<{
    id: string;
    type: 'job_found' | 'company_researched' | 'resume_tailored';
    title: string;
    time: string;
    rawTime: number;
  }[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState({
    researchData: [] as { day: string; count: number }[],
    jobsFoundData: [] as { day: string; count: number }[],
    matchDistributionData: [] as { range: string; count: number }[]
  });
  const [statsData, setStatsData] = useState({
    totalJobs: 0,
    avgMatchRate: 0,
    companiesResearched: 0,
    jobsThisWeek: 0
  });

  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user: currentUser } } = await insforge.auth.getCurrentUser();
        if (!currentUser) return;

        // Fetch profile completeness
        const { data: profile } = await insforge.database
          .from('profiles')
          .select('is_complete')
          .eq('id', currentUser.id)
          .single();
        
        if (profile) {
          setProfileComplete(profile.is_complete || false);
        }

        // Fetch jobs for stats
        const { data: jobs } = await insforge.database
          .from('jobs')
          .select('match_score, company_research, found_at')
          .eq('user_id', currentUser.id);

        if (jobs) {
          const totalJobs = jobs.length;
          const avgMatchRate = totalJobs > 0 
            ? Math.round(jobs.reduce((acc: number, job: { match_score: number | null }) => acc + (job.match_score || 0), 0) / totalJobs)
            : 0;
          const companiesResearched = jobs.filter((job: { company_research: unknown }) => job.company_research !== null).length;
          
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const jobsThisWeek = jobs.filter((job: { found_at: string | null }) => job.found_at && new Date(job.found_at) >= sevenDaysAgo).length;

          setStatsData({
            totalJobs,
            avgMatchRate,
            companiesResearched,
            jobsThisWeek
          });
        }

        // Fetch recent activities
        const [runsRes, jobsRes] = await Promise.all([
          insforge.database
            .from('agent_runs')
            .select('id, job_title_searched, jobs_found, completed_at, country_searched')
            .eq('user_id', currentUser.id)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(10),
          insforge.database
            .from('jobs')
            .select('id, company, company_research, found_at')
            .eq('user_id', currentUser.id)
            .not('company_research', 'is', null)
            .order('found_at', { ascending: false })
            .limit(10)
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
          .sort((a, b) => b.rawTime - a.rawTime)
          .slice(0, 5);

        setActivities(combined);
        setLoadingActivities(false);
      } catch (e) {
        console.error("[Dashboard] loadData failed:", e);
      }
    }
    loadData();

    async function loadAnalytics() {
      try {
        const response = await fetch('/api/analytics');
        const result = await response.json();
        if (result.success && result.data) {
          setAnalyticsData(result.data);
          if (result.errors && result.errors.length > 0) {
            setAnalyticsError(result.errors[0]);
          }
        } else if (result.error) {
          setAnalyticsError(result.error);
        }
      } catch (e) {
        console.error("[Dashboard] loadAnalytics failed:", e);
        setAnalyticsError("Failed to connect to analytics service.");
      } finally {
        setLoadingAnalytics(false);
      }
    }
    loadAnalytics();
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        {/* Incomplete Profile Banner */}
        {!profileComplete && (
          <div className="mb-8 p-4 bg-accent-muted border border-accent/20 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <AlertCircle size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">Your profile is 65% complete</h4>
                <p className="text-xs text-text-secondary">Complete your profile to get more accurate job matches and tailored resumes.</p>
              </div>
            </div>
            <Link href="/profile" className="flex items-center gap-1 text-sm font-bold text-accent hover:underline group">
              Complete Profile
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        )}

        {/* Analytics Error Banner */}
        {analyticsError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-900">Analytics Connection Issue</h4>
              <p className="text-xs text-red-700">{analyticsError}</p>
            </div>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            label="Total Jobs Found" 
            value={statsData.totalJobs.toString()} 
            sublabelText="All discovered jobs" 
          />
          <StatCard 
            label="Avg. Match Rate" 
            value={`${statsData.avgMatchRate}%`} 
            sublabelText="Based on profile" 
          />
          <StatCard 
            label="Companies Researched" 
            value={statsData.companiesResearched.toString()} 
            sublabelText="Total dossiers created" 
          />
          <StatCard 
            label="Jobs This Week" 
            value={statsData.jobsThisWeek.toString()} 
            sublabelText="Found in last 7 days" 
          />
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-stretch">
          {/* Recent Activity */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
            <h3 className="text-lg font-bold text-text-primary mb-6">Recent Activity</h3>
            <div className="space-y-6 flex-1">
              {loadingActivities ? (
                <div className="flex flex-col gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="w-3 h-3 rounded-full bg-border mt-1.5" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-border rounded w-3/4" />
                        <div className="h-3 bg-border rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length > 0 ? (
                activities.map((activity) => (
                  <ActivityItem 
                    key={activity.id} 
                    type={activity.type} 
                    title={activity.title} 
                    time={activity.time} 
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <p className="text-sm text-text-secondary">No activity yet. Start by searching for jobs.</p>
                  <Link href="/find-jobs" className="mt-4 text-sm font-bold text-accent hover:underline">
                    Find Jobs
                  </Link>
                </div>
              )}
            </div>
            {activities.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border-light text-center">
                <Link href="/activity" className="text-sm font-bold text-accent hover:underline">
                  View all activity
                </Link>
              </div>
            )}
          </div>

          {/* Company Research Activity */}
          {loadingAnalytics ? (
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm h-full flex flex-col animate-pulse">
              <div className="h-6 bg-border rounded w-1/3 mb-6" />
              <div className="flex-1 bg-border/50 rounded-xl" />
            </div>
          ) : (
            <ResearchChart data={analyticsData.researchData} />
          )}
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Jobs Found Over Time */}
          {loadingAnalytics ? (
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm h-full flex flex-col animate-pulse">
              <div className="h-6 bg-border rounded w-1/3 mb-6" />
              <div className="flex-1 bg-border/50 rounded-xl" />
            </div>
          ) : (
            <JobsFoundChart data={analyticsData.jobsFoundData} />
          )}

          {/* Match Score Distribution */}
          {loadingAnalytics ? (
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm h-full flex flex-col animate-pulse">
              <div className="h-6 bg-border rounded w-1/3 mb-6" />
              <div className="flex-1 bg-border/50 rounded-xl" />
            </div>
          ) : (
            <MatchScoreChart data={analyticsData.matchDistributionData} />
          )}
        </div>
      </main>

      <footer className="w-full max-w-7xl mx-auto px-6 py-12 border-t border-border-muted flex flex-col md:flex-row items-center justify-between gap-8 mt-12">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Image src="/logo.png" alt="JobFolio Logo" width={32} height={32} className="rounded-lg" />
          <span className="text-[19px] font-bold text-text-darkest leading-7">JobFolio</span>
        </Link>
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-sm text-text-secondary hover:text-accent transition-colors">Dashboard</Link>
          <Link href="#" className="text-sm text-text-secondary hover:text-accent transition-colors">Privacy Policy</Link>
          <Link href="#" className="text-sm text-text-secondary hover:text-accent transition-colors">Terms & Condition</Link>
        </div>
      </footer>
    </div>
  );
}
