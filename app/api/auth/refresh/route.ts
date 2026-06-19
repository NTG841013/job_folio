import { createRefreshAuthRouter } from "@insforge/sdk/ssr";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

if (!baseUrl || !anonKey) {
  throw new Error("Missing InsForge baseUrl or anonKey in environment variables.");
}

const { POST } = createRefreshAuthRouter({
  baseUrl,
  anonKey,
});

export { POST };
