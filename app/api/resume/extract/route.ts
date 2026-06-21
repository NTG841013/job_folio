import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { extractProfileFromText } from "@/agent/extractor";
// @ts-ignore
import pdf from "pdf-parse/lib/pdf-parse";

export async function POST(req: NextRequest) {
  try {
    const insforge = await createInsforgeServer();
    const { data: { user } } = await insforge.auth.getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { path } = await req.json();

    if (!path) {
      return NextResponse.json({ error: "No resume path provided" }, { status: 400 });
    }

    // Download resume from storage
    const { data: fileBlob, error: downloadError } = await insforge.storage
      .from("resumes")
      .download(path);

    if (downloadError || !fileBlob) {
      console.error("Error downloading resume for extraction:", downloadError);
      return NextResponse.json({ error: "Failed to fetch resume from storage" }, { status: 500 });
    }

    // Convert blob to buffer
    const arrayBuffer = await fileBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF
    const pdfData = await pdf(buffer);
    const text = pdfData.text;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Could not extract text from PDF. It might be an image-only scan." }, { status: 400 });
    }

    // Call AI Agent
    const extractedData = await extractProfileFromText(text);

    return NextResponse.json({ success: true, data: extractedData });
  } catch (error: any) {
    console.error("Resume extraction API error:", error);
    return NextResponse.json({ error: error.message || "Unknown error during extraction" }, { status: 500 });
  }
}
