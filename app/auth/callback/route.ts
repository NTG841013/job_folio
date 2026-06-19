import { createInsforgeServer } from "@/lib/insforge-server";
import { setAuthCookies } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code") || searchParams.get("insforge_code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const codeVerifier = cookieStore.get("insforge-code-verifier")?.value || cookieStore.get("insforge_code_verifier")?.value;

    if (codeVerifier) {
      const insforge = await createInsforgeServer();
      console.log("Exchanging code:", code, "with verifier:", codeVerifier ? "found" : "not found");

      const { data, error } = await insforge.auth.exchangeOAuthCode(code, codeVerifier);

      if (error || !data) {
        console.error("Auth callback error:", error);
        return NextResponse.redirect(`${origin}/login?error=auth-failed&details=${encodeURIComponent(error?.message || "Exchange failed")}`);
      }

      console.log("Auth success, user:", data.user.id);
      const response = NextResponse.redirect(`${origin}${next}`);
      
      // Set the auth cookies on the redirect response
      setAuthCookies(response.cookies, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      // Clear both hyphen and underscore verifiers
      response.cookies.delete("insforge-code-verifier");
      response.cookies.delete("insforge_code_verifier");
      return response;
    }

    console.log("Auth callback verifier missing, redirecting to client exchange fallback");
    return NextResponse.redirect(
      `${origin}/auth/callback-client?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`,
    );
  }

  return NextResponse.redirect(`${origin}/login?error=auth-failed`);
}
