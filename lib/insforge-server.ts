import "server-only";
import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";

export const createInsforgeServer = async (cookieStore?: any, accessToken?: string) => {
  const finalCookieStore = cookieStore || await cookies();
  
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    throw new Error("Missing InsForge baseUrl or anonKey in environment variables.");
  }

  return createServerClient({
    baseUrl,
    anonKey,
    cookies: finalCookieStore,
    accessToken,
  });
};
