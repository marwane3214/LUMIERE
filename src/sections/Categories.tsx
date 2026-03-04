import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import type { Category } from '@/types';

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
  const isArabic = i18n.language === 'ar';

  const getCategoryName = (category: Category) => {
    switch (i18n.language) {
      case 'fr': return category.name_fr;
      case 'ar': return category.name_ar;
      default: return category.name;
    }
  };

  const getCategoryDescription = (category: Category) => {
    switch (i18n.language) {
      case 'fr': return category.description_fr;
      case 'ar': return category.description_ar;
      default: return category.description;
    }
  };

  return (
    <section
      id="categories"
      className="relative w-full bg-black py-24 overflow-hidden"
    >
      <div className="section-padding">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="font-script text-3xl text-[#d4af37] block mb-4">
            {isArabic ? 'مجموعاتنا' : 'Our Collections'}
          </span>
          <h2 className="font-display text-5xl md:text-6xl text-white tracking-wider">
            {t('categories.title')}
          </h2>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto">
          {categories.map((category, index) => (
            <div
              key={category.id}
              onClick={() => onCategoryClick?.(category.slug)}
              className="relative aspect-[16/10] md:aspect-[16/9] rounded-3xl overflow-hidden cursor-pointer group bg-white/5 border border-white/10"
            >
              {/* Background Image with Zoom Effect */}
              <div className="absolute inset-0">
                <img
                  src={category.image}
                  alt={getCategoryName(category)}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent group-hover:via-black/60 transition-all duration-500" />
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                  <span className="font-script text-2xl md:text-3xl text-[#d4af37] block mb-2 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    {getCategoryDescription(category)}
                  </span>
                  <h3 className="font-display text-3xl md:text-4xl text-white mb-6">
                    {getCategoryName(category)}
                  </h3>
                  <div className="overflow-hidden">
                    <button className="flex items-center gap-3 text-white/80 hover:text-[#d4af37] transition-all duration-300 transform translate-y-12 group-hover:translate-y-0">
                      <span className="font-body text-xs tracking-[0.2em] uppercase">
                        {t('categories.explore')}
                      </span>
                      <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${isArabic ? 'rotate-180 group-hover:-translate-x-2' : 'group-hover:translate-x-2'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Numbering Decor */}
              <div className={`absolute top-8 ${isArabic ? 'left-8' : 'right-8'} font-display text-6xl md:text-8xl text-white/5 pointer-events-none`}>
                0{index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-[100px] -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-[100px] -ml-32 -mb-32" />
    </section>
  );
}
