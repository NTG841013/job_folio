import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "./components/PostHogProvider";
import { cookies } from "next/headers";
import { createInsforgeServer } from "@/lib/insforge-server";
import { AuthInitializer } from "./components/AuthInitializer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobFolio - AI-Powered Job Hunting Assistant",
  description: "Set up your profile, find jobs, and research companies with AI.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const insforge = await createInsforgeServer(cookieStore as any);
  const { data: { user } } = await insforge.auth.getCurrentUser();
  const accessToken = cookieStore.get("insforge_access_token")?.value ?? null;

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-text-primary">
        <PostHogProvider>
          <AuthInitializer user={user} accessToken={accessToken}>
            {children}
          </AuthInitializer>
        </PostHogProvider>
      </body>
    </html>
  );
}
