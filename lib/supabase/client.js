"use client";

import { createBrowserClient } from "@supabase/ssr";

// Singleton — several modules call createClient() independently (entitlement,
// sessions, sign-out). A fresh client per call would each try to detect and
// exchange any auth code in the URL, racing each other on a single-use code.
let client;

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return client;
}
