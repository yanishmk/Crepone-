// Données du nouveau design : photos améliorées et avis Uber Eats, par nom de produit.
// Un produit absent de ces tables garde sa photo d'origine et n'affiche pas d'avis.

export const PHOTO_BY_NAME: Record<string, string> = {
  "Crêpe classique Nutella": "/images/v2/crepe_nutella_p.webp",
  "Crêpe classique Nutella & Fraise": "/images/v2/crepe_fraise_p.webp",
  "Crêpe classique Banane": "/images/v2/crepe_banane_p.webp",
  "Crêpe classique Oreo": "/images/v2/crepe_oreo_p.webp",
  "Crêpe classique Lotus": "/images/v2/crepe_lotus_p.webp",
  "Crêpe classique Bueno": "/images/v2/crepe_bueno_p.webp",
  "Crêpe classique Pistache": "/images/v2/crepe_pistache_p.webp",
  "Crêpe classique Dubai": "/images/v2/crepe_dubai_ai_p.webp",
  "Crêpe fruité": "/images/v2/crepe_fruite_p.webp",
  "Crêpe croustillante Dubai": "/images/v2/crepe_dubai_ai_p.webp",
  "Crêpe croustillante Pistache": "/images/v2/crepe_pistache_p.webp",
  "Crêpe croustillante Bueno": "/images/v2/crepe_bueno_p.webp",
  "Crêpe croustillante Nutella & Fraise": "/images/v2/crepe_fraise_p.webp",
  "Gaufre Nutella": "/images/v2/waffle_nutella_z.webp",
  "Gaufre Banane": "/images/v2/waffle_banane_z.webp",
  "Gaufre Fraise 🍓": "/images/v2/waffle_fraise_z.webp",
  "Gaufre Lotus": "/images/v2/waffle_lotus_z.webp",
  "Gaufre Oreo": "/images/v2/waffle_oreo_z.webp",
  "Gaufre Bueno": "/images/v2/waffle_bueno_z.webp",
  "Gaufre Pistache": "/images/v2/waffle_pistache_p.webp",
  "Gaufre Gourmande": "/images/v2/waffle_gourmande_p.webp",
  "Gaufre Dubai": "/images/v2/waffle_dubai_z.webp",
  "Croffle lotus biscoff": "/images/v2/croffle_lotus_t.webp",
  "Croffle fraise 🍓": "/images/v2/croffle_strawberry_t.webp",
  "Croffle Oreo": "/images/v2/croffle_oreo_t.webp",
  "Croffle banana 🍌": "/images/v2/croffle_banane_t.webp",
  "Poff's Nutella": "/images/v2/poffs_nutella_t.webp",
  "Poff's fraise 🍓": "/images/v2/poffs_strawberry_t.webp",
  "Poff's Oreo": "/images/v2/poffs_oreo_t.webp",
  "Poff's Lotus": "/images/v2/poffs_lotus_t.webp",
  "Poff's Pistache": "/images/v2/poffs_pistache_t.webp",
  "Poff's Bueno": "/images/v2/poffs_bueno_t.webp",
  "Poff's Banane": "/images/v2/poffs_banane_t.webp",
  "Poff's Dubai": "/images/v2/poffs_pistache_dubai_t.webp",
  "Poff's fruité": "/images/v2/poffs_fruite_t.webp",
  "Poff's Orientales": "/images/v2/poffs_pistache_dubai_t.webp",
  "Poff's Nutella Fraise": "/images/v2/poffs_strawberry_t.webp",
  "Poff's Gourmandes": "/images/v2/poffs_gourmandes_t.webp",
  "Shake Fraise": "/images/v2/shake_fraise_t.webp",
  "Shake Banane": "/images/v2/shake_banane_t.webp",
  "Shake Oreo": "/images/v2/shake_oreo_t.webp",
  "Shake Lotus": "/images/v2/shake_lotus_t.webp",
  "Shake KitKat": "/images/v2/shake_kitkat_t.webp",
  "Shake Bueno": "/images/v2/shake_bueno_t.webp",
  "Shake Dubai": "/images/v2/shake_dubai_t.webp",
  "Shake Ferrero": "/images/v2/shake_ferrero_t.webp",
  "Smoothie Fraise & Banane": "/images/v2/smoothie_fraise_banane_t.webp",
  "Smoothie Mangue & Ananas": "/images/v2/smoothie_mangue_ananas_t.webp",
  "Smoothie Fruits Rouges": "/images/v2/smoothie_fruits_rouges_t.webp",
  "Smoothie Mangue & Fraise": "/images/v2/smoothie_mangue_fraise_t.webp",
  "Strawberry Dubai": "/images/v2/crepe_strawberry_dubai_t.webp",
  "Strawberry Bueno": "/images/v2/cup_bueno_t.webp",
};

