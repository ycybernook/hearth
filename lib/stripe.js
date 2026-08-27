import Stripe from "stripe";

// A placeholder key lets the module load (and the build succeed) before
// STRIPE_SECRET_KEY is set; any actual API call will fail with a clear
// "Invalid API Key" error from Stripe rather than a build-time crash.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-01-27.acacia",
});
