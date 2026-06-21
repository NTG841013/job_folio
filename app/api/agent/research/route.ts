import { NextRequest, NextResponse } from 'next/server';
import { createInsforgeServer } from '@/lib/insforge-server';
import { researchCompany } from '@/agent/researcher';

export async function POST(req: NextRequest) {
  try {
    const insforge = await createInsforgeServer();
    const { data: { user } } = await insforge.auth.getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId, runId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    // Trigger research process
    // Note: This could take up to 2 minutes. 
    // In a production environment with strict serverless timeouts, 
    // this would be a background job.
    const result = await researchCompany(jobId, runId, insforge);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error in /api/agent/research:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
