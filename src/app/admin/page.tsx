"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
  isNew: boolean;
  isFeatured: boolean;
  inStock: boolean;
};

type Promotion =
  | {
      id: string;
      enabled: boolean;
      name: string;
      type: "percent";
      percentOff: number;
      minimumSubtotal?: number;
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

type PromotionForm = {
  name: string;
  type: Promotion["type"];
  enabled: boolean;
  percentOff: number;
  minimumSubtotal: number;
  itemId: number;
  buyQuantity: number;
  getQuantity: number;
  freeItemId: number;
};

const EMPTY: Omit<MenuItem, "id"> = {
  category: "Crêpes Classiques",
  name: "",
  price: "$",
  badge: "",
  rating: "90%",
  reviews: 0,
  description: "",
  photo: "",
  isNew: false,
  isFeatured: false,
  inStock: true,
};

const CATEGORIES = [
  "Crêpes Classiques",
  "Crêpes Croustillantes",
  "Gaufres",
  "Croffles",
  "Poff's",
  "Milkshakes",
  "Smoothies",
  "Strawberry",
];

// ── Toast ────────────────────────────────────────────────────────────────────

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const show = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
  return { toast, show };
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function Modal({
  item,
  onSave,
  onClose,
}: {
  item: Partial<MenuItem> | null;
  onSave: (data: Omit<MenuItem, "id">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<MenuItem, "id">>(
    item ? { ...EMPTY, ...item } : { ...EMPTY }
  );
  const [preview, setPreview] = useState(item?.photo || "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function set(k: keyof typeof form, v: unknown) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    setUploading(false);
    if (json.url) {
      set("photo", json.url);
      setPreview(json.url);
    }
  }

  const isEdit = !!item?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-black text-[#141414]">
            {isEdit ? "Modifier le produit" : "Nouveau produit"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Photo */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Photo</label>
            <div className="flex items-center gap-4">
              <div
                className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#1e7a45] transition-colors flex items-center justify-center"
                onClick={() => fileRef.current?.click()}
              >
                {preview ? (
                  <Image src={preview} alt="preview" width={80} height={80} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xs text-center leading-tight">Cliquer<br/>photo</span>
                )}
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {uploading ? "Upload…" : "Choisir une image"}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                {form.photo && !uploading && (
                  <p className="mt-1 text-xs text-gray-400 truncate max-w-[200px]">{form.photo}</p>
                )}
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Nom *</label>
            <input value={form.name} onChange={e => set("name", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#1e7a45]" placeholder="Ex: Crêpe classique Dubai" />
          </div>

          {/* Category + Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Catégorie *</label>
              <select value={form.category} onChange={e => set("category", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#1e7a45]">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Prix *</label>
              <input value={form.price} onChange={e => set("price", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#1e7a45]" placeholder="$15.99" />
            </div>
          </div>

          {/* Badge + Rating */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Badge</label>
              <input value={form.badge} onChange={e => set("badge", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#1e7a45]" placeholder="⭐ Populaire" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Note</label>
              <input value={form.rating} onChange={e => set("rating", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#1e7a45]" placeholder="90%" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#1e7a45] resize-none" placeholder="Description du produit…" />
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-4">
            {(["inStock", "isNew", "isFeatured"] as const).map(k => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form[k]} onChange={e => set(k, e.target.checked)}
                  className="h-4 w-4 rounded accent-[#1e7a45]" />
                <span className="text-sm font-semibold text-gray-700">
                  {k === "inStock" ? "En stock" : k === "isNew" ? "Nouveau" : "En vedette"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button
            onClick={() => { if (form.name && form.price && form.category) onSave(form); }}
            className="rounded-lg bg-[#1e7a45] px-6 py-2 text-sm font-black text-white hover:bg-[#196638] transition-colors"
          >
            {isEdit ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete confirm ────────────────────────────────────────────────────────────

function ConfirmDelete({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-black text-[#141414] mb-2">Supprimer ce produit ?</h3>
        <p className="text-sm text-gray-500 mb-6">« {name} » sera définitivement supprimé.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Annuler</button>
          <button onClick={onConfirm} className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-black text-white hover:bg-red-600">Supprimer</button>
        </div>
      </div>
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const { toast, show } = useToast();

  const [menu, setMenu]         = useState<MenuItem[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promoForm, setPromoForm] = useState<PromotionForm>({
    name: "Promo 10%",
    type: "percent",
    enabled: true,
    percentOff: 10,
    minimumSubtotal: 0,
    itemId: 0,
    buyQuantity: 1,
    getQuantity: 1,
    freeItemId: 0,
  });
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<"products" | "stock" | "promos">("products");
  const [filterCat, setFilterCat] = useState("Tout");
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState<{ item: Partial<MenuItem> | null; open: boolean }>({ item: null, open: false });
  const [deleting, setDeleting] = useState<MenuItem | null>(null);

  async function fetchMenu() {
    const res = await fetch("/api/menu");
    setMenu(await res.json());
    setLoading(false);
  }

  async function fetchPromotions() {
    const res = await fetch("/api/promotions");
    if (res.ok) setPromotions(await res.json());
  }

  useEffect(() => {
    let active = true;
    void fetch("/api/menu")
      .then((res) => res.json())
      .then((items: MenuItem[]) => {
        if (!active) return;
        setMenu(items);
        setLoading(false);
      });
    void fetch("/api/promotions")
      .then((res) => res.ok ? res.json() : [])
      .then((items: Promotion[]) => {
        if (active) setPromotions(items);
      });
    return () => { active = false; };
  }, []);

  async function logout() {
    await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
    router.push("/admin/login");
  }

  async function saveItem(data: Omit<MenuItem, "id">) {
    const editing = modal.item?.id;
    const url  = editing ? `/api/menu/${editing}` : "/api/menu";
    const method = editing ? "PUT" : "POST";
    const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) {
      setModal({ item: null, open: false });
      await fetchMenu();
      show(editing ? "Produit modifié ✓" : "Produit ajouté ✓");
    } else {
      show("Erreur lors de la sauvegarde", "err");
    }
  }

  async function deleteItem(id: number) {
    const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
    if (res.ok) { await fetchMenu(); show("Produit supprimé"); }
    else show("Erreur suppression", "err");
    setDeleting(null);
  }

  async function toggleStock(item: MenuItem) {
    const res = await fetch(`/api/menu/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inStock: !item.inStock }),
    });
    if (res.ok) {
      await fetchMenu();
      show(!item.inStock ? "Produit remis en stock" : "Produit marqué épuisé");
    } else {
      const json = await res.json().catch(() => null) as { error?: string } | null;
      show(json?.error ?? "Erreur stock", "err");
    }
  }

  async function savePromotion() {
    const firstItem = menu[0];
    const payload = {
      ...promoForm,
      itemId: promoForm.itemId || firstItem?.id || 0,
      freeItemId: promoForm.freeItemId || firstItem?.id || 0,
      minimumSubtotal: promoForm.minimumSubtotal || 0,
    };
    const res = await fetch("/api/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      await fetchPromotions();
      show("Promotion ajoutée");
    } else {
      const json = await res.json().catch(() => null) as { error?: string } | null;
      show(json?.error ?? "Erreur promotion", "err");
    }
  }

  async function updatePromotion(id: string, patch: Partial<Promotion>) {
    const res = await fetch(`/api/promotions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      await fetchPromotions();
      show("Promotion modifiée");
    } else {
      show("Erreur promotion", "err");
    }
  }

  async function deletePromotion(id: string) {
    const res = await fetch(`/api/promotions/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchPromotions();
      show("Promotion supprimée");
    } else {
      show("Erreur suppression", "err");
    }
  }

  function describePromotion(promo: Promotion): string {
    if (promo.type === "percent") {
      return `${promo.percentOff}% de rabais${promo.minimumSubtotal ? ` dès $${promo.minimumSubtotal}` : ""}`;
    }
    if (promo.type === "buy_get") {
      const item = menu.find((row) => row.id === promo.itemId);
      return `Acheter ${promo.buyQuantity}, obtenir ${promo.getQuantity} gratuit: ${item?.name ?? "article"}`;
    }
    const freeItem = menu.find((row) => row.id === promo.freeItemId);
    return `${freeItem?.name ?? "Article"} gratuit dès $${promo.minimumSubtotal}`;
  }

  const categories = ["Tout", ...CATEGORIES];
  const filtered = menu.filter(m => {
    const matchCat  = filterCat === "Tout" || m.category === filterCat;
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase());
    if (tab === "stock") return matchCat && matchSearch;
    return matchCat && matchSearch;
  });

  const inStockCount = menu.filter(m => m.inStock).length;
  const outCount     = menu.filter(m => !m.inStock).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-all ${toast.type === "ok" ? "bg-[#1e7a45]" : "bg-red-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a2018] border-b border-white/10 shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 overflow-hidden rounded-xl bg-white flex-shrink-0">
              <Image src="/images/crepone-logo.jpg" alt="logo" width={36} height={36} className="h-full w-full object-cover" />
            </div>
            <span className="font-black text-white text-lg">Admin CrepOne</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" className="hidden sm:inline-flex rounded-lg border border-white/20 px-3 py-1.5 text-xs font-bold text-white/70 hover:bg-white/10 transition-colors">
              Voir le site ↗
            </a>
            <button onClick={logout} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-colors">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total produits", value: menu.length, color: "text-[#141414]" },
            { label: "En stock",       value: inStockCount, color: "text-[#1e7a45]" },
            { label: "Épuisés",        value: outCount,     color: "text-red-500" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-5">
          {(["products", "stock", "promos"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${tab === t ? "bg-[#1e7a45] text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
            >
              {t === "products" ? "Produits" : t === "stock" ? "Stock" : "Promos"}
            </button>
          ))}
          {tab !== "promos" && (
            <button
              onClick={() => setModal({ item: null, open: true })}
              className="ml-auto rounded-xl bg-[#f5c518] px-5 py-2 text-sm font-black text-[#141414] shadow-sm hover:bg-[#eab308] transition-colors"
            >
              + Ajouter un produit
            </button>
          )}
        </div>

        {/* Filters */}
        {tab !== "promos" && <div className="flex flex-wrap gap-3 mb-5">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:border-[#1e7a45] w-48"
          />
          <div className="flex flex-wrap gap-1.5">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setFilterCat(c)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${filterCat === c ? "bg-[#0a2018] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                {c === "Tout" ? "Tout" : c.split(" ").slice(-1)[0]}
              </button>
            ))}
          </div>
        </div>}

        {/* Content */}
        {loading ? (
          <div className="text-center py-16 text-gray-400 font-medium">Chargement…</div>
        ) : tab === "products" ? (
          /* Product table */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-16">Photo</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Produit</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Catégorie</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Prix</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Stock</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                          {item.photo && <Image src={item.photo} alt={item.name} width={48} height={48} className="h-full w-full object-cover" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-[#141414]">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 hidden md:block truncate max-w-[200px]">{item.description}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">{item.category}</span>
                      </td>
                      <td className="px-4 py-3 font-black text-[#141414]">{item.price}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <button
                          onClick={() => toggleStock(item)}
                          className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${item.inStock ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                        >
                          {item.inStock ? "✓ En stock" : "✗ Épuisé"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setModal({ item, open: true })}
                            className="rounded-lg p-2 text-gray-400 hover:text-[#1e7a45] hover:bg-green-50 transition-colors"
                            title="Modifier"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => setDeleting(item)}
                            className="rounded-lg p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Supprimer"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 font-medium">Aucun produit trouvé</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-50 text-xs text-gray-400 font-medium">
              {filtered.length} produit{filtered.length !== 1 ? "s" : ""} affiché{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>
        ) : tab === "stock" ? (
          /* Stock view */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm">
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  {item.photo && <Image src={item.photo} alt={item.name} width={56} height={56} className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#141414] text-sm truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.price} · {item.category}</p>
                </div>
                <button
                  onClick={() => toggleStock(item)}
                  className={`flex-shrink-0 h-8 w-14 rounded-full transition-all relative ${item.inStock ? "bg-[#1e7a45]" : "bg-gray-200"}`}
                  title={item.inStock ? "Marquer épuisé" : "Remettre en stock"}
                >
                  <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${item.inStock ? "left-[calc(100%-28px)]" : "left-1"}`} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-black text-[#141414]">Nouvelle promotion</h2>
              <div className="space-y-3">
                <input
                  value={promoForm.name}
                  onChange={(e) => setPromoForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1e7a45]"
                  placeholder="Nom de la promotion"
                />
                <select
                  value={promoForm.type}
                  onChange={(e) => setPromoForm((f) => ({ ...f, type: e.target.value as Promotion["type"] }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1e7a45]"
                >
                  <option value="percent">Rabais en pourcentage</option>
                  <option value="buy_get">Acheter X obtenir Y</option>
                  <option value="free_item_threshold">Article gratuit dès montant</option>
                </select>

                {promoForm.type === "percent" && (
                  <>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={promoForm.percentOff}
                      onChange={(e) => setPromoForm((f) => ({ ...f, percentOff: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1e7a45]"
                      placeholder="Pourcentage"
                    />
                    <input
                      type="number"
                      min="0"
                      value={promoForm.minimumSubtotal}
                      onChange={(e) => setPromoForm((f) => ({ ...f, minimumSubtotal: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1e7a45]"
                      placeholder="Montant minimum"
                    />
                  </>
                )}

                {promoForm.type === "buy_get" && (
                  <>
                    <select
                      value={promoForm.itemId || menu[0]?.id || 0}
                      onChange={(e) => setPromoForm((f) => ({ ...f, itemId: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1e7a45]"
                    >
                      {menu.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min="1"
                        value={promoForm.buyQuantity}
                        onChange={(e) => setPromoForm((f) => ({ ...f, buyQuantity: Number(e.target.value) }))}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1e7a45]"
                        placeholder="Acheter"
                      />
                      <input
                        type="number"
                        min="1"
                        value={promoForm.getQuantity}
                        onChange={(e) => setPromoForm((f) => ({ ...f, getQuantity: Number(e.target.value) }))}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1e7a45]"
                        placeholder="Gratuit"
                      />
                    </div>
                  </>
                )}

                {promoForm.type === "free_item_threshold" && (
                  <>
                    <select
                      value={promoForm.freeItemId || menu[0]?.id || 0}
                      onChange={(e) => setPromoForm((f) => ({ ...f, freeItemId: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1e7a45]"
                    >
                      {menu.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                    <input
                      type="number"
                      min="0"
                      value={promoForm.minimumSubtotal}
                      onChange={(e) => setPromoForm((f) => ({ ...f, minimumSubtotal: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1e7a45]"
                      placeholder="Commande minimum"
                    />
                  </>
                )}

                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={promoForm.enabled}
                    onChange={(e) => setPromoForm((f) => ({ ...f, enabled: e.target.checked }))}
                    className="h-4 w-4 accent-[#1e7a45]"
                  />
                  Active
                </label>
                <button
                  onClick={savePromotion}
                  className="w-full rounded-xl bg-[#1e7a45] px-4 py-2.5 text-sm font-black text-white hover:bg-[#196638]"
                >
                  Ajouter promotion
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {promotions.map((promo) => (
                <div key={promo.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex-1">
                    <p className="font-black text-[#141414]">{promo.name}</p>
                    <p className="text-sm text-gray-500">{describePromotion(promo)}</p>
                  </div>
                  <button
                    onClick={() => updatePromotion(promo.id, { enabled: !promo.enabled })}
                    className={`rounded-full px-3 py-1 text-xs font-black ${promo.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {promo.enabled ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => deletePromotion(promo.id)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    title="Supprimer"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
              {promotions.length === 0 && (
                <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center font-bold text-gray-400">
                  Aucune promotion
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal.open && (
        <Modal
          item={modal.item}
          onSave={saveItem}
          onClose={() => setModal({ item: null, open: false })}
        />
      )}
      {deleting && (
        <ConfirmDelete
          name={deleting.name}
          onConfirm={() => deleteItem(deleting.id)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
