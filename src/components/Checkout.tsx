import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { sbAddOrder } from '@/lib/supabaseAdmin';
import { ChevronLeft, Loader2, CheckCircle2, CreditCard, Truck, ShieldCheck } from 'lucide-react';

const MOROCCAN_CITIES = [
    'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir',
    'Meknès', 'Oujda', 'Kénitra', 'Tétouan', 'Salé', 'Nador', 'Safi',
    'Mohammédia', 'Khouribga', 'Beni Mellal', 'El Jadida', 'Taza',
    'Settat', 'Larache', 'Ksar El Kebir', 'Khemisset', 'Guelmim',
    'Berrechid', 'Oued Zem', 'Fquih Ben Salah', 'Taourirt', 'Berkane',
    'Sidi Slimane', 'Sidi Kacem', 'Khenifra', 'Ifrane', 'Azrou', 'Midelt',
    'Errachidia', 'Ouarzazate', 'Zagora', 'Tinghir', 'Taroudant', 'Tiznit',
    'Tata', 'Assa', 'Es-Semara', 'Laayoune', 'Boujdour', 'Dakhla',
    'Mechra Bel Ksiri', 'Souk El Arbaa', 'Moulay Bousselham', 'Arbaoua',
    'Ksar Sghir', 'Asilah', 'Fnideq', 'M\'diq', 'Martil', 'Chefchaouen',
    'Ouazzane', 'Al Hoceima', 'Taounate', 'Bouznika', 'Skhirat'
];

interface CheckoutProps {
    onBack: () => void;
    onSuccess: () => void;
}

export default function Checkout({ onBack, onSuccess }: CheckoutProps) {
    const { items, totalPrice, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        city: 'Casablanca',
        notes: '',
    });

    const shippingFee = formData.city.toLowerCase().trim() === 'casablanca' ? 20 : 35;
    const finalTotal = totalPrice + shippingFee;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) return;

        setLoading(true);
        const orderData = {
            customer_name: formData.name,
            customer_phone: formData.phone,
            customer_address: formData.address,
            customer_city: formData.city,
            notes: formData.notes,
            items: items.map(item => ({
                product_id: item.product.id,
                product_name: item.product.name,
                quantity: item.quantity,
                price: item.product.price,
                size: item.selectedSize,
            })),
            total_price: finalTotal, // Include shipping in total
            status: 'pending' as const,
            payment_method: 'cod' as const,
        };

        const result = await sbAddOrder(orderData);
        setLoading(false);

        if (result) {
            setOrderComplete(true);
            clearCart();
            setTimeout(() => {
                onSuccess();
            }, 3000);
        } else {
            alert('Error placing order. Please try again.');
        }
    };

    if (orderComplete) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-[#d4af37]/20 rounded-full flex items-center justify-center mb-8 animate-bounce">
                    <CheckCircle2 className="w-12 h-12 text-[#d4af37]" />
                </div>
                <h2 className="font-display text-4xl text-white mb-4">Commande Confirmée !</h2>
                <p className="font-body text-white/60 max-w-md mb-8">
                    Merci pour votre achat. Votre commande a été enregistrée avec succès sous le mode Paiement à la Livraison.
                </p>
                <button
                    onClick={onSuccess}
                    className="btn-primary px-12"
                >
                    Retour à la boutique
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-white/60 hover:text-[#d4af37] transition-colors mb-8 group"
                >
                    <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    <span>Retour au panier</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Checkout Form */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="font-display text-3xl text-white mb-2 underline-grow inline-block">Finaliser la Commande</h2>
                            <p className="text-white/40 text-sm">Veuillez remplir vos informations de livraison.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest text-[#d4af37] font-bold">Nom Complet</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#d4af37] outline-none transition-colors"
                                        placeholder="Ex: Youssef Alami"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest text-[#d4af37] font-bold">Téléphone</label>
                                    <input
                                        required
                                        type="tel"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#d4af37] outline-none transition-colors"
                                        placeholder="Ex: 0612345678"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-[#d4af37] font-bold">Adresse Complète</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#d4af37] outline-none transition-colors"
                                    placeholder="Rue, Quartier, N° Maison/Appartement"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-[#d4af37] font-bold">Ville</label>
                                <input
                                    list="moroccan-cities"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#d4af37] outline-none transition-colors"
                                    placeholder="Entrez ou sélectionnez votre ville"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                                <datalist id="moroccan-cities">
                                    {MOROCCAN_CITIES.map(city => (
                                        <option key={city} value={city} />
                                    ))}
                                </datalist>
                                <p className="text-[10px] text-white/30 italic mt-1">
                                    * Casablanca: 20 DH | Hors Casablanca: 35 DH
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-[#d4af37] font-bold">Notes (Optionnel)</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#d4af37] outline-none transition-colors min-h-[100px] resize-none"
                                    placeholder="Instructions de livraison..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div className="p-4 bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-xl space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#d4af37]/20 rounded-full flex items-center justify-center">
                                        <Truck className="w-5 h-5 text-[#d4af37]" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-display text-sm">Paiement à la Livraison (CoD)</h4>
                                        <p className="text-white/40 text-xs">Payez en espèces lorsque vous recevez votre commande.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#d4af37]/20 rounded-full flex items-center justify-center">
                                        <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-display text-sm">Garantie Qualité</h4>
                                        <p className="text-white/40 text-xs">Tous nos bijoux sont certifiés et de haute qualité.</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full btn-primary py-4 flex items-center justify-center gap-3 group overflow-hidden relative"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        <span>Confirmer la Commande — {finalTotal.toLocaleString()} DH</span>
                                    </>
                                )}
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:sticky lg:top-32 h-fit bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                        <h3 className="font-display text-2xl text-white">Résumé de la Commande</h3>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {items.map((item, idx) => (
                                <div key={`${item.product.id}-${idx}`} className="flex gap-4 items-center animate-fade-in">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                        <img src={item.product.image} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white text-sm font-display truncate">{item.product.name}</h4>
                                        <p className="text-white/40 text-xs">{item.quantity} x {item.product.price.toLocaleString()} DH</p>
                                        {item.selectedSize && <p className="text-[#d4af37] text-[10px] font-bold">Taille: {item.selectedSize}</p>}
                                    </div>
                                    <div className="text-white font-body text-sm whitespace-nowrap">
                                        {(item.quantity * item.product.price).toLocaleString()} DH
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-white/10 space-y-3">
                            <div className="flex justify-between text-white/60 text-sm">
                                <span>Sous-total</span>
                                <span>{totalPrice.toLocaleString()} DH</span>
                            </div>
                            <div className="flex justify-between text-white/60 text-sm">
                                <span>Livraison ({formData.city || '...'})</span>
                                <span className="text-white">
                                    {shippingFee} DH
                                </span>
                            </div>
                            <div className="flex justify-between text-white text-xl font-display pt-3 border-t border-white/10">
                                <span>Total</span>
                                <span className="text-[#d4af37]">{finalTotal.toLocaleString()} DH</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
