import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import type { Category } from '@/types';

gsap.registerPlugin(ScrollTrigger);

const categories: Category[] = [
  {
    id: '1',
    name: 'Rings',
    name_fr: 'Bagues',
    name_ar: 'خواتم',
    description: 'Symbolize Eternity',
    description_fr: 'Symboliser l\'Éternité',
    description_ar: 'رمز للأبدية',
    image: '/category-rings.jpg',
    slug: 'rings',
  },
  {
    id: '2',
    name: 'Necklaces',
    name_fr: 'Colliers',
    name_ar: 'قلادات',
    description: 'Adorn Your Grace',
    description_fr: 'Orner Votre Grâce',
    description_ar: 'تزين أنوثتك',
    image: '/category-necklaces.jpg',
    slug: 'necklaces',
  },
  {
    id: '3',
    name: 'Earrings',
    name_fr: 'Boucles d\'Oreilles',
    name_ar: 'أقراط',
    description: 'Frame Your Beauty',
    description_fr: 'Encadrer Votre Beauté',
    description_ar: 'إطار لجمالك',
    image: '/category-earrings.jpg',
    slug: 'earrings',
  },
  {
    id: '4',
    name: 'Bracelets',
    name_fr: 'Bracelets',
    name_ar: 'أساور',
    description: 'Embrace Elegance',
    description_fr: 'Embrasser l\'Élégance',
    description_ar: 'عناق الأناقة',
    image: '/category-bracelets.jpg',
    slug: 'bracelets',
  },
];

export default function Categories({ onCategoryClick }: { onCategoryClick?: (slug: string) => void }) {
  const { t, i18n } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTriggers: ScrollTrigger[] = [];

      if (cardsRef.current && containerRef.current) {
        const cards = cardsRef.current.querySelectorAll('.category-card');
        const totalWidth = cardsRef.current.scrollWidth - window.innerWidth;

        // Horizontal scroll animation
        const horizontalScroll = gsap.to(cardsRef.current, {
          x: -totalWidth,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: () => `+=${totalWidth}`,
            pin: true,
            scrub: 1.5,
            invalidateOnRefresh: true,
          },
        });

        if (horizontalScroll.scrollTrigger) {
          scrollTriggers.push(horizontalScroll.scrollTrigger);
        }

        // Card scale animation
        cards.forEach((card) => {
          scrollTriggers.push(
            ScrollTrigger.create({
              trigger: card,
              containerAnimation: horizontalScroll,
              start: 'left 80%',
              end: 'left 20%',
              scrub: 1.5,
              onUpdate: (self) => {
                const scale = 0.9 + self.progress * 0.1;
                gsap.set(card, { scale });
              },
            })
          );
        });
      }

      return () => {
        scrollTriggers.forEach((st) => st.kill());
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const getCategoryName = (category: Category) => {
    switch (i18n.language) {
      case 'fr':
        return category.name_fr;
      case 'ar':
        return category.name_ar;
      default:
        return category.name;
    }
  };

  const getCategoryDescription = (category: Category) => {
    switch (i18n.language) {
      case 'fr':
        return category.description_fr;
      case 'ar':
        return category.description_ar;
      default:
        return category.description;
    }
  };

  return (
    <section
      ref={sectionRef}
      id="categories"
      className="relative w-full bg-black overflow-hidden"
    >
      {/* Section Header */}
      <div className="py-16 section-padding">
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white text-center">
          {t('categories.title')}
        </h2>
      </div>

      {/* Horizontal Scroll Container */}
      <div ref={containerRef} className="relative h-screen">
        <div
          ref={cardsRef}
          className="flex h-full"
          style={{ width: 'fit-content' }}
        >
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="category-card relative h-full w-[80vw] md:w-[50vw] lg:w-[33vw] flex-shrink-0 overflow-hidden group cursor-pointer"
              onClick={() => onCategoryClick?.(category.slug)}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={category.image}
                  alt={getCategoryName(category)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-500"></div>
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
                <span className="font-script text-2xl md:text-3xl text-[#d4af37] mb-2 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  {getCategoryDescription(category)}
                </span>

                <h3 className="font-display text-3xl md:text-4xl lg:text-5xl text-white mb-6">
                  {getCategoryName(category)}
                </h3>

                <button className="inline-flex items-center gap-2 text-white/80 hover:text-[#d4af37] transition-colors duration-300 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                  <span className="font-body text-sm tracking-[0.15em] uppercase">
                    {t('categories.explore')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Index Number */}
              <div className="absolute top-8 right-8 font-display text-6xl md:text-8xl text-white/10">
                0{index + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/50">
          <span className="font-body text-xs tracking-widest uppercase">
            Scroll to explore
          </span>
          <div className="w-12 h-[1px] bg-white/30 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-[#d4af37] animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
