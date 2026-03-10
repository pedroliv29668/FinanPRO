
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    TrendingUp, Star, Users, ArrowRight, BarChart, 
    Zap, Gem, Target, Activity, CalendarDays 
} from 'lucide-react';
import { supabase } from '../services/supabase';

interface AuthenticatedSummaryProps {
    userEmail: string;
}

const AuthenticatedSummary: React.FC<AuthenticatedSummaryProps> = ({ userEmail }) => {
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const appColor = '#b76e79';

    useEffect(() => {
        const fetchData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: stateData } = await supabase
                    .from('app_state')
                    .select('payload')
                    .eq('user_id', session.user.id)
                    .maybeSingle();

                if (stateData && stateData.payload) {
                    setData(stateData.payload);
                }
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const stats = useMemo(() => {
        if (!data) return null;

        const receitas = Array.isArray(data.receitas) ? data.receitas : [];
        const despesas = Array.isArray(data.despesasVariaveis) ? data.despesasVariaveis : [];
        const fixos = Array.isArray(data.gastosFixos) ? data.gastosFixos : [];

        const totalFaturado = receitas.reduce((acc: number, curr: any) => acc + (curr.valor || 0), 0);
        const totalVariaveis = despesas.reduce((acc: number, curr: any) => acc + (curr.valor || 0), 0);
        const totalFixos = fixos.reduce((acc: number, curr: any) => acc + (curr.valor || 0), 0);
        const lucroTotal = totalFaturado - (totalVariaveis + totalFixos);

        // Mês Forte
        const mesesMap = new Map<string, number>();
        const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        
        receitas.forEach((r: any) => {
            const mesIdx = r.mes !== undefined ? r.mes : new Date(r.data).getMonth();
            const ano = r.ano !== undefined ? r.ano : new Date(r.data).getFullYear();
            const key = `${mesesNomes[mesIdx]} ${ano}`;
            mesesMap.set(key, (mesesMap.get(key) || 0) + (r.valor || 0));
        });

        let mesForte = "Calculando...";
        let maxFaturamento = -1;
        mesesMap.forEach((val, key) => {
            if (val > maxFaturamento) {
                maxFaturamento = val;
                mesForte = key;
            }
        });

        const numClientes = Array.isArray(data.clientes) ? data.clientes.length : 0;
        const ticketMedio = numClientes > 0 ? totalFaturado / receitas.length : 0;

        return {
            totalFaturado,
            lucroTotal,
            mesForte,
            ticketMedio,
            hasData: receitas.length > 0
        };
    }, [data]);

    const formatMoeda = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (loading) {
        return (
            <div className="w-full py-12 flex flex-col items-center justify-center space-y-4 animate-pulse">
                <div className="w-12 h-12 bg-slate-100 rounded-full"></div>
                <div className="h-4 w-48 bg-slate-100 rounded"></div>
            </div>
        );
    }

    if (!stats || !stats.hasData) {
        return (
            <div className="w-full bg-slate-50 rounded-[2.5rem] p-8 md:p-12 text-center border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <Activity size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-4">Bem-vinda de volta!</h2>
                <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
                    Você ainda não tem registros financeiros para gerar seu resumo. Comece agora a organizar seu império!
                </p>
                <button 
                    onClick={() => navigate('/app')}
                    className="px-10 py-5 bg-[#10b981] text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl hover:scale-105 transition-all"
                >
                    COMEÇAR AGORA
                </button>
            </div>
        );
    }

    return (
        <div className="w-full animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#b76e79]/10 rounded-full text-[#b76e79] text-[10px] font-black uppercase tracking-widest">
                        <Gem size={14} /> Resumo Estratégico do seu Império
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter leading-none">
                        Tudo Pronto para o <span className="text-[#b76e79]">Crescimento</span>, {userEmail.split('@')[0]}
                    </h2>
                    <p className="text-slate-500 text-lg font-medium leading-relaxed">
                        Seus números mostram um negócio em movimento. Veja abaixo os destaques da sua jornada e tome as melhores decisões hoje.
                    </p>
                    <button 
                        onClick={() => navigate('/app')}
                        className="group flex items-center gap-4 px-8 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
                    >
                        ACESSAR MEU PAINEL COMPLETO
                        <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* CARD 1: Faturamento */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 hover:shadow-2xl transition-all group overflow-hidden relative">
                        <div className="absolute -right-4 -bottom-4 p-8 opacity-[0.03] group-hover:scale-110 transition-transform"><BarChart size={120} /></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Faturamento Total</p>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">{formatMoeda(stats.totalFaturado)}</h3>
                        <div className="flex items-center gap-2 text-[#b76e79] font-bold text-[10px] uppercase">
                            <Zap size={12} /> Sua força bruta
                        </div>
                    </div>

                    {/* CARD 2: Mês Forte */}
                    <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white group overflow-hidden relative">
                        <div className="absolute -right-4 -bottom-4 p-8 opacity-[0.1] group-hover:scale-110 transition-transform"><Target size={120} /></div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">Mês de Ouro</p>
                        <h3 className="text-2xl font-black text-white mb-2">{stats.mesForte}</h3>
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase">
                            <Star size={12} /> Época de maior vigor
                        </div>
                    </div>

                    {/* CARD 3: Lucro */}
                    <div className={`p-6 rounded-[2rem] shadow-xl border border-slate-100 group overflow-hidden relative ${stats.lucroTotal >= 0 ? 'bg-white' : 'bg-rose-50 border-rose-100'}`}>
                        <div className="absolute -right-4 -bottom-4 p-8 opacity-[0.03] group-hover:scale-110 transition-transform"><TrendingUp size={120} /></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Lucro Acumulado</p>
                        <h3 className={`text-2xl font-black mb-2 ${stats.lucroTotal >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatMoeda(stats.lucroTotal)}</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase italic">Após subtrair todos os gastos</p>
                    </div>

                    {/* CARD 4: Ticket Médio / Insight */}
                    <div className="bg-[#b76e79]/5 p-6 rounded-[2rem] shadow-xl border border-[#b76e79]/10 group overflow-hidden relative">
                        <div className="absolute -right-4 -bottom-4 p-8 opacity-[0.05] group-hover:scale-110 transition-transform"><Users size={120} /></div>
                        <p className="text-[10px] font-black text-[#b76e79] uppercase tracking-[0.2em] mb-4">Ticket Médio p/ Registro</p>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">{formatMoeda(stats.ticketMedio)}</h3>
                        <div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase">
                            <CalendarDays size={12} /> Valor por serviço
                        </div>
                    </div>
                </div>
            </div>
            
            {/* INSIGHT BANNER */}
            <div className="mt-8 bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 flex flex-col md:flex-row items-center gap-6 group hover:shadow-lg transition-all">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-500 shrink-0 transform group-hover:rotate-12 transition-transform">
                    <Zap size={24} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-indigo-900 uppercase tracking-tight mb-1">Dica da Antigravity para {stats.mesForte}</h4>
                    <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                        Com base no seu faturamento em {stats.mesForte}, sugerimos focar em serviços de alto valor nesta mesma época para maximizar seu ROI. Seu ticket médio de {formatMoeda(stats.ticketMedio)} é uma ótima base para campanhas de fidelidade.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthenticatedSummary;
