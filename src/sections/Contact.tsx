import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Loader2 } from 'lucide-react';
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

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

                {/* Centered Form Column */}
                <div className="max-w-2xl mx-auto px-4">
                    {/* Form */}
                    <div className="relative">
                        <div className="p-10 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
                            <h3 className="font-display text-3xl text-white mb-8 text-center">
                                {t('')}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="sr-only">
                                        {t('contact.form.name')}
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder={t('contact.form.name')}
                                        required
                                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="sr-only">
                                        {t('contact.form.email')}
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder={t('contact.form.email')}
                                        required
                                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="sr-only">
                                        {t('contact.form.subject')}
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={form.subject}
                                        onChange={handleChange}
                                        placeholder={t('contact.form.subject')}
                                        required
                                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="sr-only">
                                        {t('contact.form.message')}
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        placeholder={t('contact.form.message')}
                                        rows={6}
                                        required
                                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#d4af37] text-black font-semibold text-lg hover:bg-[#c0a030] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            {t('contact.form.sending')}
                                        </>
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            {t('contact.form.send')}
                                        </>
                                    )}
                                </button>
                                {success && (
                                    <p className="text-green-500 text-center mt-4">
                                        {t('contact.form.success')}
                                    </p>
                                )}
                                {error && (
                                    <p className="text-red-500 text-center mt-4">{error}</p>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
