'use client';

import { useEffect, useState, useTransition } from "react";
import { insforge } from "@/lib/insforge-client";
import Navbar from "@/app/components/Navbar";
import { signOutAction } from "@/app/auth/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import posthog from "posthog-js";
import CompletionIndicator from "@/app/components/profile/CompletionIndicator";
import ResumeUpload from "@/app/components/profile/ResumeUpload";
import ProfileForm from "@/app/components/profile/ProfileForm";
import { updateProfile, uploadResume, getResumeUrl } from "@/actions/profile";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const { data: { user }, error: userError } = await insforge.auth.getCurrentUser();
        if (userError) {
          console.warn("[Profile] getCurrentUser error:", userError.message);
        }

        if (user) {
          // Fetch real profile data
          console.log("[Profile] Fetching profile for user:", user.id);
          const response = await (insforge as any).database
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          
          console.log("[Profile] Raw response from database:", JSON.stringify(response, null, 2));
          
          const { data: profileData, error: profileError } = response;

          if (profileError) {
            console.error("Error fetching profile:", JSON.stringify(profileError, null, 2));
          } else {
            console.log("[Profile] Fetched profileData:", profileData ? "exists" : "none (new user)");
          }

          if (profileData) {
            // Get public URL for existing resume
            let publicUrl = null;
            if (profileData.resume_pdf_url) {
              publicUrl = await getResumeUrl(profileData.resume_pdf_url);
            }

            let generatedPublicUrl = null;
            if (profileData.generated_resume_pdf_url) {
              generatedPublicUrl = await getResumeUrl(profileData.generated_resume_pdf_url);
            }

            if (mounted) {
              setUser(user);
              setProfile({
                ...profileData,
                resume_pdf_url: publicUrl ? profileData.resume_pdf_url : null,
                resume_public_url: publicUrl,
                generated_resume_pdf_url: generatedPublicUrl ? profileData.generated_resume_pdf_url : null,
                generated_resume_public_url: generatedPublicUrl
              });
              setLoading(false);
            }
          } else if (mounted) {
            setUser(user);
            setProfile({
              id: user.id,
              email: user.email,
              full_name: '',
              skills: [],
              industries: [],
              work_experience: [],
              job_titles_seeking: [],
              preferred_locations: []
            });
            setLoading(false);
          }
        } else {
          if (mounted) {
            setLoading(false);
          }
        }
      } catch (e) {
        console.error("[Profile] loadData failed:", e);
        if (mounted) setLoading(false);
      }
    }
    
    loadData();
    
    return () => { 
      mounted = false; 
    };
  }, []);

  const handleSave = async (updatedData: any) => {
    setIsSaving(true);
    const result = await updateProfile(updatedData);
    setIsSaving(false);
    if (result.success) {
      setProfile(updatedData);
    } else {
      throw new Error(result.error);
    }
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await uploadResume({
          name: file.name,
          type: file.type,
          base64
        });

        if (result.success) {
          // Get public URL for the newly uploaded resume
          const publicUrl = await getResumeUrl(result.path!);
            
          setProfile((prev: any) => ({ 
            ...prev, 
            resume_pdf_url: result.path,
            resume_public_url: publicUrl
          }));
        } else {
          alert("Upload failed: " + result.error);
        }
        setIsUploading(false);
      };
    } catch (err) {
      console.error("Upload handler error:", err);
      setIsUploading(false);
    }
  };

  const handleExtract = async () => {
    if (!profile?.resume_pdf_url) {
      alert("Please upload a resume first.");
      return;
    }

    setIsExtracting(true);
    try {
      const response = await fetch("/api/resume/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: profile.resume_pdf_url }),
      });

      const result = await response.json();

      if (result.success) {
        // Merge extracted data into current profile (UI only, don't save yet)
        setProfile((prev: any) => ({
          ...prev,
          ...result.data,
          // Ensure we don't overwrite the URLs
          resume_pdf_url: prev.resume_pdf_url,
          resume_public_url: prev.resume_public_url,
        }));
        
        posthog.capture("profile_extracted", {
          userId: user.id,
          success: true
        });
      } else {
        alert("Extraction failed: " + result.error);
        posthog.capture("profile_extracted", {
          userId: user.id,
          success: false,
          error: result.error
        });
      }
    } catch (err: any) {
      console.error("Extraction handler error:", err);
      alert("Extraction error: " + err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerate = async () => {
    if (!profile) {
      alert("No profile data found.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/resume/generate", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        // Update profile with the new generated URL
        setProfile((prev: any) => ({
          ...prev,
          generated_resume_pdf_url: result.path,
          generated_resume_public_url: result.viewUrl
        }));
        
        posthog.capture("resume_generated", {
          userId: user.id
        });
        
        window.open(result.viewUrl, '_blank');
      } else {
        alert("Generation failed: " + result.error);
      }
    } catch (err: any) {
      console.error("Generation handler error:", err);
      alert("Generation error: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate profile completion
  const calculateCompletion = (prof: any) => {
    if (!prof) return { percentage: 0, missing: ['NAME', 'TITLE', 'SKILLS', 'EXPERIENCE'] };
    
    const fields = [
      { name: 'full_name', label: 'NAME' },
      { name: 'current_title', label: 'TITLE' },
      { name: 'skills', label: 'SKILLS', isArray: true },
      { name: 'work_experience', label: 'EXPERIENCE', isArray: true },
      { name: 'job_titles_seeking', label: 'TITLES', isArray: true },
      { name: 'preferred_locations', label: 'LOCATIONS', isArray: true },
      { name: 'remote_preference', label: 'REMOTE' },
      { name: 'salary_expectation', label: 'SALARY' },
      { name: 'cover_letter_tone', label: 'TONE' }
    ];
    
    const missing = [];
    let completed = 0;
    
    for (const field of fields) {
      const val = prof[field.name];
      const isPopulated = field.isArray 
        ? (Array.isArray(val) && val.length > 0)
        : (val && val.toString().trim().length > 0);
        
      if (isPopulated) {
        completed++;
      } else {
        missing.push(field.label);
      }
    }
    
    return {
      percentage: Math.round((completed / fields.length) * 100),
      missing
    };
  };

  const completion = calculateCompletion(profile);

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col items-center bg-background">
        <div className="absolute top-0 left-0 w-full h-[500px] pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-20%] left-[10%] w-[60%] h-[80%] bg-info-light/40 blur-[120px] rounded-full" />
          <div className="absolute top-[-10%] right-[10%] w-[50%] h-[70%] bg-accent-light/40 blur-[120px] rounded-full" />
        </div>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-accent" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen flex flex-col items-center bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="card-premium max-w-md w-full text-center py-12">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto mb-6 border border-accent/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-text-darkest mb-2">Welcome to JobFolio</h3>
            <p className="text-text-secondary mb-8">Sign in to manage your profile and start finding jobs.</p>
            <Link href="/login" className="btn-primary w-full py-3 rounded-xl font-semibold shadow-lg shadow-accent/20 transition-all">
              Sign In to Continue
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-15%] left-[-5%] w-[50%] h-[60%] bg-info-light/30 blur-[120px] rounded-full" />
        <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[55%] bg-accent-light/30 blur-[120px] rounded-full" />
      </div>

      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-6 pt-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column - Form */}
          <div className="flex-1 w-full lg:w-2/3">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-text-darkest mb-2 tracking-tight">Your Profile</h1>
              <p className="text-sm text-text-secondary">Keep your details up to date for the best job matches.</p>
            </div>

            <ProfileForm 
              initialData={profile} 
              onSave={handleSave} 
              isLoading={isSaving}
            />
          </div>

          {/* Right Column - Status & Resume */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-24 space-y-6 self-start pb-24">
            <CompletionIndicator 
              percentage={completion.percentage} 
              missingFields={completion.missing} 
            />
            <ResumeUpload 
              currentResumeUrl={profile?.resume_pdf_url} 
              publicResumeUrl={profile?.resume_public_url}
              generatedResumeUrl={profile?.generated_resume_public_url}
              onUpload={handleUpload}
              onExtract={handleExtract}
              onGenerate={handleGenerate}
              isUploading={isUploading}
              isExtracting={isExtracting}
              isGenerating={isGenerating}
            />
            
            {/* Quick Actions Card */}
            <div className="card-premium">
              <h3 className="text-base font-bold text-text-darkest mb-6">Account</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => signOutAction()}
                  className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-[#7C5CFC] hover:bg-[#7C5CFC]/90 text-white text-sm font-bold rounded-full transition-all shadow-sm active:scale-[0.98]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
