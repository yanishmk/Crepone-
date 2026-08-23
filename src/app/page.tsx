"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const ORDER_URL =
  "https://www.ubereats.com/ca-fr/store/crepone/Z1HdH29GWI6fRHH_3HRHZQ";

const LOGO_URL = "/images/crepone-logo.jpg";

// ── Google Maps reviews ───────────────────────────────────────────────────────
const REVIEWS = [
  { author: "Sab H.",     stars: 5, text: "Excellent service, j'adore je recommande fortement !!!" },
  { author: "Kim L.",     stars: 5, text: "Delicious! Leaving you wanting more!" },
  { author: "Ziad H.",    stars: 5, text: "Excellent crêpes, vraiment délicieux !" },
  { author: "Melissa T.", stars: 5, text: "La crêpe Dubai est incroyable, la crème pistache est divine. Je reviens chaque semaine !" },
  { author: "Kevin M.",   stars: 5, text: "Le milkshake Lotus c'est de la folie. Meilleur dessert de Gatineau sans hésitation." },
  { author: "Sofia A.",   stars: 4, text: "Super bon ! Le croffle fraise était parfait. L'attente vaut vraiment la peine." },
  { author: "Rayan B.",   stars: 5, text: "Le poff's pistachio était une expérience hors du commun. À faire absolument !" },
  { author: "Camille D.", stars: 5, text: "La gaufre Nutella... wow. Servie généreusement, belle présentation. Top !" },
  { author: "Yasmina K.", stars: 4, text: "Très bonne qualité, ingrédients frais. Je recommande la crêpe Bueno et le shake Oreo." },
  { author: "Julien P.",  stars: 5, text: "On sort de là vraiment comblés. Service souriant et produits de qualité premium." },
];

// ── Promo texts ───────────────────────────────────────────────────────────────
const PROMO_TEXTS = [
  "🎉 Livraison rapide via Uber Eats",
  "⭐ 4.7 étoiles · 460+ avis vérifiés",
  "🔥 Nouveau: Poff's Pistachio & Dubai",
  "📍 668 Boul. Saint-Joseph, Gatineau",
  "⏰ Ouvert 18h – 23h45 tous les jours",
  "🍫 Crêpes · Gaufres · Croffles · Milkshakes",
];

type MenuItem = {
  id: number;
  category: string;
  name: string;
  price: string;
  badge: string;
  rating: string;
  reviews: number;
  description: string;
  photo: string;
  isNew?: boolean;
  isFeatured?: boolean;
  inStock?: boolean;
};

type CartItem = { item: MenuItem; quantity: number };
type OrderType = "pickup" | "dine_in";
type PickupMode = "asap" | "scheduled";

