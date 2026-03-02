import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTriggers: ScrollTrigger[] = [];

      // Content animation
      const contentElements = contentRef.current?.querySelectorAll('.animate-item');
      if (contentElements) {
        gsap.set(contentElements, { opacity: 0, y: 40 });
        
        scrollTriggers.push(
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top 70%',
            onEnter: () => {
              gsap.to(contentElements, {
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

      // Image 3D animation
      if (imageRef.current) {
        gsap.set(imageRef.current, { opacity: 0, rotateY: -30 });
        
        scrollTriggers.push(
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top 70%',
            onEnter: () => {
              gsap.to(imageRef.current, {
                opacity: 1,
                rotateY: 0,
                duration: 1,
                ease: 'expo.out',
              });
            },
            once: true,
          })
        );

        // Parallax on scroll
        scrollTriggers.push(
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
            onUpdate: (self) => {
              const progress = self.progress;
              gsap.set(imageRef.current, {
                y: (progress - 0.5) * 40,
              });
            },
          })
        );
      }

      // Frame SVG draw
      if (frameRef.current) {
        const length = frameRef.current.getTotalLength();
        gsap.set(frameRef.current, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });

        scrollTriggers.push(
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top 60%',
            onEnter: () => {
              gsap.to(frameRef.current, {
                strokeDashoffset: 0,
                duration: 1.5,
                ease: 'power2.out',
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
      id="about"
      className="relative w-full py-24 md:py-32 bg-black overflow-hidden"
    >
      {/* Gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"></div>

      <div className="w-full section-padding">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div ref={contentRef} className="order-2 lg:order-1">
            <span className="animate-item font-script text-3xl md:text-4xl text-[#d4af37] block mb-4">
              {t('about.subtitle')}
            </span>
            
            <h2 className="animate-item font-display text-4xl md:text-5xl lg:text-6xl text-white mb-8 leading-tight">
              {t('about.title')}
            </h2>
            
            <p className="animate-item font-body text-base md:text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
              {t('about.description')}
            </p>
            
            <button className="animate-item group flex items-center gap-3 btn-primary font-body text-sm tracking-[0.15em] uppercase">
              {t('about.cta')}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
            </button>
          </div>

          {/* Image with 3D frame */}
          <div className="order-1 lg:order-2 relative perspective-1000">
            <div
              ref={imageRef}
              className="relative preserve-3d transition-transform duration-500 hover:rotate-y-6"
            >
              {/* Decorative frame SVG */}
              <svg
                className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <rect
                  ref={frameRef}
                  x="1"
                  y="1"
                  width="98"
                  height="98"
                  fill="none"
                  stroke="#d4af37"
                  strokeWidth="0.5"
                  rx="2"
                />
              </svg>
              
              {/* Image */}
              <div className="relative overflow-hidden rounded-sm">
                <img
                  src="/about-portrait.jpg"
                  alt="Luxury Jewelry Model"
                  className="w-full h-auto object-cover transition-transform duration-700 hover:scale-105"
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
        </div>
      </div>
    </section>
  );
}
