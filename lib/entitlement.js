"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export function useEntitlement(user) {
  const [isPro, setIsPro] = useState(false);
  const [gate, setGate] = useState(null); // the reason text, or null when closed
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsPro(false);
      return;
    }
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("hearth_subscriptions")
      .select("status, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const notExpired = !data?.current_period_end || new Date(data.current_period_end) > new Date();
        setIsPro(Boolean(data && ACTIVE_STATUSES.has(data.status) && notExpired));
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const requirePro = useCallback(
    (locked, reason) => {
      if (!locked || isPro) return true;
      setGate(reason);
      return false;
    },
    [isPro]
  );

  const closeGate = useCallback(() => setGate(null), []);

  const startCheckout = useCallback(async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setGate(data.error || "Checkout isn't available yet — try again shortly.");
      }
    } catch {
      setGate("Checkout isn't available yet — try again shortly.");
    } finally {
      setCheckingOut(false);
    }
  }, [user]);

  return { isPro, gate, requirePro, closeGate, startCheckout, checkingOut };
}
