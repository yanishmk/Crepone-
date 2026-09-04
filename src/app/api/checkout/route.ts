import { NextResponse } from "next/server";
import crypto from "crypto";
import Stripe from "stripe";
import {
  createHubOrderPayload,
  stripeLineItems,
  type CheckoutOrderRequest,
} from "@/lib/checkoutOrder";

export const runtime = "nodejs";

function siteUrl(req: Request): string {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
}

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe n'est pas configure cote serveur" },
      { status: 500 }
    );
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const body = (await req.json()) as CheckoutOrderRequest;
    const externalId = `stripe-${crypto.randomUUID()}`;
    const order = createHubOrderPayload(body, externalId, "paid_externally");
    const baseUrl = siteUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: stripeLineItems(order),
      customer_email: order.customer.email,
      customer_creation: "if_required",
      phone_number_collection: { enabled: true },
      success_url: `${baseUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?checkout=cancelled`,
      metadata: {
        externalId,
        orderType: order.orderType,
        requestedFor: order.requestedFor ?? "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur Stripe inconnue" },
      { status: 400 }
    );
  }
}
