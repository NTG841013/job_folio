import "server-only";
import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";

export const createInsforgeServer = async (cookieStore?: unknown, accessToken?: string) => {
  const finalCookieStore = (cookieStore as any) || await cookies(); // eslint-disable-line @typescript-eslint/no-explicit-any
  
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    throw new Error("Missing InsForge baseUrl or anonKey in environment variables.");
  }

  return createServerClient({
    baseUrl,
    anonKey,
    cookies: {
      get: (name: string) => {
        const val = finalCookieStore.get(name);
        if (val) return (typeof val === 'string' ? val : val.value);
        // Fallback for underscore/hyphen mismatch
        if (name.includes('_')) {
          const fallback = finalCookieStore.get(name.replace(/_/g, '-'));
          return fallback ? (typeof fallback === 'string' ? fallback : fallback.value) : undefined;
        }
        if (name.includes('-')) {
          const fallback = finalCookieStore.get(name.replace(/-/g, '_'));
          return fallback ? (typeof fallback === 'string' ? fallback : fallback.value) : undefined;
        }
        return undefined;
      },
    },
    accessToken,
  });
};
