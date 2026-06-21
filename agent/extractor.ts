import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function extractProfileFromText(text: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 800,
    messages: [
      {
        role: "system",
        content: `You are an expert resume parser. Your task is to extract career information from the provided resume text and return it in a structured JSON format that matches our profile schema.

Return only valid JSON. If a field is not found, use null or an empty array as appropriate.

JSON Schema:
{
  "full_name": string or null,
  "email": string or null,
  "phone": string or null,
  "location": string or null,
  "current_title": string or null,
  "experience_level": "Junior" | "Mid-Level" | "Senior" | "Lead" | "Executive",
  "years_experience": number,
  "skills": string[],
  "industries": string[],
  "work_experience": [
    {
      "company": string,
      "title": string,
      "location": string,
      "startDate": string,
      "endDate": string,
      "current": boolean,
      "description": string
    }
  ],
  "education": [
    {
      "school": string,
      "degree": string,
      "field": string,
      "graduationDate": string
    }
  ],
  "linkedin_url": string or null,
  "portfolio_url": string or null,
  "work_authorization": string or null
}

IMPORTANT: Ensure all fields in the JSON are present. If a value is unknown, use "" for strings, [] for arrays, and false for "current". NEVER use null or undefined inside work_experience or education objects. All education entries must be objects within the "education" array.`,
      },
      {
        role: "user",
        content: `Resume text to parse:
---
${text}
---`,
      },
    ],
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to parse AI response as JSON:", content);
    throw new Error("Invalid JSON response from AI");
  }
}
