
import { createInsforgeServer } from "../lib/insforge-server";

async function verify() {
  try {
    const insforge = await createInsforgeServer();
    const { data: { user }, error: userError } = await insforge.auth.getCurrentUser();
    
    if (userError || !user) {
      console.log("No authenticated user found in this environment.");
      return;
    }
    
    console.log("Checking data for user:", user.id);
    
    const { data: profile, error: profileError } = await (insforge as any).database
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
      
    if (profileError) {
      console.error("Profile fetch error:", profileError);
    } else {
      console.log("Profile Data:", JSON.stringify(profile, null, 2));
      
      if (profile && profile.resume_pdf_url) {
        console.log("Resume PDF URL in DB:", profile.resume_pdf_url);
        
        // Check if file exists in storage
        const { data: files, error: storageError } = await (insforge as any).storage
          .from("resumes")
          .list({ prefix: `resumes/${user.id}/` });
          
        if (storageError) {
          console.error("Storage list error:", storageError);
        } else {
          console.log("Files in storage directory:", JSON.stringify(files, null, 2));
        }
      } else {
        console.log("No resume_pdf_url found in profile.");
      }
    }
  } catch (e) {
    console.error("Verification failed:", e);
  }
}

verify();
