import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  createHubOrderPayload,
  type CheckoutOrderItemInput,
  type CheckoutOrderRequest,
} from "@/lib/checkoutOrder";

export const runtime = "nodejs";

const HUB_URL = process.env.CLUSTER_HUB_URL || "http://localhost:3000";
const HUB_API_KEY = process.env.CLUSTER_HUB_WEBSITE_API_KEY || "";

export async function POST(req: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook non configure" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Signature Stripe manquante" }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Signature Stripe invalide" },
      { status: 400 }
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true, ignored: "payment_not_paid" });
  }

  const order = await orderFromPaidStripeSession(stripe, session);
  const hubRes = await fetch(`${HUB_URL}/orders/website`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": HUB_API_KEY },
    body: JSON.stringify(order),
  });

  const hubBody = await hubRes.text();
  if (!hubRes.ok) {
    return NextResponse.json(
      { error: "Le hub de commandes a refuse la commande payee", details: hubBody },
      { status: 502 }
    );
  }

  return NextResponse.json({
    received: true,
    order: JSON.parse(hubBody),
  });
}

async function orderFromPaidStripeSession(
  stripe: Stripe,
  session: Stripe.Checkout.Session
) {
  const externalId = session.metadata?.externalId || `stripe-${session.id}`;
  const orderType = session.metadata?.orderType === "dine_in" ? "dine_in" : "pickup";
  const requestedFor = session.metadata?.requestedFor || undefined;
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

  const items: CheckoutOrderItemInput[] = lineItems.data
    .filter((line) => line.description !== "Taxes TPS + TVQ")
    .map((line) => ({
      name: line.description ?? undefined,
      quantity: line.quantity ?? 1,
    }));

  const customer = session.customer_details;
  const body: CheckoutOrderRequest = {
    customer: {
      name: customer?.name || session.metadata?.customerName || "Client Stripe",
      phone: customer?.phone ?? session.metadata?.customerPhone ?? undefined,
      email: customer?.email ?? session.metadata?.customerEmail ?? undefined,
    },
    orderType,
    requestedFor,
    items,
  };

  return createHubOrderPayload(body, externalId, "paid_externally");
}
