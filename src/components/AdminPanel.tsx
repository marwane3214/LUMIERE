import { useState, useEffect, useCallback } from 'react';
import {
    LayoutDashboard, Package, ShoppingBag, LogOut, Plus, Pencil, Trash2,
    Search, X, Check, ChevronDown, Star, AlertCircle, TrendingUp,
    DollarSign, Clock, ChevronRight, Save, Image as ImageIcon, ShieldCheck, Loader2,
    Gift
} from 'lucide-react';
import type { Product, Order } from '@/types';
import {
    sbGetProducts, sbAddProduct, sbUpdateProduct, sbDeleteProduct,
    sbGetOrders, sbAddOrder, sbUpdateOrderStatus, sbDeleteOrder,
    sbUploadImage
} from '@/lib/supabaseAdmin';

// ──────────────────────────────────────────────────────────────────────────
// Constants / helpers
// ──────────────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<Order['status'], { bg: string; text: string; label: string }> = {
    pending: { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24', label: 'En attente' },
    confirmed: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', label: 'Confirmée' },
    delivered: { bg: 'rgba(34,197,94,0.15)', text: '#4ade80', label: 'Livrée' },
    cancelled: { bg: 'rgba(239,68,68,0.15)', text: '#f87171', label: 'Annulée' },
};

const CATEGORIES = [
    { value: 'rings', label: 'Bagues' },
    { value: 'necklaces', label: 'Colliers' },
    { value: 'earrings', label: "Boucles d'oreilles" },
    { value: 'bracelets', label: 'Bracelets' },
    { value: 'packs', label: 'Packs' },
] as const;

const MOROCCAN_CITIES = [
    'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir',
    'Meknès', 'Oujda', 'Kénitra', 'Tétouan', 'Salé', 'Nador',
];

const formatDH = (n: number) => `${n.toLocaleString('fr-MA')} DH`;

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-MA', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

const emptyProduct = (): Omit<Product, 'id' | 'created_at'> => ({
    name: '', name_fr: '', name_ar: '',
    description: '', description_fr: '', description_ar: '',
    price: 0, image: '', images: [], category: 'rings',
    featured: false, in_stock: true,
});

// ══════════════════════════════════════════════════════════════════════════
// Shared UI atoms
// ══════════════════════════════════════════════════════════════════════════

function StatCard({ icon: Icon, label, value, color }: {
    icon: React.ElementType; label: string; value: string; color: string;
}) {
    return (
        <div className="rounded-xl p-5 flex items-center gap-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
                <p className="text-white/40 text-xs tracking-widest uppercase">{label}</p>
                <p className="text-white text-xl font-bold mt-0.5">{value}</p>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: Order['status'] }) {
    const s = STATUS_COLORS[status];
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.text }} />
            {s.label}
        </span>
    );
}

