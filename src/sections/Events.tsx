import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Gift } from 'lucide-react';
import { sbGetProducts } from '@/lib/supabaseAdmin';
import type { Product } from '@/types';

gsap.registerPlugin(ScrollTrigger);

const fallbackEvents = [
    {
        id: 'e1',
        title: "Valentine's Day",
        subtitle: 'Show your love',
        image: '/event-valentine.jpg', // Placeholder, user will need to add this
    },
    {
        id: 'e2',
        title: "Women's Day",
        subtitle: 'Celebrate her strength',
        image: '/event-womensday.jpg', // Placeholder, user will need to add this
    }
];

export default function Events({ onEventClick }: { onEventClick: (id: string) => void }) {
    const { t, i18n } = useTranslation();
    const sectionRef = useRef<HTMLElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [eventProducts, setEventProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadEvents() {
            const data = await sbGetProducts();
            if (data && data.length > 0) {
                setEventProducts(data.filter(p => p.category === 'events'));
            }
            setLoading(false);
        }
        loadEvents();
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (containerRef.current) {
                const banners = containerRef.current.querySelectorAll('.event-banner');

                gsap.set(banners, { opacity: 0, y: 50 });

                ScrollTrigger.create({
                    trigger: containerRef.current,
                    start: 'top 80%',
                    onEnter: () => {
                        gsap.to(banners, {
                            opacity: 1,
                            y: 0,
                            duration: 1,
                            stagger: 0.3,
                            ease: 'power3.out'
                        });
                    },
                    once: true
                });
            }
        }, sectionRef);

        return () => ctx.revert();
    }, [loading, eventProducts]);

    const items = eventProducts.length > 0 ? eventProducts.map(p => ({
        id: p.id,
        title: i18n.language === 'fr' ? p.name_fr : (i18n.language === 'ar' ? p.name_ar : p.name),
        subtitle: i18n.language === 'fr' ? p.description_fr : (i18n.language === 'ar' ? p.description_ar : p.description),
        image: p.image,
        price: p.price
    })) : fallbackEvents;

    return (
        <section ref={sectionRef} id="events" className="relative w-full py-24 bg-black overflow-hidden border-t border-white/5">
            <div className="relative w-full section-padding">

                <div className="text-center mb-16">
                    <div className="flex justify-center mb-4">
                        <Gift className="w-8 h-8 text-[#d4af37]" />
                    </div>
                    <span className="font-script text-3xl md:text-4xl text-[#d4af37] block mb-4">
                        {t('events.subtitle', 'Special Occasions')}
                    </span>
                    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white">
                        {t('events.title', 'Event Collections')}
                    </h2>
                </div>

                <div ref={containerRef} className="flex flex-col gap-8 max-w-6xl mx-auto">
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            onClick={() => onEventClick(item.id)}
                            className="event-banner group relative h-[50vh] min-h-[400px] w-full rounded-2xl overflow-hidden cursor-pointer"
                        >
                            <div className="absolute inset-0">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        if (!target.src.includes('data:image')) {
                                            // fallback gradient if image missing
                                            target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxMTEiLz48L3N2Zz4=';
                                        }
                                    }}
                                />
                                <div className={`absolute inset-0 bg-gradient-to-r ${index % 2 === 0 ? 'from-black/90 via-black/50' : 'from-transparent via-black/50 to-black/90'} to-transparent transition-opacity duration-500`}></div>
                            </div>

                            <div className={`relative h-full flex flex-col justify-center p-8 md:p-16 w-full md:w-2/3 ${index % 2 === 0 ? 'mr-auto items-start text-left' : 'ml-auto items-end text-right'}`}>
                                <span className="font-body text-[#d4af37] text-sm tracking-[0.3em] uppercase mb-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                    {t('events.explore', 'Explore Collection')}
                                </span>

                                <h3 className="font-display text-5xl md:text-7xl text-white mb-6 leading-tight">
                                    {item.title}
                                </h3>

                                <p className="font-script text-2xl md:text-3xl text-white/80 mb-8 max-w-md">
                                    {item.subtitle}
                                </p>

                                <button className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#d4af37] transition-colors duration-300">
                                    {t('events.cta', 'Shop Now')}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
