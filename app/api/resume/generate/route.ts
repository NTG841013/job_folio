import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { OpenAI } from "openai";
import { renderToBuffer } from "@react-pdf/renderer";
import { ResumeTemplate } from "@/app/components/profile/ResumeTemplate";
import React from "react";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const insforge = await createInsforgeServer();
    const { data: { user } } = await insforge.auth.getCurrentUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    // 1. Fetch current profile
    const { data: profile, error: profileError } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    // 2. Synthesize professional content using AI
    const prompt = `
      You are a professional resume writer. I will give you a candidate's profile data.
      Your goal is to polish the "Professional Summary" and "Work Experience" responsibilities.
      
      Rules:
      - Professional Summary: Write a compelling 3-4 sentence paragraph highlighting their top skills and experience level.
      - Work Experience: For each role, provide 3-5 high-impact, action-oriented bullet points based on their "key_responsibilities".
      - Return ONLY valid JSON matching this schema:
      {
        "professional_summary": "string",
        "work_experience": [
          {
            "company": "string",
            "position": "string",
            "startDate": "string",
            "endDate": "string",
            "current": boolean,
            "responsibilities": ["string"]
          }
        ]
      }

      DATA:
      Full Name: ${profile.full_name}
      Current Title: ${profile.current_title}
      Experience Level: ${profile.experience_level}
      Years Experience: ${profile.years_experience}
      Skills: ${profile.skills.join(", ")}
      Industries: ${profile.industries.join(", ")}
      Work History: ${JSON.stringify(profile.work_experience)}
    `;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a sharp career strategist and resume expert. Return ONLY valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = JSON.parse(aiResponse.choices[0].message.content || "{}");

    // 3. Prepare data for PDF template
    const resumeData = {
      full_name: profile.full_name,
      current_title: profile.current_title,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      linkedin_url: profile.linkedin_url,
      portfolio_url: profile.portfolio_url,
      professional_summary: content.professional_summary,
      work_experience: content.work_experience,
      education: profile.education || [],
      skills: profile.skills,
    };

    // 4. Render PDF to Buffer
    const pdfBuffer = await renderToBuffer(
      React.createElement(ResumeTemplate, { data: resumeData }) as any
    );

    // 5. Upload to Storage
    const filePath = `resumes/${user.id}/generated_resume.pdf`;
    
    // Using Blob ensures the size is correctly captured by the SDK
    const pdfBlob = new Blob([pdfBuffer as any], { type: 'application/pdf' });

    const { error: uploadError } = await (insforge.storage
      .from("resumes") as any)
      .upload(filePath, pdfBlob, {
        contentType: "application/pdf",
        upsert: true,
        duplex: 'half'
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ success: false, error: "Failed to save PDF to storage" }, { status: 500 });
    }

    // 6. Update profile with generated path
    const { error: updateError } = await insforge.database
      .from("profiles")
      .update({ generated_resume_pdf_url: filePath })
      .eq("id", user.id);

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json({ success: false, error: "Failed to update profile record" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      path: filePath,
      viewUrl: `/api/resume/view?path=${encodeURIComponent(filePath)}`
    });

  } catch (err: any) {
    console.error("PDF Generation error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