function ConfirmDialog({ message, onConfirm, onCancel }: {
    message: string; onConfirm: () => void; onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-sm mx-4 rounded-xl p-7 text-center" style={{ background: '#141414', border: '1px solid rgba(239,68,68,0.3)' }}>
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
                <p className="text-white text-sm mb-6">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-sm text-white/60 border border-white/10 hover:border-white/20 transition-colors">Annuler</button>
                    <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-500/80 hover:bg-red-500 transition-colors">Supprimer</button>
                </div>
            </div>
        </div>
    );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-white/40 text-xs tracking-[0.15em] uppercase mb-1.5">
                {label}{required && <span className="text-[#d4af37] ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative w-10 h-5 rounded-full transition-all duration-300" style={{ background: checked ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.1)' }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300" style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }} />
            </div>
            <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">{label}</span>
        </button>
    );
}

function LoadingSpinner({ text = 'Chargement…' }: { text?: string }) {
    return (
        <div className="flex items-center justify-center gap-3 py-16 text-white/40">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">{text}</span>
        </div>
    );
}

function Toast({ msg }: { msg: string }) {
    return (
        <div className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium text-black shadow-2xl" style={{ background: 'linear-gradient(135deg, #d4af37, #b8942a)' }}>
            <Check className="w-4 h-4" />{msg}
        </div>
    );
}

function ErrorBanner({ msg }: { msg: string }) {
    return (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl text-sm text-red-300 mb-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle className="w-4 h-4 shrink-0" />{msg}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════
// Products Tab
// ══════════════════════════════════════════════════════════════════════════
function ProductsTab() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [form, setForm] = useState<Omit<Product, 'id' | 'created_at'>>(emptyProduct());
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [toast, setToast] = useState('');

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        const data = await sbGetProducts();
        setProducts(data);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = products.filter((p) =>
        p.category !== 'events' && (
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.name_fr ?? '').toLowerCase().includes(search.toLowerCase())
        )
    );

    const featuredCount = products.filter(p => p.featured && p.category !== 'events').length;

    const openNew = () => { setForm(emptyProduct()); setEditingId(null); setShowForm(true); setError(''); };

    const openEdit = (p: Product) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, created_at: _ca, ...rest } = p;
        setForm(rest);
        setEditingId(p.id);
        setShowForm(true);
        setError('');
    };

    const handleSave = async () => {
        if (!form.name || form.price <= 0) { setError('Veuillez remplir le nom et le prix.'); return; }

        // Check featured limit (4)
        if (form.featured) {
            const othersFeatured = products.filter(p => p.featured && p.id !== editingId).length;
            if (othersFeatured >= 4) {
                setError('Vous ne pouvez avoir que 4 produits mis en vedette au maximum.');
                return;
            }
        }

        setSaving(true);
        setError('');
        let ok: Product | null;
        if (editingId) {
            ok = await sbUpdateProduct(editingId, form);
        } else {
            ok = await sbAddProduct(form);
        }
        setSaving(false);
        if (!ok) { setError('Erreur Supabase — vérifiez la console.'); return; }
        showToast(editingId ? 'Produit mis à jour ✓' : 'Produit ajouté ✓');
        setShowForm(false);
        load();
    };

    const handleDelete = async (id: string) => {
        const ok = await sbDeleteProduct(id);
        setConfirmDelete(null);
        if (ok) { showToast('Produit supprimé.'); load(); }
        else setError('Impossible de supprimer ce produit.');
    };

    return (
        <div className="space-y-5">
            {error && !showForm && <ErrorBanner msg={error} />}

            {/* Top bar */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-1 min-w-[200px] px-4 rounded-lg" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Search className="w-4 h-4 text-white/30 shrink-0" />
                    <input className="bg-transparent py-2.5 text-sm text-white placeholder-white/25 outline-none w-full" placeholder="Rechercher un produit…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>

                <div className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${featuredCount === 4 ? 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20' : 'bg-white/5 text-white/40 border-white/10'}`}>
                    Featured: {featuredCount}/4
                </div>

                <button id="add-product-btn" onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-black transition-opacity hover:opacity-90" style={{ background: 'linear-gradient(135deg, #d4af37, #b8942a)' }}>
                    <Plus className="w-4 h-4" /> Nouveau produit
                </button>
            </div>

            {/* Table */}
            {loading ? <LoadingSpinner /> : (
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ background: '#111' }}>
                                {['Produit', 'Catégorie', 'Prix', 'Stock', 'Vedette', 'Actions'].map((h) => (
                                    <th key={h} className="px-4 py-3.5 text-left text-xs tracking-widest uppercase text-white/35 font-medium">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-12 text-white/30">Aucun produit trouvé.</td></tr>
                            )}
                            {filtered.map((p, i) => (
                                <tr key={p.id} style={{ background: i % 2 === 0 ? '#0c0c0c' : '#0f0f0f', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center" style={{ background: '#1a1a1a' }}>
                                                {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-white/20" />}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{p.name}</p>
                                                <p className="text-white/35 text-xs">{p.name_fr}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className="px-2.5 py-1 rounded-full text-xs capitalize" style={{ background: 'rgba(212,175,55,0.12)', color: '#d4af37' }}>
                                            {CATEGORIES.find((c) => c.value === p.category)?.label ?? p.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-[#d4af37] font-semibold">{formatDH(p.price)}</td>
                                    <td className="px-4 py-3.5">
                                        <span className="px-2.5 py-1 rounded-full text-xs" style={p.in_stock ? { background: 'rgba(34,197,94,0.12)', color: '#4ade80' } : { background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
                                            {p.in_stock ? 'Disponible' : 'Épuisé'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        {p.featured ? <Star className="w-4 h-4 text-[#d4af37] fill-[#d4af37]" /> : <Star className="w-4 h-4 text-white/20" />}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-white/50 hover:text-[#d4af37] hover:bg-[#d4af37]/10 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => setConfirmDelete(p.id)} className="p-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Product form modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto py-10 px-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-xl shadow-2xl" style={{ background: '#111', border: '1px solid rgba(212,175,55,0.2)' }}>
                        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            <h3 className="text-white font-semibold text-lg">{editingId ? 'Modifier le produit' : 'Nouveau produit'}</h3>
                            <button onClick={() => setShowForm(false)} className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-all"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="p-6 space-y-5">
                            {error && <ErrorBanner msg={error} />}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField label="Nom (EN)" required>
                                    <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Golden Rose Ring" />
                                </FormField>
                                <FormField label="Nom (FR)">
                                    <input className="admin-input" value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} placeholder="Bague Rose Dorée" />
                                </FormField>
                            </div>
                            <FormField label="Nom (AR)">
                                <input className="admin-input text-right" dir="rtl" value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} placeholder="خاتم الوردة الذهبية" />
                            </FormField>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField label="Prix (DH)" required>
                                    <div className="relative">
                                        <input className="admin-input pr-10" type="number" min={0} value={form.price || ''} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="890" />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">DH</span>
                                    </div>
                                </FormField>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField label="Catégorie">
                                    <div className="relative">
                                        <select className="admin-input appearance-none pr-8" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Product['category'] })}>
                                            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                                    </div>
                                </FormField>
                                <FormField label="Associer à un événement (Optionnel)">
                                    <div className="relative">
                                        <select className="admin-input appearance-none pr-8" value={form.event_id || ''} onChange={(e) => setForm({ ...form, event_id: e.target.value || undefined })}>
                                            <option value="">Aucun événement</option>
                                            {products.filter(p => p.category === 'events').map(ev => (
                                                <option key={ev.id} value={ev.id}>{ev.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                                    </div>
                                    <p className="text-[10px] text-white/30 mt-1 italic">* Les produits d'un événement sont cachés de la boutique générale.</p>
                                </FormField>
                            </div>
                            <FormField label="Image du produit">
                                <div
                                    className={`relative group h-40 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 overflow-hidden ${uploadingImg ? 'border-[#d4af37]/20 bg-[#d4af37]/5' : 'border-white/10 hover:border-[#d4af37]/40 bg-white/[0.02]'}`}
                                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#d4af37'; }}
                                    onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                                    onDrop={async (e) => {
                                        e.preventDefault();
                                        const file = e.dataTransfer.files[0];
                                        if (!file) return;
                                        setUploadingImg(true);
                                        const url = await sbUploadImage(file);
                                        if (url) setForm({ ...form, image: url });
                                        setUploadingImg(false);
                                    }}
                                >
                                    {uploadingImg ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-6 h-6 text-[#d4af37] animate-spin" />
                                            <p className="text-xs text-[#d4af37]/60 font-medium tracking-wide">Téléchargement…</p>
                                        </div>
                                    ) : form.image ? (
                                        <>
                                            <img src={form.image} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" alt="Preview" />
                                            <div className="relative z-10 flex flex-col items-center gap-2">
                                                <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                    <Plus className="w-5 h-5 text-white rotate-45" />
                                                </div>
                                                <span className="text-[11px] text-white/70 font-medium px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10">Glisser une nouvelle image</span>
                                            </div>
                                            <button
                                                onClick={() => setForm({ ...form, image: '' })}
                                                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white/60 hover:text-white transition-colors border border-white/10 z-20"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/10 group-hover:border-[#d4af37]/30 group-hover:bg-[#d4af37]/5 transition-all">
                                                <Plus className="w-6 h-6 text-white/20 group-hover:text-[#d4af37]/60" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-white/70 font-medium">Glisser-déposer une image</p>
                                                <label htmlFor="image-upload-input" className="text-xs text-[#d4af37] cursor-pointer hover:underline mt-1 inline-block">ou parcourir vos fichiers</label>
                                                <input
                                                    id="image-upload-input"
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        setUploadingImg(true);
                                                        const url = await sbUploadImage(file);
                                                        if (url) setForm({ ...form, image: url });
                                                        setUploadingImg(false);
                                                    }}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <input
                                    className="admin-input mt-3 text-xs opacity-50 focus:opacity-100 transition-opacity"
                                    value={form.image}
                                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                                    placeholder="Ou collez une URL directe ici…"
                                />
                            </FormField>

                            <FormField label="Images supplémentaires">
                                <div className="grid grid-cols-4 gap-3">
                                    {(form.images || []).map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                                            <img src={img} className="w-full h-full object-cover" alt="" />
                                            <button
                                                onClick={() => setForm({ ...form, images: (form.images || []).filter((_, i) => i !== idx) })}
                                                className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white/60 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="aspect-square rounded-lg border-2 border-dashed border-white/10 hover:border-[#d4af37]/40 bg-white/[0.02] flex items-center justify-center cursor-pointer transition-all">
                                        <div className="flex flex-col items-center gap-1">
                                            <Plus className="w-5 h-5 text-white/20" />
                                            <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold font-display">Ajouter</span>
                                        </div>
                                        <input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const files = Array.from(e.target.files || []);
                                                if (files.length === 0) return;
                                                setUploadingImg(true);
                                                const urls = await Promise.all(files.map(f => sbUploadImage(f)));
                                                const validUrls = urls.filter((u): u is string => !!u);
                                                setForm({ ...form, images: [...(form.images || []), ...validUrls] });
                                                setUploadingImg(false);
                                            }}
                                        />
                                    </label>
                                </div>
                            </FormField>
                            <FormField label="Description (EN)">
                                <textarea className="admin-input min-h-[72px] resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the product…" />
                            </FormField>
                            <FormField label="Description (FR)">
                                <textarea className="admin-input min-h-[72px] resize-none" value={form.description_fr} onChange={(e) => setForm({ ...form, description_fr: e.target.value })} />
                            </FormField>
                            <div className="flex gap-6 pt-1">
                                <Toggle label="En stock" checked={form.in_stock} onChange={(v) => setForm({ ...form, in_stock: v })} />
                                <Toggle label="Mis en vedette" checked={form.featured} onChange={(v) => setForm({ ...form, featured: v })} />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-lg text-sm text-white/50 border border-white/10 hover:border-white/20 transition-colors">Annuler</button>
                            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #d4af37, #b8942a)' }}>
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                {editingId ? 'Enregistrer' : 'Créer le produit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmDelete && (
                <ConfirmDialog message="Supprimer ce produit définitivement ?" onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
            )}
            {toast && <Toast msg={toast} />}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════
// New Order Form
// ══════════════════════════════════════════════════════════════════════════
function NewOrderForm({ onClose, onCreated, products }: {
    onClose: () => void; onCreated: () => void; products: Product[];
}) {
    const availableProducts = products.filter(p => p.category !== 'events');
    const [form, setForm] = useState({
        customer_name: '', customer_phone: '', customer_address: '',
        customer_city: MOROCCAN_CITIES[0], notes: '',
        selectedProductId: availableProducts[0]?.id ?? '', quantity: 1,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const selectedProduct = availableProducts.find((p) => p.id === form.selectedProductId);

    const handleCreate = async () => {
        if (!form.customer_name || !form.customer_phone || !form.customer_address) {
            setError('Veuillez remplir tous les champs obligatoires.'); return;
        }
        if (!selectedProduct) { setError('Veuillez sélectionner un produit.'); return; }
        setSaving(true);
        setError('');
        const result = await sbAddOrder({
            customer_name: form.customer_name,
            customer_phone: form.customer_phone,
            customer_address: form.customer_address,
            customer_city: form.customer_city,
            notes: form.notes || undefined,
            items: [{ product_id: selectedProduct.id, product_name: selectedProduct.name, quantity: form.quantity, price: selectedProduct.price }],
            total_price: selectedProduct.price * form.quantity,
            status: 'pending',
            payment_method: 'cod',
        });
        setSaving(false);
        if (!result) { setError('Erreur Supabase — vérifiez la console.'); return; }
        onCreated();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto py-10 px-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-xl shadow-2xl" style={{ background: '#111', border: '1px solid rgba(212,175,55,0.2)' }}>
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="text-white font-semibold text-lg">Nouvelle commande CoD</h3>
                    <button onClick={onClose} className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-all"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-6 space-y-4">
                    {error && <ErrorBanner msg={error} />}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Nom du client" required>
                            <input className="admin-input" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="Youssef Alami" />
                        </FormField>
                        <FormField label="Téléphone" required>
                            <input className="admin-input" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} placeholder="0612345678" />
                        </FormField>
                    </div>
                    <FormField label="Adresse" required>
                        <input className="admin-input" value={form.customer_address} onChange={(e) => setForm({ ...form, customer_address: e.target.value })} placeholder="12 Rue Hassan II, Apt 3" />
                    </FormField>
                    <FormField label="Ville">
                        <div className="relative">
                            <select className="admin-input appearance-none pr-8" value={form.customer_city} onChange={(e) => setForm({ ...form, customer_city: e.target.value })}>
                                {MOROCCAN_CITIES.map((city) => <option key={city}>{city}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                        </div>
                    </FormField>
                    <div className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
                        <p className="text-white/40 text-xs tracking-widest uppercase">Produit commandé</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="relative">
                                <select className="admin-input appearance-none pr-8" value={form.selectedProductId} onChange={(e) => setForm({ ...form, selectedProductId: e.target.value })}>
                                    {availableProducts.map((p) => <option key={p.id} value={p.id}>{p.name} — {formatDH(p.price)}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                            </div>
                            <FormField label="Quantité">
                                <input className="admin-input" type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Math.max(1, Number(e.target.value)) })} />
                            </FormField>
                        </div>
                        {selectedProduct && <p className="text-[#d4af37] text-sm font-bold">Total : {formatDH(selectedProduct.price * form.quantity)}</p>}
                    </div>
                    <FormField label="Notes (optionnel)">
                        <textarea className="admin-input min-h-[70px] resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Instructions de livraison…" />
                    </FormField>
                    <div className="flex items-center gap-2 text-xs text-white/30 pt-1">
                        <DollarSign className="w-3.5 h-3.5" /> Paiement à la livraison (Cash on Delivery)
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm text-white/50 border border-white/10 hover:border-white/20 transition-colors">Annuler</button>
                    <button onClick={handleCreate} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #d4af37, #b8942a)' }}>
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Créer la commande
                    </button>
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════
// Orders Tab
// ══════════════════════════════════════════════════════════════════════════
function OrdersTab() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | Order['status']>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [showNewForm, setShowNewForm] = useState(false);
    const [toast, setToast] = useState('');

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

    const load = useCallback(async () => {
        setLoading(true);
        const [o, p] = await Promise.all([sbGetOrders(), sbGetProducts()]);
        setOrders(o);
        setProducts(p);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = orders.filter((o) => {
        const matchStatus = filterStatus === 'all' || o.status === filterStatus;
        const matchSearch =
            o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            o.customer_phone.includes(search) ||
            o.id.includes(search);
        return matchStatus && matchSearch;
    });

    const handleStatusChange = async (id: string, status: Order['status']) => {
        const ok = await sbUpdateOrderStatus(id, status);
        if (ok) { showToast(`Statut mis à jour : ${STATUS_COLORS[status].label}`); load(); }
    };

    const handleDeleteOrder = async (id: string) => {
        const ok = await sbDeleteOrder(id);
        setConfirmDelete(null);
        if (ok) { showToast('Commande supprimée.'); load(); }
    };

    const statusCounts = (Object.keys(STATUS_COLORS) as Order['status'][]).map((s) => ({
        status: s, count: orders.filter((o) => o.status === s).length,
    }));

    return (
        <div className="space-y-5">
            {/* Status pills */}
            <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => setFilterStatus('all')} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${filterStatus === 'all' ? 'text-black' : 'text-white/50 border border-white/10 hover:border-white/20'}`} style={filterStatus === 'all' ? { background: 'linear-gradient(135deg,#d4af37,#b8942a)' } : {}}>
                    Toutes ({orders.length})
                </button>
                {statusCounts.map(({ status, count }) => (
                    <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${filterStatus === status ? '' : 'border border-white/10 hover:border-white/20'}`} style={filterStatus === status ? { background: STATUS_COLORS[status].bg, color: STATUS_COLORS[status].text, border: `1px solid ${STATUS_COLORS[status].text}40` } : { color: 'rgba(255,255,255,0.5)' }}>
                        {STATUS_COLORS[status].label} ({count})
                    </button>
                ))}
            </div>

            {/* Search + new */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-1 min-w-[200px] px-4 rounded-lg" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Search className="w-4 h-4 text-white/30 shrink-0" />
                    <input className="bg-transparent py-2.5 text-sm text-white placeholder-white/25 outline-none w-full" placeholder="Nom, téléphone, ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <button id="add-order-btn" onClick={() => setShowNewForm(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-black transition-opacity hover:opacity-90" style={{ background: 'linear-gradient(135deg, #d4af37, #b8942a)' }}>
                    <Plus className="w-4 h-4" /> Nouvelle commande
                </button>
            </div>

            {/* List */}
            {loading ? <LoadingSpinner /> : (
                <div className="space-y-3">
                    {filtered.length === 0 && (
                        <div className="rounded-xl p-12 text-center text-white/30" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>Aucune commande trouvée.</div>
                    )}
                    {filtered.map((order) => (
                        <div key={order.id} className="rounded-xl overflow-hidden transition-all" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <p className="text-white font-medium">{order.customer_name}</p>
                                        <span className="text-white/30 text-xs font-mono truncate max-w-[120px]">{order.id}</span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-white/35">
                                        <span>{order.customer_phone}</span><span>·</span>
                                        <span>{order.customer_city}</span><span>·</span>
                                        <span>{formatDate(order.created_at)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <p className="text-[#d4af37] font-bold text-sm">{formatDH(order.total_price)}</p>
                                    <StatusBadge status={order.status} />
                                    <ChevronRight className={`w-4 h-4 text-white/25 transition-transform duration-200 ${expandedId === order.id ? 'rotate-90' : ''}`} />
                                </div>
                            </div>
                            {expandedId === order.id && (
                                <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div className="mt-4">
                                        <p className="text-white/40 text-xs tracking-widest uppercase mb-2">Articles commandés</p>
                                        <div className="space-y-2">
                                            {order.items.map((item, i) => (
                                                <div key={i} className="flex items-center justify-between rounded-lg px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                                    <div>
                                                        <p className="text-white text-sm">
                                                            {item.product_name}
                                                            {item.size && (
                                                                <span className="ml-2 px-1.5 py-0.5 rounded-md text-[10px] bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 font-bold uppercase">
                                                                    Taille {item.size}
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-white/35 text-xs">Qté : {item.quantity}</p>
                                                    </div>
                                                    <p className="text-[#d4af37] text-sm font-semibold">{formatDH(item.price * item.quantity)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="rounded-lg px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        <p className="text-white/40 text-xs tracking-widest uppercase mb-1">Adresse de livraison</p>
                                        <p className="text-white text-sm">{order.customer_address}, {order.customer_city}</p>
                                    </div>
                                    {order.notes && (
                                        <div className="rounded-lg px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                            <p className="text-white/40 text-xs tracking-widest uppercase mb-1">Notes</p>
                                            <p className="text-white text-sm">{order.notes}</p>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-xs text-white/30">
                                        <DollarSign className="w-3.5 h-3.5" /> Paiement à la livraison (Cash on Delivery)
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap pt-1">
                                        <p className="text-white/40 text-xs tracking-widest uppercase mr-2">Changer le statut :</p>
                                        {(Object.keys(STATUS_COLORS) as Order['status'][]).map((s) => (
                                            <button key={s} disabled={order.status === s} onClick={() => handleStatusChange(order.id, s)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-default" style={order.status === s ? { background: STATUS_COLORS[s].bg, color: STATUS_COLORS[s].text } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
                                                {STATUS_COLORS[s].label}
                                            </button>
                                        ))}
                                        <button onClick={() => setConfirmDelete(order.id)} className="ml-auto p-2 rounded-lg text-white/35 hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showNewForm && (
                <NewOrderForm products={products} onClose={() => setShowNewForm(false)} onCreated={() => { load(); showToast('Commande créée ✓'); }} />
            )}
            {confirmDelete && (
                <ConfirmDialog message="Supprimer cette commande définitivement ?" onConfirm={() => handleDeleteOrder(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
            )}
            {toast && <Toast msg={toast} />}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════
// Dashboard Tab
// ══════════════════════════════════════════════════════════════════════════
function DashboardTab({ setTab }: { setTab: (t: Tab) => void }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([sbGetProducts(), sbGetOrders()]).then(([p, o]) => {
            setProducts(p); setOrders(o); setLoading(false);
        });
    }, []);

    const regularProducts = products.filter(p => p.category !== 'events');
    const revenue = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total_price, 0);
    const pendingOrders = orders.filter((o) => o.status === 'pending');
    const recentOrders = [...orders].slice(0, 5);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Package} label="Produits" value={String(regularProducts.length)} color="#d4af37" />
                <StatCard icon={ShoppingBag} label="Commandes" value={String(orders.length)} color="#60a5fa" />
                <StatCard icon={TrendingUp} label="Revenu total" value={formatDH(revenue)} color="#4ade80" />
                <StatCard icon={Clock} label="En attente" value={String(pendingOrders.length)} color="#fbbf24" />
            </div>

            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center justify-between px-5 py-4" style={{ background: '#111', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-white font-semibold text-sm">Commandes récentes</p>
                    <button onClick={() => setTab('orders')} className="text-[#d4af37] text-xs hover:underline flex items-center gap-1">
                        Voir toutes <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
                <div className="divide-y divide-white/[0.04]">
                    {recentOrders.length === 0 && <p className="text-center py-8 text-white/30 text-sm">Aucune commande.</p>}
                    {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors" style={{ background: '#0c0c0c' }}>
                            <div>
                                <p className="text-white text-sm font-medium">{order.customer_name}</p>
                                <p className="text-white/35 text-xs mt-0.5">{order.customer_city} · {formatDate(order.created_at)}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="text-[#d4af37] text-sm font-bold">{formatDH(order.total_price)}</p>
                                <StatusBadge status={order.status} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {products.filter((p) => !p.in_stock).length > 0 && (
                <div className="rounded-xl p-5" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <p className="text-red-400 text-sm font-semibold">Produits épuisés</p>
                    </div>
                    <div className="space-y-1.5">
                        {products.filter((p) => !p.in_stock).map((p) => (
                            <p key={p.id} className="text-white/60 text-sm">· {p.name}</p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════
// Events Tab
// ══════════════════════════════════════════════════════════════════════════
function EventsTab() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [form, setForm] = useState<Omit<Product, 'id' | 'created_at'>>({
        ...emptyProduct(),
        category: 'events'
    });
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [toast, setToast] = useState('');

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

    const load = useCallback(async () => {
        setLoading(true);
        const data = await sbGetProducts();
        setProducts(data.filter(p => p.category === 'events'));
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const openNew = () => {
        setForm({ ...emptyProduct(), category: 'events' });
        setEditingId(null);
        setShowForm(true);
        setError('');
    };

    const openEdit = (p: Product) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, created_at: _ca, ...rest } = p;
        setForm(rest);
        setEditingId(p.id);
        setShowForm(true);
        setError('');
    };

    const handleSave = async () => {
        if (!form.name || form.price < 0) { setError('Veuillez remplir au moins le nom.'); return; }
        setSaving(true);
        setError('');
        let ok: Product | null;
        if (editingId) {
            ok = await sbUpdateProduct(editingId, form);
        } else {
            ok = await sbAddProduct(form);
        }
        setSaving(false);
        if (!ok) return;
        showToast(editingId ? 'Événement mis à jour ✓' : 'Événement ajouté ✓');
        setShowForm(false);
        load();
    };

    const handleDelete = async (id: string) => {
        const ok = await sbDeleteProduct(id);
        setConfirmDelete(null);
        if (ok) { showToast('Événement supprimé.'); load(); }
    };

    return (
        <div className="space-y-5">
            <div className="flex justify-end">
                <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: 'linear-gradient(135deg, #d4af37, #b8942a)' }}>
                    <Plus className="w-4 h-4" /> Nouvel Événement
                </button>
            </div>

            {loading ? <LoadingSpinner /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {products.map((p) => (
                        <div key={p.id} className="rounded-xl overflow-hidden group border border-white/5 bg-[#0a0a0a]">
                            <div className="relative h-64">
                                <img src={p.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                                <div className="absolute bottom-4 left-5 right-5">
                                    <h4 className="text-white text-xl font-display">{p.name}</h4>
                                    <p className="text-white/60 text-sm italic font-script">{p.description}</p>
                                </div>
                                <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => openEdit(p)} className="p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-[#d4af37] hover:text-black transition-all border border-white/10"><Pencil className="w-4 h-4" /></button>
                                    <button onClick={() => setConfirmDelete(p.id)} className="p-2.5 bg-red-500/10 backdrop-blur-md rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {products.length === 0 && (
                        <div className="col-span-full py-20 text-center text-white/20 border border-dashed border-white/10 rounded-xl">
                            Aucun événement trouvé.
                        </div>
                    )}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto py-10 px-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-xl shadow-2xl" style={{ background: '#0a0a0a', border: '1px solid rgba(212,175,55,0.2)' }}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                            <h3 className="text-white font-semibold">{editingId ? 'Modifier l\'événement' : 'Nouvel événement'}</h3>
                            <button onClick={() => setShowForm(false)} className="p-2 text-white/40 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            {error && <ErrorBanner msg={error} />}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormField label="Nom de l'événement (Ex: Valentine's Day)" required>
                                    <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Valentine's Day" />
                                </FormField>
                                <FormField label="Prix si c'est un article spécial (Optionnel)">
                                    <input className="admin-input" type="number" value={form.price || ''} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="0" />
                                </FormField>
                            </div>

                            <FormField label="Sous-titre / Description (Ex: Show your love)">
                                <input className="admin-input font-script text-lg" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Show your love..." />
                            </FormField>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormField label="Bannière de l'événement (Image)">
                                    <div className="relative aspect-video rounded-xl border-2 border-dashed border-white/10 overflow-hidden bg-white/[0.02] flex items-center justify-center group transition-all hover:border-[#d4af37]/40">
                                        {form.image ? (
                                            <>
                                                <img src={form.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" alt="" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <label className="cursor-pointer bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-xs text-white border border-white/20 hover:bg-[#d4af37] hover:text-black transition-all">
                                                        Changer l'image
                                                        <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                                            const file = e.target.files?.[0]; if (!file) return;
                                                            setUploadingImg(true); const url = await sbUploadImage(file);
                                                            if (url) setForm({ ...form, image: url }); setUploadingImg(false);
                                                        }} />
                                                    </label>
                                                </div>
                                                <button onClick={() => setForm({ ...form, image: '' })} className="absolute top-4 right-4 p-1.5 bg-black/60 rounded-full text-white/60 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                                            </>
                                        ) : (
                                            <label className="cursor-pointer flex flex-col items-center gap-3 text-white/30 hover:text-[#d4af37] transition-all group">
                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 group-hover:bg-[#d4af37]/10 group-hover:border-[#d4af37]/20 transition-all">
                                                    {uploadingImg ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                                                </div>
                                                <span className="text-xs uppercase tracking-[0.2em] font-bold">Bannière</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                                    const file = e.target.files?.[0]; if (!file) return;
                                                    setUploadingImg(true); const url = await sbUploadImage(file);
                                                    if (url) setForm({ ...form, image: url }); setUploadingImg(false);
                                                }} />
                                            </label>
                                        )}
                                    </div>
                                </FormField>

                                <FormField label="Fond d'écran de la page (Optionnel)">
                                    <div className="relative aspect-video rounded-xl border-2 border-dashed border-white/10 overflow-hidden bg-white/[0.02] flex items-center justify-center group transition-all hover:border-[#d4af37]/40">
                                        {form.background_image ? (
                                            <>
                                                <img src={form.background_image} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" alt="" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <label className="cursor-pointer bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-xs text-white border border-white/20 hover:bg-[#d4af37] hover:text-black transition-all">
                                                        Changer le fond
                                                        <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                                            const file = e.target.files?.[0]; if (!file) return;
                                                            setUploadingImg(true); const url = await sbUploadImage(file);
                                                            if (url) setForm({ ...form, background_image: url }); setUploadingImg(false);
                                                        }} />
                                                    </label>
                                                </div>
                                                <button onClick={() => setForm({ ...form, background_image: '' })} className="absolute top-4 right-4 p-1.5 bg-black/60 rounded-full text-white/60 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                                            </>
                                        ) : (
                                            <label className="cursor-pointer flex flex-col items-center gap-3 text-white/30 hover:text-[#d4af37] transition-all group">
                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 group-hover:bg-[#d4af37]/10 group-hover:border-[#d4af37]/20 transition-all">
                                                    {uploadingImg ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                                                </div>
                                                <span className="text-xs uppercase tracking-[0.2em] font-bold">Image de fond</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                                    const file = e.target.files?.[0]; if (!file) return;
                                                    setUploadingImg(true); const url = await sbUploadImage(file);
                                                    if (url) setForm({ ...form, background_image: url }); setUploadingImg(false);
                                                }} />
                                            </label>
                                        )}
                                    </div>
                                </FormField>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/5">
                            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm text-white/50 hover:text-white transition-colors">Annuler</button>
                            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-8 py-2.5 rounded-lg text-sm font-bold text-black bg-[#d4af37] hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-[#d4af37]/20">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {editingId ? 'Enregistrer les modifications' : 'Créer l\'événement'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmDelete && <ConfirmDialog message="Supprimer cet événement ?" onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />}
            {toast && <Toast msg={toast} />}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════
// Main Admin Panel
// ══════════════════════════════════════════════════════════════════════════
type Tab = 'dashboard' | 'products' | 'orders' | 'events';

interface AdminPanelProps { onLogout: () => void; }

export default function AdminPanel({ onLogout }: AdminPanelProps) {
    const [tab, setTab] = useState<Tab>('dashboard');

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        { id: 'products', label: 'Produits', icon: Package },
        { id: 'events', label: 'Événements', icon: Gift },
        { id: 'orders', label: 'Commandes', icon: ShoppingBag },
    ];

    return (
        <div className="min-h-screen" style={{ background: '#070707', fontFamily: 'system-ui, sans-serif' }}>
            {/* Topbar */}
            <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5" style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #d4af37, #b8942a)' }}>
                        <ShieldCheck className="w-4 h-4 text-black" />
                    </div>
                    <div>
                        <p className="text-white text-sm font-bold tracking-wider">LUMIÈRE JEWELRY</p>
                        <p className="text-white/30 text-[10px] tracking-widest uppercase">Panneau d'administration</p>
                    </div>
                </div>

                <nav className="hidden md:flex items-center gap-1">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button key={id} id={`admin-tab-${id}`} onClick={() => setTab(id)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200" style={tab === id ? { background: 'rgba(212,175,55,0.15)', color: '#d4af37' } : { color: 'rgba(255,255,255,0.4)' }}>
                            <Icon className="w-3.5 h-3.5" />{label}
                        </button>
                    ))}
                </nav>

                <button id="admin-logout-btn" onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Déconnexion</span>
                </button>
            </header>

            {/* Mobile tabs */}
            <div className="md:hidden flex border-b" style={{ background: '#0a0a0a', borderColor: 'rgba(255,255,255,0.07)' }}>
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setTab(id)} className="flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-all" style={tab === id ? { color: '#d4af37' } : { color: 'rgba(255,255,255,0.35)' }}>
                        <Icon className="w-4 h-4" />{label}
                    </button>
                ))}
            </div>

            {/* Page content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-6">
                    <h1 className="text-white text-2xl font-bold mb-1">{tabs.find((t) => t.id === tab)?.label}</h1>
                    <div className="w-10 h-0.5" style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }} />
                </div>
                {tab === 'dashboard' && <DashboardTab setTab={setTab} />}
                {tab === 'products' && <ProductsTab />}
                {tab === 'events' && <EventsTab />}
                {tab === 'orders' && <OrdersTab />}
            </main>

            <style>{`
        .admin-input {
          width: 100%;
          padding: 10px 14px;
          font-size: 14px;
          color: #fff;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          outline: none;
          transition: border-color 0.2s;
        }
        .admin-input:focus { border-color: rgba(212,175,55,0.4); }
        .admin-input::placeholder { color: rgba(255,255,255,0.2); }
        .admin-input option { background: #1a1a1a; color: #fff; }
      `}</style>
        </div>
    );
}
