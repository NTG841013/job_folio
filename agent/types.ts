export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  current_title: string;
  experience_level: string;
  years_experience: number;
  skills: string[];
  industries: string[];
  work_experience: any[];
  education: any[];
  job_titles_seeking: string[];
  remote_preference: string;
  preferred_locations: string[];
  salary_expectation?: string;
  cover_letter_tone: string;
  linkedin_url?: string;
  portfolio_url?: string;
  work_authorization?: string;
  resume_pdf_url?: string;
  is_complete: boolean;
};

export type MatchResult = {
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missing_skills: string[]; // matching DB naming or use missingSkills? DB uses missing_skills
};

export type Job = {
  id: string;
  user_id: string;
  run_id?: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  job_type?: string;
  about_role?: string;
  responsibilities?: string[];
  requirements?: string[];
  nice_to_have?: string[];
  benefits?: string[];
  about_company?: string;
  match_score?: number;
  match_reason?: string;
  matched_skills?: string[];
  missing_skills?: string[];
  company_research?: any;
  cover_letter?: string;
  found_at: string;
};
