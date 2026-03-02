import { useState } from 'react';
import { sbGetOrdersByPhone } from '@/lib/supabaseAdmin';
import type { Order } from '@/types';
import { Search, Package, Clock, CheckCircle2, XCircle, ShoppingBag, Loader2, ChevronLeft } from 'lucide-react';

const STATUS_MAP = {
    pending: { label: 'En attente', color: 'text-amber-400', icon: Clock, bg: 'bg-amber-400/10' },
    confirmed: { label: 'Confirmée', color: 'text-blue-400', icon: Package, bg: 'bg-blue-400/10' },
    delivered: { label: 'Livrée', color: 'text-emerald-400', icon: CheckCircle2, bg: 'bg-emerald-400/10' },
    cancelled: { label: 'Annulée', color: 'text-red-400', icon: XCircle, bg: 'bg-red-400/10' },
};

export default function UserOrders({ onBack }: { onBack: () => void }) {
    const [phone, setPhone] = useState('');
    const [orders, setOrders] = useState<Order[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone) return;

        setLoading(true);
        const data = await sbGetOrdersByPhone(phone);
        setOrders(data);
        setLoading(false);
        setSearched(true);
    };

    return (
        <div className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-white/60 hover:text-[#d4af37] transition-colors mb-8 group"
                >
                    <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    <span>Retour à l'accueil</span>
                </button>

                <div className="text-center mb-12">
                    <h2 className="font-display text-4xl text-white mb-4">Suivre mes commandes</h2>
                    <p className="text-white/40 max-w-md mx-auto">
                        Entrez votre numéro de téléphone pour voir l'historique et le statut de vos commandes.
                    </p>
                </div>

                <form onSubmit={handleSearch} className="max-w-md mx-auto mb-16 px-4">
                    <div className="relative">
                        <input
                            type="tel"
                            className="w-full bg-white/5 border border-white/10 rounded-full py-4 px-6 pl-12 text-white focus:border-[#d4af37] outline-none transition-all"
                            placeholder="Ex: 0612345678"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                        <button
                            disabled={loading}
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#d4af37] text-black px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Rechercher'}
                        </button>
                    </div>
                </form>

                <div className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : searched && orders ? (
                        orders.length > 0 ? (
                            orders.map((order) => {
                                const status = STATUS_MAP[order.status];
                                const StatusIcon = status.icon;
                                return (
                                    <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#d4af37]/30 transition-colors">
                                        <div className="p-6 sm:p-8">
                                            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                                <div>
                                                    <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Commande #{order.id.slice(-6).toUpperCase()}</p>
                                                    <p className="text-white/60 text-sm">{new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                </div>
                                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${status.bg} ${status.color}`}>
                                                    <StatusIcon className="w-4 h-4" />
                                                    <span className="text-sm font-bold">{status.label}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-4 mb-8">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm">
                                                        <div className="text-white">
                                                            {item.quantity} x {item.product_name}
                                                        </div>
                                                        <div className="text-white/60">
                                                            {(item.price * item.quantity).toLocaleString()} DH
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="pt-6 border-t border-white/10 flex justify-between items-center text-xl">
                                                <span className="text-white/40 font-display text-sm uppercase">Total</span>
                                                <span className="text-[#d4af37] font-display">{order.total_price.toLocaleString()} DH</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-20 bg-white/5 border border-white/10 border-dashed rounded-3xl">
                                <ShoppingBag className="w-16 h-16 text-white/10 mx-auto mb-4" />
                                <p className="text-white/40">Aucune commande trouvée pour ce numéro.</p>
                            </div>
                        )
                    ) : null}
                </div>
            </div>
        </div>
    );
}
