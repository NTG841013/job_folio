import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";

export async function GET(req: NextRequest) {
  try {
    const insforge = await createInsforgeServer();
    const { data: { user } } = await insforge.auth.getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const projectId = process.env.POSTHOG_PROJECT_ID;
    const personalApiKey = process.env.POSTHOG_PERSONAL_API_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

    if (!projectId || !personalApiKey) {
      // If credentials are missing, return mock-like empty success to avoid crashing UI
      // but log the error for the developer
      console.error("[api/analytics] Missing PostHog credentials (POSTHOG_PROJECT_ID or POSTHOG_PERSONAL_API_KEY)");
      return NextResponse.json({
        success: true,
        data: {
          researchData: [],
          jobsFoundData: [],
          matchDistributionData: []
        }
      });
    }

    const fetchPostHogData = async (query: string) => {
      const response = await fetch(`${posthogHost}/api/projects/${projectId}/query/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${personalApiKey}`,
        },
        body: JSON.stringify({
          query: {
            kind: "HogQLQuery",
            query: query,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.detail) errorMessage = errorJson.detail;
        } catch (e) {
          // not json
        }
        
        if (response.status === 401 || response.status === 403) {
          throw new Error(`PostHog Authentication Error: ${errorMessage}. Please check if POSTHOG_PERSONAL_API_KEY is a valid Personal API Key (starts with phx_), not a Project Token (starts with phc_).`);
        }
        throw new Error(`PostHog API error: ${response.status} - ${errorMessage}`);
      }

      return response.json();
    };

    // 1. Jobs Found Over Time (Last 30 days)
    const jobsFoundQuery = `
      SELECT toDate(timestamp) as day, count() as count
      FROM events
      WHERE event = 'job_found' AND distinct_id = '${user.id}' AND timestamp > now() - interval 30 day
      GROUP BY day
      ORDER BY day ASC
    `;

    // 2. Company Research Activity (Last 7 days)
    const researchQuery = `
      SELECT toDate(timestamp) as day, count() as count
      FROM events
      WHERE event = 'company_researched' AND distinct_id = '${user.id}' AND timestamp > now() - interval 7 day
      GROUP BY day
      ORDER BY day ASC
    `;

    // 3. Match Score Distribution (All time)
    const matchScoreQuery = `
      SELECT
        floor(toInt(properties.matchScore) / 10) * 10 as range_start,
        count() as count
      FROM events
      WHERE event = 'job_found' AND distinct_id = '${user.id}' AND properties.matchScore IS NOT NULL
      GROUP BY range_start
      ORDER BY range_start ASC
    `;

    const results = await Promise.allSettled([
      fetchPostHogData(jobsFoundQuery),
      fetchPostHogData(researchQuery),
      fetchPostHogData(matchScoreQuery),
    ]);

    const jobsFoundRes = results[0].status === 'fulfilled' ? results[0].value : { results: [] };
    const researchRes = results[1].status === 'fulfilled' ? results[1].value : { results: [] };
    const matchScoreRes = results[2].status === 'fulfilled' ? results[2].value : { results: [] };

    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map(r => r.reason.message);

    // Format data for Recharts
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const formattedJobsFound = (jobsFoundRes.results || []).map((row: [string, number]) => ({
      day: dayNames[new Date(row[0]).getUTCDay()],
      fullDate: row[0],
      count: row[1]
    }));

    const formattedResearch = (researchRes.results || []).map((row: [string, number]) => ({
      day: dayNames[new Date(row[0]).getUTCDay()],
      fullDate: row[0],
      count: row[1]
    }));

    const formattedMatchScore = (matchScoreRes.results || []).map((row: [number, number]) => ({
      range: `${row[0]}-${row[0] + 10}%`,
      count: row[1]
    }));

    return NextResponse.json({
      success: true,
      data: {
        jobsFoundData: formattedJobsFound,
        researchData: formattedResearch,
        matchDistributionData: formattedMatchScore
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error("[api/analytics]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
