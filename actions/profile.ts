'use server';

import { createInsforgeServer } from "@/lib/insforge-server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: any) {
  try {
    const insforge = await createInsforgeServer();
    const { data: { user } } = await insforge.auth.getCurrentUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Calculate is_complete
    const isComplete = !!(
      formData.full_name &&
      formData.current_title &&
      (Array.isArray(formData.skills) && formData.skills.length > 0) &&
      (Array.isArray(formData.work_experience) && formData.work_experience.length > 0) &&
      (Array.isArray(formData.job_titles_seeking) && formData.job_titles_seeking.length > 0) &&
      (Array.isArray(formData.preferred_locations) && formData.preferred_locations.length > 0) &&
      formData.remote_preference &&
      formData.salary_expectation &&
      formData.cover_letter_tone
    );

    // Standardize data to match schema
    const profileData = {
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      current_title: formData.current_title,
      experience_level: formData.experience_level,
      years_experience: parseInt(formData.years_experience) || 0,
      skills: formData.skills || [],
      industries: formData.industries || [],
      work_experience: formData.work_experience || [],
      education: Array.isArray(formData.education) ? formData.education : [],
      job_titles_seeking: formData.job_titles_seeking || [],
      remote_preference: formData.remote_preference,
      preferred_locations: formData.preferred_locations || [],
      salary_expectation: formData.salary_expectation,
      cover_letter_tone: formData.cover_letter_tone,
      linkedin_url: formData.linkedin_url,
      portfolio_url: formData.portfolio_url,
      work_authorization: formData.work_authorization,
      resume_pdf_url: formData.resume_pdf_url,
    };

    const { error } = await insforge.database
      .from("profiles")
      .upsert({
        id: user.id,
        ...profileData,
        is_complete: isComplete,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (err: any) {
    console.error("Profile update failed:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}

export async function uploadResume(fileData: { name: string, type: string, base64: string }) {
  try {
    const insforge = await createInsforgeServer();
    const { data: { user } } = await insforge.auth.getCurrentUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const filePath = `resumes/${user.id}/resume.pdf`;
    
    // Convert base64 to Buffer/Blob for upload
    const buffer = Buffer.from(fileData.base64, 'base64');
    const blob = new Blob([buffer], { type: "application/pdf" });

    const { data, error: uploadError } = await (insforge.storage
      .from("resumes") as any)
      .upload(filePath, blob, {
        contentType: "application/pdf",
        upsert: true
      });

    if (uploadError) {
      console.error("Error uploading resume:", uploadError);
      return { success: false, error: uploadError.message };
    }

    // Update profile with the resume path
    const { error: updateError } = await insforge.database
      .from("profiles")
      .upsert({
        id: user.id,
        resume_pdf_url: filePath,
        updated_at: new Date().toISOString(),
      });

    if (updateError) {
      console.error("Error updating profile with resume path:", updateError);
      return { success: false, error: updateError.message };
    }

    revalidatePath("/profile");
    return { success: true, path: filePath };
  } catch (err: any) {
    console.error("Resume upload failed:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}

export async function getResumeUrl(path: string) {
  try {
    const insforge = await createInsforgeServer();
    const { data: { user } } = await insforge.auth.getCurrentUser();

    if (!user) return null;

    const storage = (insforge as any).storage;
    const bucket = storage.from("resumes");

    // Normalize path to check existence
    const key = path.startsWith("resumes/") ? path : `resumes/${path}`;
    
    // Check if file actually exists in storage before returning a URL
    // We use the proxy approach but need to know if we should show the "Uploaded" state
    const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || "https://vrthxj7q.eu-central.insforge.app";
    const API_KEY = process.env.INSFORGE_API_KEY || "ik_06e656bc56fe047fc1d4b1f6d0657ad0";
    
    const checkUrl = `${baseUrl}/api/storage/buckets/resumes/objects/${encodeURIComponent(key)}`;
    const checkResponse = await fetch(checkUrl, {
      method: 'HEAD', // Light check
      headers: { 'x-api-key': API_KEY }
    });

    if (!checkResponse.ok) {
      console.warn(`[getResumeUrl] File not found in storage: ${key}. Status: ${checkResponse.status}`);
      
      // If the file is missing from storage but the DB thinks it's there, 
      // we clean up the DB to keep them in sync.
      try {
        await insforge.database
          .from("profiles")
          .update({ resume_pdf_url: null })
          .eq("id", user.id);
        console.log(`[getResumeUrl] Cleaned up non-existent resume path from DB for user ${user.id}`);
      } catch (dbErr) {
        console.error("[getResumeUrl] Failed to clean up DB:", dbErr);
      }

      return null;
    }
    
    // Return our secure proxy URL
    return `/api/resume/view?path=${encodeURIComponent(path)}`;
  } catch (err) {
    console.error("Failed to get resume URL:", err);
    return null;
  }
}
