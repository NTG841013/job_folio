import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const API_KEY = "ik_06e656bc56fe047fc1d4b1f6d0657ad0"; // From MCP.JSON
const API_BASE_URL = "https://vrthxj7q.eu-central.insforge.app";

const sql = `
-- Drop existing tables to align with architecture.md
DROP TABLE IF EXISTS public.experience CASCADE;
DROP TABLE IF EXISTS public.education CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.agent_runs CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.agent_logs CASCADE;

-- Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  current_title TEXT,
  experience_level TEXT,
  years_experience INTEGER,
  skills TEXT[],
  industries TEXT[],
  work_experience JSONB,
  education JSONB,
  job_titles_seeking TEXT[],
  remote_preference TEXT,
  preferred_locations TEXT[],
  salary_expectation TEXT,
  cover_letter_tone TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  work_authorization TEXT,
  resume_pdf_url TEXT,
  generated_resume_pdf_url TEXT,
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- agent_runs Table
CREATE TABLE public.agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'running',
  job_title_searched TEXT,
  location_searched TEXT,
  country_searched TEXT,
  jobs_found INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;

-- jobs Table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES public.agent_runs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source TEXT DEFAULT 'search',
  source_url TEXT,
  external_apply_url TEXT,
  title TEXT,
  company TEXT,
  location TEXT,
  salary TEXT,
  job_type TEXT,
  about_role TEXT,
  responsibilities TEXT[],
  requirements TEXT[],
  nice_to_have TEXT[],
  benefits TEXT[],
  about_company TEXT,
  match_score INTEGER,
  match_reason TEXT,
  matched_skills TEXT[],
  missing_skills TEXT[],
  company_research JSONB,
  found_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- agent_logs Table
CREATE TABLE public.agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES public.agent_runs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  level TEXT DEFAULT 'info',
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own agent_runs" ON public.agent_runs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own jobs" ON public.jobs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own agent_logs" ON public.agent_logs FOR ALL USING (auth.uid() = user_id);
`;

async function main() {
  console.log("Setting up database schema according to architecture.md...");
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/database/advance/rawsql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({ query: sql })
    });

    console.log("Schema setup successful.");

    // Verification
    const verifySql = `
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('profiles', 'agent_runs', 'jobs', 'agent_logs');
    `;
    const verifyResponse = await fetch(`${API_BASE_URL}/api/database/advance/rawsql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({ query: verifySql })
    });

    if (verifyResponse.ok) {
      const result = await verifyResponse.json();
      console.log("Verified tables:", result);
    }

    // Bucket verification/creation
    console.log("Checking storage buckets...");
    const bucketResponse = await fetch(`${API_BASE_URL}/api/storage/buckets`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY
      }
    });
    console.log("Bucket response status:", bucketResponse.status);

    if (bucketResponse.ok) {
      console.log("Bucket response received.");
      const buckets = await bucketResponse.json();
      console.log("Existing buckets:", JSON.stringify(buckets, null, 2));
      
      const bucketList = Array.isArray(buckets) ? buckets : (buckets.data || buckets.buckets || []);
      const resumeBucket = bucketList.find((b: any) => b.name === 'resumes' || b.id === 'resumes');
      
      if (!resumeBucket) {
        console.log("Creating 'resumes' bucket...");
        const createBucketResponse = await fetch(`${API_BASE_URL}/api/storage/buckets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
          },
          body: JSON.stringify({ bucketName: 'resumes', isPublic: false })
        });
        
        if (createBucketResponse.ok) {
          console.log("'resumes' bucket created successfully.");
          console.log(await createBucketResponse.json());
        } else {
          console.error("Failed to create bucket:", await createBucketResponse.text());
        }
      } else {
        console.log("'resumes' bucket already exists.");
      }
    } else {
      console.error("Failed to list buckets:", await bucketResponse.text());
    }
  } catch (error) {
    console.error("Error setting up database:", error);
  }
}

main();
