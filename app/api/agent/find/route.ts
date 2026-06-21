import { NextRequest, NextResponse } from 'next/server';
import { runDiscovery } from '@/agent/adzuna';
import { createInsforgeServer } from '@/lib/insforge-server';

export async function POST(req: NextRequest) {
  try {
    const insforge = await createInsforgeServer();
    const { data: { user } } = await insforge.auth.getCurrentUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { jobTitle, location, country } = body;

    if (!jobTitle) {
      return NextResponse.json(
        { success: false, error: 'Job title is required' },
        { status: 400 }
      );
    }

    const result = await runDiscovery(jobTitle, location || '', country || 'us', insforge);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      jobsFound: result.jobsFound
    });
  } catch (error) {
    console.error('API Error in /api/agent/find:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
