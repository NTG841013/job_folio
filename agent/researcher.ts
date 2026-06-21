import { createInsforgeServer } from '@/lib/insforge-server';
import { browserbase } from '@/lib/browserbase';
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from 'zod';
import { openai } from '@/lib/openai';
import { createPostHogServer } from '@/lib/posthog-server';

// Schema for homepage extraction
const HomepageSchema = z.object({
  oneLiner: z.string().describe("What the company does in one sentence"),
  productSummary: z.string().describe("What they build/sell and who it's for"),
  signals: z.array(z.string()).describe("Funding, notable customers, scale, mission, recent news"),
  pageLinks: z.array(z.object({
    url: z.string(),
    kind: z.enum(["about", "careers", "blog", "engineering", "product", "team", "other"]),
  })).describe("Internal links worth visiting"),
});

// Schema for sub-page extraction
const SubPageSchema = z.object({
  keyPoints: z.array(z.string()),
  technologies: z.array(z.string()).describe("Specific languages, frameworks, tools, platforms"),
  valuesOrCulture: z.array(z.string()).describe("Stated values, working style, team norms"),
  notable: z.array(z.string()).describe("Customers, funding, scale, projects, awards"),
});

export async function researchCompany(jobId: string, providedRunId?: string, providedInsforge?: unknown) {
  const insforge = (providedInsforge as any) || await createInsforgeServer(); // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: { user } } = await insforge.auth.getCurrentUser();

  if (!user) throw new Error('Not authenticated');

  const runId = providedRunId || crypto.randomUUID();
  let posthog: ReturnType<typeof createPostHogServer> | null = null;

  // Create agent_run
  const { error: runError } = await insforge.database.from('agent_runs').insert([{
    id: runId,
    user_id: user.id,
    status: 'running',
    job_title_searched: `Research: ${jobId}`,
    started_at: new Date().toISOString()
  }]);

  if (runError) {
    console.error('Failed to create agent_run:', runError);
  }

  posthog = createPostHogServer();
  posthog.capture({
    distinctId: user.id,
    event: 'research_started',
    properties: { userId: user.id, jobId, runId }
  });

  const log = async (message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    console.log(`[Research Agent ${runId}] ${message}`);
    const { error } = await insforge.database.from('agent_logs').insert([{
      run_id: runId,
      user_id: user.id,
      job_id: jobId,
      message,
      level,
      created_at: new Date().toISOString()
    }]);
    
    if (error) {
      console.error('Failed to insert log:', error);
    }
  };

  try {
    // 1. Fetch job and profile
    const { data: job } = await insforge.database.from('jobs').select('*').eq('id', jobId).single();
    if (!job) throw new Error('Job not found');

    const { data: profile } = await insforge.database.from('profiles').select('*').eq('id', user.id).single();
    if (!profile) throw new Error('Profile not found');

    await log(`Researching ${job.company || 'Unknown Company'}...`);

    // 2. Derive root domain
    const companyName = job.company || 'Unknown';
    let companyUrl = `https://www.${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    try {
      await log('Finding company website...', 'info');
      const res = await fetch(job.source_url, { redirect: 'follow', method: 'HEAD' });
      const finalUrl = new URL(res.url);
      
      // If we are still on adzuna or a search engine, don't use it
      if (!finalUrl.hostname.includes('adzuna')) {
        const hostParts = finalUrl.hostname.split('.');
        if (hostParts.length >= 2) {
          const rootDomain = hostParts.slice(-2).join('.');
          companyUrl = `https://${rootDomain}`;
        }
      }
    } catch {
      await log(`Could not derive URL from redirect, falling back to guess: ${companyUrl}`, 'warning');
    }

    // 3. Browserbase & Stagehand
    const companyResearch: Record<string, any> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
    const visitedUrls: string[] = [];

    try {
      await log('Initializing AI browser...', 'info');
      const session = await browserbase.sessions.create({
        projectId: process.env.BROWSERBASE_PROJECT_ID!,
        timeout: 120,
      });

      const stagehand = new Stagehand({
        env: "BROWSERBASE",
        apiKey: process.env.BROWSERBASE_API_KEY!,
        projectId: process.env.BROWSERBASE_PROJECT_ID!,
        browserbaseSessionID: session.id,
        model: { modelName: "openai/gpt-4o", apiKey: process.env.OPENAI_API_KEY! },
        disablePino: true,
      });

      await stagehand.init();
      const page = stagehand.context.activePage()!;

      await log(`Analyzing ${job.company || 'Unknown Company'} homepage (${companyUrl})...`, 'info');
      await page.goto(companyUrl, { waitUntil: 'domcontentloaded' });
      await log('Homepage loaded. Extracting company info...', 'info');
      
      const homepageData = await stagehand.extract(
        "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.",
        HomepageSchema
      );

      companyResearch.homepage = homepageData;
      visitedUrls.push(companyUrl);

      if (homepageData.oneLiner || homepageData.productSummary) {
        // Pick sub-pages (max 3)
        const subPageLinks = (homepageData.pageLinks || [])
          .filter(link => !['careers', 'other'].includes(link.kind))
          .slice(0, 3);
        
        companyResearch.subPages = [];

        for (const link of subPageLinks) {
          try {
            const targetUrl = link.url.startsWith('http') ? link.url : `${companyUrl}${link.url.startsWith('/') ? '' : '/'}${link.url}`;
            await log(`Visiting ${link.kind} page...`, 'info');
            await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
            await log(`Page loaded. Extracting ${link.kind} insights...`, 'info');
            
            const subPageData = await stagehand.extract(
              "Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.",
              SubPageSchema
            );
            companyResearch.subPages.push({ ...subPageData, url: targetUrl, kind: link.kind });
            visitedUrls.push(targetUrl);
            await log(`Successfully researched ${link.kind} page.`, 'success');
          } catch (error) {
            await log(`Failed to extract sub-page: ${error instanceof Error ? error.message : String(error)}`, 'warning');
          }
        }
      } else {
        await log('Homepage content was thin, skipping sub-pages.', 'warning');
      }
      
      await stagehand.close();
    } catch (error) {
      await log(`Browser research encountered an error: ${error instanceof Error ? error.message : String(error)}`, 'error');
      // Continue to synthesis even if browser fails
    }

    // 4. GPT-4o Synthesis
    await log('Synthesizing career dossier...', 'info');
    
    const systemPrompt = `You are a sharp career strategist preparing a candidate to apply for a specific role. You are given (a) research collected from the company's own website, (b) the job posting, and (c) the candidate's profile. Produce a concise, concrete briefing that gives this specific candidate an edge for this specific role.

Rules:
- Ground every company claim in the provided research or job posting. Never invent funding, customers, headcount, or facts. If research was thin, infer carefully from the job posting and say what's inferred.
- Be specific to THIS candidate. Connect their actual skills and past work to this company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind of detail that signals the candidate did their homework.
- Keep every item tight: one or two sentences. No fluff.

Return ONLY valid JSON matching this shape:
{
  "companyOverview": string,
  "techStack": string[],
  "culture": string[],
  "whyThisRole": string,
  "yourEdge": string[],
  "gapsToAddress": string[],
  "smartQuestions": string[],
  "interviewPrep": string[],
  "sources": string[]
}`;

    const userPrompt = `COMPANY RESEARCH (from their website):
${JSON.stringify(companyResearch)}

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Description: ${job.about_role}
Matched skills (already computed): ${(job.matched_skills || []).join(", ")}
Missing skills (already computed): ${(job.missing_skills || []).join(", ")}

CANDIDATE PROFILE:
Current title: ${profile.current_title}
Experience: ${profile.years_experience} years, level ${profile.experience_level}
Skills: ${(profile.skills || []).join(", ")}
Work history: ${JSON.stringify(profile.work_experience)}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Empty response from synthesis AI');
    
    const dossier = JSON.parse(content);
    dossier.sources = visitedUrls;
    await log('Dossier synthesized. Saving results...', 'success');

    // 5. Update DB
    await insforge.database.from('jobs').update({
      company_research: dossier
    }).eq('id', jobId).eq('user_id', user.id);

    await insforge.database.from('agent_runs').update({
      status: 'completed',
      completed_at: new Date().toISOString()
    }).eq('id', runId);

    // 6. PostHog
    // posthog already initialized above
    posthog.capture({
      distinctId: user.id,
      event: 'company_researched',
      properties: { userId: user.id, jobId, company: job.company || 'Unknown Company' }
    });
    await posthog.shutdown();

    await log(`Research completed for ${job.company || 'Unknown Company'}!`, 'success');
    return { success: true, dossier, runId };

  } catch (error) {
    if (posthog) await posthog.shutdown();
    const errorMsg = error instanceof Error ? error.message : String(error);
    await log(`Research failed: ${errorMsg}`, 'error');
    
    await insforge.database.from('agent_runs').update({
      status: 'failed',
      completed_at: new Date().toISOString()
    }).eq('id', runId);

    return { success: false, error: errorMsg, runId };
  }
}
