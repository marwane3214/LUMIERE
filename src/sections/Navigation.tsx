import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import type { Language } from '@/types';

export default function Navigation() {
  const { t, i18n } = useTranslation();
  const { totalItems, setIsCartOpen } = useCart();
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', flag: '🇲🇦' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
    setIsLangMenuOpen(false);
  };

  const isArabic = i18n.language === 'ar';
  const navLinks = [
    { href: '/#home', label: t('nav.home') },
    { href: '/#products', label: t('nav.shop') },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-black/95 backdrop-blur-md py-4 border-b border-[#d4af37]/20'
        : 'bg-transparent py-6'
        }`}
    >
      <div className="w-full section-padding">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="/"
            className="relative group perspective-1000"
          >
            <span className={`font-display text-2xl md:text-3xl text-white transition-transform duration-600 inline-block group-hover:rotate-y-180 ${isArabic ? '' : 'tracking-[0.2em]'}`}>
              {isArabic ? t('hero.title') : 'LUMIÈRE'}
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#d4af37] transition-all duration-300 group-hover:w-full"></span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => {
                  // Standard hash navigation
                }}
                className="font-body text-sm tracking-wider text-white/80 hover:text-[#d4af37] transition-colors duration-300 underline-grow"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1 text-white/80 hover:text-[#d4af37] transition-colors duration-300"
              >
                <span className="text-lg">
                  {languages.find((l) => l.code === i18n.language)?.flag || '🇬🇧'}
                </span>
                <span className="hidden sm:inline text-xs uppercase">
                  {i18n.language}
                </span>
              </button>

              {isLangMenuOpen && (
                <div className="absolute top-full right-0 mt-2 bg-black/95 border border-[#d4af37]/30 rounded-md overflow-hidden min-w-[140px]">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-[#d4af37]/10 transition-colors duration-200 flex items-center gap-2 ${i18n.language === lang.code ? 'text-[#d4af37]' : 'text-white/80'
                        }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search */}
            <button className="text-white/80 hover:text-[#d4af37] transition-colors duration-300 hover:scale-110 transform">
              <Search className="w-5 h-5" />
            </button>

            {/* Account */}
            <button
              onClick={() => user ? signOut() : window.location.href = '#auth'}
              className="text-white/80 hover:text-[#d4af37] transition-colors duration-300 hover:scale-110 transform"
            >
              <User className="w-5 h-5" />
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative text-white/80 hover:text-[#d4af37] transition-colors duration-300 hover:scale-110 transform"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#d4af37] text-black text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white/80 hover:text-[#d4af37] transition-colors duration-300"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 top-[60px] bg-black/98 transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
              className="font-display text-3xl text-white/80 hover:text-[#d4af37] transition-all duration-300"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
