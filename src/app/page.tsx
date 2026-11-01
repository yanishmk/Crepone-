"use client";

import Image from "next/image";
import Script from "next/script";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { calculatePromotionPreview } from "@/lib/promotions";
import type { Promotion } from "@/lib/menuStore";
import { DESIGN_BOTTOM, DESIGN_TOP } from "./designMarkup";
import { CATEGORY_LABELS, HIDDEN_NAMES, PHOTO_BY_NAME, UBER_STATS, isCutout } from "./menuExtras";
import "./home.css";

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

// Sections statiques du design : mémorisées pour que React ne les recrée jamais
// (les animations modifient leur contenu après le chargement).
const StaticDesign = memo(function StaticDesign({ html }: { html: string }) {
  return <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: html }} />;
});

function formatPrice(price: string): string {
  return parsePriceValue(price).toFixed(2).replace(".", ",") + " $";
}

// ── Menu (données de /api/menu, gérées dans /admin) ──────────────────────────

function MenuTile({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) {
  const src = PHOTO_BY_NAME[item.name] ?? item.photo;
  const cut = isCutout(src);
  const stats = UBER_STATS[item.name];
  const out = item.inStock === false;
  return (
    <article className={`mcard${out ? " is-out" : ""}`}>
      <div className={`mimg ${cut ? "cut" : "photo"}`}>
        {stats?.rank && !out ? <span className="rk">#{stats.rank}</span> : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={item.name} loading="lazy" />
      </div>
      <div className="meta">
        {out && <span className="chip out">Rupture de stock</span>}
        {stats?.rank ? <span className="chip rank">#{stats.rank} le plus commandé</span> : null}
        {stats?.likePct ? (
          <span className="chip like">
            {stats.likePct} % aiment · {stats.reviews} avis
          </span>
        ) : null}
        {item.isNew && <span className="chip pop">Nouveau</span>}
      </div>
      <h3>{item.name}</h3>
      <p>{item.description}</p>
      <div className="row-price">
        <span className="price">{formatPrice(item.price)}</span>
        <button type="button" className="add" disabled={out} onClick={() => onAdd(item)}>
          {out ? "Indisponible" : "+ Ajouter"}
        </button>
      </div>
    </article>
  );
}

function MenuSection({ menu, onAdd }: { menu: MenuItem[]; onAdd: (item: MenuItem) => void }) {
  const items = menu.filter((m) => !HIDDEN_NAMES.has(m.name));
  const categories = Array.from(new Set(items.map((m) => m.category)));
  const [selected, setSelected] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const current = selected && categories.includes(selected) ? selected : categories[0];

  return (
    <section id="menu">
      <div className="wrap">
        <div className="sec-head center">
          <div>
            <div className="eyebrow">Menu complet</div>
            <h2>Choisis ton dessert</h2>
          </div>
          <p>Tout est préparé à la commande. Ajoute tes desserts au panier et paye en ligne pour emporter ou sur place.</p>
        </div>
        <div className="tabs" role="tablist" aria-label="Catégories du menu">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              className="tab"
              aria-selected={c === current}
              onClick={() => {
                setSelected(c);
                setAnimKey((k) => k + 1);
              }}
            >
              {CATEGORY_LABELS[c] ?? c}
            </button>
          ))}
        </div>
        <div key={animKey} className={`menu${animKey ? " anim" : ""}`} role="tabpanel">
          {items.length === 0 && <p className="note">Chargement du menu…</p>}
          {items
            .filter((m) => m.category === current)
            .map((m) => (
              <MenuTile key={m.id} item={m} onAdd={onAdd} />
            ))}
        </div>
        <p className="note" style={{ textAlign: "center" }}>
          Prix avant taxes. Disponibilité selon les stocks du soir.
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addToCart = useCallback((item: MenuItem) => {
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
  }, []);

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
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  useEffect(() => {
    fetch("/api/menu").then((r) => r.json()).then(setMenu);
    fetch("/api/promotions").then((r) => r.ok ? r.json() : []).then(setPromotions);
  }, []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const message =
      checkout === "success"
        ? "Paiement reçu. Ta commande a été envoyée à CrepOne."
        : checkout === "cancelled"
          ? "Paiement annulé. Ton panier n'a pas été envoyé."
          : null;
    if (!message) return;

    if (checkout === "success" || checkout === "cancelled") {
      window.history.replaceState(null, "", window.location.pathname);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      setTimeout(() => setToast(message), 0);
      toastTimeout.current = setTimeout(() => setToast(null), 4200);
    }
  }, []);

  // Prix et boutons « Ajouter » des sections du design (vedettes, étiquette du héros)
  useEffect(() => {
    if (!menu.length) return;
    document.querySelectorAll<HTMLElement>("[data-price-for]").forEach((el) => {
      const item = menu.find((m) => m.name === el.dataset.priceFor);
      if (item) el.textContent = formatPrice(item.price);
    });
    document.querySelectorAll<HTMLElement>("[data-add-name]").forEach((el) => {
      const item = menu.find((m) => m.name === el.dataset.addName);
      el.hidden = !item || item.inStock === false;
    });
    document.dispatchEvent(new Event("crepone:menu"));
  }, [menu]);

  // Clics dans le design : ouvrir le panier, ajouter un produit vedette
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("[data-open-cart]")) {
        e.preventDefault();
        setIsCartOpen(true);
        return;
      }
      const add = target.closest<HTMLElement>("[data-add-name]");
      if (add) {
        const item = menu.find((m) => m.name === add.dataset.addName);
        if (item && item.inStock !== false) addToCart(item);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [menu, addToCart]);

  return (
    <main>
      <StaticDesign html={DESIGN_TOP} />
      <MenuSection menu={menu} onAdd={addToCart} />
      <StaticDesign html={DESIGN_BOTTOM} />
      <Script src="/design/home.js" strategy="afterInteractive" />

      {cartCount > 0 && !isCartOpen && (
        <button type="button" className="cart-fab" onClick={() => setIsCartOpen(true)}>
          Voir le panier <b>{cartCount}</b>
        </button>
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        menu={menu}
        promotions={promotions}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />

      {toast && (
        <div className="toast-crep" role="status">
          {toast}
        </div>
      )}
    </main>
  );
}

function CartDrawer({
  isOpen,
  onClose,
  cart,
  menu,
  promotions,
  updateQuantity,
  removeFromCart,
}: {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  menu: MenuItem[];
  promotions: Promotion[];
  updateQuantity: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
}) {
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
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
  const promotionPreview = calculatePromotionPreview(cart, promotions, menu);
  const discountPreview = promotionPreview.discountTotal;
  const discountedSubtotal = Math.max(0, subtotal - discountPreview);
  const taxPreview = discountedSubtotal * TAX_RATE_PREVIEW;
  const totalPreview = discountedSubtotal + taxPreview;

  const phoneDigits = phone.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length >= 7;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = name.trim().length > 0 && isPhoneValid && isEmailValid;

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

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name, phone, email },
          orderType,
          requestedFor: requestedFor.toISOString(),
          items: cart.map((c) => ({
            id: c.item.id,
            name: c.item.name,
            quantity: c.quantity,
          })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Le paiement n'a pas pu démarrer");
      }
      const body = (await res.json()) as { url?: string };
      if (!body.url) throw new Error("Stripe n'a pas retourne d'URL de paiement");

      setReadyTime(requestedFor);
      setCustomerName(name);
      window.location.assign(body.url);
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
      setEmail("");
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
                {discountPreview > 0 && (
                  <div className="flex justify-between text-[#f5c518]">
                    <span>Promotion</span>
                    <span>-${discountPreview.toFixed(2)}</span>
                  </div>
                )}
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
              <label className="mb-1 block text-xs font-bold text-white/60">Email pour le reçu</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-white/10 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1e7a45]"
                placeholder="nom@email.com"
              />
              {email.length > 0 && !isEmailValid && (
                <p className="mt-1 text-xs font-bold text-amber-400">
                  Adresse email invalide.
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
                {submitting ? "Paiement…" : error ? "Réessayer" : "Payer maintenant"}
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
