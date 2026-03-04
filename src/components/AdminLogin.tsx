import { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

// ── Admin secret key ─────────────────────
const ADMIN_KEY = '0679953277';

interface AdminLoginProps {
    onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
    const [key, setKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [error, setError] = useState('');
    const [shaking, setShaking] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (key === ADMIN_KEY) {
            sessionStorage.setItem('admin_authenticated', 'true');
            onSuccess();
        } else {
            setError('Clé incorrecte. Accès refusé.');
            setShaking(true);
            setKey('');
            setTimeout(() => { setShaking(false); setError(''); }, 2500);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#050505] flex items-center justify-center z-50 overflow-hidden">
            {/* Radial glow background */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 70%)',
                }}
            />
            {/* Grid texture */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }}
            />

            {/* Card */}
            <div
                className={`relative w-full max-w-md mx-4 transition-all duration-300 ${shaking ? 'animate-[shake_0.4s_ease]' : ''
                    }`}
                style={{
                    background: 'linear-gradient(145deg, #0f0f0f 0%, #141414 100%)',
                    border: '1px solid rgba(212,175,55,0.2)',
                    borderRadius: '16px',
                    boxShadow: '0 0 80px rgba(212,175,55,0.07), 0 32px 64px rgba(0,0,0,0.6)',
                }}
            >
                {/* Top gold accent line */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }}
                />

                <div className="p-10">
                    {/* Logo area */}
                    <div className="flex flex-col items-center mb-10">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                            style={{
                                background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.03) 70%)',
                                border: '1px solid rgba(212,175,55,0.3)',
                            }}
                        >
                            <ShieldCheck className="w-7 h-7 text-[#d4af37]" />
                        </div>
                        <h1
                            className="text-3xl font-bold tracking-[0.2em] uppercase text-white"
                            style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.3em' }}
                        >
                            ADMIN
                        </h1>
                        <div
                            className="w-16 h-px my-3"
                            style={{ background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }}
                        />
                        <p className="text-white/40 text-sm tracking-widest uppercase">Luxury Jewelry</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-white/50 text-xs tracking-[0.2em] uppercase mb-2">
                                Clé d'accès
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]/50" />
                                <input
                                    id="admin-key-input"
                                    type={showKey ? 'text' : 'password'}
                                    value={key}
                                    onChange={(e) => setKey(e.target.value)}
                                    placeholder="••••••••••••••••"
                                    className="w-full pl-11 pr-11 py-3.5 text-sm text-white placeholder-white/20 outline-none transition-all duration-300"
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(212,175,55,0.15)'}`,
                                        borderRadius: '8px',
                                    }}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                >
                                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {error && (
                                <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                                    <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                                    {error}
                                </p>
                            )}
                        </div>

                        <button
                            id="admin-login-btn"
                            type="submit"
                            className="w-full py-4 text-sm font-semibold tracking-[0.2em] uppercase transition-all duration-300 rounded-lg hover:opacity-90 active:scale-[0.98]"
                            style={{
                                background: 'linear-gradient(135deg, #d4af37 0%, #b8942a 100%)',
                                color: '#000',
                                boxShadow: '0 4px 24px rgba(212,175,55,0.25)',
                            }}
                        >
                            Accéder au tableau de bord
                        </button>
                    </form>

                    <p className="text-center text-white/20 text-xs mt-8 tracking-widest">
                        ACCÈS RESTREINT · PERSONNEL AUTORISÉ UNIQUEMENT
                    </p>
                </div>

                {/* Bottom gold accent */}
                <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }}
                />
            </div>

            <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
      `}</style>
        </div>
    );
}
