'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import { insforge } from '@/lib/insforge-client';
import { MATCH_THRESHOLD } from '@/lib/utils';
import { 
  Search, 
  MapPin, 
  Globe,
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Loader2,
  CircleCheck
} from 'lucide-react';

const COUNTRIES = [
  { code: 'us', name: 'United States' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'au', name: 'Australia' },
  { code: 'ca', name: 'Canada' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'in', name: 'India' },
  { code: 'br', name: 'Brazil' },
  { code: 'za', name: 'South Africa' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'at', name: 'Austria' },
  { code: 'nz', name: 'New Zealand' },
  { code: 'pl', name: 'Poland' },
  { code: 'it', name: 'Italy' },
  { code: 'mx', name: 'Mexico' },
  { code: 'sg', name: 'Singapore' },
];

export default function FindJobsPage() {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('us');
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<{ message: string; count: number } | null>(null);

  // Filters & Sorting State
  const [filterQuery, setFilterQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'found_at' | 'match_score'>('found_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await insforge.auth.getCurrentUser();
      if (!user) return;

      const { data, error } = await insforge.database
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('found_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Derived Data
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      (job.title || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
      (job.company || '').toLowerCase().includes(filterQuery.toLowerCase());
    
    let matchesScore = true;
    if (scoreFilter === 'high') matchesScore = job.match_score >= MATCH_THRESHOLD;
    else if (scoreFilter === 'medium') matchesScore = job.match_score >= 50 && job.match_score < MATCH_THRESHOLD;
    else if (scoreFilter === 'low') matchesScore = job.match_score < 50;

    return matchesSearch && matchesScore;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === 'found_at') {
      valA = new Date(a.found_at).getTime();
      valB = new Date(b.found_at).getTime();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);
  const paginatedJobs = sortedJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterQuery, scoreFilter, sortBy, sortOrder]);

  const handleSearch = async () => {
    if (!jobTitle.trim()) return;

    try {
      setIsSearching(true);
      setSearchStatus(null);
      
      const response = await fetch('/api/agent/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, location, country })
      });

      const result = await response.json();
      
      if (result.success) {
        setSearchStatus({
          message: `Found ${result.jobsFound} jobs and saved them to your list.`,
          count: result.jobsFound
        });
        await fetchJobs();
      } else {
        console.error('Search failed:', result.error);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
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

  // Match score color logic
  const getScoreColor = (score: number) => {
    if (score >= MATCH_THRESHOLD) return 'bg-success';
    if (score >= 50) return 'bg-warning';
    return 'bg-text-muted';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= MATCH_THRESHOLD) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-text-muted';
  };

  return (
    <main className="min-h-screen bg-background pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-6">
        {/* Search Controls Card */}
        <section className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Job Title
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Frontend Engineer"
                  className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="lg:col-span-1 space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Remote, New York..."
                  className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="lg:col-span-1 space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Country
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <select
                  className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all appearance-none cursor-pointer"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>

            <div className="flex items-end">
              <button 
                onClick={handleSearch}
                disabled={isSearching || !jobTitle.trim()}
                className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>{isSearching ? 'Finding...' : 'Find Jobs'}</span>
              </button>
            </div>
          </div>

          {/* Success Message Banner */}
          {searchStatus && (
            <div className="mt-6 flex items-center gap-2 px-4 py-3 bg-success-lightest border border-success-light rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
              <CircleCheck className="w-4 h-4 text-success" />
              <p className="text-sm font-medium text-success-darker">
                {searchStatus.message}
              </p>
            </div>
          )}
        </section>

        {/* Job List Section */}
        <section className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-border rounded-xl px-4 py-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Filter by company or role..."
                className="w-full pl-10 pr-4 py-1.5 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent outline-none"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <select 
                className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-lg text-sm font-medium text-text-dark hover:bg-surface-secondary transition-colors outline-none cursor-pointer appearance-none"
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value as any)}
              >
                <option value="all">All Matches</option>
                <option value="high">High Match ({MATCH_THRESHOLD}%+)</option>
                <option value="medium">Medium (50-{MATCH_THRESHOLD}%)</option>
                <option value="low">Low Match (Under 50%)</option>
              </select>

              <button 
                onClick={() => {
                  if (sortBy === 'match_score') {
                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  } else {
                    setSortBy('match_score');
                    setSortOrder('desc');
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 bg-surface border rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'match_score' ? 'border-accent text-accent' : 'border-border text-text-dark hover:bg-surface-secondary'
                }`}
              >
                <ArrowUpDown className="w-4 h-4" />
                <span>Match Score</span>
                {sortBy === 'match_score' && (
                  <span className="text-[10px] ml-1 uppercase">{sortOrder}</span>
                )}
              </button>

              <button 
                onClick={() => {
                  if (sortBy === 'found_at') {
                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  } else {
                    setSortBy('found_at');
                    setSortOrder('desc');
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 bg-surface border rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'found_at' ? 'border-accent text-accent' : 'border-border text-text-dark hover:bg-surface-secondary'
                }`}
              >
                <ArrowUpDown className="w-4 h-4" />
                <span>Date Found</span>
                {sortBy === 'found_at' && (
                  <span className="text-[10px] ml-1 uppercase">{sortOrder}</span>
                )}
              </button>
            </div>
          </div>

          {/* Jobs Table */}
          <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-surface-secondary">
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Company</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Match Score</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Salary Est.</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Source</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Date Found</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 text-accent animate-spin" />
                          <p className="text-sm text-text-muted">Loading your job matches...</p>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedJobs.length > 0 ? (
                    paginatedJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-surface-secondary transition-colors group cursor-pointer" onClick={() => router.push(`/find-jobs/${job.id}`)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-surface-tertiary flex items-center justify-center border border-border">
                              <span className="text-xs font-bold text-text-secondary">{(job.company || 'U')[0]}</span>
                            </div>
                            <span className="text-sm font-semibold text-text-primary">{job.company || 'Unknown Company'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">{job.title}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 min-w-[120px]">
                            <div className="flex-1 h-1.5 bg-surface-tertiary rounded-full overflow-hidden border border-border-light/20">
                              <div 
                                className={`h-full ${getScoreColor(job.match_score)} transition-all`} 
                                style={{ width: `${job.match_score}%` }}
                              />
                            </div>
                            <span className={`text-sm font-bold ${getScoreTextColor(job.match_score)}`}>
                              {job.match_score}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-text-secondary font-medium">{job.salary || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            job.source === 'search' 
                              ? 'bg-accent-light text-accent' 
                              : 'bg-surface-secondary text-text-secondary border border-border'
                          }`}>
                            {job.source}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-text-muted">{getTimeAgo(job.found_at)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <a 
                            href={job.source_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block p-2 text-text-muted hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Search className="w-8 h-8 text-text-muted opacity-20" />
                          <p className="text-sm text-text-muted">No jobs found. Try searching for your next role!</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-surface-secondary/50">
              <span className="text-sm text-text-muted">
                Showing <span className="font-medium text-text-primary">
                  {sortedJobs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                </span> to <span className="font-medium text-text-primary">
                  {Math.min(currentPage * itemsPerPage, sortedJobs.length)}
                </span> of <span className="font-medium text-text-primary">{sortedJobs.length}</span> results
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-border bg-surface text-text-secondary hover:bg-surface-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button 
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        page === currentPage 
                          ? 'bg-accent text-white' 
                          : 'bg-surface border border-border text-text-secondary hover:bg-surface-secondary'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 rounded-lg border border-border bg-surface text-text-secondary hover:bg-surface-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
