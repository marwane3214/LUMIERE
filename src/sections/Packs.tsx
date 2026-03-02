import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Eye, ShoppingBag, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useCart } from '@/hooks/useCart';
import type { Product } from '@/types';
import { sbGetProducts } from '@/lib/supabaseAdmin';

gsap.registerPlugin(ScrollTrigger);

const RING_SIZES = ['5', '6', '7', '8', '9', '10', '11', '12'];

function PackModal({ product, onClose, getProductName, addToCart }: {
    product: Product;
    onClose: () => void;
    getProductName: (p: Product) => string;
    addToCart: (p: Product, size?: string) => void;
}) {
    const { t, i18n } = useTranslation();
    const [mainImg, setMainImg] = useState(product.image);
    const [selectedSize, setSelectedSize] = useState('');
    const isRing = product.category === 'rings' || product.name.toLowerCase().includes('ring');
    const lang = i18n.language;

    const description = lang === 'fr'
        ? product.description_fr
        : lang === 'ar'
            ? product.description_ar
            : product.description;

    // Prevent body scroll while modal open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const bgStyle = product.background_image
        ? { backgroundImage: `url(${product.background_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : {};

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={onClose}
            style={{ isolation: 'isolate' }}
        >
            <div
                className="relative bg-[#050505] rounded-2xl max-w-5xl w-full overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,1)]"
                onClick={(e) => e.stopPropagation()}
                style={{ maxHeight: '90vh', overflowY: 'auto' }}
            >
                {/* Background decorative image for the modal */}
                {product.background_image && (
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={bgStyle} />
                )}

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 text-white/60 hover:text-white hover:bg-black/80 transition-all flex items-center justify-center border border-white/10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="relative grid md:grid-cols-2">
                    {/* Left: Image Gallery */}
                    <div className="space-y-4 p-6 bg-[#0a0a0a]/80">
                        <div className="aspect-[4/5] rounded-xl overflow-hidden border border-white/5 shadow-2xl">
                            <img
                                src={mainImg}
                                alt={getProductName(product)}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = product.image;
                                }}
                            />
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                            {[product.image, ...(product.images || [])].filter(Boolean).map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setMainImg(img)}
                                    className={`w-20 h-20 rounded-lg overflow-hidden border transition-all shrink-0 ${mainImg === img ? 'border-[#d4af37] opacity-100' : 'border-white/10 opacity-60 hover:opacity-100 hover:border-[#d4af37]/50'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="p-8 md:p-12 flex flex-col justify-center space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 rounded-full text-[10px] tracking-[0.2em] font-bold uppercase bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20">
                                    Pack
                                </span>
                            </div>
                            <h3 className="font-display text-4xl md:text-5xl text-white mb-2 leading-tight">
                                {getProductName(product)}
                            </h3>
                            <div className="w-20 h-[1px] bg-gradient-to-r from-[#d4af37] to-transparent mb-6" />
                            <p className="font-body text-white/60 text-lg leading-relaxed max-w-md">
                                {description}
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-baseline gap-2">
                                <span className="text-white/40 text-sm font-body">Price:</span>
                                <span className="font-display text-4xl text-[#d4af37]">
                                    {product.price.toLocaleString()} DH
                                </span>
                            </div>

                            {/* Ring Size Selector (if pack contains rings) */}
                            {isRing && (
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
                                        if (isRing && !selectedSize) return;
                                        addToCart(product, isRing ? selectedSize : undefined);
                                        onClose();
                                    }}
                                    disabled={isRing && !selectedSize}
                                    className="flex-1 btn-primary py-5 rounded-full font-bold tracking-[0.2em] uppercase text-xs flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    {isRing && !selectedSize ? 'Select a Size' : t('products.addToCart')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default function Packs() {
    const { t, i18n } = useTranslation();
    const { addToCart } = useCart();
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [packs, setPacks] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPacks() {
            const data = await sbGetProducts();
            if (data && data.length > 0) {
                setPacks(data.filter(p => p.category === 'packs' || p.category === 'pack'));
            }
            setLoading(false);
        }
        loadPacks();
    }, []);

    useEffect(() => {
        if (loading || packs.length === 0) return;
        const ctx = gsap.context(() => {
            const scrollTriggers: ScrollTrigger[] = [];

            if (headerRef.current) {
                const title = headerRef.current.querySelector('h2');
                const subtitle = headerRef.current.querySelector('span');

                if (title && subtitle) {
                    gsap.set([subtitle, title], { opacity: 0, y: 40 });

                    scrollTriggers.push(
                        ScrollTrigger.create({
                            trigger: headerRef.current,
                            start: 'top 80%',
                            onEnter: () => {
                                gsap.to(subtitle, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' });
                                gsap.to(title, { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'expo.out' });
                            },
                            once: true,
                        })
                    );
                }
            }

            if (cardsRef.current) {
                const cards = cardsRef.current.querySelectorAll('.pack-card');
                gsap.set(cards, { opacity: 0, x: -50 });

                scrollTriggers.push(
                    ScrollTrigger.create({
                        trigger: cardsRef.current,
                        start: 'top 75%',
                        onEnter: () => {
                            gsap.to(cards, { opacity: 1, x: 0, duration: 0.8, stagger: 0.2, ease: 'expo.out' });
                        },
                        once: true,
                    })
                );
            }

            return () => scrollTriggers.forEach((st) => st.kill());
        }, sectionRef);

        return () => ctx.revert();
    }, [packs, loading]);

    const getProductName = (product: Product) => {
        switch (i18n.language) {
            case 'fr': return product.name_fr || product.name;
            case 'ar': return product.name_ar || product.name;
            default: return product.name;
        }
    };

    if (!loading && packs.length === 0) return null;

    return (
        <section ref={sectionRef} id="packs" className="relative w-full py-24 md:py-32 bg-[#050505] overflow-hidden">
            <div className="relative w-full section-padding">
                <div ref={headerRef} className="text-center mb-16">
                    <span className="font-script text-3xl md:text-4xl text-[#d4af37] block mb-4">
                        {t('packs')}
                    </span>
                    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white">
                        {t('packs')}
                    </h2>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {packs.map((pack) => (
                            <div key={pack.id} className="pack-card group relative rounded-2xl overflow-hidden border border-white/5 hover:border-[#d4af37]/50 transition-colors duration-500 cursor-pointer"
                                style={pack.background_image
                                    ? { background: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.85)), url(${pack.background_image}) center/cover no-repeat` }
                                    : { background: '#0a0a0a' }
                                }
                            >
                                <div className="aspect-[4/3] relative overflow-hidden">
                                    <img src={pack.image} alt={getProductName(pack)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedProduct(pack); }}
                                            className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-[#d4af37] hover:text-black transition-all"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); addToCart(pack); }}
                                            className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-[#d4af37] hover:text-black transition-all"
                                        >
                                            <ShoppingBag className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="absolute top-4 left-4 bg-[#d4af37] text-black text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">Pack</div>
                                </div>
                                <div className="p-8 text-center">
                                    <h3 className="font-display text-2xl text-white mb-2">{getProductName(pack)}</h3>
                                    <p className="font-body text-[#d4af37] text-xl font-bold">{pack.price.toLocaleString()} DH</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedProduct && (
                <PackModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    getProductName={getProductName}
                    addToCart={addToCart}
                />
            )}
        </section>
    );
}
