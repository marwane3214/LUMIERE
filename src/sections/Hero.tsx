import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLSpanElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial states
      gsap.set([subtitleRef.current, descRef.current, ctaRef.current], {
        opacity: 0,
        y: 60,
      });

      if (titleRef.current) {
        const letters = titleRef.current.querySelectorAll('.letter');
        gsap.set(letters, {
          opacity: 0,
          y: 100,
          rotateX: 90,
        });
      }

      // Entrance timeline
      const tl = gsap.timeline({ delay: 0.3 });

      // Subtitle animation
      tl.to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out',
      });

      // Title animation (letters stagger for Latin, whole title for Arabic)
      if (titleRef.current) {
        const letters = titleRef.current.querySelectorAll('.letter');
        const elementsToAnimate = letters.length > 0 ? letters : titleRef.current;

        tl.to(
          elementsToAnimate,
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            stagger: letters.length > 0 ? 0.08 : 0,
            ease: 'expo.out',
          },
          '-=0.5'
        );
      }

      // Description
      tl.to(
        descRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'expo.out',
        },
        '-=0.3'
      );

      // CTA button
      tl.to(
        ctaRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'elastic.out(1, 0.5)',
        },
        '-=0.4'
      );

      // Scroll effects
      const scrollTriggers: ScrollTrigger[] = [];

      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
          onUpdate: (self) => {
            const progress = self.progress;
            if (contentRef.current) {
              gsap.set(contentRef.current, {
                opacity: 1 - progress * 1.5,
                y: -progress * 80,
              });
            }
          },
        })
      );

      // Particles animation
      if (particlesRef.current) {
        const particles = particlesRef.current.querySelectorAll('.particle');
        particles.forEach((particle, i) => {
          gsap.to(particle, {
            y: `random(-30, 30)`,
            x: `random(-20, 20)`,
            opacity: `random(0.3, 0.7)`,
            duration: `random(4, 8)`,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.2,
          });
        });
      }

      return () => {
        scrollTriggers.forEach((st) => st.kill());
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const titleLetters = t('hero.title').split('');

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative w-full h-screen overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/hero-bg.jpg"
          alt="Luxury Jewelry"
          className="w-full h-full object-cover scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black"></div>
      </div>

      {/* Floating Particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle absolute w-1 h-1 bg-[#d4af37] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 h-full flex flex-col items-center justify-center text-center section-padding"
      >
        <span
          ref={subtitleRef}
          className="font-script text-3xl md:text-5xl text-[#d4af37] mb-4 float-animation"
        >
          {t('hero.welcome')}
        </span>

        <h1
          ref={titleRef}
          className={`font-display text-6xl md:text-8xl lg:text-9xl text-white mb-8 perspective-1200 ${isArabic ? '' : 'tracking-[0.15em]'}`}
        >
          {isArabic ? (
            t('hero.title')
          ) : (
            titleLetters.map((letter, index) => (
              <span
                key={index}
                className="letter inline-block preserve-3d"
                style={{ display: letter === ' ' ? 'inline' : 'inline-block' }}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </span>
            ))
          )}
        </h1>

        <p
          ref={descRef}
          className="font-body text-base md:text-lg text-white/80 max-w-2xl mb-12 leading-relaxed"
        >
          {t('hero.description')}
        </p>

        <button
          ref={ctaRef}
          onClick={() => window.location.href = '/#products'}
          className="btn-primary btn-glow font-body text-sm tracking-[0.2em] uppercase"
        >
          {t('hero.cta')}
        </button>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
    </section>
  );
}
