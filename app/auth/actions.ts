"use server";

import "server-only";
import { createInsforgeServer } from "@/lib/insforge-server";
import { clearAuthCookies } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signOutAction() {
  const insforge = await createInsforgeServer();
  
  // Call SDK sign out to invalidate session if possible
  await insforge.auth.signOut();
  
  // Clear auth cookies
  const cookieStore = await cookies();
  clearAuthCookies(cookieStore as any);
  
  // Explicitly clear legacy hyphenated cookies too
  cookieStore.delete('insforge-access-token');
  cookieStore.delete('insforge-refresh-token');

  // Also clear the SDK standard ones explicitly just in case clearAuthCookies missed them
  cookieStore.delete('insforge_access_token');
  cookieStore.delete('insforge_refresh_token');
  
  // Redirect to homepage
  redirect("/");
}
