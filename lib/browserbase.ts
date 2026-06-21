import Browserbase from "@browserbasehq/sdk";

if (!process.env.BROWSERBASE_API_KEY) {
  console.warn("Warning: BROWSERBASE_API_KEY is not defined in environment variables.");
}

export const browserbase = new Browserbase({
  apiKey: process.env.BROWSERBASE_API_KEY || "",
});
