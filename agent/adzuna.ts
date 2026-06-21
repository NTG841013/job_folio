import { createInsforgeServer } from '@/lib/insforge-server';
import { searchJobs } from '@/lib/adzuna';
import { scoreJob } from './matcher';
import { Profile } from './types';
import { createPostHogServer } from '@/lib/posthog-server';
import { formatSalary } from '@/lib/utils';
import { estimateSalary } from './salary-estimator';

export async function runDiscovery(jobTitle: string, location: string, country: string = 'us', providedInsforge?: unknown) {
  const insforge = (providedInsforge as any) || await createInsforgeServer(); // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: { user } } = await insforge.auth.getCurrentUser();

  if (!user) throw new Error('Not authenticated');

  const runId = crypto.randomUUID();
  let posthog: ReturnType<typeof createPostHogServer> | null = null;

  // 1. Create agent_run
  const { error: runError } = await insforge.database.from('agent_runs').insert([{
    id: runId,
    user_id: user.id,
    status: 'running',
    job_title_searched: jobTitle,
    location_searched: location,
    country_searched: country,
    started_at: new Date().toISOString()
  }]);

  if (runError) {
    console.error('Failed to create agent_run:', runError);
  }

  posthog = createPostHogServer();
  posthog.capture({
    distinctId: user.id,
    event: 'job_search_started',
    properties: {
      userId: user.id,
      jobTitle,
      location,
      runId
    }
  });

  const log = async (message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    console.log(`[AgentRun ${runId}] ${message}`);
    const { error } = await insforge.database.from('agent_logs').insert([{
      run_id: runId,
      user_id: user.id,
      message,
      level,
      created_at: new Date().toISOString()
    }]);

    if (error) {
      console.error('Failed to insert log:', error);
    }
  };

  try {
    await log(`Starting job discovery for "${jobTitle}" in "${location || 'Anywhere'}" (${country.toUpperCase()})`);

    // 2. Fetch jobs from Adzuna
    const adzunaJobs = await searchJobs(jobTitle, location, country);
    await log(`Found ${adzunaJobs.length} jobs on Adzuna. Starting AI scoring...`);

    if (adzunaJobs.length === 0) {
      await insforge.database.from('agent_runs').update({
        status: 'completed',
        jobs_found: 0,
        completed_at: new Date().toISOString()
      }).eq('id', runId);
      return { success: true, jobsFound: 0 };
    }

    // 3. Fetch user profile for scoring
    const { data: profile } = await insforge.database
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      throw new Error('User profile not found. Please complete your profile first.');
    }

    // 4. Score and save jobs
    let savedCount = 0;
    // posthog already initialized above

    for (const job of adzunaJobs) {
      try {
        const scoring = await scoreJob(profile as Profile, job);
        
        const jobRecord = {
          run_id: runId,
          user_id: user.id,
          source: 'search',
          source_url: job.redirect_url,
          external_apply_url: job.redirect_url,
          title: job.title,
          company: job.company?.display_name || 'Unknown Company',
          location: job.location?.display_name || 'Remote',
          salary: job.salary_min
            ? formatSalary(job.salary_min, job.salary_max, country)
            : await estimateSalary(job.title, job.company?.display_name || 'Unknown', job.location?.display_name || 'Remote', country, job.description),
          job_type: job.contract_type || 'fulltime',
          about_role: job.description,
          match_score: scoring.matchScore,
          match_reason: scoring.matchReason,
          matched_skills: scoring.matchedSkills,
          missing_skills: scoring.missing_skills,
          found_at: new Date().toISOString(),
        };

        await insforge.database.from('jobs').insert([jobRecord]);
        
        // Capture to PostHog for analytics
        posthog.capture({
          distinctId: user.id,
          event: 'job_found',
          properties: {
            userId: user.id,
            jobTitle: job.title,
            company: job.company?.display_name || 'Unknown Company',
            matchScore: scoring.matchScore,
            source: 'adzuna'
          }
        });

        savedCount++;
      } catch (error) {
        await log(`Failed to process job "${job.title}": ${error instanceof Error ? error.message : String(error)}`, 'error');
      }
    }

    // 5. Finalize run
    if (posthog) await posthog.shutdown();
    
    await insforge.database.from('agent_runs').update({
      status: 'completed',
      jobs_found: savedCount,
      completed_at: new Date().toISOString()
    }).eq('id', runId);

    await log(`Discovery completed. Processed ${savedCount} jobs.`, 'success');
    return { success: true, jobsFound: savedCount };

  } catch (error) {
    if (posthog) await posthog.shutdown();
    const errorMsg = error instanceof Error ? error.message : String(error);
    await log(`Discovery failed: ${errorMsg}`, 'error');
    
    await insforge.database.from('agent_runs').update({
      status: 'failed',
      completed_at: new Date().toISOString()
    }).eq('id', runId);

    return { success: false, error: errorMsg };
  }
}
