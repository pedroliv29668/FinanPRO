import React, { useState } from 'react';
import { 
    Activity, Zap, Calendar, Users, CreditCard, PiggyBank, 
    MessageCircle, Sparkles, ShieldCheck, Target, Palette, BarChart, 
    Star, BookOpen, X, ChevronRight, CheckCircle2, Info
} from 'lucide-react';

interface HelpViewProps {
    appColor: string;
}

interface ModuleDetail {
    intro: string;
    steps: string[];
    extra: string;
}

interface Module {
    id: string;
    title: string;
    icon: React.ReactNode;
    desc: string;
    tip: string;
    image: string;
    details: ModuleDetail;
}

const HelpView: React.FC<HelpViewProps> = ({ appColor }) => {
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);

    const modules: Module[] = [
        {
            id: 'dashboard',
            title: "01. Dashboard & Filtros",
            icon: <Activity size={24} />,
            desc: "Aprenda a ler os cards de faturamento, despesas e lucro real. Use o seletor de meses para comparar seu crescimento histórico.",
            tip: "Mantenha o foco no 'Lucro Real' após os descontos.",
            image: "/assets/training/dashboard.png",
            details: {
                intro: "O Dashboard é o coração do FinanPRO. Aqui você tem uma visão panorâmica da saúde do seu negócio em segundos. É a primeira tela que você vê ao entrar e onde as decisões importantes são tomadas.",
                steps: [
                    "Cards de Resumo: No topo, você vê o Faturamento Bruto (total de vendas), Total de Despesas e o Lucro Real (o que sobra no seu bolso após pagar tudo).",
                    "Seletor de Meses: Use as setas no cabeçalho para viajar no tempo. O app recalcula tudo automaticamente para o mês selecionado.",
                    "Análise de Margem: O círculo de porcentagem mostra quão 'saudável' está seu lucro. Quanto maior a porcentagem, mais eficiente você está sendo.",
                    "Consultoria IA: No final do Dashboard, você encontra o botão da IA que analisa todos esses números para você."
                ],
                extra: "Lembre-se: O Dashboard é alimentado pelos seus lançamentos na Agenda e no Financeiro. Se não lançar, ele não mostra a realidade!"
            }
        },
        {
            id: 'modes',
            title: "02. Modos: Pro vs Pessoal",
            icon: <Zap size={24} />,
            desc: "Alterne entre suas finanças profissionais e pessoais no topo do app. O sistema mantém os dados 100% separados.",
            tip: "Nunca misture as contas! Isso é o segredo do sucesso.",
            image: "/assets/training/dashboard.png", // Use dashboard image as reference for mode toggle
            details: {
                intro: "O FinanPRO é '2 apps em 1'. No menu lateral, você escolhe se quer ver o seu Salão (Modo Profissional) ou a sua Vida (Modo Pessoal).",
                steps: [
                    "Modo Profissional (Azul/Índigo): Aqui você cadastra clientes, agenda horários e lança as contas do salão (aluguel, produtos, etc).",
                    "Modo Pessoal (Rosa/Branding): Aqui você controla seus gastos de casa, fatura do cartão pessoal e seus sonhos individuais.",
                    "Separação Total: Os dados nunca se misturam. O que você gasta no salão não polui o seu gráfico de gastos pessoais.",
                    "Transferência: Quando você tira seu 'salário' do salão, você lança uma saída no Pro e uma entrada no Pessoal."
                ],
                extra: "Mantenha o foco: Use o Modo Pro durante o expediente e o Modo Pessoal para organizar suas metas de vida à noite."
            }
        },
        {
            id: 'agenda',
            title: "03. Agenda Inteligente",
            icon: <Calendar size={24} />,
            desc: "Cadastre seus atendimentos. Ao marcar um cliente como 'Atendido', o sistema gera a receita automaticamente no financeiro.",
            tip: "Use o status 'Atendido' para ganhar tempo!",
            image: "/assets/training/agenda.png",
            details: {
                intro: "A nossa Agenda não é apenas um papel digital. Ela é integrada ao seu financeiro. Quando você trabalha, o app já faz a contabilidade para você.",
                steps: [
                    "Novo Agendamento: Clique no botão '+' e escolha a cliente, o serviço e a cor do bloco para organizar seu dia visualmente.",
                    "Status do Atendimento: Ao terminar um serviço, clique no bloco e mude para 'Atendido'. Isso lança o valor automaticamente no seu faturamento do dia.",
                    "Gestão de Pagamentos: No detalhe do agendamento, você pode marcar se o cliente já pagou ou se está pendente.",
                    "Navegação: Alterne entre visão de 'Semana' para ver seus horários e 'Mês' para planejar sua disponibilidade futura."
                ],
                extra: "Ganhe velocidade: Cadastre seus serviços e preços uma única vez para preencher a agenda em segundos."
            }
        },
        {
            id: 'crm',
            title: "04. Gestão de Clientes (CRM)",
            icon: <Users size={24} />,
            desc: "Acompanhe quem são suas melhores clientes, quanto elas gastam e quando foi a última visita.",
            tip: "Dê atenção especial às clientes com ticket alto.",
            image: "/assets/training/financeiro.png", // Placeholder image
            details: {
                intro: "Suas clientes são seu maior ativo. O módulo de Clientes mostra quem são elas, o que elas gostam e quanto elas trazem de retorno.",
                steps: [
                    "Ficha de Cadastro: Guarde telefone, nome e observações importantes sobre cada cliente.",
                    "Ranking de Faturamento: Veja automaticamente quem são as 10 clientes que mais investem no seu trabalho.",
                    "Frequência: O app te avisa quem não aparece há algum tempo para que você possa fazer um resgate.",
                    "Histórico: Saiba exatamente o que cada cliente fez em cada visita anterior."
                ],
                extra: "Estratégia: Use o botão de WhatsApp direto na lista de clientes para enviar lembretes de retorno."
            }
        },
        {
            id: 'finance_pro',
            title: "05. Financeiro Profissional",
            icon: <CreditCard size={24} />,
            desc: "Gerencie gastos fixos (aluguel, luz) e variáveis. Faça retiradas de Pro-labore direto para o seu modo pessoal.",
            tip: "Defina seu Pro-labore para ter um salário fixo.",
            image: "/assets/training/financeiro.png",
            details: {
                intro: "Aqui é onde você controla para onde o dinheiro do salão está indo. Uma gestão financeira impecável é o que separa amadoras de empresárias.",
                steps: [
                    "Lançamento de Despesas: Cadastre tudo: aluguel, energia, internet, estoque de produtos e comissões.",
                    "Categorização: Separe o que é 'Gasto Fixo' (que vem todo mês) do que é 'Gasto Variável' (que depende das vendas).",
                    "Fluxo de Caixa: Veja a lista de todas as entradas da agenda e saídas manuais em ordem cronológica.",
                    "Retirada de Pró-Labore: Aprenda a se pagar primeiro. Defina um valor fixo mensal para transferir para sua conta pessoal."
                ],
                extra: "Conselho: Tente manter seus gastos fixos abaixo de 30% do seu faturamento bruto."
            }
        },
        {
            id: 'finance_personal',
            title: "06. Financeiro Pessoal",
            icon: <PiggyBank size={24} />,
            desc: "Controle suas contas de casa por categorias (Moradia, Alimentação...) e acompanhe a fatura do cartão de crédito.",
            tip: "Cuidado com os gastos variáveis no pessoal.",
            image: "/assets/training/financeiro.png",
            details: {
                intro: "Sua vida pessoal precisa estar organizada para você ter paz no trabalho. Este módulo é idêntico ao profissional, mas focado na sua casa.",
                steps: [
                    "Orçamentos por Categoria: Defina quanto você quer gastar no máximo com 'Lazer' ou 'Alimentação'.",
                    "Acompanhamento de Fatura: Lance suas compras no cartão de crédito para não ser pega de surpresa no vencimento.",
                    "Dinheiro Livre: O app calcula quanto sobra após pagar as contas fixas da casa.",
                    "Saldo Real: Saiba exatamente quanto você tem disponível para investir nos seus sonhos."
                ],
                extra: "Foco: O objetivo aqui é fazer o seu 'Dinheiro Livre' crescer todos os meses."
            }
        },
        {
            id: 'marketing',
            title: "07. Marketing & WhatsApp",
            icon: <MessageCircle size={24} />,
            desc: "Confirmação de horários, aniversariantes e resgate via WhatsApp com um clique.",
            tip: "Use a IA para criar mensagens personalizadas.",
            image: "/assets/training/dashboard.png", // Use dashboard for context
            details: {
                intro: "Vender é a alma do negócio. Este módulo automatiza sua comunicação para que você nunca perca uma venda por esquecimento.",
                steps: [
                    "Confirmação de Agenda: Envie uma mensagem profissional para suas clientes do dia seguinte com um clique.",
                    "Aniversariantes: O app lista quem faz aniversário hoje e sugere uma mensagem de parabéns com cupom.",
                    "Resgate de Clientes: Identifique clientes sumidas há mais de 30 dias e envie um convite especial.",
                    "Mensagens Personalizadas: Use os modelos prontos ou crie o seu próprio estilo de fala."
                ],
                extra: "Automação: Ao clicar em 'Enviar WhatsApp', o app já abre a conversa com o número e o texto prontinhos."
            }
        },
        {
            id: 'ai',
            title: "08. Consultoria Estratégica IA",
            icon: <Sparkles size={24} />,
            desc: "Nossa IA analisa seus dados e te dá dicas de marketing, cortes de custos e estratégias de crescimento.",
            tip: "Consulte a IA pelo menos uma vez por semana.",
            image: "/assets/training/dashboard.png",
            details: {
                intro: "Imagine ter um consultor financeiro 24h por dia. A nossa Inteligência Artificial lê seus números e traduz em estratégias reais.",
                steps: [
                    "Análise de Dados: A IA olha seu faturamento, suas despesas e seus serviços mais vendidos.",
                    "Sugestões de Corte: Ela identifica se você está gastando demais em alguma categoria específica.",
                    "Dicas de Faturamento: Sugere formas de aumentar o ticket médio com base no seu histórico.",
                    "Relatórios em Texto: Você recebe uma análise humana e fácil de entender, sem termos técnicos complicados."
                ],
                extra: "Privacidade: Seus dados são processados de forma segura e servem apenas para gerar os seus próprios conselhos."
            }
        },
        {
            id: 'reserve',
            title: "09. Reserva de Emergência",
            icon: <ShieldCheck size={24} />,
            desc: "O sistema calcula automaticamente quanto você precisa ter guardado para 6 meses de segurança total.",
            tip: "Priorize preencher sua barra de segurança.",
            image: "/assets/training/financeiro.png",
            details: {
                intro: "Paz não tem preço. A Reserva de Emergência é o valor que te garante dormir tranquila sabendo que, se nada entrar, você está segura.",
                steps: [
                    "Cálculo Automático: O app soma seus gastos fixos e multiplica por 6 meses.",
                    "Barra de Progresso: Veja visualmente quão perto você está da sua liberdade financeira total.",
                    "Lançamento de Aportes: Cada vez que você guarda um dinheiro para reserva, lance no sistema.",
                    "Alvo de Segurança: O sistema te diz exatamente o valor final que você precisa atingir."
                ],
                extra: "Prioridade: Não comece a investir em 'Sonhos' caros antes de ter pelo menos 3 meses de reserva concluídos."
            }
        },
        {
            id: 'dreams',
            title: "10. Gestão de Sonhos",
            icon: <Target size={24} />,
            desc: "Defina metas de longo prazo (viagens, reformas) e veja o progresso de cada aporte realizado.",
            tip: "Aporte pequenas quantias toda semana.",
            image: "/assets/training/dashboard.png",
            details: {
                intro: "Trabalhar com propósito é muito melhor. Aqui você transforma seu lucro em conquistas reais e visíveis.",
                steps: [
                    "Criação de Objetivos: Dê um nome ao seu sonho (ex: Viagem para Paris, Reforma do Salão, Novo Carro).",
                    "Definição de Valor: Estipule quanto custa esse sonho e para quando você o deseja.",
                    "Acompanhamento: Veja a porcentagem de conclusão de cada meta.",
                    "Motivação: Ao ver o progresso subir, você terá mais ânimo para manter a disciplina financeira."
                ],
                extra: "Dica: Tenha no máximo 3 sonhos ativos ao mesmo tempo para não perder o foco."
            }
        },
        {
            id: 'brand',
            title: "11. Personalização da Marca",
            icon: <Palette size={24} />,
            desc: "Mude a cor do aplicativo para combinar com sua marca e altere o nome que aparece no topo.",
            tip: "Deixe o app com a cara do seu salão!",
            image: "/assets/training/dashboard.png",
            details: {
                intro: "O FinanPRO é seu. Ele deve ter a identidade visual do seu negócio para que você se sinta em casa.",
                steps: [
                    "Seletor de Cores: No menu lateral em 'Estilo', escolha a cor que mais combina com seu logotipo.",
                    "Alteração de Nome: Mude o nome do app no topo (ex: 'Studio da Bia', 'Salão Império').",
                    "Visual Premium: A cor escolhida altera botões, ícones e detalhes de todo o sistema.",
                    "Modo Noturno: O design foi pensado para ser elegante e não cansar a vista durante o uso."
                ],
                extra: "Branding: Use cores que transmitam a sensação que você quer que suas clientes tenham ao entrar no salão."
            }
        },
        {
            id: 'analytics',
            title: "12. Relatórios & Analytics",
            icon: <BarChart size={24} />,
            desc: "Veja gráficos detalhados de faturamento semanal, mensal e o ranking dos serviços mais vendidos.",
            tip: "Analise quais serviços dão mais lucro real.",
            image: "/assets/training/financeiro.png",
            details: {
                intro: "O que não é medido não é gerenciado. O Analytics transforma seus dados em inteligência visual.",
                steps: [
                    "Comparativo Mensal: Veja se este mês você está faturando mais ou menos que o mês passado.",
                    "Top Serviços: Descubra quais procedimentos são os favoritos das suas clientes.",
                    "Fluxo de Caixa Mensal: Entenda em que semana do mês o dinheiro entra mais e quando ele sai mais.",
                    "Lucratividade: Veja o lucro líquido real após todos os impostos e descontos."
                ],
                extra: "Frequência: Tire 10 minutos no primeiro dia de cada mês para analisar o Analytics do mês que fechou."
            }
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
                    <div 
                        key={i} 
                        onClick={() => setSelectedModule(item)}
                        className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#b76e79]/30 transition-all duration-500 flex flex-col h-full cursor-pointer"
                    >
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-[#b76e79] mb-4 group-hover:bg-[#b76e79] group-hover:text-white transition-all duration-500 shadow-inner">
                            {item.icon}
                        </div>
                        <h3 className="text-sm font-black text-[#1a365d] uppercase tracking-tight mb-2">{item.title}</h3>
                        <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-4 flex-grow">{item.desc}</p>
                        <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                            <p className="text-[9px] font-black text-[#b76e79] uppercase tracking-widest flex items-center gap-2">
                                <Star size={10} /> Dica: {item.tip}
                            </p>
                            <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA Suporte */}
            <div className="bg-emerald-50 rounded-[2rem] border border-emerald-100 p-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                    <MessageCircle size={24} />
                </div>
                <div className="text-center sm:text-left">
                    <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight">Ainda com dúvidas?</h4>
                    <p className="text-[11px] text-emerald-700 font-medium">Chame nosso suporte VIP agora no WhatsApp. Estamos prontos para te ajudar!</p>
                </div>
                <button className="sm:ml-auto w-full sm:w-auto bg-emerald-500 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-emerald-600 transition-all active:scale-95">Chamar Suporte</button>
            </div>

            {/* Modal de Detalhes do Módulo */}
            {selectedModule && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn" onClick={() => setSelectedModule(null)}>
                    <div 
                        className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-scaleUp flex flex-col max-h-[90vh]" 
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header do Modal */}
                        <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#b76e79]">
                                    {selectedModule.icon}
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-[#1a365d] uppercase tracking-tight">{selectedModule.title}</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guia de Implementação VIP</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedModule(null)}
                                className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Conteúdo Scrollable */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                {/* Lado Esquerdo: Imagem/Preview */}
                                <div className="p-6 sm:p-8 bg-slate-50 flex flex-col justify-center items-center">
                                    <div className="relative group w-full">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-[#b76e79] to-[#1a365d] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                                        <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-100">
                                            <img 
                                                src={selectedModule.image} 
                                                alt={selectedModule.title} 
                                                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                <span className="text-white text-[10px] font-black uppercase tracking-widest bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-lg">Visualização Real do App</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-6 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed px-4">
                                        * Esta imagem é uma representação real da seção no seu aplicativo. Siga as instruções ao lado.
                                    </p>
                                </div>

                                {/* Lado Direito: Texto Detalhado */}
                                <div className="p-6 sm:p-10 space-y-8 bg-white">
                                    <div>
                                        <h3 className="text-sm font-black text-[#1a365d] uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Info size={16} className="text-[#b76e79]" /> O que é esta funcionalidade?
                                        </h3>
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                            {selectedModule.details.intro}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-[#1a365d] uppercase tracking-widest mb-4">Passo a Passo Detalhado:</h3>
                                        {selectedModule.details.steps.map((step, idx) => (
                                            <div key={idx} className="flex gap-4 group">
                                                <div className="w-6 h-6 rounded-full bg-[#b76e79]/10 text-[#b76e79] flex items-center justify-center text-[10px] font-black shrink-0 group-hover:bg-[#b76e79] group-hover:text-white transition-all">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-slate-600 text-xs font-bold leading-relaxed">{step}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 relative overflow-hidden">
                                        <div className="absolute right-0 top-0 p-4 opacity-[0.05]"><Star size={64} className="text-indigo-600" /></div>
                                        <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                            <Sparkles size={14} className="text-[#b76e79]" /> Segredo de Rainha
                                        </h4>
                                        <p className="text-indigo-700 text-xs font-bold leading-relaxed relative z-10 italic">
                                            "{selectedModule.details.extra}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer do Modal */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-center">
                            <button 
                                onClick={() => setSelectedModule(null)}
                                className="w-full sm:w-auto px-12 py-5 bg-[#1a365d] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-slate-900 transition-all active:scale-95"
                            >
                                Entendi, vamos aplicar! 💅
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HelpView;
