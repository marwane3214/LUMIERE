import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Instagram, Facebook, Twitter } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTriggers: ScrollTrigger[] = [];

      if (contentRef.current) {
        const elements = contentRef.current.querySelectorAll('.animate-item');
        gsap.set(elements, { opacity: 0, y: 30 });

        scrollTriggers.push(
          ScrollTrigger.create({
            trigger: footerRef.current,
            start: 'top 85%',
            onEnter: () => {
              gsap.to(elements, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
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
    }, footerRef);

    return () => ctx.revert();
  }, []);


  return (
    <footer
      ref={footerRef}
      className="relative w-full bg-black pt-20 pb-8 overflow-hidden"
    >
      {/* Gold line */}
      <div className="animate-item absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"></div>

      <div ref={contentRef} className="w-full section-padding">
        {/* Logo & Tagline */}
        <div className="animate-item text-center mb-16">
          <a
            href="/"
            className={`inline-block font-display text-4xl md:text-5xl text-white mb-4 hover:text-[#d4af37] transition-colors duration-300 ${isArabic ? '' : 'tracking-[0.2em]'}`}
          >
            {isArabic ? t('hero.title') : 'LUMIÈRE'}
          </a>
          <p className="font-script text-xl md:text-2xl text-[#d4af37]">
            {t('footer.tagline')}
          </p>
        </div>

        {/* Links Grid - Simplified */}
        <div className="flex justify-center mb-16 max-w-6xl mx-auto">
          {/* Contact Link Only */}
          <div className="animate-item text-center">
            <ul className="space-y-3">
              <li>
                <a
                  href="/contact"
                  className="font-body text-sm text-white/60 hover:text-[#d4af37] border-b border-transparent hover:border-[#d4af37] transition-all duration-300 inline-block uppercase tracking-widest"
                >
                  {t('footer.links.contactUs')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="animate-item border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:border-[#d4af37] hover:text-[#d4af37] hover:bg-[#d4af37]/10 hover:scale-110 hover:rotate-6 transition-all duration-300"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:border-[#d4af37] hover:text-[#d4af37] hover:bg-[#d4af37]/10 hover:scale-110 hover:rotate-6 transition-all duration-300"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:border-[#d4af37] hover:text-[#d4af37] hover:bg-[#d4af37]/10 hover:scale-110 hover:rotate-6 transition-all duration-300"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>

            {/* Copyright */}
            <p className="font-body text-xs text-white/40 text-center">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