function parsePriceValue(price: string): number {
  const n = Number(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

// Taxe combinée TPS+TVQ — dupliquée côté client uniquement pour l'aperçu du
// panier ; le montant faisant foi est recalculé côté serveur dans /api/order.
const TAX_RATE_PREVIEW = 0.14975;

// Heures d'ouverture (voir footer/promo bar du site) — bornent les créneaux
// de retrait proposés au client.
const BUSINESS_OPEN_HOUR = 18;
const BUSINESS_CLOSE_HOUR = 23;
const BUSINESS_CLOSE_MINUTE = 45;

// Estimation par défaut du temps de préparation d'une commande (crêpe/gaufre
// faite à la commande) — ajustable si besoin.
const DEFAULT_PREP_MINUTES = 20;

function formatHHMM(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * Détermine la fenêtre de retrait disponible autour de l'instant "now":
 * - si le magasin est ouvert maintenant, la fenêtre commence maintenant même
 *   (ASAP possible) et se termine à la fermeture du jour;
 * - sinon, la prochaine fenêtre est l'ouverture (aujourd'hui si elle n'est
 *   pas encore passée, sinon demain).
 */
function getSchedulableWindow(now: Date) {
  const atTime = (hours: number, minutes: number, dayOffset = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const todayOpen = atTime(BUSINESS_OPEN_HOUR, 0);
  const todayClose = atTime(BUSINESS_CLOSE_HOUR, BUSINESS_CLOSE_MINUTE);

  if (now < todayOpen) {
    return { open: todayOpen, close: todayClose, isOpenNow: false };
  }
  if (now <= todayClose) {
    return { open: now, close: todayClose, isOpenNow: true };
  }
  return { open: atTime(BUSINESS_OPEN_HOUR, 0, 1), close: atTime(BUSINESS_CLOSE_HOUR, BUSINESS_CLOSE_MINUTE, 1), isOpenNow: false };
}

function MenuCard({
  item,
  onAdd,
}: {
  item: MenuItem;
  index: number;
  onAdd: (item: MenuItem) => void;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
      {/* Photo — taller for carousel context */}
      <div className="card-media relative" style={{ aspectRatio: "4/3" }}>
        <Image
          alt={item.name}
          fill
          className="card-media-inner object-cover"
          src={item.photo}
          sizes="(max-width: 640px) calc(100vw - 64px), 288px"
        />
        {/* Bottom gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Badge top-left */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <span className="rounded-full bg-white/92 px-3 py-1 text-xs font-black text-[#141414] shadow-sm backdrop-blur-sm">
            {item.badge}
          </span>
          {item.isNew && (
            <span className="rounded-full bg-[#1e7a45] px-3 py-1 text-xs font-black text-white shadow-sm">
              Nouveau
            </span>
          )}
        </div>

        {/* Rating pill top-right */}
        <div className="absolute right-3 top-3 rounded-full bg-white/92 px-2.5 py-1 text-xs font-black text-[#141414] shadow-sm backdrop-blur-sm">
          👍 {item.rating}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-black leading-tight">{item.name}</h3>
        <p className="mt-1.5 flex-1 text-xs leading-5 text-[#6b7280]">{item.description}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-xl font-black text-[#141414]">{item.price}</span>
          <button
            onClick={() => onAdd(item)}
            className="rounded-full bg-[#141414] px-5 py-2 text-xs font-black text-white transition-all hover:scale-105 hover:bg-[#1e7a45] active:scale-95"
          >
            + Ajouter
          </button>
        </div>
      </div>
    </article>
  );
}

function CategoryCarousel({
  sectionId,
  title,
  icon,
  items,
  onAdd,
}: {
  sectionId: string;
  title: string;
  icon: string;
  items: MenuItem[];
  onAdd: (item: MenuItem) => void;
}) {
  const [active, setActive] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const dragStartX = useRef(0);
  const isDragging = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const atStart = active === 0;
  const atEnd   = active === items.length - 1;

  const prev = () => { if (!atStart) setActive((i) => i - 1); };
  const next = () => { if (!atEnd)   setActive((i) => i + 1); };

  /* Bloque le scroll vertical de la page pendant un swipe horizontal */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onMove = (e: TouchEvent) => {
      const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
      const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
      if (dx > dy && dx > 8) e.preventDefault();
    };
    el.addEventListener("touchmove", onMove, { passive: false });
    return () => el.removeEventListener("touchmove", onMove);
  }, []);

  if (!items.length) return null;

  const current = items[active];

  return (
    <section className="border-t border-white/10 py-8" id={sectionId}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* Header — nom + prix live */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#f5c518]">
              {icon} Nos {title}
            </p>
            <h2 className="mt-0.5 text-2xl font-black tracking-tight text-white sm:text-3xl">{title}</h2>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="max-w-[170px] truncate text-sm font-bold text-white/60">{current.name}</p>
            <p className="text-xl font-black text-[#f5c518]">{current.price}</p>
          </div>
        </div>

        {/* Stage — overflow-hidden + peek mobile avec min(270px, 78vw) */}
        <div
          ref={stageRef}
          className="relative overflow-hidden rounded-3xl"
          style={{ height: 440, touchAction: "pan-y" }}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
          }}
          onTouchEnd={(e) => {
            const dx = touchStartX.current - e.changedTouches[0].clientX;
            const dy = touchStartY.current - e.changedTouches[0].clientY;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
              if (dx > 0) next(); else prev();
            }
          }}
          onMouseDown={(e) => { isDragging.current = true; dragStartX.current = e.clientX; }}
          onMouseUp={(e) => {
            if (!isDragging.current) return;
            isDragging.current = false;
            const dx = dragStartX.current - e.clientX;
            if (Math.abs(dx) > 40) { if (dx > 0) next(); else prev(); }
          }}
          onMouseLeave={() => { isDragging.current = false; }}
        >
          <div className="absolute inset-0 flex select-none items-center justify-center">
            {items.map((item, i) => {
              const offset = i - active; // linear (no wrap) since navigation is clamped
              if (Math.abs(offset) > 2) return null;

              const isActive = offset === 0;
              const abs = Math.abs(offset);
              const scale   = isActive ? 1 : abs === 1 ? 0.84 : 0.7;
              const opacity = isActive ? 1 : abs === 1 ? 0.45 : 0.1;
              const zIndex  = 10 - abs * 4;

              return (
                <div
                  key={item.id}
                  className="absolute"
                  style={{
                    /* 78vw sur mobile (~294px) → peek ~50px de la carte suivante
                       270px sur desktop → coverflow */
                    transform: `translateX(calc(${offset} * min(270px, 78vw))) scale(${scale})`,
                    opacity,
                    zIndex,
                    width: "min(288px, calc(100vw - 80px))",
                    transition: "transform 0.38s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.38s ease",
                    boxShadow: isActive ? "0 16px 48px rgba(0,0,0,0.16)" : "none",
                    borderRadius: "1rem",
                  }}
                >
                  {!isActive && (
                    <div
                      className="absolute inset-0 z-50 cursor-pointer"
                      onClick={() => setActive(i)}
                    />
                  )}
                  <MenuCard item={item} index={i} onAdd={onAdd} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={prev}
            disabled={atStart}
            aria-label="Précédent"
            className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-full border text-white transition-all active:scale-95 ${
              atStart
                ? "cursor-not-allowed border-white/15 bg-white/5 opacity-30"
                : "border-white/25 bg-white/10 hover:scale-105 hover:border-white/60"
            }`}
          >
            ←
          </button>

          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-1.5 rounded-full bg-[#f5c518]"
              style={{
                width: `${((active + 1) / items.length) * 100}%`,
                transition: "width 0.32s cubic-bezier(0.25,0.46,0.45,0.94)",
              }}
            />
          </div>

          <button
            onClick={next}
            disabled={atEnd}
            aria-label="Suivant"
            className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-full border text-white transition-all active:scale-95 ${
              atEnd
                ? "cursor-not-allowed border-white/15 bg-white/5 opacity-30"
                : "border-white/25 bg-white/10 hover:scale-105 hover:border-white/60"
            }`}
          >
            →
          </button>

          <span className="flex-shrink-0 tabular-nums text-xs font-bold text-white/40">
            {active + 1}/{items.length}
          </span>
        </div>
      </div>
    </section>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_LINKS = [
  { id: "crepes-classiques",     label: "Crêpes Classiques", icon: "🥞" },
  { id: "crepes-croustillantes", label: "Croustillantes",    icon: "🥞" },
  { id: "gaufres",               label: "Gaufres",           icon: "🧇" },
  { id: "croffles",              label: "Croffles",          icon: "🥐" },
  { id: "poffs",                 label: "Poff's",            icon: "🫧" },
  { id: "milkshakes",            label: "Milkshakes",        icon: "🥤" },
  { id: "smoothies",             label: "Smoothies",         icon: "🍹" },
  { id: "strawberry",            label: "Strawberry",        icon: "🍓" },
];

function CategoryNav() {
  return (
    <div className="sticky top-[72px] z-40 border-b border-white/10 bg-[#0a2018]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="scrollbar-none flex gap-1 overflow-x-auto py-2.5">
          {CATEGORY_LINKS.map(({ id, label, icon }) => (
            <a
              key={id}
              href={`#${id}`}
              className="flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-black text-white transition-all hover:bg-white/12"
            >
              {icon} {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
    // Confirmation discrète — on n'interrompt pas la navigation dans le menu
    // en ouvrant le panier à chaque ajout.
    setToast(`✓ ${item.name} ajouté au panier`);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(null), 2200);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.item.id === id ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((c) => c.item.id !== id));
  };

  const [menu, setMenu] = useState<MenuItem[]>([]);
  useEffect(() => {
    fetch("/api/menu").then((r) => r.json()).then(setMenu);
  }, []);

  return (
    <main className="min-h-screen">

      {/* ── Promo Bar ─────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden bg-[#141414] py-2 text-xs font-bold text-white">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...PROMO_TEXTS, ...PROMO_TEXTS].map((text, i) => (
            <span key={i} className="mx-10 flex-shrink-0">{text}</span>
          ))}
        </div>
      </div>

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a2018]/85 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
          <a className="flex items-center gap-3" href="#">
            <div className="flex h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-white/10">
              <Image alt="CrepOne logo" className="h-full w-full object-cover" height={58} src={LOGO_URL} width={58} />
            </div>
            <div>
              <span className="block text-2xl font-black leading-none tracking-tight text-white">CrepOne</span>
            </div>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-bold text-white/65 md:flex">
            <a href="#crepes-classiques"     className="transition-colors hover:text-[#f5c518]">Crêpes</a>
            <a href="#gaufres"               className="transition-colors hover:text-[#f5c518]">Gaufres</a>
            <a href="#milkshakes"            className="transition-colors hover:text-[#f5c518]">Milkshakes</a>
            <a href="#reviews"               className="transition-colors hover:text-[#f5c518]">Avis</a>
            <a href="#visit"                 className="transition-colors hover:text-[#f5c518]">Visiter</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label={`Panier (${cartCount})`}
              className="relative rounded-full bg-[#fef9c3] p-2.5 text-[#141414] transition-colors hover:bg-[#fde047]"
            >
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 w-5 animate-pulse-glow place-items-center rounded-full bg-[#1e7a45] text-[10px] font-black text-white">
                  {cartCount}
                </span>
              )}
            </button>
            <a
              href={ORDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#1e7a45] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-[#1e7a45]/25 transition-all hover:scale-105 hover:bg-[#196638]"
            >
              Commander
            </a>
          </div>
        </div>
      </header>

      <CategoryNav />

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden bg-[linear-gradient(135deg,#123a33_0%,#145247_38%,#2b7664_58%,#d9bd61_100%)] px-4 py-8 text-white sm:px-6 lg:min-h-[calc(100vh-112px)] lg:py-0"
        id="signature"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(245,197,24,0.18),transparent_24rem)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_45%,rgba(245,197,24,0.22),transparent_28rem)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#123a33] via-[#174f49]/86 to-[#123a33]/6" />
        <div className="pointer-events-none absolute bottom-0 right-[6%] hidden h-48 w-[34rem] rounded-full bg-black/24 blur-2xl lg:block" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 lg:min-h-[calc(100vh-112px)] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="max-w-3xl animate-slide-up py-3 lg:py-0">
            <h1 className="max-w-4xl text-5xl font-black leading-[0.92] tracking-tight sm:text-7xl lg:text-[7.4rem] xl:text-[8.2rem]">
              Dessert{" "}
              <span className="block text-[#f5c518]">signature.</span>
            </h1>

            <div className="relative mx-auto mt-3 flex min-h-[260px] items-end justify-center lg:hidden">
              <div className="absolute top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[#f5c518]/20 blur-3xl" />
              <div className="absolute bottom-3 h-16 w-56 rounded-full bg-black/28 blur-2xl" />
              <div className="absolute right-0 top-0 z-20 rounded-full border border-[#f5c518]/40 bg-[#141414]/78 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#f5c518] shadow-xl backdrop-blur">
                🏆 Best seller
              </div>
              <Image
                alt="Fraise Cup Strawberry Dubai CrepOne"
                className="relative z-10 h-auto w-[74%] max-w-[300px] animate-float drop-shadow-[0_28px_40px_rgba(0,0,0,0.42)]"
                height={480}
                priority
                src="/images/strawberry-dubai-cup-cutout.png"
                width={390}
              />
            </div>

            <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-white/82 sm:text-xl">
              Crêpes artisanales, gaufres belges, croffles et milkshakes —
              les saveurs authentiques de CrepOne, maintenant en boutique.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={ORDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-[#1e7a45] px-8 py-4 text-sm font-black text-white shadow-xl shadow-[#0a241c]/25 transition-all hover:scale-105 hover:bg-[#196638]"
              >
                Commander sur Uber Eats
              </a>
              <a
                href="#menu"
                className="inline-flex min-h-[52px] items-center gap-2 rounded-full border border-white/24 bg-white/10 px-8 py-4 text-sm font-black text-white backdrop-blur transition-all hover:scale-105 hover:bg-white/16"
              >
                Voir le menu →
              </a>
            </div>

          </div>

          <div className="relative hidden min-h-[330px] items-end justify-center lg:flex lg:min-h-[calc(100vh-112px)] lg:justify-end">
            <div className="absolute right-0 top-1/2 h-[22rem] w-[22rem] -translate-y-1/2 rounded-full bg-[#f5c518]/20 blur-3xl lg:h-[36rem] lg:w-[36rem]" />
            <div className="absolute bottom-8 h-24 w-80 rounded-full bg-black/28 blur-2xl lg:right-16 lg:w-[34rem]" />
            <div className="absolute right-4 top-4 z-20 rounded-full border border-[#f5c518]/40 bg-[#141414]/78 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#f5c518] shadow-xl backdrop-blur sm:right-16 lg:right-20 lg:top-16">
              🏆 Best seller
            </div>
            <Image
              alt="Fraise Cup Strawberry Dubai CrepOne"
              className="relative z-10 h-auto w-[76%] max-w-[390px] animate-float drop-shadow-[0_34px_48px_rgba(0,0,0,0.46)] lg:w-[78%] lg:max-w-[640px]"
              height={760}
              priority
              src="/images/strawberry-dubai-cup-cutout.png"
              width={620}
            />
          </div>
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────────────────────── */}
      <section className="overflow-hidden border-b border-white/10 bg-black/20 py-8 backdrop-blur-sm" id="reviews">
        {/* Header */}
        <div className="mx-auto mb-5 flex max-w-7xl items-center justify-between px-4 sm:px-6">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white">Ce que disent nos clients</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2">
            <GoogleIcon />
            <span className="font-black text-white">4.7</span>
            <div className="flex text-[#fbbf24]">
              {[1,2,3,4].map((s) => <span key={s}>★</span>)}
              <span className="text-white/30">★</span>
            </div>
            <span className="hidden text-xs font-bold text-white/55 sm:inline">Google Maps</span>
          </div>
        </div>

        {/* Marquee */}
        <div className="flex animate-marquee gap-4 whitespace-nowrap" style={{ animationDuration: "55s" }}>
          {[...REVIEWS, ...REVIEWS].map((r, i) => (
            <ReviewCard key={i} review={r} />
          ))}
        </div>
      </section>

      {/* ── Category Carousels ────────────────────────────────────────────────── */}
      {([
        { sectionId: "crepes-classiques",     label: "Crêpes Classiques",    icon: "🥞", cat: "Crêpes Classiques"     },
        { sectionId: "crepes-croustillantes", label: "Crêpes Croustillantes", icon: "🥞", cat: "Crêpes Croustillantes" },
        { sectionId: "gaufres",               label: "Gaufres",              icon: "🧇", cat: "Gaufres"               },
        { sectionId: "croffles",              label: "Croffles",             icon: "🥐", cat: "Croffles"              },
        { sectionId: "poffs",                 label: "Poff's",               icon: "🫧", cat: "Poff's"                },
        { sectionId: "milkshakes",            label: "Milkshakes",           icon: "🥤", cat: "Milkshakes"            },
        { sectionId: "smoothies",             label: "Smoothies",            icon: "🍹", cat: "Smoothies"             },
        { sectionId: "strawberry",            label: "Strawberry",           icon: "🍓", cat: "Strawberry"            },
      ]).map(({ sectionId, label, icon, cat }) => (
        <CategoryCarousel
          key={cat}
          sectionId={sectionId}
          title={label}
          icon={icon}
          items={menu.filter((m) => m.category === cat && m.inStock !== false)}
          onAdd={addToCart}
        />
      ))}

      {/* ── Location CTA ──────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 px-4 py-16 sm:px-6" id="visit">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-black/20 p-8 backdrop-blur-sm sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/55">
                Viens nous voir
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-white">CrepOne à Gatineau</h2>
              <p className="mt-4 max-w-lg leading-7 text-white/70">
                668 Boulevard Saint-Joseph, Gatineau, QC J8Y 4B4
                <br />
                Ouvert <strong className="text-white">18h – 23h45</strong> · Tous les jours
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={ORDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1e7a45] px-7 text-sm font-black text-white shadow-lg shadow-black/25 transition-all hover:scale-105 hover:bg-[#196638]"
                >
                  Commander maintenant
                </a>
                <a
                  href="https://maps.google.com/?q=668+Boulevard+Saint-Joseph+Gatineau+QC"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 text-sm font-black text-white transition-all hover:border-white/50 hover:bg-white/15"
                >
                  📍 Google Maps
                </a>
              </div>
            </div>
            <div className="mt-8 flex-shrink-0 rounded-3xl border border-white/15 bg-white/8 p-6 backdrop-blur lg:mt-0">
              <p className="text-5xl font-black text-[#f5c518]">4.7★</p>
              <p className="mt-2 text-sm font-black uppercase tracking-[0.18em] text-white/55">
                Google Maps
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 bg-[#071510]/90 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">

          {/* Top row */}
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">

            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white">
                <Image alt="CrepOne logo" className="h-full w-full object-cover" height={48} src={LOGO_URL} width={48} />
              </div>
              <div>
                <span className="block text-xl font-black text-white">CrepOne</span>
                <span className="text-xs text-white/45">Ice &amp; Crêpe · Gatineau</span>
              </div>
            </div>

            {/* Social + Google */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/crep_one/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram CrepOne"
                className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-all hover:scale-110 hover:bg-[#e1306c]"
              >
                <InstagramIcon />
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@crepone7"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok CrepOne"
                className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-all hover:scale-110 hover:bg-white hover:text-[#141414]"
              >
                <TikTokIcon />
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/p/CrepOne-61566200200895/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook CrepOne"
                className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-all hover:scale-110 hover:bg-[#1877f2]"
              >
                <FacebookIcon />
              </a>

              {/* Google Reviews */}
              <a
                href="https://maps.google.com/?q=CrepOne+668+Boulevard+Saint-Joseph+Gatineau+QC"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-5 text-sm font-black text-white transition-all hover:scale-105 hover:bg-white/20"
              >
                <GoogleIcon />
                <span>4.7 ★ Laisser un avis</span>
              </a>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <p className="text-sm text-white/55">
              668 Boul. Saint-Joseph, Gatineau, QC · Ouvert 18h – 23h45 tous les jours
            </p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <p className="text-xs text-white/30">© 2025 CrepOne. Tous droits réservés.</p>
              <a
                href="/admin"
                aria-label="Espace gestionnaire"
                className="grid h-7 w-7 place-items-center rounded-full text-white/20 transition-all hover:bg-white/10 hover:text-white/60"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.92c.04-.34.07-.69.07-1.08s-.03-.73-.07-1.08l2.32-1.82c.21-.16.27-.46.13-.7l-2.2-3.81c-.13-.23-.43-.31-.66-.23l-2.74 1.1c-.57-.44-1.18-.8-1.85-1.07L14 2.42C13.95 2.18 13.73 2 13.5 2h-3c-.23 0-.45.18-.49.42L9.67 5.05c-.67.27-1.28.63-1.85 1.07L5.08 5.02c-.24-.09-.53 0-.66.23L2.22 9.06c-.14.23-.08.54.13.7l2.32 1.82C4.63 11.27 4.6 11.63 4.6 12s.03.73.07 1.08L2.35 14.9c-.21.16-.27.46-.13.7l2.2 3.81c.13.23.43.31.66.23l2.74-1.1c.57.44 1.18.8 1.85 1.07l.34 2.63c.05.24.27.42.5.42h3c.23 0 .45-.18.49-.42l.34-2.63c.67-.27 1.28-.63 1.85-1.07l2.74 1.1c.23.09.53 0 .66-.23l2.2-3.81c.14-.23.08-.54-.13-.7l-2.32-1.82z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        onOrderSuccess={() => setCart([])}
      />

      {toast && (
        <div className="animate-slide-up fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-full bg-[#141414] px-5 py-3 text-sm font-black text-white shadow-2xl">
          {toast}
        </div>
      )}
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

const AVATAR_COLORS = ["bg-[#1e7a45]", "bg-[#141414]", "bg-[#d97706]", "bg-[#374151]", "bg-[#196638]"];

function ReviewCard({ review }: { review: { author: string; stars: number; text: string } }) {
  const initials = review.author.split(" ").map((w) => w[0]).join("");
  const color = AVATAR_COLORS[review.author.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div className="inline-flex w-64 flex-shrink-0 flex-col gap-2 whitespace-normal rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-full ${color} text-xs font-black text-white`}>
            {initials}
          </div>
          <div>
            <p className="text-xs font-black text-[#141414]">{review.author}</p>
            <div className="flex gap-0.5 text-xs">
              {[1,2,3,4,5].map((s) => (
                <span key={s} className={s <= review.stars ? "text-[#fbbf24]" : "text-[#d1d5db]"}>★</span>
              ))}
            </div>
          </div>
        </div>
        <GoogleIcon />
      </div>
      <p className="line-clamp-2 text-xs leading-5 text-[#4b5563]">&quot;{review.text}&quot;</p>
    </div>
  );
}

function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  );
}

function CartDrawer({
  isOpen,
  onClose,
  cart,
  updateQuantity,
  removeFromCart,
  onOrderSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  updateQuantity: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  onOrderSuccess: () => void;
}) {
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("pickup");
  const [pickupMode, setPickupMode] = useState<PickupMode>("asap");
  const [scheduledTime, setScheduledTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [readyTime, setReadyTime] = useState<Date | null>(null);

  const subtotal = cart.reduce(
    (sum, c) => sum + parsePriceValue(c.item.price) * c.quantity,
    0
  );
  const taxPreview = subtotal * TAX_RATE_PREVIEW;
  const totalPreview = subtotal + taxPreview;

  const phoneDigits = phone.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length >= 7;
  const canSubmit = name.trim().length > 0 && isPhoneValid;

  if (!isOpen) return null;

  const now = new Date();
  const schedule = getSchedulableWindow(now);
  const asapReadyTime = new Date(
    Math.min(now.getTime() + DEFAULT_PREP_MINUTES * 60_000, schedule.close.getTime())
  );

  function goToCheckout() {
    setPickupMode(schedule.isOpenNow ? "asap" : "scheduled");
    setScheduledTime(formatHHMM(schedule.open));
    setStep("checkout");
  }

  async function submitOrder() {
    setSubmitting(true);
    setError(null);
    try {
      let requestedFor: Date;
      if (pickupMode === "asap") {
        requestedFor = asapReadyTime;
      } else {
        const [h, m] = scheduledTime.split(":").map(Number);
        requestedFor = new Date(schedule.open);
        requestedFor.setHours(h, m, 0, 0);
      }

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name, phone },
          orderType,
          requestedFor: requestedFor.toISOString(),
          items: cart.map((c) => ({
            name: c.item.name,
            price: c.item.price,
            quantity: c.quantity,
          })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "La commande n'a pas pu être envoyée");
      }
      setReadyTime(requestedFor);
      setCustomerName(name);
      setStep("success");
      onOrderSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    onClose();
    // Laisse le temps à l'animation de fermeture avant de réinitialiser,
    // sinon on voit le flash du panier vide/étape "cart" pendant la sortie.
    setTimeout(() => {
      setStep("cart");
      setName("");
      setPhone("");
      setError(null);
    }, 200);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-black/50"
      onClick={handleClose}
    >
      <div
        className="animate-slide-in-right flex h-full w-full max-w-md flex-col overflow-y-auto bg-[#0a2018] p-6 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black">
            {step === "cart" && `Votre panier${cart.length ? ` (${cart.length})` : ""}`}
            {step === "checkout" && "Vos informations"}
            {step === "success" && "Commande envoyée !"}
          </h2>
          <button
            onClick={handleClose}
            aria-label="Fermer le panier"
            className="grid h-8 w-8 place-items-center rounded-full text-2xl text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        </div>

        {step === "cart" && (
          <>
            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                <p className="text-4xl">🥞</p>
                <p className="font-bold text-white/70">Ton panier est vide.</p>
                <button
                  onClick={handleClose}
                  className="mt-2 rounded-full bg-white/10 px-6 py-2.5 text-sm font-black hover:bg-white/20"
                >
                  Voir le menu
                </button>
              </div>
            ) : (
              <div className="flex-1 space-y-3">
                {cart.map((c) => (
                  <div
                    key={c.item.id}
                    className="flex items-center gap-3 rounded-2xl bg-white/5 p-3"
                  >
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-white/10">
                      <Image
                        alt={c.item.name}
                        fill
                        className="object-cover"
                        src={c.item.photo}
                        sizes="56px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{c.item.name}</p>
                      <p className="text-xs text-white/50">{c.item.price}</p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <button
                        onClick={() => updateQuantity(c.item.id, -1)}
                        aria-label={`Retirer un ${c.item.name}`}
                        className="h-7 w-7 rounded-full bg-white/10 transition-colors hover:bg-white/20"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm font-bold tabular-nums">
                        {c.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(c.item.id, 1)}
                        aria-label={`Ajouter un ${c.item.name}`}
                        className="h-7 w-7 rounded-full bg-white/10 transition-colors hover:bg-white/20"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(c.item.id)}
                      className="flex-shrink-0 text-white/40 transition-colors hover:text-red-400"
                      aria-label={`Retirer ${c.item.name} du panier`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            {cart.length > 0 && (
              <div className="mt-6 space-y-1.5 border-t border-white/10 pt-4 text-sm">
                <div className="flex justify-between text-white/60">
                  <span>Sous-total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Taxes (TPS + TVQ)</span>
                  <span>${taxPreview.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-1.5 text-base font-black">
                  <span>Total</span>
                  <span>${totalPreview.toFixed(2)}</span>
                </div>
                <button
                  onClick={goToCheckout}
                  className="mt-4 w-full rounded-full bg-[#1e7a45] py-3 text-sm font-black transition-all hover:scale-[1.02] hover:bg-[#196638]"
                >
                  Continuer →
                </button>
              </div>
            )}
          </>
        )}

        {step === "checkout" && (
          <div className="flex flex-1 flex-col gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-white/60">Nom complet</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg bg-white/10 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1e7a45]"
                placeholder="Ton nom"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-white/60">Téléphone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg bg-white/10 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1e7a45]"
                placeholder="514-555-0100"
              />
              {phone.length > 0 && !isPhoneValid && (
                <p className="mt-1 text-xs font-bold text-amber-400">
                  Numéro de téléphone incomplet.
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-white/60">Type de commande</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setOrderType("pickup")}
                  className={`flex-1 rounded-full py-2 text-xs font-black transition-colors ${
                    orderType === "pickup" ? "bg-[#1e7a45]" : "bg-white/10 hover:bg-white/15"
                  }`}
                >
                  À emporter
                </button>
                <button
                  onClick={() => setOrderType("dine_in")}
                  className={`flex-1 rounded-full py-2 text-xs font-black transition-colors ${
                    orderType === "dine_in" ? "bg-[#1e7a45]" : "bg-white/10 hover:bg-white/15"
                  }`}
                >
                  Sur place
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-white/60">Heure de retrait</label>
              {!schedule.isOpenNow && (
                <p className="mb-2 text-xs font-bold text-amber-400">
                  CrepOne est fermé en ce moment (ouvert 18h–23h45) — choisis une heure de
                  retrait{" "}
                  {schedule.open.toDateString() === now.toDateString() ? "pour ce soir." : "pour demain."}
                </p>
              )}
              <div className="flex gap-2">
                {schedule.isOpenNow && (
                  <button
                    onClick={() => setPickupMode("asap")}
                    className={`flex-1 rounded-full py-2 text-xs font-black transition-colors ${
                      pickupMode === "asap" ? "bg-[#1e7a45]" : "bg-white/10 hover:bg-white/15"
                    }`}
                  >
                    Dès que possible
                  </button>
                )}
                <button
                  onClick={() => setPickupMode("scheduled")}
                  className={`flex-1 rounded-full py-2 text-xs font-black transition-colors ${
                    pickupMode === "scheduled" ? "bg-[#1e7a45]" : "bg-white/10 hover:bg-white/15"
                  }`}
                >
                  Choisir une heure
                </button>
              </div>

              {pickupMode === "asap" ? (
                <p className="mt-2 text-xs text-white/50">
                  Prête vers <span className="font-bold text-white">{formatHHMM(asapReadyTime)}</span>{" "}
                  (~{DEFAULT_PREP_MINUTES} min de préparation)
                </p>
              ) : (
                <input
                  type="time"
                  value={scheduledTime}
                  min={formatHHMM(schedule.open)}
                  max={formatHHMM(schedule.close)}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="mt-2 w-full rounded-lg bg-white/10 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1e7a45]"
                />
              )}
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-bold text-red-400">
                {error}
              </p>
            )}

            <div className="mt-auto flex gap-2 border-t border-white/10 pt-4">
              <button
                onClick={() => setStep("cart")}
                className="rounded-full border border-white/20 px-4 py-3 text-xs font-black transition-colors hover:bg-white/10"
              >
                ← Retour
              </button>
              <button
                onClick={submitOrder}
                disabled={submitting || !canSubmit}
                className="flex-1 rounded-full bg-[#1e7a45] py-3 text-sm font-black transition-all hover:bg-[#196638] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? "Envoi…" : error ? "Réessayer" : "Confirmer la commande"}
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="text-4xl">🎉</p>
            <p className="text-lg font-black">Merci {customerName} !</p>
            <p className="text-sm text-white/60">
              Ta commande a été envoyée à CrepOne.
              {readyTime && (
                <>
                  {" "}
                  Prête vers <span className="font-bold text-white">{formatHHMM(readyTime)}</span>.
                </>
              )}
            </p>
            <button
              onClick={handleClose}
              className="mt-4 rounded-full bg-white/10 px-6 py-3 text-sm font-black hover:bg-white/20"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
