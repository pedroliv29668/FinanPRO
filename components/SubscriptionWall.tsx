import React from 'react';
import { Lock, CreditCard, MessageCircle, ArrowRight, ShieldCheck, CircleCheck, Sparkles, Clock, Crown, Zap } from 'lucide-react';

interface SubscriptionWallProps {
    userEmail: string;
    appColor: string;
    onLogout: () => void;
    trialDaysLeft?: number;
}

const SubscriptionWall: React.FC<SubscriptionWallProps> = ({ userEmail, appColor, onLogout, trialDaysLeft = 0 }) => {
    const checkoutUrl = 'https://lastlink.com/p/C969D3A79/checkout-payment/';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

            <div className="max-w-3xl w-full relative z-10 animate-fadeIn">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 backdrop-blur-sm">
                        <Clock size={14} className="animate-pulse" />
                        {trialDaysLeft > 0
                            ? `Seu teste gratuito expira em ${trialDaysLeft} dias`
                            : 'Seu período de teste expirou'
                        }
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tighter mb-4 leading-tight">
                        {trialDaysLeft > 0
                            ? 'Continue aproveitando o FINANPRO'
                            : <>Desbloqueie o <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">FINANPRO</span></>
                        }
                    </h1>

                    <p className="text-slate-400 font-medium max-w-md mx-auto text-sm leading-relaxed">
                        {trialDaysLeft > 0
                            ? `Conta: ${userEmail}. Assine agora para não perder acesso quando o teste acabar.`
                            : `Conta: ${userEmail}. Escolha seu plano para continuar com acesso total.`
                        }
                    </p>
                </div>

                {/* Plans */}
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 mb-6">
                    {/* Plano Mensal */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-white/20 transition-all group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                                <Zap size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-black uppercase text-sm tracking-tight">Mensal</h3>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Flexibilidade total</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-white">R$ 47</span>
                                <span className="text-slate-500 font-bold text-xs">/mês</span>
                            </div>
                        </div>

                        <ul className="space-y-3 mb-8">
                            {['Acesso completo', 'Suporte via WhatsApp', 'Cancele quando quiser'].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                    <CircleCheck size={14} className="text-indigo-400 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => window.open(checkoutUrl, '_blank')}
                            className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black uppercase text-[10px] tracking-widest border border-white/10 transition-all group-hover:scale-[1.02] active:scale-95"
                        >
                            Assinar Mensal
                        </button>
                    </div>

                    {/* Plano Anual - Destaque */}
                    <div className="relative bg-gradient-to-br from-emerald-500/20 to-teal-500/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/40 hover:border-emerald-400/60 transition-all group">
                        {/* Badge economia */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-[0.15em] rounded-full shadow-lg shadow-emerald-500/30 whitespace-nowrap">
                            🔥 Economia de 74%
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                                <Crown size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-black uppercase text-sm tracking-tight">Anual</h3>
                                <p className="text-[9px] font-bold text-emerald-400/60 uppercase tracking-widest">Melhor custo-benefício</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-white">R$ 149</span>
                                <span className="text-slate-500 font-bold text-xs">/ano</span>
                            </div>
                            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-wider mt-1">= R$ 12,40/mês</p>
                        </div>

                        <ul className="space-y-3 mb-8">
                            {['Tudo do mensal', 'IA Estratégica Ilimitada', 'Economia de R$ 415/ano'].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                    <CircleCheck size={14} className="text-emerald-400 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => window.open(checkoutUrl, '_blank')}
                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20 transition-all group-hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Sparkles size={16} />
                            Assinar Anual
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-6">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        <ShieldCheck size={14} className="text-emerald-500" /> Pagamento seguro
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        <CircleCheck size={14} className="text-emerald-500" /> Cancele quando quiser
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        <CreditCard size={14} className="text-emerald-500" /> Via LastLink
                    </div>
                </div>

                {/* Footer actions */}
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <button
                        onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-all"
                    >
                        <MessageCircle size={14} /> Suporte
                    </button>
                    <button
                        onClick={onLogout}
                        className="flex-1 py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-all"
                    >
                        Sair da Conta
                    </button>
                </div>

                <p className="text-center mt-6 text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em]">
                    FINANPRO — Inteligência Financeira para Negócios de Beleza
                </p>
            </div>
        </div>
    );
};

export default SubscriptionWall;
