import OpenAI from 'openai';
import { Profile, Job } from './types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function generateCoverLetter(profile: Profile, job: Job): Promise<string> {
  const tone = profile.cover_letter_tone || 'formal';
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const systemPrompt = `You are an expert career coach and professional writer. Your task is to write a highly tailored cover letter for a candidate.

Rules:
1. Tone: The letter must be ${tone}.
2. Company Research: You MUST incorporate 1-2 specific, non-obvious facts from the "COMPANY RESEARCH" section provided. Show the candidate has done their homework.
3. The Edge: Explicitly link the candidate's specific skills (from "MATCHED SKILLS") to the job's core requirements.
4. Structure: 
   - Recipient header (Company Name, Location).
   - Compelling opening stating the role.
   - 2-3 body paragraphs showing fit and research.
   - Strong closing with call to action.
IMPORTANT: Do NOT include your own name, contact info, or the date at the top of the letter. These will be added by the UI template. Start directly with the company/recipient information.
5. Content: Be concise, impactful, and authentic. Avoid generic fluff.
6. Length: Keep it under 400 words.
7. Formatting: Use plain text with clear paragraph breaks. Do not use Markdown headers or bolding.`;

  const userPrompt = `
CURRENT DATE: ${currentDate}

CANDIDATE PROFILE:
Name: ${profile.full_name}
Current Title: ${profile.current_title}
Skills: ${profile.skills.join(', ')}
Key Experience: ${JSON.stringify(profile.work_experience.slice(0, 3))}

JOB DETAILS:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
About Role: ${job.about_role}
Matched Skills: ${job.matched_skills?.join(', ') || 'N/A'}

COMPANY RESEARCH:
${job.company_research ? JSON.stringify(job.company_research) : 'No specific research available. Use general professional knowledge about the company.'}

Write the cover letter now.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Empty response from OpenAI');

    // Cleanup: remove common header elements if the AI included them despite instructions
    const cleaned = content.trim();
    const fullName = profile.full_name.toLowerCase();
    const lines = cleaned.split('\n');
    const resultLines = [];
    let foundStartOfContent = false;
    
    const dateRegex = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}$/i;
    const dateWithLabelRegex = /^(Date|Today's Date|Current Date):\s+.*$/i;

    for (const line of lines) {
      const trimmedLine = line.trim();
      const lowerLine = trimmedLine.toLowerCase();
      
      if (!foundStartOfContent) {
        if (trimmedLine === '' || 
            lowerLine === fullName ||
            (lowerLine.includes(fullName) && (lowerLine.includes("name:") || lowerLine.includes("candidate:"))) ||
            lowerLine.includes("[candidate name]") ||
            lowerLine.includes("[today's date]") ||
            lowerLine.includes("[date]") ||
            dateRegex.test(trimmedLine) ||
            dateWithLabelRegex.test(trimmedLine)
        ) {
          continue;
        }
        foundStartOfContent = true;
      }
      resultLines.push(line);
    }

    return resultLines.join('\n').trim();
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw new Error('Failed to generate cover letter. Please try again later.');
  }
}
