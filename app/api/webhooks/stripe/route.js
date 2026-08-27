import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Stripe requires the raw body for signature verification, so this route
// must not run through any body-parsing middleware.
export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.client_reference_id || session.metadata?.user_id;
      if (!userId) break;

      const subscription = session.subscription
        ? await stripe.subscriptions.retrieve(session.subscription)
        : null;

      await supabase.from("hearth_subscriptions").upsert(
        {
          user_id: userId,
          stripe_customer_id: session.customer,
          stripe_subscription_id: subscription?.id ?? null,
          status: subscription?.status ?? "active",
          current_period_end: subscription
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const userId = subscription.metadata?.user_id;
      if (!userId) break;

      await supabase.from("hearth_subscriptions").upsert(
        {
          user_id: userId,
          stripe_customer_id: subscription.customer,
          stripe_subscription_id: subscription.id,
          status: event.type === "customer.subscription.deleted" ? "canceled" : subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
