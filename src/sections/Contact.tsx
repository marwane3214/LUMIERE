import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Contact() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const { error: sbError } = await supabase
                .from('contact_messages')
                .insert([
                    {
                        name: form.name,
                        email: form.email,
                        subject: form.subject,
                        message: form.message,
                        status: 'unread',
                    },
                ]);

            if (sbError) throw sbError;

            setSuccess(true);
            setForm({ name: '', email: '', subject: '', message: '' });
        } catch (err: any) {
            console.error('Contact error:', err);
            setError(t('contact.form.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="contact" className="relative w-full py-32 bg-black overflow-hidden">
            {/* Background Ornaments */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-[100px] -ml-48 -mb-48" />

            <div className="section-padding relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20 px-4">
                    <span className="font-script text-3xl text-[#d4af37] block mb-4">
                        {t('contact.subtitle')}
                    </span>
                    <h2 className="font-display text-5xl md:text-6xl text-white mb-6 tracking-wider">
                        {t('contact.title')}
                    </h2>
                    <p className="font-body text-white/60 leading-relaxed text-lg">
                        {t('contact.description')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto items-start">
                    {/* Info Cards */}
                    <div className="space-y-8 px-4">
                        {[
                            { icon: Mail, label: 'Email', value: 'contact@lumiere.com', href: 'mailto:contact@lumiere.com' },
                            { icon: Phone, label: 'Phone', value: '+212 5XX-XXXXXX', href: 'tel:+2125XXXXXXXX' },
                            { icon: MapPin, label: 'Location', value: 'Casablanca, Morocco', href: '#' },
                        ].map((item, i) => (
                            <a
                                key={i}
                                href={item.href}
                                className="group flex items-center gap-6 p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#d4af37]/40 transition-all duration-500"
                            >
                                <div className="w-14 h-14 rounded-full bg-[#d4af37]/10 flex items-center justify-center group-hover:bg-[#d4af37] transition-all duration-500">
                                    <item.icon className="w-6 h-6 text-[#d4af37] group-hover:text-black" />
                                </div>
                                <div>
                                    <p className="text-white/40 text-xs tracking-widest uppercase mb-1">
                                        {item.label}
                                    </p>
                                    <p className="text-white text-lg font-medium group-hover:text-[#d4af37]">
                                        {item.value}
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* Form */}
                    <div className="relative px-4">
                        <div className="p-10 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
                            {success ? (
                                <div className="text-center py-20 animate-fade-in">
                                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Send className="w-10 h-10 text-green-500" />
                                    </div>
                                    <h3 className="text-2xl text-white font-display mb-4">
                                        {t('contact.form.success')}
                                    </h3>
                                    <button
                                        onClick={() => setSuccess(false)}
                                        className="text-[#d4af37] hover:underline transition-all"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {error && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs text-white/40 uppercase tracking-widest ml-1">
                                                {t('contact.form.name')}
                                            </label>
                                            <input
                                                required
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:border-[#d4af37]/50 outline-none transition-all"
                                                value={form.name}
                                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-white/40 uppercase tracking-widest ml-1">
                                                {t('contact.form.email')}
                                            </label>
                                            <input
                                                required
                                                type="email"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:border-[#d4af37]/50 outline-none transition-all"
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-white/40 uppercase tracking-widest ml-1">
                                            {t('contact.form.subject')}
                                        </label>
                                        <input
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:border-[#d4af37]/50 outline-none transition-all"
                                            value={form.subject}
                                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-white/40 uppercase tracking-widest ml-1">
                                            {t('contact.form.message')}
                                        </label>
                                        <textarea
                                            required
                                            rows={5}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:border-[#d4af37]/50 outline-none transition-all resize-none"
                                            value={form.message}
                                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        />
                                    </div>

                                    <button
                                        disabled={loading}
                                        className="w-full py-5 rounded-xl bg-[#d4af37] text-black font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                {t('contact.form.send')}
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
