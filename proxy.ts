import { createInsforgeServer } from "@/lib/insforge-server";
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@insforge/sdk/ssr";

export default async function proxy(request: NextRequest) {
  // Initialize response
  const response = NextResponse.next({ request });

  // Skip auth checks for API routes and auth callback
  if (
    request.nextUrl.pathname.startsWith("/api/auth") ||
    request.nextUrl.pathname.startsWith("/auth/callback")
  ) {
    return response;
  }

  // Update session handles token refresh automatically
  // It reads from request.cookies and writes to response.cookies
  const { accessToken, error: refreshError } = await updateSession({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
    requestCookies: request.cookies as any,
    responseCookies: response.cookies as any,
  });

  if (refreshError) {
    console.warn(`[Proxy] Session update error:`, refreshError.message);
  }

  // Force clean up of hyphenated cookies if underscore versions exist
  if (request.cookies.has('insforge_access_token') && request.cookies.has('insforge-access-token')) {
    response.cookies.delete('insforge-access-token');
    response.cookies.delete('insforge-refresh-token');
  }

  // Use the request cookies and the current access token for the server client
  const insforge = await createInsforgeServer(request.cookies as any, accessToken || undefined);
  
  const {
    data: { user },
  } = await insforge.auth.getCurrentUser();

  console.log(`[Proxy] Path: ${request.nextUrl.pathname}, User: ${user ? user.id : 'null'}`);

  // If user is not logged in and trying to access protected routes
  if (
    !user &&
    (request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/profile") ||
      request.nextUrl.pathname.startsWith("/find-jobs"))
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    // Copy all cookies from the session update to the redirect response
    response.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  // If user is logged in and trying to access login page
  if (user && request.nextUrl.pathname.startsWith("/login")) {
    const homeUrl = new URL("/", request.url);
    const redirectResponse = NextResponse.redirect(homeUrl);
    // Copy all cookies from the session update to the redirect response
    response.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
