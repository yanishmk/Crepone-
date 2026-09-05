import type { HubOrderItem } from "./checkoutOrder";
import type { MenuItem, Promotion } from "./menuStore";

type PromotionMenuItem = Omit<MenuItem, "isNew" | "isFeatured" | "badge" | "rating" | "reviews" | "description" | "photo" | "category"> & {
  isNew?: boolean;
  isFeatured?: boolean;
};

export interface AppliedPromotion {
  id: string;
  name: string;
  amount: number;
}

interface PromotionInputItem {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  clusterItemUid?: number;
}

export function applyPromotions(
  items: PromotionInputItem[],
  promotions: Promotion[],
  menu: PromotionMenuItem[]
): { items: HubOrderItem[]; discountTotal: number; appliedPromotions: AppliedPromotion[] } {
  const orderItems: HubOrderItem[] = items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    modifiers: [],
    clusterItemUid: item.clusterItemUid,
  }));
  const appliedPromotions: AppliedPromotion[] = [];
  const subtotal = round2(orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0));

  for (const promo of promotions.filter((p) => p.enabled)) {
    if (promo.type === "percent") {
      if (promo.minimumSubtotal && subtotal < promo.minimumSubtotal) continue;
      const percent = Math.max(0, Math.min(100, promo.percentOff));
      const eligibleItemIds = new Set(promo.appliesToItemIds ?? []);
      const eligibleSubtotal = round2(
        items
          .filter((item) => eligibleItemIds.size === 0 || eligibleItemIds.has(item.id))
          .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
      );
      const amount = round2(eligibleSubtotal * (percent / 100));
      if (amount > 0) appliedPromotions.push({ id: promo.id, name: promo.name, amount });
    }

    if (promo.type === "buy_get") {
      const item = orderItems.find((row) => row.clusterItemUid && items.find((i) => i.name === row.name)?.id === promo.itemId);
      if (!item || promo.buyQuantity <= 0 || promo.getQuantity <= 0) continue;
      const groupSize = promo.buyQuantity + promo.getQuantity;
      const freeUnits = Math.floor(item.quantity / groupSize) * promo.getQuantity;
      const amount = round2(freeUnits * item.unitPrice);
      if (amount > 0) appliedPromotions.push({ id: promo.id, name: promo.name, amount });
    }

    if (promo.type === "free_item_threshold") {
      if (subtotal < promo.minimumSubtotal) continue;
      const freeItem = menu.find((item) => item.id === promo.freeItemId && item.inStock !== false);
      if (!freeItem) continue;
      const freeItemPrice = parsePrice(freeItem.price);
      if (freeItemPrice <= 0 || freeItem.clusterItemUid === undefined) continue;
      orderItems.push({
        name: `${freeItem.name} (gratuit)`,
        quantity: 1,
        unitPrice: 0,
        modifiers: [],
        clusterItemUid: freeItem.clusterItemUid,
      });
      appliedPromotions.push({ id: promo.id, name: promo.name, amount: freeItemPrice });
    }
  }

  const discountTotal = round2(Math.min(
    appliedPromotions.reduce((sum, promo) => sum + promo.amount, 0),
    subtotal
  ));

  return {
    items: distributeDiscount(orderItems, discountTotal),
    discountTotal,
    appliedPromotions,
  };
}

function distributeDiscount(items: HubOrderItem[], discountTotal: number): HubOrderItem[] {
  const paidItems = items.filter((item) => item.unitPrice > 0);
  const subtotal = paidItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  if (discountTotal <= 0 || subtotal <= 0) return items;

  let remainingDiscount = discountTotal;
  return items.map((item, index) => {
    if (item.unitPrice <= 0) return item;
    const isLastPaid = paidItems[paidItems.length - 1] === item;
    const lineTotal = item.unitPrice * item.quantity;
    const lineDiscount = isLastPaid ? remainingDiscount : round2(discountTotal * (lineTotal / subtotal));
    remainingDiscount = round2(remainingDiscount - lineDiscount);
    const discountedUnitPrice = round2(Math.max(0, (lineTotal - lineDiscount) / item.quantity));
    return {
      ...item,
      unitPrice: discountedUnitPrice,
      notes: [item.notes, index === 0 ? "PROMOTION APPLIQUEE" : ""].filter(Boolean).join(" - ") || undefined,
    };
  });
}

export function calculatePromotionPreview(
  cart: { item: PromotionMenuItem; quantity: number }[],
  promotions: Promotion[],
  menu: PromotionMenuItem[]
) {
  const items = cart.map((cartItem) => ({
    id: cartItem.item.id,
    name: cartItem.item.name,
    quantity: cartItem.quantity,
    unitPrice: parsePrice(cartItem.item.price),
    clusterItemUid: cartItem.item.clusterItemUid,
  }));
  return applyPromotions(items, promotions, menu);
}

function parsePrice(price: string): number {
  const amount = Number(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) ? round2(amount) : 0;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
