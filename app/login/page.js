"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setStatus(error ? "error" : "sent");
  };

  return (
    <div className="app">
      <header className="masthead">
        <h1 className="wordmark">
          Hearth<em>.</em>
        </h1>
      </header>

      <main className="stage">
        <section className="panel" aria-label="Sign in">
          <div className="field">
            <span className="field-label">Sign in</span>
            <p className="safety" style={{ marginTop: 0 }}>
              We&rsquo;ll email you a link — no password to remember.
            </p>

            {status === "sent" ? (
              <p role="status">Check your inbox for a sign-in link.</p>
            ) : (
              <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="chip"
                  style={{ textAlign: "left", width: "100%" }}
                />
                <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Send magic link"}
                </button>
                {status === "error" && <p role="alert">Something went wrong. Try again.</p>}
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
