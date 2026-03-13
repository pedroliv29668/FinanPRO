import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity, Sparkles, ShieldCheck, CircleCheck,
    TrendingUp, BarChart, Clock, CreditCard, Users,
    Star, PiggyBank, FileText, Zap, X, Check,
    CircleHelp, MessageCircle, Target
} from 'lucide-react';
import AuthenticatedSummary from '../components/AuthenticatedSummary';

interface LandingPageProps {
    isAuthenticated: boolean;
    userEmail: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ isAuthenticated, userEmail }) => {
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const firstFirstName = userEmail ? userEmail.split('@')[0].split('.')[0].split('_')[0] : 'Usuária';
    const appColor = '#b76e79';

    return (
        <div className="min-h-screen bg-white text-[#1a365d] font-inter overflow-x-hidden selection:bg-emerald-100 pb-20 md:pb-0">
            {/* HEADER SECTION 1 */}
            <header className="fixed top-0 left-0 right-0 z-[200] bg-white/95 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 md:py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Activity className="text-[#1a365d]" size={24} />
                        <span className="text-lg md:text-xl font-black tracking-tighter uppercase">FINANPRO</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#solucao" className="text-xs font-bold uppercase tracking-widest hover:text-[#059669] transition-colors">Solução</a>
                        <a href="#planos" className="text-xs font-bold uppercase tracking-widest hover:text-[#059669] transition-colors">Preços</a>
                        <a href="#faq" className="text-xs font-bold uppercase tracking-widest hover:text-[#059669] transition-colors">FAQ</a>
                    </nav>
                    <button
                        onClick={() => navigate(isAuthenticated ? '/app' : '/login')}
                        className="px-5 py-2 border-2 border-[#1a365d] rounded-full text-xs font-black uppercase tracking-widest text-[#1a365d] hover:bg-[#1a365d] hover:text-white transition-all shadow-sm"
                    >
                        {isAuthenticated ? `Olá, ${firstFirstName} 👋` : 'Entrar'}
                    </button>
                </div>
            </header>

            {/* SECTION 1: HERO - OPTIMIZED FOR ABOVE THE FOLD */}
            <section id="hero" className="pt-20 md:pt-24 pb-8 md:pb-12 px-4 sm:px-6 relative overflow-hidden min-h-[80vh] flex items-center">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#1a365d]/5 -skew-x-12 -z-10 transform origin-top-right"></div>
                <div className="max-w-7xl mx-auto items-center w-full">
                    {isAuthenticated ? (
                        <AuthenticatedSummary userEmail={userEmail} />
                    ) : (
                        <div className="grid lg:grid-cols-2 gap-6 md:gap-12 items-center">
                            <div className="space-y-3 md:space-y-5 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full text-[#059669] text-xs md:text-sm font-black uppercase tracking-[0.2em] mb-1 animate-fadeIn">
                                    <Sparkles size={12} /> Gestão para Negócios de Beleza
                                </div>
                                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tighter animate-fadeIn">
                                    Descubra Quanto Você Realmente Lucra <span className="text-[#b76e79] block sm:inline">no Seu Salão</span>
                                </h1>
                                <p className="max-w-xl mx-auto lg:mx-0 text-slate-500 text-sm md:text-lg font-medium leading-relaxed animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                                    Mais de 500 empreendedoras de beleza já organizaram suas finanças e aumentaram seus lucros em até 40% com o FINANPRO. Próxima pode ser você.
                                </p>
                                <div className="space-y-4 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                                    <button
                                        onClick={() => navigate('/login?mode=signup')}
                                        className="w-full sm:w-auto px-10 py-5 bg-[#10b981] text-white rounded-xl md:rounded-2xl font-black uppercase text-xs md:text-sm tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                                    >
                                        TESTE GRÁTIS POR 30 DIAS
                                    </button>
                                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            <ShieldCheck size={16} className="text-emerald-500" /> Sem cartão
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            <CircleCheck size={16} className="text-emerald-500" /> 30 dias grátis
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative group animate-fadeIn mt-8 lg:mt-0" style={{ animationDelay: '0.3s' }}>
                                <div className="bg-white p-3 rounded-[1.5rem] shadow-2xl border border-slate-100 transform rotate-2 group-hover:rotate-0 transition-all duration-700">
                                    <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800" alt="App Dashboard" className="rounded-xl w-full h-auto object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all" />
                                </div>
                                <div className="absolute -bottom-6 -left-12 glass p-4 rounded-2xl shadow-xl border border-white/50 flex items-center space-x-3 backdrop-blur-md bg-white/70 z-10">
                                    <div className="w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center text-white">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Seu Lucro esse Mês </p>
                                        <p className="text-lg font-extrabold text-[#1a365d]">2.500,00</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* SECTION 2: PROBLEMAS */}
            <section id="problemas" className="py-20 bg-slate-50 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-black text-center uppercase tracking-tighter mb-12">Você se Identifica com Alguma Dessas Situações?</h2>
                    <div className="grid gap-3">
                        {[
                            "Seu salão está sempre cheio, mas no fim do mês o lucro desaparece",
                            "Você mistura dinheiro pessoal com dinheiro do negócio",
                            "Perde horas toda semana tentando organizar planilhas",
                            "Não sabe qual serviço te dá mais lucro de verdade",
                            "Tem medo de crescer porque não tem controle financeiro"
                        ].map((p, i) => (
                            <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-100 shadow-sm group hover:border-[#b76e79] transition-all">
                                <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                                    <X size={14} />
                                </div>
                                <p className="text-xs sm:text-sm font-bold text-slate-700">{p}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION: AGENDA INTELIGENTE (NOVO) */}
            <section className="py-20 px-4 sm:px-6 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <div className="order-2 lg:order-1 relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl transform -translate-x-1/2"></div>
                        <div className="relative bg-white border border-slate-100 rounded-3xl shadow-2xl p-6 sm:p-8 transform rotate-1 hover:rotate-0 transition-all duration-500">
                            <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">14</div>
                                    <div>
                                        <p className="text-xs font-black uppercase text-slate-400">Segunda-feira</p>
                                        <p className="font-bold text-slate-800">Agenda do Dia</p>
                                    </div>
                                </div>
                                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">3 Atendidos</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border-l-4 border-emerald-500">
                                    <div className="flex-1">
                                        <p className="font-black text-slate-700 text-xs uppercase">Ana Júlia</p>
                                        <p className="text-[10px] text-slate-400 font-bold">Corte + Hidratação</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-emerald-600 text-xs">R$ 180,00</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase">Pago via Pix</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 bg-white border border-slate-100 rounded-xl border-l-4 border-amber-500 shadow-sm opacity-60">
                                    <div className="flex-1">
                                        <p className="font-black text-slate-700 text-xs uppercase">Carla Dias</p>
                                        <p className="text-[10px] text-slate-400 font-bold">Progressiva</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-400 text-xs">R$ 250,00</p>
                                        <p className="text-[9px] text-slate-300 font-bold uppercase">Agendado</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-50 text-center">
                                <p className="text-[10px] uppercase font-black tracking-widest text-indigo-500 animate-pulse">✨ Lançamento Automático no Financeiro</p>
                            </div>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full text-indigo-600 text-xs font-black uppercase tracking-widest mb-4">
                            <Clock size={14} /> Adeus, Caderninho
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1a365d] uppercase tracking-tighter mb-6">
                            Você Agenda, o <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Dinheiro Entra</span>
                        </h2>
                        <p className="text-slate-500 text-lg font-medium leading-relaxed mb-8">
                            Chega de esquecer de anotar ou perder horas somando o dia. No FINANPRO, cada agendamento já alimenta seu caixa automaticamente.
                        </p>
                        <ul className="space-y-4 mb-8 inline-block text-left">
                            {['Lembretes Automáticos', 'Histórico da Cliente', 'Cálculo de Comissão'].map(item => (
                                <li key={item} className="flex items-center gap-3 font-bold text-slate-700">
                                    <div className="p-1 rounded-full bg-indigo-100 text-indigo-600"><Check size={12} /></div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* SECTION 3: SOLUÇÃO */}
            <section id="solucao" className="py-20 px-4 sm:px-6 bg-white">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter mb-3 text-[#1a365d]">Apresentamos o FINANPRO</h2>
                    <p className="text-base text-slate-400 font-medium mb-16 max-w-2xl mx-auto italic">"A amiga que entende de números para você não precisar se preocupar."</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: <BarChart size={32} className="text-[#1a365d]" />, title: 'Lucro real em tempo real', desc: 'Saiba exatamente quanto está sobrando sem matemática complicada.' },
                            { icon: <Clock size={32} className="text-[#059669]" />, title: 'Economize 5+ horas', desc: 'Registre atendimentos em segundos. Relatórios prontos num clique.' },
                            { icon: <TrendingUp size={32} className="text-[#b76e79]" />, title: 'Aumente seus lucros', desc: 'Descubra serviços lucrativos e otimize seus custos agora.' }
                        ].map((b, i) => (
                            <div key={i} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all group">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-all">{b.icon}</div>
                                <h3 className="text-xl font-black uppercase mb-3">{b.title}</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 4: COMO FUNCIONA (Fixed ID & Numbering) */}
            <section id="como-funciona" className="py-20 px-4 sm:px-6 bg-[#1a365d] text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter mb-4">Tão Simples que Você Vai Usar Todos os Dias</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
                        <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 border-t-2 border-dashed border-white/20"></div>
                        {[
                            { n: '1', title: 'Conecte', desc: 'Adicione suas entradas e saídas de forma manual e simples.' },
                            { n: '2', title: 'Acompanhe', desc: 'Veja dashboards claros com seu faturamento e lucro por período.' },
                            { n: '3', title: 'Cresça', desc: 'Realize seus sonhos com o lucro que você agora sabe onde está.' }
                        ].map((s, i) => (
                            <div key={i} className="text-center space-y-4 relative z-10">
                                <div className="w-16 h-16 bg-[#10b981] text-white text-2xl font-black rounded-full flex items-center justify-center mx-auto shadow-xl ring-4 ring-white/10">{s.n}</div>
                                <h3 className="text-xl font-black uppercase">{s.title}</h3>
                                <p className="text-slate-300 text-sm font-medium leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 5: FUNCIONALIDADES */}
            <section id="funcionalidades" className="py-20 px-4 sm:px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-center mb-16">Tudo em um Só Lugar</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: <CreditCard size={20} />, title: 'Controle de Caixa Diário', desc: 'Saiba exatamente quanto entrou via Pix, Cartão ou Dinheiro hoje.' },
                            { icon: <Users size={20} />, title: 'Clientes VIP', desc: 'Identifique suas clientes que mais faturam e crie estratégias.' },
                            { icon: <Star size={20} />, title: 'Análise de Serviços', desc: 'Ranking automático dos procedimentos mais lucrativos.' },
                            { icon: <PiggyBank size={20} />, title: 'Gestão de Sonhos', desc: 'Transforme seu lucro em objetivos reais com nosso rastreador.' },
                            { icon: <FileText size={20} />, title: 'Relatórios Automáticos', desc: 'Extratos detalhados por mês para você nunca mais ter dúvidas.' },
                            { icon: <Zap size={20} />, title: 'Insights Inteligentes', desc: 'Sugestões automáticas baseadas no seu faturamento para otimizar.' }
                        ].map((f, i) => (
                            <div key={i} className="p-7 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#1a365d] transition-all group">
                                <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-[#1a365d] mb-5 group-hover:bg-[#1a365d] group-hover:text-white transition-all">{f.icon}</div>
                                <h3 className="text-lg font-black uppercase mb-3">{f.title}</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION: SONHOS E MARCA (NOVO) */}
            <section className="py-20 px-4 sm:px-6 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-900/20 to-transparent"></div>
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 item-center relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-emerald-400 text-xs font-black uppercase tracking-widest mb-4 border border-white/10">
                            <Target size={14} /> Seu Próximo Nível
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-6">
                            Transforme Lucro em <span className="text-emerald-400">Sonhos Realizados</span>
                        </h2>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed mb-8">
                            Não é só sobre pagar boletos. O FINANPRO tem uma tecnologia exclusiva de <strong>"Gestão de Sonhos"</strong> que te ajuda a reservar dinheiro para o que realmente importa: seu carro, sua reforma, sua viagem.
                        </p>

                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm mb-8">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Reforma do Salão</span>
                                <span className="text-xl font-black">75%</span>
                            </div>
                            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-3/4 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                            </div>
                            <p className="mt-3 text-[10px] text-slate-400 font-bold uppercase text-right">Faltam apenas R$ 2.500,00</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="p-8 bg-white text-[#1a365d] rounded-3xl shadow-xl transform lg:translate-x-12 border-4 border-slate-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-lg"><Sparkles size={24} /></div>
                                <div>
                                    <h3 className="font-black text-xl uppercase leading-none">Sua Marca, Seu Império</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Personalização Total</p>
                                </div>
                            </div>
                            <p className="text-slate-600 font-medium mb-6">
                                O aplicativo fica com a <strong>cor da sua marca</strong> e o <strong>seu nome</strong>. Suas clientes e você vão sentir que o sistema foi feito sob medida para o seu sucesso.
                            </p>
                            <div className="flex gap-2">
                                <div className="w-6 h-6 rounded-full bg-rose-500 border-2 border-white shadow-sm ring-2 ring-slate-100"></div>
                                <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-white shadow-sm ring-2 ring-slate-100"></div>
                                <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-sm ring-2 ring-slate-100"></div>
                                <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-sm ring-2 ring-slate-100"></div>
                                <span className="text-xs font-bold text-slate-400 flex items-center ml-2">+ infinitas cores</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 6: PROVA SOCIAL */}
            <section id="depoimentos" className="py-20 px-4 sm:px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-center mb-16">Donas de Salão que já Transformaram seus Negócios</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { name: 'Maria Silva', role: 'Espaço Beleza Pura (SP)', text: 'Antes do FINANPRO eu achava que estava lucrando, mas estava no vermelho. Em 2 meses organizei tudo e aumentei meu lucro!' },
                            { name: 'Carla Oliveira', role: 'Clínica Estética Revitalize', text: 'Finalmente entendi para onde ia o meu dinheiro. O controle de gastos fixos me abriu os olhos. Hoje meu salão respira.' },
                            { name: 'Juliana Costa', role: 'Studio J - Nails', text: 'Uso no meu celular entre atendimentos. É simples e não toma meu tempo. Recomendo para todas as manicures.' }
                        ].map((d, i) => (
                            <div key={i} className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm relative">
                                <div className="flex gap-1 text-amber-500 mb-4"><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /></div>
                                <p className="italic text-slate-600 font-medium mb-8 leading-relaxed text-sm">"{d.text}"</p>
                                <div className="flex items-center gap-3 border-t border-slate-50 pt-6">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-white font-black text-sm" style={{ backgroundColor: appColor }}>{d.name[0]}</div>
                                    <div>
                                        <p className="font-black text-[#1a365d] uppercase text-[10px]">{d.name}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{d.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 7: COMPARAÇÃO */}
            <section id="comparativo" className="py-20 px-4 sm:px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl sm:text-4xl font-black text-[#1a365d] uppercase tracking-tighter text-center mb-12">FINANPRO vs Amadorismo</h2>
                    <div className="bg-white rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-xl">
                        <div className="grid grid-cols-2 text-center bg-[#1a365d] text-white">
                            <div className="p-6 border-r border-white/10 text-[10px] font-black uppercase tracking-[0.2em]">SEM FINANPRO ❌</div>
                            <div className="p-6 text-[10px] font-black uppercase tracking-[0.2em] bg-[#059669]">COM FINANPRO ✅</div>
                        </div>
                        {[
                            ['Planilhas confusas', 'Dashboard visual e claro'],
                            ['Horas perdidas', 'Automação inteligente'],
                            ['Decisões no escuro', 'Dados em tempo real'],
                            ['Dinheiro misturado', 'Finanças separadas'],
                            ['Estresse constante', 'Paz e controle total']
                        ].map((row, i) => (
                            <div key={i} className="grid grid-cols-2 text-center border-b border-slate-50 last:border-0 group hover:bg-slate-50 transition-colors">
                                <div className="p-5 border-r border-slate-50 text-slate-400 text-[11px] font-medium italic">{row[0]}</div>
                                <div className="p-5 text-[#1a365d] text-[11px] font-black uppercase tracking-tight">{row[1]}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 8: GARANTIA */}
            <section id="garantia" className="py-20 px-4 sm:px-6 bg-slate-50">
                <div className="max-w-4xl mx-auto p-10 bg-white rounded-[2.5rem] border-4 border-[#10b981] shadow-xl relative overflow-hidden text-center">
                    <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter mb-4 text-[#1a365d]">🛡️ TESTE GRÁTIS POR 30 DIAS</h2>
                    <p className="text-slate-500 font-medium text-sm md:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
                        Experimente TODAS as funcionalidades sem pagar nada por 30 dias. Sem cartão de crédito.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 text-emerald-600 font-black uppercase text-[10px] tracking-widest mb-8">
                        <span className="flex items-center gap-2"><CircleCheck size={18} /> Sem contrato</span>
                        <span className="flex items-center gap-2"><CircleCheck size={18} /> 100% Online</span>
                        <span className="flex items-center gap-2"><CircleCheck size={18} /> Suporte VIP</span>
                    </div>
                    <button 
                        onClick={() => navigate('/login?mode=signup')}
                        className="px-8 py-4 border-2 border-[#10b981] text-[#10b981] rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#10b981] hover:text-white transition-all shadow-md active:scale-95"
                    >
                        Quero começar meu teste grátis agora 🚀
                    </button>
                </div>
            </section>

            {/* SECTION 9: PREÇOS (CARD INTELIGENTE) */}
            <section id="planos" className="py-20 px-4 sm:px-6 bg-white">
                <div className="max-w-7xl mx-auto text-center mb-8">
                    <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter mb-4 text-[#1a365d]">O Investimento que se Paga no Primeiro Mês</h2>

                    {/* Toggle Seletor */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${billingCycle === 'monthly' ? 'text-[#1a365d]' : 'text-slate-400'}`}>Mensal</span>
                        <button
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                            className="w-14 h-8 bg-[#1a365d] rounded-full p-1 relative transition-all duration-300"
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${billingCycle === 'yearly' ? 'text-[#1a365d]' : 'text-slate-400'}`}>Anual</span>
                    </div>

                    {/* Card Único Inteligente */}
                    <div className="max-w-md mx-auto relative animate-fadeIn">
                        {billingCycle === 'yearly' && (
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 px-6 py-2 bg-[#b76e79] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
                                74% DE ECONOMIA - Equivale a apenas R$ 12,40/mês!
                            </div>
                        )}

                        <div className="bg-white rounded-[2rem] p-8 md:p-10 border-[3px] border-[#b76e79]/30 shadow-2xl relative overflow-hidden group hover:border-[#b76e79] transition-all duration-500">
                            <div className="mb-6">
                                <h3 className="text-2xl font-black uppercase text-[#1a365d] mb-1">Plano FINANPRO VIP</h3>
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Tudo o que você precisa para crescer</p>
                            </div>

                            <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic">
                                <p className="text-[#1a365d] text-xs font-bold uppercase tracking-tight">
                                    ✨ "Menos que o preço de uma escova por mês"
                                </p>
                            </div>

                            <div className="mb-8 flex flex-col items-center">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-[#1a365d] transition-all duration-300">
                                        {billingCycle === 'monthly' ? 'R$ 47' : 'R$ 149'}
                                    </span>
                                    <span className="text-slate-400 font-bold uppercase text-[10px]">
                                        {billingCycle === 'monthly' ? '/mês' : '/ano'}
                                    </span>
                                </div>
                                {billingCycle === 'yearly' && (
                                    <p className="mt-1 text-[#059669] font-black text-[9px] uppercase tracking-widest">Apenas R$ 12,40 por mês no anual</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-3 mb-10 text-left">
                                {[
                                    { icon: <Calendar size={14} />, text: 'Agenda Inteligente Automática' },
                                    { icon: <PiggyBank size={14} />, text: 'Gestão de Sonhos Exclusiva' },
                                    { icon: <Zap size={14} />, text: 'IA Estratégica & Copys' },
                                    { icon: <Users size={14} />, text: 'CRM e Histórico de Clientes' },
                                    { icon: <BarChart size={14} />, text: 'Relatórios de Lucro Real' },
                                    { icon: <ShieldCheck size={14} />, text: 'Suporte VIP Individual' }
                                ].map((item, ii) => (
                                    <div key={ii} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-[#b76e79]/10 text-[#b76e79] flex items-center justify-center shrink-0">
                                            {item.icon}
                                        </div>
                                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            <button onClick={() => window.open('https://lastlink.com/p/C969D3A79/checkout-payment/', '_blank')} className="w-full py-5 bg-[#10b981] text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all mb-4">
                                ASSINAR AGORA E COMEÇAR
                            </button>

                            <button 
                                onClick={() => navigate('/login?mode=signup')}
                                className="w-full py-3 text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-widest transition-all mb-4"
                            >
                                ou prefiro testar 30 dias grátis antes
                            </button>

                            <div className="space-y-4">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    Junte-se a +500 empreendedoras da beleza 👑
                                </p>
                                
                                <div className="flex justify-center items-center gap-3 pt-4 border-t border-slate-100">
                                    <div className="flex gap-1.5 grayscale opacity-50">
                                        <div className="px-1.5 py-0.5 border border-slate-300 rounded text-[8px] font-bold">PIX</div>
                                        <div className="px-1.5 py-0.5 border border-slate-300 rounded text-[8px] font-bold">VISA</div>
                                        <div className="px-1.5 py-0.5 border border-slate-300 rounded text-[8px] font-bold">MASTER</div>
                                    </div>
                                    <div className="h-4 w-px bg-slate-200"></div>
                                    <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-600 uppercase tracking-widest">
                                        <ShieldCheck size={10} /> 100% Seguro
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 10: FAQ */}
            <section id="faq" className="py-20 px-4 sm:px-6 bg-slate-50">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl sm:text-4xl font-black text-[#1a365d] uppercase tracking-tighter text-center mb-12">Dúvidas Frequentes</h2>
                    <div className="space-y-4">
                        {[
                            ["É difícil de usar? Preciso entender de contabilidade?", "De jeito nenhum! O FINANPRO foi feito por quem vive a realidade do salão. É tudo visual e intuitivo."],
                            ["Quanto tempo leva para configurar?", "Em menos de 2 minutos você já pode registrar sua primeira venda do dia."],
                            ["Meus dados estão seguros?", "Sim. Usamos criptografia de ponta para garantir que suas finanças sejam um segredo só seu."],
                            ["Funciona no celular?", "Com certeza! É um webapp 100% responsivo para você usar no celular ou computador."],
                            ["Posso cancelar quando quiser?", "Sim, sem letras miúdas. Não temos fidelidade. Você paga o mês e usa."]
                        ].map((faq, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm group hover:border-[#b76e79] transition-all">
                                <h3 className="text-base font-black uppercase text-[#1a365d] mb-3 flex items-center gap-3"><CircleHelp size={18} className="text-[#b76e79] shrink-0" /> {faq[0]}</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">{faq[1]}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 11: CTA FINAL */}
            <section id="cta-final" className="py-20 px-4 sm:px-6 bg-gradient-to-br from-[#1a365d] to-[#059669] text-white text-center">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-tight">Está Pronta para Ter o Controle Total das Finanças?</h2>
                    <button onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })} className="px-12 py-6 bg-white text-[#1a365d] rounded-xl font-black uppercase text-xs md:text-sm tracking-[0.2em] shadow-2xl hover:scale-110 active:scale-95 transition-all">
                        VERIFICAR PLANOS E PREÇOS
                    </button>
                </div>
            </section>

            {/* RODAPÉ */}
            <footer className="py-16 bg-white border-t border-slate-100 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-center md:text-left">
                    <div className="space-y-4">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <Activity className="text-[#1a365d]" size={20} />
                            <span className="text-base font-black tracking-tighter uppercase">FINANPRO</span>
                        </div>
                        <p className="text-slate-400 text-xs font-medium leading-relaxed">Empoderando empreendedoras da beleza através da inteligência financeira.</p>
                    </div>
                    <div>
                        <h4 className="font-black text-[10px] uppercase text-[#1a365d] mb-5 tracking-widest underline decoration-[#b76e79] underline-offset-8">Políticas</h4>
                        <ul className="space-y-2 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            <li><button className="hover:text-[#1a365d]">Termos</button></li>
                            <li><button className="hover:text-[#1a365d]">Privacidade</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black text-[10px] uppercase text-[#1a365d] mb-5 tracking-widest underline decoration-[#b76e79] underline-offset-8">Links</h4>
                        <ul className="space-y-2 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            <li><button className="hover:text-[#1a365d]">Suporte</button></li>
                            <li><button className="hover:text-[#1a365d]">Blog</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black text-[10px] uppercase text-[#1a365d] mb-5 tracking-widest underline decoration-[#b76e79] underline-offset-8">Siga-nos</h4>
                        <div className="flex justify-center md:justify-start gap-3">
                            <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#1a365d] hover:bg-[#1a365d] hover:text-white transition-all"><Users size={14} /></button>
                            <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#1a365d] hover:bg-[#1a365d] hover:text-white transition-all"><MessageCircle size={14} /></button>
                        </div>
                    </div>
                </div>
            </footer>

            {/* STICKY FOOTER MOBILE */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-[250] bg-white/90 backdrop-blur-md border-t border-slate-100 p-4 animate-fadeIn">
                <button onClick={() => navigate(isAuthenticated ? '/app' : '/login?mode=signup')} className="w-full py-4 bg-[#10b981] text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">TESTE GRÁTIS 30 DIAS</button>
            </div>
        </div>
    );
};

export default LandingPage;
