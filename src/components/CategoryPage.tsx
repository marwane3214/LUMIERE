import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sbGetProducts } from '@/lib/supabaseAdmin';
import type { Product } from '@/types';
import { ChevronLeft, Eye, ShoppingBag, Star, X } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

export default function CategoryPage({ slug, onBack }: { slug: string; onBack: () => void }) {
    const { t, i18n } = useTranslation();
    const { addToCart } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        async function load() {
            const data = await sbGetProducts();
            // Filter by category and exclude products assigned to specific events
            setProducts(data.filter(p => p.category === slug && !p.event_id));
            setLoading(false);
        }
        load();
    }, [slug]);

    const getProductName = (product: Product) => {
        switch (i18n.language) {
            case 'fr': return product.name_fr;
            case 'ar': return product.name_ar;
            default: return product.name;
        }
    };

    const getCategoryTitle = () => {
        const titles: Record<string, any> = {
            rings: { en: 'Rings', fr: 'Bagues', ar: 'خواتم' },
            necklaces: { en: 'Necklaces', fr: 'Colliers', ar: 'قلادات' },
            earrings: { en: 'Earrings', fr: 'Boucles d\'Oreilles', ar: 'أقراط' },
            bracelets: { en: 'Bracelets', fr: 'Bracelets', ar: 'أساور' },
        };
        return titles[slug]?.[i18n.language] || slug;
    };

    return (
        <div className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-white/60 hover:text-[#d4af37] transition-colors mb-8 group"
                >
                    <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    <span>{t('nav.home', 'Home')}</span>
                </button>

                <div className="text-center mb-16">
                    <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white capitalize">
                        {getCategoryTitle()}
                    </h1>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {products.length === 0 ? (
                            <div className="col-span-full text-center text-white/40 py-12">
                                No products found in this category.
                            </div>
                        ) : (
                            products.map((product) => (
                                <div
                                    key={product.id}
                                    className="product-card group relative bg-[#0a0a0a] rounded-sm overflow-hidden border border-white/5 opacity-100"
                                >
                                    <div className="relative aspect-square overflow-hidden">
                                        <img
                                            src={product.image}
                                            alt={getProductName(product)}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                            <button
                                                onClick={() => setSelectedProduct(product)}
                                                className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-[#d4af37] hover:text-black transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
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
                            ))
                        )}
                    </div>
                )}
            </div>

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
                                        id="main-preview-img-cat"
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
                                                const main = document.getElementById('main-preview-img-cat') as HTMLImageElement;
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
                                        {selectedProduct.featured && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                                <Star className="w-3 h-3 text-[#d4af37] fill-[#d4af37]" /> Featured
                                            </span>
                                        )}
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

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={() => {
                                                addToCart(selectedProduct);
                                                setSelectedProduct(null);
                                            }}
                                            className="flex-1 btn-primary py-5 rounded-full font-bold tracking-[0.2em] uppercase text-xs flex items-center justify-center gap-3 group"
                                        >
                                            <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            {t('products.addToCart')}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">Livraison</span>
                                            <span className="text-xs text-white/70">Partout au Maroc</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">Qualité</span>
                                            <span className="text-xs text-white/70">Garantie Certifiée</span>
                                        </div>
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
