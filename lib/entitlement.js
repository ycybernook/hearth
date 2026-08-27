"use client";

import { useCallback, useState } from "react";

// ---------------------------------------------------------------------------
// PHASE 2 REPLACEMENT
//
// Swap the body of this hook for a Supabase read:
//
//   const { data } = await supabase
//     .from("subscriptions")
//     .select("status, current_period_end")
//     .eq("user_id", user.id)
//     .single();
//   const isPro = data?.status === "active" || data?.status === "trialing";
//
// and point startCheckout() at a /api/checkout route that creates a
// Stripe Checkout session. Nothing else in the app needs to change —
// every gate goes through isPro and requirePro().
// ---------------------------------------------------------------------------

export function useEntitlement() {
  const [isPro, setIsPro] = useState(false);
  const [gate, setGate] = useState(null); // the reason text, or null when closed

  const requirePro = useCallback(
    (locked, reason) => {
      if (!locked || isPro) return true;
      setGate(reason);
      return false;
    },
    [isPro]
  );

  const closeGate = useCallback(() => setGate(null), []);

  const startCheckout = useCallback(() => {
    // TODO: POST /api/checkout -> redirect to Stripe.
    // For now this previews the unlocked build.
    setIsPro(true);
    setGate(null);
  }, []);

  return { isPro, gate, requirePro, closeGate, startCheckout };
}
