import React from 'react';
import { 
    Activity, Zap, Calendar, Users, CreditCard, PiggyBank, 
    MessageCircle, Sparkles, ShieldCheck, Target, Palette, BarChart, 
    Star, BookOpen
} from 'lucide-react';

interface HelpViewProps {
    appColor: string;
}

const HelpView: React.FC<HelpViewProps> = ({ appColor }) => {
    const modules = [
        {
            title: "01. Dashboard & Filtros",
            icon: <Activity size={24} />,
            desc: "Aprenda a ler os cards de faturamento, despesas e lucro real. Use o seletor de meses para comparar seu crescimento histórico.",
            tip: "Mantenha o foco no 'Lucro Real' após os descontos."
        },
        {
            title: "02. Modos: Pro vs Pessoal",
            icon: <Zap size={24} />,
            desc: "Alterne entre suas finanças profissionais e pessoais no topo do app. O sistema mantém os dados 100% separados.",
            tip: "Nunca misture as contas! Isso é o segredo do sucesso."
        },
        {
            title: "03. Agenda Inteligente",
            icon: <Calendar size={24} />,
            desc: "Cadastre seus atendimentos. Ao marcar um cliente como 'Atendido', o sistema gera a receita automaticamente no financeiro.",
            tip: "Use o status 'Atendido' para ganhar tempo!"
        },
        {
            title: "04. Gestão de Clientes (CRM)",
            icon: <Users size={24} />,
            desc: "Acompanhe quem são suas melhores clientes, quanto elas gastam e quando foi a última visita.",
            tip: "Dê atenção especial às clientes com ticket alto."
        },
        {
            title: "05. Financeiro Profissional",
            icon: <CreditCard size={24} />,
            desc: "Gerencie gastos fixos (aluguel, luz) e variáveis. Faça retiradas de Pro-labore direto para o seu modo pessoal.",
            tip: "Defina seu Pro-labore para ter um salário fixo."
        },
        {
            title: "06. Financeiro Pessoal",
            icon: <PiggyBank size={24} />,
            desc: "Controle suas contas de casa por categorias (Moradia, Alimentação...) e acompanhe a fatura do cartão de crédito.",
            tip: "Cuidado com os gastos variáveis no pessoal."
        },
        {
            title: "07. Marketing & WhatsApp",
            icon: <MessageCircle size={24} />,
            desc: "Confirmação de horários, aniversariantes e resgate via WhatsApp com um clique.",
            tip: "Use a IA para criar mensagens personalizadas."
        },
        {
            title: "08. Consultoria Estratégica IA",
            icon: <Sparkles size={24} />,
            desc: "Nossa IA analisa seus dados e te dá dicas de marketing, cortes de custos e estratégias de crescimento.",
            tip: "Consulte a IA pelo menos uma vez por semana."
        },
        {
            title: "09. Reserva de Emergência",
            icon: <ShieldCheck size={24} />,
            desc: "O sistema calcula automaticamente quanto você precisa ter guardado para 6 meses de segurança total.",
            tip: "Priorize preencher sua barra de segurança."
        },
        {
            title: "10. Gestão de Sonhos",
            icon: <Target size={24} />,
            desc: "Defina metas de longo prazo (viagens, reformas) e veja o progresso de cada aporte realizado.",
            tip: "Aporte pequenas quantias toda semana."
        },
        {
            title: "11. Personalização da Marca",
            icon: <Palette size={24} />,
            desc: "Mude a cor do aplicativo para combinar com sua marca e altere o nome que aparece no topo.",
            tip: "Deixe o app com a cara do seu salão!"
        },
        {
            title: "12. Relatórios & Analytics",
            icon: <BarChart size={24} />,
            desc: "Veja gráficos detalhados de faturamento semanal, mensal e o ranking dos serviços mais vendidos.",
            tip: "Analise quais serviços dão mais lucro real."
        }
    ];

    return (
        <div className="animate-fadeIn space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-3 font-outfit">
                        <div className="p-2.5 rounded-xl shadow-sm" style={{ backgroundColor: `${appColor}15`, color: appColor }}>
                            <BookOpen size={24} />
                        </div>
                        Central VIP de Treinamento
                    </h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 ml-1">
                        Domine cada ferramenta do seu império
                    </p>
                </div>
            </div>

            {/* Banner de Boas Vindas */}
            <div className="bg-[#1a365d] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
                <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent"></div>
                <div className="relative z-10 space-y-2">
                    <h2 className="text-xl font-black uppercase">Bem-vinda à sua área exclusiva, Rainha! 👑</h2>
                    <p className="text-slate-300 text-sm font-medium max-w-2xl leading-relaxed">
                        Este é o seu guia definitivo. Abaixo você encontra o passo a passo de cada funcionalidade. 
                        Clique em qualquer módulo para entender como extrair o máximo de lucro do FinanPRO.
                    </p>
                </div>
            </div>

            {/* Grid de Módulos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((item, i) => (
                    <div key={i} className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#b76e79]/30 transition-all duration-500 flex flex-col h-full">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-[#b76e79] mb-4 group-hover:bg-[#b76e79] group-hover:text-white transition-all duration-500 shadow-inner">
                            {item.icon}
                        </div>
                        <h3 className="text-sm font-black text-[#1a365d] uppercase tracking-tight mb-2">{item.title}</h3>
                        <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-4 flex-grow">{item.desc}</p>
                        <div className="pt-3 border-t border-slate-50">
                            <p className="text-[9px] font-black text-[#b76e79] uppercase tracking-widest flex items-center gap-2">
                                <Star size={10} /> Dica: {item.tip}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA Suporte */}
            <div className="bg-emerald-50 rounded-[2rem] border border-emerald-100 p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                    <MessageCircle size={24} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight">Ainda com dúvidas?</h4>
                    <p className="text-[11px] text-emerald-700 font-medium">Chame nosso suporte VIP agora no WhatsApp. Estamos prontos para te ajudar!</p>
                </div>
                <button className="ml-auto bg-emerald-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-emerald-600 transition-all">Suporte</button>
            </div>
        </div>
    );
};

export default HelpView;
