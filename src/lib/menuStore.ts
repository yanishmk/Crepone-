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

const MENU_PATH = path.join(process.cwd(), "data", "menu.json");
const MENU_KEY = "menu";

let sqlClient: postgres.Sql | null = null;

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function sql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  sqlClient ??= postgres(process.env.DATABASE_URL, {
    max: 1,
    ssl: process.env.NODE_ENV === "production" ? "require" : undefined,
  });
  return sqlClient;
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