export type UberStats = { rank?: number; likePct?: number; reviews?: number };

export const UBER_STATS: Record<string, UberStats> = {
  "Crêpe classique Bueno": { rank: 1, likePct: 76, reviews: 13 },
  "Crêpe classique Nutella & Fraise": { rank: 2 },
  "Crêpe classique Dubai": { rank: 3, likePct: 92, reviews: 14 },
  "Crêpe classique Oreo": { likePct: 84, reviews: 19 },
  "Crêpe classique Banane": { likePct: 80, reviews: 15 },
  "Crêpe classique Nutella": { likePct: 87, reviews: 16 },
  "Crêpe classique Lotus": { likePct: 90, reviews: 11 },
  "Crêpe classique Pistache": { likePct: 100, reviews: 9 },
  "Crêpe fruité": { likePct: 72, reviews: 11 },
  "Crêpe croustillante Bueno": { likePct: 83, reviews: 6 },
  "Crêpe croustillante Nutella & Fraise": { likePct: 80, reviews: 5 },
  "Gaufre Bueno": { likePct: 71, reviews: 7 },
  "Croffle lotus biscoff": { likePct: 100, reviews: 3 },
  "Croffle Oreo": { likePct: 100, reviews: 3 },
  "Croffle banana 🍌": { likePct: 100, reviews: 3 },
  "Poff's Bueno": { likePct: 75, reviews: 4 },
  "Poff's Oreo": { likePct: 75, reviews: 4 },
  "Poff's Banane": { likePct: 100, reviews: 4 },
  "Poff's Dubai": { likePct: 81, reviews: 11 },
  "Poff's Nutella Fraise": { likePct: 66, reviews: 3 },
  "Poff's fraise 🍓": { likePct: 100, reviews: 4 },
  "Shake Banane": { likePct: 75, reviews: 4 },
  "Shake Ferrero": { likePct: 75, reviews: 4 },
  "Shake Dubai": { likePct: 66, reviews: 3 },
  "Smoothie Fraise & Banane": { likePct: 66, reviews: 9 },
  "Smoothie Fruits Rouges": { likePct: 100, reviews: 4 },
  "Smoothie Mangue & Ananas": { likePct: 77, reviews: 9 },
  "Strawberry Dubai": { likePct: 87, reviews: 56 },
  "Strawberry Bueno": { likePct: 100, reviews: 10 },
};

// Retirés du menu affiché (on peut aussi les supprimer dans /admin).
export const HIDDEN_NAMES = new Set<string>(["Crêpe Gourmande", "Crêpe croustillante Gourmandes", "Crêpe Halawa"]);

export const CATEGORY_LABELS: Record<string, string> = {
  "Crêpes Classiques": "Crêpes",
  "Crêpes Croustillantes": "Croustillantes",
};

// Photos détourées (sans assiette) : affichées sans cadre rond.
export function isCutout(src: string): boolean {
  return /_(t|c)\.webp$/.test(src);
}
