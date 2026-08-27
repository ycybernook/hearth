"use client";

import { useEffect } from "react";

// Belt-and-suspenders: if a Supabase auth code ever lands on a page other
// than /auth/callback (e.g. because /auth/callback isn't yet in the
// project's allowed Redirect URLs), the browser client's own detectSessionInUrl
// still exchanges it — this just scrubs the leftover ?code= from the address
// bar afterwards so it doesn't linger, and it's never resubmitted.
export default function AuthCodeCleanup() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("code")) return;
    url.searchParams.delete("code");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  }, []);
  return null;
}
