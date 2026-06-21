import OpenAI from "openai";
import { CURRENCY_MAP, formatSalary } from "@/lib/utils";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function estimateSalary(title: string, company: string, location: string, country: string, description: string) {
  const config = CURRENCY_MAP[country.toLowerCase()] || CURRENCY_MAP.us;
  const { symbol, code } = config;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `You are a recruitment expert specializing in global tech salaries.
Your task is to estimate a realistic annual salary range for a job based on its title, company, location, and a snippet of its description.

Use your knowledge of local market rates for the given country (${country.toUpperCase()}) and city (${location}).
The currency is ${code} (${symbol}).

Return a JSON object with:
{
  "min": number,
  "max": number,
  "confidence": "high" | "medium" | "low",
  "reason": "short explanation of the estimate based on local market data"
}

If you absolutely cannot estimate, return 0 for min and max.`
      },
      {
        role: "user",
        content: `Job Title: ${title}
Company: ${company}
Location: ${location}
Country: ${country.toUpperCase()}
Description Snippet: ${description}`
      }
    ]
  });

  const content = response.choices[0].message.content;
  if (!content) return null;

  try {
    const data = JSON.parse(content);
    if (data.min > 0) {
      const formatted = formatSalary(data.min, data.max, country);
      return `Estimated: ${formatted}`;
    }
  } catch (e) {
    console.error("Failed to parse salary estimate:", e);
  }

  return null;
}
