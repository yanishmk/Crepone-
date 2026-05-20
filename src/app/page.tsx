"use client";

import Image from "next/image";
import { useState } from "react";

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
};

const CATEGORIES = ["Tous", "Crêpes", "Gaufres", "Croffles", "Poff's", "Milkshakes", "Fraise Cup"];

const MENU: MenuItem[] = [
  // ── Crêpes ──────────────────────────────────────────────────────────────────
  { id: 1,  category: "Crêpes",  name: "Crêpe Nutella",   price: "$9.99",  badge: "💛 Classique", rating: "88%", reviews: 24, description: "Nutella fondant sur crêpe moelleuse et dorée.", photo: "/images/crepe_nutella.jpg" },
  { id: 2,  category: "Crêpes",  name: "Crêpe Fraise",    price: "$12.99", badge: "🍓 Frais",     rating: "86%", reviews: 18, description: "Fraises fraîches, chocolat et chantilly maison.", photo: "/images/crepe_strawberry_dubai.jpg" },
  { id: 3,  category: "Crêpes",  name: "Crêpe Banane",    price: "$12.99", badge: "🍌 Fruité",    rating: "84%", reviews: 12, description: "Banane fraîche, Nutella et noisettes concassées.", photo: "/images/crepe_nutella.jpg" },
  { id: 4,  category: "Crêpes",  name: "Crêpe Oreo",      price: "$13.99", badge: "🖤 Crunch",    rating: "84%", reviews: 19, description: "Miettes d'Oreo, crème vanille et chocolat fondu.", photo: "/images/crepe_oreo.jpg" },
  { id: 5,  category: "Crêpes",  name: "Crêpe Lotus",     price: "$13.99", badge: "🌟 Fan fav",   rating: "90%", reviews: 10, isFeatured: true, description: "Pâte Lotus Biscoff et miettes de biscuit caramel.", photo: "/images/crepe_lotus.jpg" },
  { id: 6,  category: "Crêpes",  name: "Crêpe Halawa",    price: "$14.99", badge: "✨ Exotique",  rating: "87%", reviews: 8,  description: "Crème halawa onctueuse et pistaches fraîches.", photo: "/images/crepe_pistachio.jpg" },
  { id: 7,  category: "Crêpes",  name: "Crêpe Pistache",  price: "$14.99", badge: "💚 Nouveau",   rating: "100%", reviews: 8, isNew: true, description: "Crème pistache riche et pistaches concassées.", photo: "/images/crepe_pistachio.jpg" },
  { id: 8,  category: "Crêpes",  name: "Crêpe Bueno",     price: "$14.99", badge: "💎 Signature", rating: "85%", reviews: 12, description: "Kinder Bueno, chocolat au lait et chantilly.", photo: "/images/crepe_bueno.jpg" },
  { id: 9,  category: "Crêpes",  name: "Crêpe Gourmande", price: "$15.99", badge: "👑 Chef",      rating: "92%", reviews: 15, description: "M&Ms, chocolat, chantilly et fruits frais.", photo: "/images/crepe_bueno.jpg" },
  { id: 10, category: "Crêpes",  name: "Crêpe Fruité",    price: "$15.99", badge: "🍉 Saison",    rating: "89%", reviews: 11, description: "Fruits frais de saison et coulis maison.", photo: "/images/crepe_strawberry_dubai.jpg" },
  { id: 11, category: "Crêpes",  name: "Crêpe Dubai",     price: "$15.99", badge: "⭐ Populaire", rating: "100%", reviews: 9, isFeatured: true, description: "Crème pistache, kadaifi croustillant et chocolat belge.", photo: "/images/crepe_dubai.jpg" },

  // ── Gaufres ─────────────────────────────────────────────────────────────────
  { id: 12, category: "Gaufres", name: "Gaufre Nutella",   price: "$9.99",  badge: "💛 Classique", rating: "86%", reviews: 20, description: "Gaufre croustillante garnie de Nutella et banane.", photo: "/images/waffle_nutella.jpg" },
  { id: 13, category: "Gaufres", name: "Gaufre Mordjene",  price: "$11.99", badge: "🌾 Maison",    rating: "88%", reviews: 14, description: "Gaufre à la crème Mordjene et amandes grillées.", photo: "/images/waffle_strawberry.jpg" },
  { id: 14, category: "Gaufres", name: "Gaufre Fraise",    price: "$12.99", badge: "🍓 Frais",     rating: "88%", reviews: 15, description: "Gaufre dorée, fraises fraîches et coulis maison.", photo: "/images/waffle_strawberry.jpg" },
  { id: 15, category: "Gaufres", name: "Gaufre Banane",    price: "$12.99", badge: "🍌 Fruité",    rating: "84%", reviews: 10, description: "Gaufre chaude, banane et sirop de caramel.", photo: "/images/waffle_nutella.jpg" },
  { id: 16, category: "Gaufres", name: "Gaufre Oreo",      price: "$13.99", badge: "🖤 Crunch",    rating: "84%", reviews: 19, isFeatured: true, description: "Gaufre croustillante, Oreo, crème vanille et sucre glace.", photo: "/images/waffle_oreo.jpg" },
  { id: 17, category: "Gaufres", name: "Gaufre Lotus",     price: "$13.99", badge: "🌟 Fan fav",   rating: "90%", reviews: 18, description: "Lotus Biscoff, caramel et crumble de biscuit.", photo: "/images/waffle_lotus.jpg" },
  { id: 18, category: "Gaufres", name: "Gaufre Bueno",     price: "$14.99", badge: "💎 Signature", rating: "85%", reviews: 7,  isFeatured: true, description: "Crumbles Bueno, crème noisette et chocolat belge.", photo: "/images/waffle_bueno.jpg" },
  { id: 19, category: "Gaufres", name: "Gaufre Pistache",  price: "$14.99", badge: "💚 Exotique",  rating: "90%", reviews: 8,  description: "Crème pistache et éclats de pistaches fraîches.", photo: "/images/waffle_lotus.jpg" },
  { id: 20, category: "Gaufres", name: "Gaufre Halawa",    price: "$14.99", badge: "✨ Nouveau",   rating: "87%", reviews: 6,  isNew: true, description: "Halawa fondante, pistaches et filet de miel.", photo: "/images/waffle_bueno.jpg" },
  { id: 21, category: "Gaufres", name: "Gaufre Gourmande", price: "$15.99", badge: "👑 Chef",      rating: "91%", reviews: 11, description: "M&Ms, choco fondu, chantilly et garnitures généreuses.", photo: "/images/waffle_oreo.jpg" },
  { id: 22, category: "Gaufres", name: "Gaufre Fruite",    price: "$15.99", badge: "🍉 Saison",    rating: "88%", reviews: 9,  description: "Fruits de saison, chantilly et coulis frais.", photo: "/images/waffle_strawberry.jpg" },
  { id: 23, category: "Gaufres", name: "Gaufre Dubai",     price: "$15.99", badge: "⭐ Premium",   rating: "89%", reviews: 12, isFeatured: true, description: "Crème pistache, kadaifi croustillant façon Dubai.", photo: "/images/waffle_dubai.jpg" },

  // ── Poff's ──────────────────────────────────────────────────────────────────
  { id: 24, category: "Poff's",  name: "Poff's Fraise",   price: "$12.99", badge: "🍓 Frais",     rating: "88%", reviews: 14, description: "Poff moelleux aux fraises fraîches et coulis rosé.", photo: "/images/poffs_strawberry.jpg" },
  { id: 25, category: "Poff's",  name: "Poff's Oreo",     price: "$13.99", badge: "🖤 Crunch",    rating: "84%", reviews: 9,  description: "Poff doré, miettes d'Oreo et crème vanille.", photo: "/images/poffs_nutella.jpg" },
  { id: 26, category: "Poff's",  name: "Poff's Lotus",    price: "$13.99", badge: "🌟 Fan fav",   rating: "90%", reviews: 12, description: "Poff Biscoff, notes caramel et texture feuilletée.", photo: "/images/poffs_bueno.jpg" },
  { id: 27, category: "Poff's",  name: "Poff's Pistache", price: "$14.99", badge: "💚 Nouveau",   rating: "92%", reviews: 6,  isNew: true, description: "Poff à la crème pistache et pistaches concassées.", photo: "/images/poffs_pistachio.jpg" },
  { id: 28, category: "Poff's",  name: "Poff's Dubai",    price: "$14.99", badge: "⭐ Populaire", rating: "77%", reviews: 9,  isFeatured: true, description: "Poff pistache Dubai et croustillant kadaifi.", photo: "/images/poffs_dubai.jpg" },

  // ── Milkshakes (7.99$) ──────────────────────────────────────────────────────
  { id: 29, category: "Milkshakes", name: "Shake Fraise",  price: "$7.99", badge: "🍓 Frais",      rating: "88%", reviews: 18, description: "Milkshake fraise, chantilly et coulis brillant.", photo: "/images/shake_fraise.jpg" },
  { id: 30, category: "Milkshakes", name: "Shake Banane",  price: "$7.99", badge: "🍌 Fruité",     rating: "85%", reviews: 10, description: "Milkshake banane, caramel et crème fouettée.", photo: "/images/shake_bueno.jpg" },
  { id: 31, category: "Milkshakes", name: "Shake Oreo",    price: "$7.99", badge: "🍪 Bestseller", rating: "92%", reviews: 25, isFeatured: true, description: "Milkshake Oreo crémeux et finition cookies.", photo: "/images/shake_oreo.jpg" },
  { id: 32, category: "Milkshakes", name: "Shake Lotus",   price: "$7.99", badge: "🌟 Fan fav",    rating: "90%", reviews: 22, description: "Milkshake Lotus Biscoff et chantilly caramel.", photo: "/images/shake_lotus.jpg" },
  { id: 33, category: "Milkshakes", name: "Shake Kitkat",  price: "$7.99", badge: "🍫 Choco",      rating: "87%", reviews: 11, description: "Milkshake KitKat, chocolat et éclats croustillants.", photo: "/images/shake_oreo.jpg" },
  { id: 34, category: "Milkshakes", name: "Shake Bueno",   price: "$7.99", badge: "💎 Signature",  rating: "85%", reviews: 14, description: "Milkshake Kinder Bueno, noisette et chocolat.", photo: "/images/shake_bueno.jpg" },
  { id: 35, category: "Milkshakes", name: "Shake Dubai",   price: "$7.99", badge: "✨ Nouveau",    rating: "88%", reviews: 11, isNew: true, description: "Milkshake pistache et kadaifi façon Dubai.", photo: "/images/shake_dubai.jpg" },
  { id: 36, category: "Milkshakes", name: "Shake Ferrero", price: "$7.99", badge: "🌰 Noisette",   rating: "86%", reviews: 9,  description: "Milkshake Ferrero Rocher et noisettes grillées.", photo: "/images/shake_bueno.jpg" },

  // ── Fraise Cup (9.99$) ──────────────────────────────────────────────────────
  { id: 37, category: "Fraise Cup", name: "Fraise Cup Dubai",  price: "$9.99", badge: "⭐ Star",      rating: "95%", reviews: 12, isFeatured: true, description: "Fraises, crème pistache Dubai et kadaifi croustillant.", photo: "/images/shake_dubai.jpg" },
  { id: 38, category: "Fraise Cup", name: "Fraise Cup Bueno",  price: "$9.99", badge: "💎 Signature", rating: "88%", reviews: 8,  description: "Fraises et crème Kinder Bueno fondante.", photo: "/images/shake_bueno.jpg" },
  { id: 39, category: "Fraise Cup", name: "Fraise Cup Oreo",   price: "$9.99", badge: "🖤 Crunch",    rating: "84%", reviews: 7,  description: "Fraises fraîches et miettes d'Oreo croquantes.", photo: "/images/shake_oreo.jpg" },
  { id: 40, category: "Fraise Cup", name: "Fraise Cup Lotus",  price: "$9.99", badge: "🌟 Fan fav",   rating: "90%", reviews: 10, description: "Fraises et crème Lotus Biscoff caramelisée.", photo: "/images/shake_lotus.jpg" },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [cartCount, setCartCount] = useState(0);

  const filtered = activeCategory === "Tous"
    ? MENU
    : MENU.filter((item) => item.category === activeCategory);

  const featured = MENU.filter((item) => item.isFeatured);

  const addToCart = () => setCartCount((n) => n + 1);

  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#141414]">

      {/* ── Promo Bar ─────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden bg-[#141414] py-2 text-xs font-bold text-[#f5c518]">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...PROMO_TEXTS, ...PROMO_TEXTS].map((text, i) => (
            <span key={i} className="mx-10 flex-shrink-0">{text}</span>
          ))}
        </div>
      </div>

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[#e5e7eb] bg-[#fafaf8]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <a className="flex items-center gap-3" href="#">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-[#e5e7eb]">
              <Image alt="CrepOne logo" className="h-full w-full object-cover" height={56} src={LOGO_URL} width={56} />
            </div>
            <div>
              <span className="block text-xl font-black leading-none">CrepOne</span>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#4b5563]">
                Boutique · Gatineau
              </span>
            </div>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-bold text-[#4b5563] md:flex">
            <a href="#signature" className="transition-colors hover:text-[#d97706]">Signature</a>
            <a href="#featured"  className="transition-colors hover:text-[#d97706]">Vedettes</a>
            <a href="#menu"      className="transition-colors hover:text-[#d97706]">Menu</a>
            <a href="#reviews"   className="transition-colors hover:text-[#d97706]">Avis</a>
            <a href="#visit"     className="transition-colors hover:text-[#d97706]">Visiter</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={addToCart}
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

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden bg-[linear-gradient(135deg,#123a33_0%,#1d6b61_46%,#f6d87f_100%)] px-4 py-14 text-white sm:px-6 lg:py-24"
        id="signature"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(245,197,24,0.24),transparent_25rem)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#123a33] via-[#1c5f5f]/88 to-[#123a33]/18" />
        <div className="pointer-events-none absolute -right-28 top-8 hidden h-[34rem] w-[34rem] rounded-full bg-[#f5c518]/28 blur-3xl lg:block" />
        <div className="pointer-events-none absolute bottom-0 right-[8%] hidden h-52 w-96 rounded-full bg-black/18 blur-2xl lg:block" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="max-w-3xl animate-slide-up">
            <h1 className="text-6xl font-black leading-[0.9] tracking-tight sm:text-7xl lg:text-8xl">
              CrepOne,{" "}
              <span className="text-[#f5c518]">dessert signature.</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-white/78">
              Crêpes artisanales, gaufres belges, croffles et milkshakes —
              les saveurs authentiques de CrepOne, maintenant en boutique.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={ORDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 animate-pulse-glow items-center gap-2 rounded-full bg-[#1e7a45] px-7 text-sm font-black text-white shadow-xl shadow-[#1e7a45]/25 transition-all hover:scale-105 hover:bg-[#196638]"
              >
                Commander sur Uber Eats
              </a>
              <a
                href="#menu"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/18 bg-white/10 px-7 text-sm font-black text-white backdrop-blur transition-all hover:scale-105 hover:bg-white/16"
              >
                Voir le menu →
              </a>
            </div>

          </div>

          <div className="relative flex min-h-[340px] items-center justify-center lg:min-h-[560px]">
            <div className="absolute h-[22rem] w-[22rem] rounded-full bg-[#f5c518]/22 blur-3xl lg:h-[34rem] lg:w-[34rem]" />
            <div className="absolute bottom-8 h-28 w-80 rounded-full bg-black/24 blur-2xl" />
            <Image
              alt="Fraise Cup Strawberry Dubai CrepOne"
              className="relative z-10 h-auto w-[72%] max-w-[360px] animate-float drop-shadow-[0_34px_48px_rgba(0,0,0,0.42)] lg:w-[64%] lg:max-w-[460px]"
              height={480}
              priority
              src="/images/strawberry-dubai-cup-cutout.png"
              width={360}
            />
          </div>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────────────────── */}
      <div className="border-y border-[#e5e7eb] bg-white/70 px-4 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 text-sm">
          {[
            ["⭐", "4.7/5 étoiles"],
            ["💬", "460+ avis Google"],
            ["🚀", "Livraison rapide"],
            ["⏰", "18h – 23h45"],
            ["📍", "Gatineau QC"],
          ].map(([icon, text]) => (
            <span key={text as string} className="flex items-center gap-1.5 font-bold text-[#4b5563]">
              {icon} {text}
            </span>
          ))}
        </div>
      </div>

      {/* ── Reviews ──────────────────────────────────────────────────────────── */}
      <section className="overflow-hidden border-y border-[#e5e7eb] bg-white py-8" id="reviews">
        {/* Header */}
        <div className="mx-auto mb-5 flex max-w-7xl items-center justify-between px-4 sm:px-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d97706]">Avis clients</p>
            <h2 className="text-xl font-black tracking-tight">Ce que disent nos clients</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-[#fafaf8] px-4 py-2">
            <GoogleIcon />
            <span className="font-black text-[#141414]">4.7</span>
            <div className="flex text-[#fbbf24]">
              {[1,2,3,4].map((s) => <span key={s}>★</span>)}
              <span className="text-[#d1d5db]">★</span>
            </div>
            <span className="hidden text-xs font-bold text-[#4b5563] sm:inline">Google Maps</span>
          </div>
        </div>

        {/* Single masked marquee */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent" />
          <div className="flex animate-marquee gap-4 whitespace-nowrap" style={{ animationDuration: "55s" }}>
            {[...REVIEWS, ...REVIEWS].map((r, i) => (
              <ReviewCard key={i} review={r} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured ──────────────────────────────────────────────────────────── */}
      <section className="px-4 py-12 sm:px-6" id="featured">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#d97706]">
            Sélection du chef
          </p>
          <h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Nos vedettes</h2>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {featured.map((item) => (
              <FeaturedCard key={item.id} item={item} onAdd={addToCart} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Full Menu ─────────────────────────────────────────────────────────── */}
      <section className="px-4 pb-16 sm:px-6" id="menu">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#d97706]">
                Menu boutique
              </p>
              <h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                Tous nos desserts
              </h2>
            </div>
            <p className="text-sm font-medium text-[#4b5563]">{filtered.length} items</p>
          </div>

          {/* Category tabs */}
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 rounded-full px-5 py-2.5 text-sm font-black transition-all duration-200 ${
                  activeCategory === cat
                    ? "scale-105 bg-[#141414] text-white shadow-md"
                    : "border border-[#e8c5a5] bg-[#fafaf8] text-[#374151] hover:border-[#d97706] hover:text-[#d97706]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item, index) => (
              <MenuCard key={item.id} item={item} index={index} onAdd={addToCart} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────────── */}
      <section className="bg-[#141414] px-4 py-16 text-white sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#f5c518]">
              Comment ça marche
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">Du craving au checkout.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { n: 1, icon: "🍽️", title: "Choisis ta base",    desc: "Crêpe, gaufre, croffle ou poff's — tu décides." },
              { n: 2, icon: "🍫", title: "Personnalise",       desc: "Chocolat, fruits, crunch ou caramel. À toi de jouer." },
              { n: 3, icon: "🚀", title: "Commande en ligne",  desc: "Livraison ou récupération via Uber Eats en quelques clics." },
            ].map(({ n, icon, title, desc }) => (
              <div
                key={n}
                className="rounded-2xl border border-white/10 bg-white/5 p-7 transition-colors hover:bg-white/10"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f5c518] text-sm font-black text-[#141414]">
                    {n}
                  </span>
                  <span className="text-3xl">{icon}</span>
                </div>
                <h3 className="text-xl font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Location CTA ──────────────────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6" id="visit">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#fef9c3] to-[#fafaf8] p-8 sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#4b5563]">
                Viens nous voir
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight">CrepOne à Gatineau</h2>
              <p className="mt-4 max-w-lg leading-7 text-[#4b5563]">
                668 Boulevard Saint-Joseph, Gatineau, QC J8Y 4B4
                <br />
                Ouvert <strong>18h – 23h45</strong> · Tous les jours
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={ORDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1e7a45] px-7 text-sm font-black text-white shadow-lg shadow-[#1e7a45]/25 transition-all hover:scale-105 hover:bg-[#196638]"
                >
                  Commander maintenant
                </a>
                <a
                  href="https://maps.google.com/?q=668+Boulevard+Saint-Joseph+Gatineau+QC"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-[#e5e7eb] bg-white px-7 text-sm font-black text-[#141414] transition-colors hover:border-[#d97706]"
                >
                  📍 Google Maps
                </a>
              </div>
            </div>
            <div className="mt-8 flex-shrink-0 rounded-3xl bg-white/70 p-6 shadow-xl lg:mt-0">
              <p className="text-5xl font-black text-[#d97706]">4.7★</p>
              <p className="mt-2 text-sm font-black uppercase tracking-[0.18em] text-[#4b5563]">
                Google Maps
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#e5e7eb] bg-[#141414] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white">
              <Image alt="CrepOne logo" className="h-full w-full object-cover" height={48} src={LOGO_URL} width={48} />
            </div>
            <span className="text-xl font-black text-white">CrepOne</span>
          </div>
          <p className="text-sm text-white/60">
            668 Boul. Saint-Joseph, Gatineau, QC · 18h – 23h45 tous les jours
          </p>
          <p className="mt-2 text-xs text-white/35">© 2025 CrepOne. Boutique desserts Gatineau.</p>
        </div>
      </footer>
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

function FeaturedCard({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#d97706]/40 hover:shadow-xl">
      <div className="card-media relative aspect-square">
        <Image
          alt={item.name}
          fill
          className="card-media-inner object-cover"
          src={item.photo}
          sizes="(max-width: 768px) 50vw, 20vw"
        />
      </div>
      <div className="p-3">
        <p className="truncate text-xs font-black">{item.name}</p>
        <p className="text-sm font-black text-[#d97706]">{item.price}</p>
        <button
          onClick={onAdd}
          className="mt-2 w-full rounded-full bg-[#141414] py-1.5 text-xs font-black text-white transition-colors hover:bg-[#1e7a45] active:scale-95"
        >
          Ajouter
        </button>
      </div>
    </article>
  );
}

function MenuCard({
  item,
  index,
  onAdd,
}: {
  item: MenuItem;
  index: number;
  onAdd: () => void;
}) {
  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#d97706]/30 hover:shadow-2xl"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Photo */}
      <div className="card-media relative aspect-[4/3]">
        <Image
          alt={item.name}
          fill
          className="card-media-inner object-cover"
          src={item.photo}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#141414] shadow-sm backdrop-blur-sm">
            {item.badge}
          </span>
          {item.isNew && (
            <span className="rounded-full bg-[#1e7a45] px-3 py-1 text-xs font-black text-white shadow-sm">
              Nouveau
            </span>
          )}
        </div>

        {/* Rating pill */}
        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-black text-[#141414] shadow-sm backdrop-blur-sm">
          👍 {item.rating}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#d97706]">
          {item.category}
        </span>
        <h3 className="mt-1 text-base font-black leading-tight">{item.name}</h3>
        <p className="mt-2 flex-1 text-xs leading-5 text-[#4b5563]">{item.description}</p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-xl font-black">{item.price}</span>
          <button
            onClick={onAdd}
            className="rounded-full bg-[#141414] px-4 py-2 text-xs font-black text-white transition-all hover:scale-105 hover:bg-[#1e7a45] active:scale-95"
          >
            + Ajouter
          </button>
        </div>
      </div>
    </article>
  );
}

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
      />
    </svg>
  );
}
