import fs from "fs";
import path from "path";
import type { HubOrderPayload } from "./checkoutOrder";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "stripe-pending-orders.json");

interface PendingStripeOrder {
  sessionId: string;
  order: HubOrderPayload;
  createdAt: string;
  sentToHubAt?: string;
}

type Store = Record<string, PendingStripeOrder>;

export function savePendingStripeOrder(sessionId: string, order: HubOrderPayload) {
  const store = readStore();
  store[sessionId] = {
    sessionId,
    order,
    createdAt: new Date().toISOString(),
  };
  writeStore(store);
}

export function getPendingStripeOrder(sessionId: string): PendingStripeOrder | null {
  return readStore()[sessionId] ?? null;
}

export function markPendingStripeOrderSent(sessionId: string) {
  const store = readStore();
  const pending = store[sessionId];
  if (!pending) return;
  store[sessionId] = {
    ...pending,
    sentToHubAt: new Date().toISOString(),
  };
  writeStore(store);
}

function readStore(): Store {
  if (!fs.existsSync(STORE_PATH)) return {};
  return JSON.parse(fs.readFileSync(STORE_PATH, "utf-8")) as Store;
}

function writeStore(store: Store) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}
