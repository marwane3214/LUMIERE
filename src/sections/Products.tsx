import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Eye, ShoppingBag, X, Star } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import type { Product } from '@/types';

gsap.registerPlugin(ScrollTrigger);

const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'Eternal Diamond Ring',
    name_fr: 'Bague Diamant Éternel',
    name_ar: 'خاتم الماس الأبدي',
    description: 'A stunning gold ring with a brilliant central diamond surrounded by smaller diamonds.',
    description_fr: 'Une magnifique bague en or avec un diamant central brillant entouré de petits diamants.',
    description_ar: 'خاتم ذهبي مذهل بماسة مركزية brillante محاطة بألماس أصغر.',
    price: 2450,
    image: '/product-ring.jpg',
    category: 'rings',
    featured: true,
    in_stock: true,
    created_at: '2024-01-01',
  },
  {
    id: '2',
    name: 'Golden Elegance Necklace',
    name_fr: 'Collier Élégance Dorée',
    name_ar: 'قلادة الأناقة الذهبية',
    description: 'An exquisite gold necklace with intricate filigree pendant featuring emeralds and diamonds.',
    description_fr: 'Un collier en or exquis avec pendentif en filigrane complexe orné d\'émeraudes et de diamants.',
    description_ar: 'قلادة ذهبية رائعة بقلادة فريدة مزخرفة بالزمرد والألماس.',
    price: 3890,
    image: '/product-necklace.jpg',
    category: 'necklaces',
    featured: true,
    in_stock: true,
    created_at: '2024-01-02',
  },
  {
    id: '3',
    name: 'Sapphire Serenity Earrings',
    name_fr: 'Boucles d\'Oreilles Sérénité Saphir',
    name_ar: 'أقراط الياقوت الهادئة',
    description: 'Elegant drop earrings featuring deep blue sapphires and sparkling diamonds.',
    description_fr: 'Élégantes boucles d\'oreilles pendantes avec des saphirs bleu profond et des diamants étincelants.',
    description_ar: 'أقراط أنيقة مع ياقوت أزرق غامق وألماس لامع.',
    price: 1670,
    image: '/product-earrings.jpg',
    category: 'earrings',
    featured: true,
    in_stock: true,
    created_at: '2024-01-03',
  },
  {
    id: '4',
    name: 'Emerald Enchantment Bracelet',
    name_fr: 'Bracelet Enchantement Émeraude',
    name_ar: 'سوار السحر الزمردي',
    description: 'A luxurious gold bracelet with emeralds and diamonds in an intricate woven pattern.',
    description_fr: 'Un bracelet en or luxueux avec des émeraudes et des diamants dans un motif tissé complexe.',
    description_ar: 'سوار ذهبي فاخر مع زمرد وألماس بنمط منسوج معقد.',
    price: 4250,
    image: '/product-bracelet.jpg',
    category: 'bracelets',
    featured: true,
    in_stock: true,
    created_at: '2024-01-04',
  },
];

import { sbGetProducts } from '@/lib/supabaseAdmin';

export default function Products() {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const RING_SIZES = ['5', '6', '7', '8', '9', '10', '11', '12'];

  useEffect(() => {
    async function loadProducts() {
      const data = await sbGetProducts();
      if (data && data.length > 0) {
        // Filter for featured products, limit to 4, and exclude event-specific items from general view
        const featured = data.filter(p => p.featured && !p.event_id).slice(0, 4);
        setProducts(featured);
      } else {
        // Fallback to hardcoded for demo if DB is empty
        setProducts(featuredProducts);
      }
      setLoading(false);
    }
    loadProducts();
  }, []);

  useEffect(() => {
    if (loading || products.length === 0) return;
    const ctx = gsap.context(() => {
      const scrollTriggers: ScrollTrigger[] = [];

      // Header animation
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
                gsap.to(subtitle, {
                  opacity: 1,
                  y: 0,
                  duration: 0.8,
                  ease: 'expo.out',
                });
                gsap.to(title, {
                  opacity: 1,
                  y: 0,
                  duration: 0.8,
                  delay: 0.2,
                  ease: 'expo.out',
                });
              },
              once: true,
            })
          );
        }
      }

      // Cards animation
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.product-card');
        gsap.set(cards, { opacity: 0, y: 80 });

        scrollTriggers.push(
          ScrollTrigger.create({
            trigger: cardsRef.current,
            start: 'top 75%',
            onEnter: () => {
              gsap.to(cards, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: 'expo.out',
              });
            },
            once: true,
          })
        );
      }

      return () => {
        scrollTriggers.forEach((st) => st.kill());
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const getProductName = (product: Product) => {
    switch (i18n.language) {
      case 'fr':
        return product.name_fr;
      case 'ar':
        return product.name_ar;
      default:
        return product.name;
    }
  };

  return (
    <section
      ref={sectionRef}
      id="products"
      className="relative w-full py-24 md:py-32 bg-black overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #d4af37 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}></div>
      </div>

      <div className="relative w-full section-padding">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <span className="font-script text-3xl md:text-4xl text-[#d4af37] block mb-4">
            {t('products.subtitle')}
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white">
            {t('products.title')}
          </h2>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div
            ref={cardsRef}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="product-card group relative bg-[#0a0a0a] rounded-sm overflow-hidden card-3d"
              >
                <div className="card-3d-inner">
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={getProductName(product)}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Overlay */}
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

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-display text-lg text-white mb-2 group-hover:text-[#d4af37] transition-colors duration-300">
                      {getProductName(product)}
                    </h3>
                    <p className="font-body text-[#d4af37] text-lg">
                      {product.price.toLocaleString()} DH
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="btn-primary font-body text-sm tracking-[0.15em] uppercase">
            {t('products.cta')}
          </button>
        </div>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
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
              {/* Left: Image Gallery */}
              <div className="space-y-4 p-6 bg-[#0a0a0a]">
                <div className="aspect-[4/5] rounded-xl overflow-hidden border border-white/5 shadow-2xl">
                  <img
                    id="main-preview-img"
                    src={selectedProduct.image}
                    alt={getProductName(selectedProduct)}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Thumbnails */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {[selectedProduct.image, ...(selectedProduct.images || [])].map((img, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const main = document.getElementById('main-preview-img') as HTMLImageElement;
                        if (main) main.src = img;
                      }}
                      className="w-20 h-20 rounded-lg overflow-hidden border border-white/10 hover:border-[#d4af37] transition-all shrink-0 opacity-60 hover:opacity-100"
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
    </section>
  );
}
