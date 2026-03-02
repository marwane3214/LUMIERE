import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import type { Testimonial } from '@/types';

gsap.registerPlugin(ScrollTrigger);

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Isabella Montgomery',
    quote: 'The craftsmanship of my LUMIÈRE ring is absolutely exquisite. Every detail speaks to the dedication and artistry of their master jewelers.',
    quote_fr: 'L\'artisanat de ma bague LUMIÈRE est absolument exquis. Chaque détail témoigne du dévouement et de l\'art de leurs joailliers maîtres.',
    quote_ar: 'حرفية خاتم لوميير الخاص بي رائعة للغاية. كل تفصيل يتحدث عن التفاني والفن لدى صائغيهم الماهرين.',
  },
  {
    id: '2',
    name: 'Alexandra Sterling',
    quote: 'LUMIÈRE transformed my vision into a breathtaking reality. The custom necklace they created exceeded every expectation.',
    quote_fr: 'LUMIÈRE a transformé ma vision en une réalité à couper le souffle. Le collier personnalisé qu\'ils ont créé a dépassé toutes les attentes.',
    quote_ar: 'حولت لوميير رؤيتي إلى واقع مذهل. القلادة المخصصة التي صنعوها تجاوزت كل توقعاتي.',
  },
  {
    id: '3',
    name: 'Victoria Ashford',
    quote: 'From the moment I stepped into their atelier, I knew I was in the presence of true artisans. My earrings are timeless treasures.',
    quote_fr: 'Dès le moment où j\'ai franchi la porte de leur atelier, j\'ai su que j\'étais en présence de véritables artisans. Mes boucles d\'oreilles sont des trésors intemporels.',
    quote_ar: 'من اللحظة التي دخلت فيها إلى ورشتهم، عرفت أنني في حضور حرفيين حقيقيين. أقراطي هي كنوز خالدة.',
  },
];

export default function Testimonials() {
  const { t, i18n } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTriggers: ScrollTrigger[] = [];

      if (contentRef.current) {
        const elements = contentRef.current.querySelectorAll('.animate-item');
        gsap.set(elements, { opacity: 0, y: 40 });

        scrollTriggers.push(
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top 70%',
            onEnter: () => {
              gsap.to(elements, {
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

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);

    const direction = index > currentIndex ? 1 : -1;

    gsap.to('.testimonial-content', {
      opacity: 0,
      x: -50 * direction,
      duration: 0.4,
      ease: 'expo.in',
      onComplete: () => {
        setCurrentIndex(index);
        gsap.fromTo(
          '.testimonial-content',
          { opacity: 0, x: 50 * direction },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: 'expo.out',
            onComplete: () => setIsAnimating(false),
          }
        );
      },
    });
  };

  const nextSlide = () => {
    const next = (currentIndex + 1) % testimonials.length;
    goToSlide(next);
  };

  const prevSlide = () => {
    const prev = (currentIndex - 1 + testimonials.length) % testimonials.length;
    goToSlide(prev);
  };

  const getQuote = (testimonial: Testimonial) => {
    switch (i18n.language) {
      case 'fr':
        return testimonial.quote_fr;
      case 'ar':
        return testimonial.quote_ar;
      default:
        return testimonial.quote;
    }
  };

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative w-full py-24 md:py-32 bg-black overflow-hidden"
    >
      {/* Gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"></div>

      <div ref={contentRef} className="w-full section-padding">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="animate-item relative perspective-1000">
            <div className="relative preserve-3d">
              {/* Decorative frame */}
              <svg
                className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <rect
                  x="1"
                  y="1"
                  width="98"
                  height="98"
                  fill="none"
                  stroke="#d4af37"
                  strokeWidth="0.5"
                  rx="2"
                  strokeDasharray="400"
                  strokeDashoffset="0"
                />
              </svg>

              <div className="relative overflow-hidden rounded-sm">
                <img
                  src="/about-portrait.jpg"
                  alt="Happy Customer"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>

              {/* Corner decorations */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-[#d4af37]"></div>
              <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-[#d4af37]"></div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-[#d4af37]"></div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-[#d4af37]"></div>
            </div>
          </div>

          {/* Testimonial Slider */}
          <div className="animate-item">
            <span className="font-script text-3xl md:text-4xl text-[#d4af37] block mb-4">
              {t('testimonials.subtitle')}
            </span>

            <h2 className="font-display text-4xl md:text-5xl text-white mb-12">
              {t('testimonials.title')}
            </h2>

            {/* Quote */}
            <div className="testimonial-content relative min-h-[200px]">
              <Quote className="absolute -top-4 -left-2 w-12 h-12 text-[#d4af37]/20" />

              <p className="font-body text-lg md:text-xl text-white/80 leading-relaxed mb-8 pl-8">
                "{getQuote(testimonials[currentIndex])}"
              </p>

              <div className="pl-8">
                <p className="font-display text-xl text-[#d4af37]">
                  — {testimonials[currentIndex].name}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-6 mt-10">
              {/* Arrows */}
              <div className="flex gap-3">
                <button
                  onClick={prevSlide}
                  disabled={isAnimating}
                  className="w-12 h-12 border border-white/30 rounded-full flex items-center justify-center text-white/70 hover:border-[#d4af37] hover:text-[#d4af37] hover:bg-[#d4af37]/10 transition-all duration-300 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  disabled={isAnimating}
                  className="w-12 h-12 border border-white/30 rounded-full flex items-center justify-center text-white/70 hover:border-[#d4af37] hover:text-[#d4af37] hover:bg-[#d4af37]/10 transition-all duration-300 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                        ? 'w-8 bg-[#d4af37]'
                        : 'bg-white/30 hover:bg-white/50'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
