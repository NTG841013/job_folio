import { createBrowserClient } from "@insforge/sdk/ssr";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

export const insforge = createBrowserClient({
  baseUrl: baseUrl || "",
  anonKey: anonKey || "",
});

if (typeof window !== 'undefined') {
  (window as any).insforge = insforge;
  
  // Cleanup conflicting cookies on initialization
  // If we have underscore versions on localhost, ensure we don't have hyphenated ones causing confusion
  const cookies = document.cookie.split('; ');
  const hasUnderscore = cookies.some(c => c.startsWith('insforge_access_token='));
  const hasHyphen = cookies.some(c => c.startsWith('insforge-access-token='));
  
  if (hasUnderscore && hasHyphen) {
    console.log("[InsForge Client] Found both underscore and hyphen cookies, cleaning up hyphens...");
    document.cookie = "insforge-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "insforge-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}
