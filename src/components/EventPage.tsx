import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sbGetProducts } from '@/lib/supabaseAdmin';
import type { Product } from '@/types';
import { ChevronLeft, Eye, ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

export default function EventPage({ eventId, onBack }: { eventId: string; onBack: () => void }) {
    const { t, i18n } = useTranslation();
    const { addToCart } = useCart();
    const [event, setEvent] = useState<Product | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const RING_SIZES = ['5', '6', '7', '8', '9', '10', '11', '12'];

    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await sbGetProducts();

            // The event itself is a product with category 'events'
            const currentEvent = data.find(p => p.id === eventId);
            setEvent(currentEvent || null);

            // Filter products that belong to this event
            const eventProducts = data.filter(p => p.event_id === eventId);
            setProducts(eventProducts);

            setLoading(false);
        }
        load();
    }, [eventId]);

    const getProductName = (product: Product) => {
        switch (i18n.language) {
            case 'fr': return product.name_fr;
            case 'ar': return product.name_ar;
            default: return product.name;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-4">
                <h1 className="font-display text-4xl mb-4">Événement introuvable</h1>
                <button onClick={onBack} className="text-[#d4af37] hover:underline flex items-center gap-2">
                    <ChevronLeft className="w-5 h-5" /> Retour à l'accueil
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white relative">
            {/* Dynamic Background */}
            {event.background_image && (
                <div className="fixed inset-0 z-0">
                    <img src={event.background_image} className="w-full h-full object-cover opacity-20" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
                </div>
            )}

            <div className="relative z-10 pt-24 pb-20 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-white/60 hover:text-[#d4af37] transition-colors mb-12 group"
                    >
                        <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span>{t('nav.home', 'Home')}</span>
                    </button>

                    {/* Event Banner */}
                    <div className="relative rounded-3xl overflow-hidden mb-20 border border-white/10 shadow-2xl group h-[400px] md:h-[500px]">
                        <img src={event.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8 md:p-16">
                            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white mb-4 animate-fade-up">
                                {event.name}
                            </h1>
                            <p className="font-script text-3xl md:text-4xl text-[#d4af37] opacity-90 animate-fade-up delay-100">
                                {event.description}
                            </p>
                        </div>
                    </div>

                    {/* Event Products Grid */}
                    <div className="mb-12">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="font-display text-2xl md:text-3xl text-white tracking-widest uppercase">La Collection</h2>
                            <div className="flex-1 h-[1px] bg-gradient-to-r from-white/20 to-transparent"></div>
                        </div>

                        {products.length === 0 ? (
                            <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <p className="text-white/40 italic">Aucun produit n'a encore été assigné à cette collection.</p>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="product-card group relative bg-black/40 backdrop-blur-md rounded-sm overflow-hidden border border-white/5 hover:border-[#d4af37]/30 transition-all duration-500"
                                    >
                                        <div className="relative aspect-square overflow-hidden">
                                            <img
                                                src={product.image}
                                                alt={getProductName(product)}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                                <button
                                                    onClick={() => { setSelectedProduct(product); setSelectedSize(''); }}
                                                    className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-[#d4af37] hover:text-black transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => addToCart(product)}
                                                    className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-[#d4af37] hover:text-black transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 delay-75"
                                                >
                                                    <ShoppingBag className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-display text-lg text-white mb-2 group-hover:text-[#d4af37] transition-colors duration-300 truncate">
                                                {getProductName(product)}
                                            </h3>
                                            <p className="font-body text-[#d4af37] text-lg">
                                                {product.price.toLocaleString()} DH
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Modal */}
            {selectedProduct && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
                    onClick={() => setSelectedProduct(null)}
                >
                    <div
                        className="bg-[#050505] rounded-2xl max-w-5xl w-full overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,1)] relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-black/40 text-white/60 hover:text-white hover:bg-black/60 transition-all flex items-center justify-center border border-white/10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="grid md:grid-cols-2">
                            <div className="space-y-4 p-6 bg-[#0a0a0a]">
                                <div className="aspect-[4/5] rounded-xl overflow-hidden border border-white/5 shadow-2xl">
                                    <img
                                        id="main-preview-img-event"
                                        src={selectedProduct.image}
                                        alt={getProductName(selectedProduct)}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                                    {[selectedProduct.image, ...(selectedProduct.images || [])].map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                const main = document.getElementById('main-preview-img-event') as HTMLImageElement;
                                                if (main) main.src = img;
                                            }}
                                            className="w-20 h-20 rounded-lg overflow-hidden border border-white/10 hover:border-[#d4af37] transition-all shrink-0 opacity-60 hover:opacity-100"
                                        >
                                            <img src={img} className="w-full h-full object-cover" alt="" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 md:p-12 flex flex-col justify-center space-y-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-3 py-1 rounded-full text-[10px] tracking-[0.2em] font-bold uppercase bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20">
                                            {selectedProduct.category}
                                        </span>
                                    </div>
                                    <h3 className="font-display text-4xl md:text-5xl text-white mb-2 leading-tight">
                                        {getProductName(selectedProduct)}
                                    </h3>
                                    <div className="w-20 h-[1px] bg-gradient-to-r from-[#d4af37] to-transparent mb-6"></div>
                                    <p className="font-body text-white/60 text-lg leading-relaxed max-w-md">
                                        {i18n.language === 'fr' ? selectedProduct.description_fr : (i18n.language === 'ar' ? selectedProduct.description_ar : selectedProduct.description)}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-white/40 text-sm font-body">Price:</span>
                                        <span className="font-display text-4xl text-[#d4af37]">
                                            {selectedProduct.price.toLocaleString()} DH
                                        </span>
                                    </div>

                                    {/* Ring Size Selector */}
                                    {selectedProduct.category === 'rings' && (
                                        <div>
                                            <span className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-bold mb-3 block">
                                                Ring Size {selectedSize && <span className="text-[#d4af37] ml-2">— {selectedSize}</span>}
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                                {RING_SIZES.map((size) => (
                                                    <button
                                                        key={size}
                                                        onClick={() => setSelectedSize(size)}
                                                        className={`w-10 h-10 rounded-lg text-sm font-bold border transition-all duration-200 ${selectedSize === size
                                                            ? 'bg-[#d4af37] text-black border-[#d4af37]'
                                                            : 'bg-transparent text-white/60 border-white/15 hover:border-[#d4af37]/60 hover:text-white'
                                                            }`}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={() => {
                                                if (selectedProduct.category === 'rings' && !selectedSize) return;
                                                addToCart(selectedProduct, selectedProduct.category === 'rings' ? selectedSize : undefined);
                                                setSelectedProduct(null);
                                                setSelectedSize('');
                                            }}
                                            disabled={selectedProduct.category === 'rings' && !selectedSize}
                                            className="flex-1 btn-primary py-5 rounded-full font-bold tracking-[0.2em] uppercase text-xs flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            {selectedProduct.category === 'rings' && !selectedSize ? 'Select a Size' : t('products.addToCart')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
