"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Mot de passe incorrect");
    }
  }

  return (
    <div className="min-h-screen bg-[#0a2018] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="h-20 w-20 overflow-hidden rounded-2xl bg-white shadow-lg">
            <Image src="/images/crepone-logo.jpg" alt="CrepOne" width={80} height={80} className="h-full w-full object-cover" />
          </div>
        </div>
        <h1 className="text-center text-2xl font-black text-white mb-2">CrepOne Admin</h1>
        <p className="text-center text-white/50 text-sm mb-8">Accès réservé au gestionnaire</p>

        <form onSubmit={handleSubmit} className="bg-white/8 backdrop-blur border border-white/12 rounded-2xl p-8 space-y-4">
          <div>
            <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#f5c518] transition-colors"
            />
          </div>
          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#1e7a45] py-3 font-black text-white transition-all hover:bg-[#196638] disabled:opacity-60"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
