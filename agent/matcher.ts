import OpenAI from 'openai';
import { AdzunaJob } from '@/lib/adzuna';
import { Profile, MatchResult } from './types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function scoreJob(profile: Profile, job: AdzunaJob): Promise<MatchResult> {
  const systemPrompt = `You are an expert technical recruiter. You will be given a candidate's profile and a job listing.
Your task is to score the match from 0 to 100 and provide a concise reason, identifying matched and missing skills.

Rules:
- matchScore: 0-100 integer. Be realistic. 90+ is perfect match, 70+ is strong, 50+ is okay, <50 is weak.
- matchReason: 1-2 sentences explaining why the score was given.
- matchedSkills: Array of specific technical skills from the profile that appear in or are highly relevant to the job.
- missing_skills: Array of technical skills mentioned in the job listing that are NOT in the candidate's profile.

Return ONLY valid JSON.`;

  const userPrompt = `CANDIDATE PROFILE:
Title: ${profile.current_title}
Experience: ${profile.years_experience} years (${profile.experience_level})
Skills: ${profile.skills.join(', ')}
Work History: ${JSON.stringify(profile.work_experience.slice(0, 2))}

JOB LISTING:
Title: ${job.title}
Company: ${job.company?.display_name || 'Unknown Company'}
Description Snippet: ${job.description}

Return JSON with matchScore, matchReason, matchedSkills, and missing_skills.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 500
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Empty response from OpenAI');

    const result = JSON.parse(content) as MatchResult;
    
    // Ensure numeric score
    result.matchScore = Math.min(100, Math.max(0, Math.round(result.matchScore)));
    
    return result;
  } catch (error) {
    console.error('Error scoring job:', error);
    return {
      matchScore: 0,
      matchReason: 'Failed to calculate match score due to an error.',
      matchedSkills: [],
      missing_skills: []
    };
  }
}
