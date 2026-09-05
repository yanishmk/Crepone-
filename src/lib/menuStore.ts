import fs from "fs";
import path from "path";
import postgres, { type JSONValue } from "postgres";

export interface MenuItem {
  id: number;
  category: string;
  name: string;
  price: string;
  badge: string;
  rating: string;
  reviews: number;
  description: string;
  photo: string;
  isNew: boolean;
  isFeatured: boolean;
  inStock?: boolean;
  clusterItemUid?: number;
}

export type Promotion =
  | {
      id: string;
      enabled: boolean;
      name: string;
      type: "percent";
      percentOff: number;
      minimumSubtotal?: number;
      appliesToItemIds?: number[];
    }
  | {
      id: string;
      enabled: boolean;
      name: string;
      type: "buy_get";
      itemId: number;
      buyQuantity: number;
      getQuantity: number;
    }
  | {
      id: string;
      enabled: boolean;
      name: string;
      type: "free_item_threshold";
      freeItemId: number;
      minimumSubtotal: number;
    };

const MENU_PATH = path.join(process.cwd(), "data", "menu.json");
const MENU_KEY = "menu";
const PROMOTIONS_KEY = "promotions";

let sqlClient: postgres.Sql | null = null;

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function sql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  sqlClient ??= postgres(normalizeDatabaseUrl(process.env.DATABASE_URL), {
    max: 1,
    prepare: false,
    ssl: process.env.NODE_ENV === "production" ? "require" : undefined,
  });
  return sqlClient;
}

function normalizeDatabaseUrl(value: string): string {
  let url = value.trim().replace(/^DATABASE_URL=/, "").trim();
  url = url.replace(/^["']|["']$/g, "");

  const match = url.match(/^(postgres(?:ql)?:\/\/[^:]+:)(.*)(@[^/@]+:\d+\/.*)$/);
  if (!match) return url;

  const [, prefix, rawPassword, suffix] = match;
  const password = rawPassword.replace(/^\[(.*)]$/, "$1");
  return `${prefix}${encodeURIComponent(decodeURIComponentSafe(password))}${suffix}`;
}

function decodeURIComponentSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function readFileMenu(): MenuItem[] {
  return JSON.parse(fs.readFileSync(MENU_PATH, "utf-8")) as MenuItem[];
}

function writeFileMenu(menu: MenuItem[]) {
  fs.writeFileSync(MENU_PATH, JSON.stringify(menu, null, 2));
}

async function ensureMenuTable() {
  await sql()`
    CREATE TABLE IF NOT EXISTS crepone_store (
      key text PRIMARY KEY,
      value jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
}

export async function readMenu(): Promise<MenuItem[]> {
  if (!hasDatabase()) return readFileMenu();

  await ensureMenuTable();
  const rows = await sql()<[{ value: MenuItem[] }]>`
    SELECT value FROM crepone_store WHERE key = ${MENU_KEY}
  `;

  if (rows.length > 0) return rows[0].value;

  const seedMenu = readFileMenu();
  await writeMenu(seedMenu);
  return seedMenu;
}

export async function writeMenu(menu: MenuItem[]) {
  if (!hasDatabase()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is required to persist menu changes in production");
    }
    writeFileMenu(menu);
    return;
  }

  await ensureMenuTable();
  await sql()`
    INSERT INTO crepone_store (key, value, updated_at)
    VALUES (${MENU_KEY}, ${sql().json(menu as unknown as JSONValue)}, now())
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = now()
  `;
}

export async function readPromotions(): Promise<Promotion[]> {
  if (!hasDatabase()) return [];

  await ensureMenuTable();
  const rows = await sql()<[{ value: Promotion[] }]>`
    SELECT value FROM crepone_store WHERE key = ${PROMOTIONS_KEY}
  `;
  return rows[0]?.value ?? [];
}

export async function writePromotions(promotions: Promotion[]) {
  if (!hasDatabase()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is required to persist promotions in production");
    }
    return;
  }

  await ensureMenuTable();
  await sql()`
    INSERT INTO crepone_store (key, value, updated_at)
    VALUES (${PROMOTIONS_KEY}, ${sql().json(promotions as unknown as JSONValue)}, now())
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = now()
  `;
}

export async function writePendingOrder(externalId: string, order: unknown) {
  if (!hasDatabase()) return;
  await ensureMenuTable();
  await sql()`
    INSERT INTO crepone_store (key, value, updated_at)
    VALUES (${`pending_order_${externalId}`}, ${sql().json(order as JSONValue)}, now())
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = now()
  `;
}

export async function readPendingOrder<T>(externalId: string): Promise<T | null> {
  if (!hasDatabase()) return null;
  await ensureMenuTable();
  const rows = await sql()<[{ value: T }]>`
    SELECT value FROM crepone_store WHERE key = ${`pending_order_${externalId}`}
  `;
  return rows[0]?.value ?? null;
}
