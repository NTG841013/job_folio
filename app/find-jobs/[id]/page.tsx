'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import CompanyResearchDossier from '@/app/components/CompanyResearchDossier';
import { insforge } from '@/lib/insforge-client';
import { MATCH_THRESHOLD } from '@/lib/utils';
import { 
  ChevronLeft, 
  ExternalLink, 
  DollarSign, 
  MapPin, 
  Briefcase, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Building2, 
  Search, 
  Loader2
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  job_type: string;
  about_role: string;
  match_score: number;
  match_reason: string;
  matched_skills: string[];
  missing_skills: string[];
  source_url: string;
  external_apply_url: string;
  found_at: string;
  company_research: any;
}

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResearching, setIsResearching] = useState(false);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [researchLogs, setResearchLogs] = useState<any[]>([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isResearching) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [researchLogs, isResearching]);

  useEffect(() => {
    async function fetchJob() {
      try {
        setIsLoading(true);
        const { data, error } = await insforge.database
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setJob(data);
      } catch (error) {
        console.error('Error fetching job:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchJob();
  }, [id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeRunId && isResearching) {
      const fetchLogs = async () => {
        try {
          const { data } = await insforge.database
            .from('agent_logs')
            .select('*')
            .eq('run_id', activeRunId)
            .order('created_at', { ascending: true });
          
          if (data && data.length > 0) {
            setResearchLogs(data);
          }
        } catch (error) {
          console.error('Error fetching logs:', error);
        }
      };
      
      fetchLogs();
      interval = setInterval(fetchLogs, 2000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeRunId, isResearching]);

  const handleResearch = async () => {
    if (!job) return;
    
    try {
      setIsResearching(true);
      const newRunId = crypto.randomUUID();
      setActiveRunId(newRunId);
      setResearchLogs([{ message: 'Initializing research agent...', level: 'info', created_at: new Date().toISOString() }]);
      
      const response = await fetch('/api/agent/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, runId: newRunId })
      });

      const result = await response.json();

      if (result.success) {
        // Refresh job data to show research
        const { data } = await insforge.database
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single();
        setJob(data);
      } else {
        console.error('Research failed:', result.error);
      }
    } catch (error) {
      console.error('Research error:', error);
    } finally {
      setIsResearching(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background pb-20">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 pt-8 flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
          <p className="text-text-secondary">Loading job details...</p>
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-background pb-20">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 pt-8 flex flex-col items-center justify-center py-20">
          <p className="text-text-secondary mb-4">Job not found.</p>
          <Link href="/find-jobs" className="btn-primary">
            Back to Jobs
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-32">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-8 space-y-6">
        {/* Back Link */}
        <Link href="/find-jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Jobs
        </Link>

        {/* Header Card */}
        <section className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-surface-tertiary border border-border flex items-center justify-center overflow-hidden">
              <Building2 className="w-8 h-8 text-text-muted" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-text-primary leading-none">{job.title}</h1>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-text-secondary">{job.company}</span>
                <span className="text-text-muted">•</span>
                <div className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  job.match_score >= MATCH_THRESHOLD ? 'bg-success-lightest text-success' : 'bg-surface-tertiary text-text-muted'
                }`}>
                  {job.match_score}% Match Score
                </div>
              </div>
            </div>
          </div>
          <a 
            href={job.source_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            View Job Post
          </a>
        </section>

        {/* Info Cards Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-success-lightest flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary truncate">{job.salary || '—'}</p>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Salary Est.</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-info-lightest flex items-center justify-center">
              <MapPin className="w-5 h-5 text-info" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-text-primary truncate" title={job.location || 'Remote'}>{job.location || 'Remote'}</p>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Location</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary truncate">{job.job_type || '—'}</p>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Job Type</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-tertiary flex items-center justify-center">
              <Clock className="w-5 h-5 text-text-muted" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary truncate">{getTimeAgo(job.found_at)}</p>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Date Found</p>
            </div>
          </div>
        </section>

        {/* AI Match Reasoning Card */}
        <section className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-success" />
            <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">AI Match Reasoning</h2>
          </div>
          <p className="text-sm text-text-slate leading-relaxed">
            {job.match_reason}
          </p>
        </section>

        {/* Skills Card */}
        <section className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Required Skills vs Your Profile</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-text-secondary">You have</p>
              <div className="flex flex-wrap gap-2">
                {job.matched_skills?.map((skill, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-success-lightest text-success rounded-full text-xs font-medium border border-success-light/30">
                    <CheckCircle2 className="w-3 h-3" />
                    {skill}
                  </span>
                ))}
                {(!job.matched_skills || job.matched_skills.length === 0) && (
                  <span className="text-xs text-text-muted italic">No matching skills identified.</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-medium text-text-secondary">Gap skills</p>
              <div className="flex flex-wrap gap-2">
                {job.missing_skills?.map((skill, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-muted text-accent rounded-full text-xs font-medium border border-accent-light/30">
                    <XCircle className="w-3 h-3" />
                    {skill}
                  </span>
                ))}
                {(!job.missing_skills || job.missing_skills.length === 0) && (
                  <span className="text-xs text-text-muted italic">No skill gaps identified.</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Job Description Card */}
        <section className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-text-muted" />
              <h2 className="text-sm font-bold text-text-primary">Job Description</h2>
            </div>
            {job.about_role && job.about_role.length > 300 && (
              <button 
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-xs font-bold text-accent hover:underline"
              >
                {isDescriptionExpanded ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>
          
          <div className="relative">
            <div className={`text-sm text-text-slate leading-relaxed whitespace-pre-wrap ${!isDescriptionExpanded && job.about_role && job.about_role.length > 300 ? 'max-h-32 overflow-hidden' : ''}`}>
              {job.about_role}
            </div>
            {!isDescriptionExpanded && job.about_role && job.about_role.length > 300 && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-surface to-transparent" />
            )}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-border-light">
            <p className="text-[10px] text-text-muted italic">
              {(job.about_role?.endsWith('…') || job.about_role?.endsWith('...')) 
                ? 'This is a preview snippet from Adzuna.' 
                : 'Full description provided by source.'}
            </p>
            <a 
              href={job.source_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-tertiary hover:bg-border rounded-lg text-xs font-bold text-text-primary transition-colors border border-border"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Full Posting
            </a>
          </div>
        </section>

        {/* Company Research Card */}
        <section className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center">
                <Building2 className="w-4 h-4 text-accent" />
              </div>
              <h2 className="text-sm font-bold text-text-primary">Company Research</h2>
            </div>
            {!job.company_research && (
              <button 
                onClick={handleResearch}
                disabled={isResearching}
                className="btn-primary py-1.5 text-xs flex items-center gap-2 disabled:opacity-70"
              >
                {isResearching ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Search className="w-3 h-3" />
                )}
                {isResearching ? 'Researching...' : 'Research Company'}
              </button>
            )}
          </div>

          <div className={`p-6 ${job.company_research ? '' : 'bg-surface-tertiary/30 min-h-[300px] flex flex-col items-center justify-center text-center'}`}>
            {job.company_research ? (
              <CompanyResearchDossier dossier={job.company_research} />
            ) : isResearching ? (
              <div className="w-full max-w-md mx-auto space-y-6 py-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-accent-light/30 border-t-accent animate-spin" />
                    <Building2 className="w-6 h-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="space-y-1 text-center">
                    <h3 className="text-sm font-bold text-text-primary">Research in progress</h3>
                    <p className="text-xs text-text-muted">The agent is browsing {job.company}'s website to build your dossier. This usually takes 30-45 seconds.</p>
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-xl overflow-hidden">
                  <div className="bg-surface-tertiary px-4 py-2 border-b border-border flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Live Research Log</span>
                    <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
                  </div>
                  <div className="p-4 max-h-48 overflow-y-auto space-y-2 font-mono text-[11px] bg-overlay">
                    {researchLogs.map((log, i) => (
                      <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="text-text-muted shrink-0">[{new Date(log.created_at).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                        <span className={
                          log.level === 'error' ? 'text-error' : 
                          log.level === 'warning' ? 'text-warning' : 
                          log.level === 'success' ? 'text-success' : 
                          'text-text-secondary'
                        }>
                          {log.message}
                        </span>
                      </div>
                    ))}
                    {researchLogs.length === 0 && (
                      <div className="text-text-muted italic">Waiting for agent to start...</div>
                    )}
                    <div ref={logEndRef} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-surface-tertiary flex items-center justify-center border border-border mx-auto mb-2">
                  <Building2 className="w-6 h-6 text-text-muted" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-text-primary">No research yet</h3>
                  <p className="text-xs text-text-muted max-w-xs mx-auto">
                    Click "Research Company" to let the AI browse {job.company}'s public pages and build a dossier.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Sticky Bottom Apply Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/80 to-transparent">
        <div className="max-w-4xl mx-auto">
          <a 
            href={job.external_apply_url || job.source_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full btn-primary py-4 text-base shadow-xl flex items-center justify-center gap-2"
          >
            Apply Now at {job.company}
          </a>
        </div>
      </div>
    </main>
  );
}
