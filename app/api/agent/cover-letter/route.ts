import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { generateCoverLetter } from "@/agent/cover_letter";
import { Profile, Job } from "@/agent/types";

export async function POST(req: NextRequest) {
  try {
    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ success: false, error: "Missing jobId" }, { status: 400 });
    }

    const insforge = await createInsforgeServer();
    const { data: { user } } = await insforge.auth.getCurrentUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const runId = crypto.randomUUID();

    const log = async (message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      await insforge.database.from('agent_logs').insert([{
        run_id: runId,
        user_id: user.id,
        job_id: jobId,
        message,
        level,
        created_at: new Date().toISOString()
      }]);
    };

    // 1. Fetch data
    await log("Reading your profile and job details...");
    const [profileRes, jobRes] = await Promise.all([
      insforge.database.from('profiles').select('*').eq('id', user.id).single(),
      insforge.database.from('jobs').select('*').eq('id', jobId).eq('user_id', user.id).single()
    ]);

    if (profileRes.error || !profileRes.data) {
      await log("Failed to load profile", "error");
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    if (jobRes.error || !jobRes.data) {
      await log("Failed to load job details", "error");
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    const profile = profileRes.data as Profile;
    const job = jobRes.data as Job;

    if (!profile.is_complete) {
      await log("Profile incomplete. Results may be generic.", "warning");
    }

    // 2. Analyze Company Research
    if (job.company_research) {
      await log(`Analyzing company research for ${job.company}...`);
    } else {
      await log(`No research found for ${job.company}. Using general knowledge.`);
    }

    // 3. Generate
    await log(`Drafting your ${profile.cover_letter_tone || 'formal'} cover letter...`);
    const coverLetter = await generateCoverLetter(profile, job);

    // 4. Save
    await log("Refining and saving to your application...");
    const { error: updateError } = await insforge.database
      .from('jobs')
      .update({ cover_letter: coverLetter })
      .eq('id', jobId);

    if (updateError) {
      await log("Failed to save cover letter to database", "error");
      throw updateError;
    }

    await log("Cover letter generated successfully!", "success");

    return NextResponse.json({
      success: true,
      data: {
        coverLetter,
        runId
      }
    });

  } catch (error) {
    console.error("[api/agent/cover-letter]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
