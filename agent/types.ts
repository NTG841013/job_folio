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
