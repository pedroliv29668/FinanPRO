import React from 'react';
import { Lock, CreditCard, MessageCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface SubscriptionWallProps {
    userEmail: string;
    appColor: string;
    onLogout: () => void;
}

const SubscriptionWall: React.FC<SubscriptionWallProps> = ({ userEmail, appColor, onLogout }) => {
    const checkoutUrl = 'https://lastlink.com/p/C969D3A79/checkout-payment/';

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
            <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn relative">
                {/* Banner de Status */}
                <div className="bg-amber-50 border-b border-amber-100 p-4 flex items-center justify-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Aguardando Confirmação de Assinante</span>
                </div>

                <div className="p-8 sm:p-12 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <Lock size={40} className="text-slate-400" />
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-[#1a365d] uppercase tracking-tighter mb-4">
                        Quase lá! Falta pouco para liberar seu acesso.
                    </h1>

                    <p className="text-slate-500 font-medium leading-relaxed mb-8 max-w-md mx-auto">
                        Identificamos que sua conta <span className="text-[#1a365d] font-bold">{userEmail}</span> ainda não possui uma assinatura ativa ou o pagamento ainda está sendo processado.
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4 mb-10">
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-3">
                            <div className="flex items-center gap-2 text-[#059669] font-black text-[10px] uppercase tracking-widest">
                                <CheckCircle2 size={16} /> Já assinou?
                            </div>
                            <p className="text-xs text-slate-500 font-bold leading-tight">
                                Se você acabou de pagar, aguarde até 5 minutos para a liberação automática.
                            </p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-3">
                            <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                                <ShieldCheck size={16} /> Pagamento Seguro
                            </div>
                            <p className="text-xs text-slate-500 font-bold leading-tight">
                                Sua transação é processada via LastLink com segurança bancária.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => window.open(checkoutUrl, '_blank')}
                            className="w-full py-5 bg-[#10b981] text-white rounded-2xl font-black uppercase text-sm tracking-[0.1em] shadow-[0_20px_40px_rgba(16,185,129,0.2)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                        >
                            <CreditCard size={20} />
                            Finalizar minha Assinatura
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-50">
                            <button
                                onClick={() => window.open('https://wa.me/5511999999999', '_blank')} // Ajustar para o seu número
                                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-white border-2 border-slate-100 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:border-[#25D366] hover:text-[#25D366] transition-all"
                            >
                                <MessageCircle size={16} /> Suporte WhatsApp
                            </button>
                            <button
                                onClick={onLogout}
                                className="flex-1 py-4 px-6 bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                            >
                                Sair da Conta
                            </button>
                        </div>
                    </div>

                    <p className="mt-8 text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                        FinanPRO - Inteligência Financeira para Negócios de Beleza
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionWall;
