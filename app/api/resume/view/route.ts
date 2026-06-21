import { createInsforgeServer } from "@/lib/insforge-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return new NextResponse("Path is required", { status: 400 });
    }

    const insforge = await createInsforgeServer();
    const { data: { user } } = await insforge.auth.getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Security: Ensure user can only access their own resume
    // Path should be like resumes/userId/resume.pdf or userId/resume.pdf
    if (!path.includes(user.id)) {
      console.warn(`[Proxy] Security violation: User ${user.id} tried to access path ${path}`);
      return new NextResponse("Forbidden", { status: 403 });
    }

    const API_KEY = process.env.INSFORGE_API_KEY || "ik_06e656bc56fe047fc1d4b1f6d0657ad0";
    const API_BASE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL || "https://vrthxj7q.eu-central.insforge.app";
    
    // Normalize path for the URL
    // If it's already resumes/userId/... we use it, otherwise we prepend it
    const key = path.startsWith("resumes/") ? path : `resumes/${path}`;
    const url = `${API_BASE_URL}/api/storage/buckets/resumes/objects/${encodeURIComponent(key)}`;

    console.log(`[Proxy] Fetching resume for user ${user.id} from ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY
      }
    });

    if (!response.ok) {
      console.error(`[Proxy] Failed to fetch from InsForge: ${response.status} ${response.statusText}`);
      return new NextResponse("File not found", { status: 404 });
    }

    const blob = await response.blob();
    
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="resume.pdf"',
        'Cache-Control': 'private, max-age=3600'
      }
    });

  } catch (error) {
    console.error("[Proxy] Error in resume view proxy:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
