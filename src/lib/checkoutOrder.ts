import type { MenuItem } from "./menuStore";
import type { Promotion } from "./menuStore";
import { applyPromotions, type AppliedPromotion } from "./promotions";

const QC_TAX_RATE = 0.14975;

export interface CheckoutOrderItemInput {
  id?: number;
  name?: string;
  quantity: number;
}

export interface CheckoutOrderRequest {
  customer: { name: string; phone?: string; email?: string };
  orderType: "pickup" | "dine_in";
  requestedFor?: string;
  items: CheckoutOrderItemInput[];
}

export interface HubOrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  modifiers: { name: string; price: number }[];
  notes?: string;
  clusterItemUid?: number;
}

export interface HubOrderPayload {
  externalId: string;
  orderType: "pickup" | "dine_in";
  requestedFor?: string;
  customer: { name: string; phone?: string; email?: string };
  items: HubOrderItem[];
  subtotal: number;
  discountTotal?: number;
  appliedPromotions?: AppliedPromotion[];
  tax: number;
  total: number;
  paymentStatus: "pay_at_pos" | "paid_externally";
}

export function createHubOrderPayload(
  body: CheckoutOrderRequest,
  externalId: string,
  paymentStatus: HubOrderPayload["paymentStatus"],
  menu: MenuItem[],
  promotions: Promotion[] = []
): HubOrderPayload {
  if (!body.customer?.name?.trim()) {
    throw new Error("Le nom du client est requis");
  }
  if (!isValidEmail(body.customer.email)) {
    throw new Error("Email client invalide");
  }
  if (!body.items?.length) {
    throw new Error("Le panier est vide");
  }
  if (body.orderType !== "pickup" && body.orderType !== "dine_in") {
    throw new Error("Type de commande invalide");
  }

  const byId = new Map(menu.map((item) => [item.id, item]));
  const byName = new Map(menu.map((item) => [item.name, item]));

  const rawItems = body.items.map((input) => {
    const menuItem =
      input.id !== undefined
        ? byId.get(input.id)
        : input.name
          ? byName.get(input.name)
          : undefined;

    if (!menuItem) {
      throw new Error(`Item introuvable: ${input.name ?? input.id ?? "inconnu"}`);
    }
    if (menuItem.inStock === false) {
      throw new Error(`${menuItem.name} est epuise`);
    }
    if (menuItem.clusterItemUid === undefined) {
      throw new Error(`${menuItem.name} n'est pas encore mappe au POS`);
    }

    const quantity = Number(input.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      throw new Error(`Quantite invalide pour ${menuItem.name}`);
    }

    return {
      id: menuItem.id,
      name: menuItem.name,
      quantity,
      unitPrice: parsePrice(menuItem.price),
      clusterItemUid: menuItem.clusterItemUid,
    };
  });

  const subtotal = round2(rawItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0));
  const promotionResult = applyPromotions(rawItems, promotions, menu);
  const discountedSubtotal = round2(
    promotionResult.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  );
  const tax = round2(discountedSubtotal * QC_TAX_RATE);

  return {
    externalId,
    orderType: body.orderType,
    requestedFor: body.requestedFor,
    customer: {
      name: body.customer.name.trim(),
      phone: body.customer.phone?.trim() || undefined,
      email: body.customer.email?.trim().toLowerCase() || undefined,
    },
    items: promotionResult.items,
    subtotal,
    discountTotal: promotionResult.discountTotal || undefined,
    appliedPromotions: promotionResult.appliedPromotions.length ? promotionResult.appliedPromotions : undefined,
    tax,
    total: round2(discountedSubtotal + tax),
    paymentStatus,
  };
}

export function stripeLineItems(order: HubOrderPayload) {
  const lineItems = order.items.filter((item) => item.unitPrice > 0).map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: "cad",
      unit_amount: toCents(item.unitPrice),
      product_data: { name: item.name },
    },
  }));

  if (order.tax > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "cad",
        unit_amount: toCents(order.tax),
        product_data: { name: "Taxes TPS + TVQ" },
      },
    });
  }

  return lineItems;
}

function parsePrice(price: string): number {
  const amount = Number(price.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`Prix invalide: ${price}`);
  }
  return round2(amount);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function toCents(n: number): number {
  return Math.round(n * 100);
}

function isValidEmail(value: string | undefined): boolean {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()));
}
