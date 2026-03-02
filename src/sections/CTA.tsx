import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CTA() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTriggers: ScrollTrigger[] = [];

      // Parallax background
      if (bgRef.current) {
        scrollTriggers.push(
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
            onUpdate: (self) => {
              const progress = self.progress;
              gsap.set(bgRef.current, {
                y: (progress - 0.5) * 80,
              });
            },
          })
        );
      }

      // Content animation
      if (contentRef.current) {
        const elements = contentRef.current.querySelectorAll('.animate-item');
        gsap.set(elements, { opacity: 0, y: 50 });

        scrollTriggers.push(
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top 60%',
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

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative w-full h-[80vh] min-h-[600px] overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <div ref={bgRef} className="absolute inset-0 scale-110">
        <img
          src="/cta-bg.jpg"
          alt="Luxury Experience"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 h-full flex flex-col items-center justify-center text-center section-padding"
      >
        <span className="animate-item font-script text-3xl md:text-5xl text-[#d4af37] mb-4">
          {t('cta.subtitle')}
        </span>

        <h2 className="animate-item font-display text-5xl md:text-6xl lg:text-7xl text-white mb-8 tracking-wide">
          {t('cta.title')}
        </h2>

        <p className="animate-item font-body text-base md:text-lg text-white/80 max-w-2xl mb-12 leading-relaxed">
          {t('cta.description')}
        </p>

        <button className="animate-item btn-primary btn-glow font-body text-sm tracking-[0.2em] uppercase">
          {t('cta.button')}
        </button>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
    </section>
  );
}
