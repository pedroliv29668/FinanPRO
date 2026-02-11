import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus, Trash2, TrendingUp, TrendingDown, Target,
  ChevronLeft, ChevronRight, Menu, X, LayoutDashboard,
  Activity, Lightbulb, Settings, Star, CreditCard, Users, ArrowUpRight, Clock, Calendar, PiggyBank, BarChart3, Palette, Trophy, PartyPopper, Receipt, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, ShoppingBag, Save, CalendarDays, ArrowUp, ArrowDown, Bell, Sparkles, ChevronDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
  Legend
} from 'recharts';

import { supabase } from './services/supabase';
import { getAIInsight } from './services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Receita, Despesa, Sonho, GastoFixo, Conquista, Agendamento, Cliente, Servico } from './types';
import AuthScreen from './components/AuthScreen';
import CalendarView from './components/CalendarView';
import ClientesView from './components/ClientesView';
import MarketingView from './components/MarketingView';

const meses = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];

interface SonhoExpandido extends Sonho {
  poupancaMensal?: number;
  dataRealizacao?: string;
}

const App: React.FC = () => {
  const getSaved = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) return defaultValue;
      const parsed = JSON.parse(saved);
      return parsed;
    } catch (e) { return defaultValue; }
  };

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');

  // UI State
  const [mesAtual, setMesAtual] = useState<number>(new Date().getMonth());
  const [anoAtual] = useState(new Date().getFullYear());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState<'dashboard' | 'reports' | 'agenda' | 'clientes' | 'marketing'>('dashboard');

  // Modal States
  const [modalMetas, setModalMetas] = useState(false);
  const [modalFixos, setModalFixos] = useState(false);
  const [modalSonhos, setModalSonhos] = useState(false);
  const [modalNovoServico, setModalNovoServico] = useState(false);
  const [modalConfig, setModalConfig] = useState(false);
  const [modalClientes, setModalClientes] = useState(false);
  const [modalIA, setModalIA] = useState(false);
  const [modalGlobalCliente, setModalGlobalCliente] = useState(false);
  const [clienteParaEdicaoGlobal, setClienteParaEdicaoGlobal] = useState<Cliente | null>(null);

  // Data State
  const [receitas, setReceitas] = useState<Receita[]>(() => {
    const saved = getSaved('receitas', []);
    return saved.map((r: any) => ({
      ...r,
      categoria: r.categoria || 'Serviço',
      descricao: r.descricao || ''
    }));
  });
  const [despesasVariaveis, setDespesasVariaveis] = useState<Despesa[]>(() => getSaved('despesasVariaveis', []));
  const [sonhos, setSonhos] = useState<SonhoExpandido[]>(() => getSaved('sonhos', []));
  const [gastosFixos, setGastosFixos] = useState<GastoFixo[]>(() => getSaved('gastosFixos', []));
  const [clientes, setClientes] = useState<Cliente[]>(() => getSaved('clientes', []));
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(() => getSaved('agendamentos', []));
  const [servicos, setServicos] = useState<Servico[]>(() => {
    const saved = getSaved('servicosClinica', null);
    if (!saved) {
      return [
        { id: '1', nome: 'Limpeza de Pele', valor: 150 },
        { id: '2', nome: 'Botox', valor: 800 },
        { id: '3', nome: 'Drenagem', valor: 120 },
        { id: '4', nome: 'Preenchimento', valor: 1200 }
      ];
    }
    return saved;
  });

  // App Config
  const [appName, setAppName] = useState(() => getSaved('appName', 'Gestão Clínica Estética'));
  const [appColor, setAppColor] = useState(() => getSaved('appColor', '#009b72'));
  const [projecaoSelecionada, setProjecaoSelecionada] = useState<number>(() => getSaved('projecaoSelecionada', 25));

  // AI State
  const [aiResponse, setAiResponse] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);

  // Temporary Form States
  const [formCliente, setFormCliente] = useState({ nome: '', telefone: '', email: '', observacoes: '' });
  const [formNovoGastoFixo, setFormNovoGastoFixo] = useState({ nome: '', valor: '' });

  // Persistence
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('receitas', JSON.stringify(receitas));
      localStorage.setItem('despesasVariaveis', JSON.stringify(despesasVariaveis));
      localStorage.setItem('sonhos', JSON.stringify(sonhos));
      localStorage.setItem('gastosFixos', JSON.stringify(gastosFixos));
      localStorage.setItem('clientes', JSON.stringify(clientes));
      localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
      localStorage.setItem('servicosClinica', JSON.stringify(servicos));
      localStorage.setItem('appName', JSON.stringify(appName));
      localStorage.setItem('appColor', JSON.stringify(appColor));
      localStorage.setItem('projecaoSelecionada', JSON.stringify(projecaoSelecionada));
    }
  }, [receitas, despesasVariaveis, sonhos, gastosFixos, clientes, servicos, appName, appColor, projecaoSelecionada, isAuthenticated]);

  // Auth Effect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session?.user?.email) {
        setEmail(session.user.email);
        setUserName(session.user.email.split('@')[0].toUpperCase());
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user?.email) {
        setEmail(session.user.email);
        setUserName(session.user.email.split('@')[0].toUpperCase());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleAddCliente = (e: React.FormEvent) => {
    e.preventDefault();
    const novo: Cliente = {
      id: Date.now(),
      nome: formCliente.nome,
      telefone: formCliente.telefone,
      email: formCliente.email,
      observacoes: formCliente.observacoes,
      totalGasto: 0,
      totalAtendimentos: 0
    };
    setClientes([novo, ...clientes]);
    setFormCliente({ nome: '', telefone: '', email: '', observacoes: '' });
    setModalClientes(false);
  };

  const handleGenerateInsight = async () => {
    setIsAILoading(true);
    setModalIA(true);
    try {
      const summary = {
        faturamento: receitas.reduce((acc, r) => acc + r.valor, 0),
        gastos: (despesasVariaveis.reduce((acc, d) => acc + d.valor, 0) + gastosFixos.reduce((acc, g) => acc + g.valor, 0)),
        clientes: clientes.length,
        servicos: servicos.length
      };
      const response = await getAIInsight(summary);
      setAiResponse(response);
    } catch (error) {
      setAiResponse("Erro ao gerar insights. Tente novamente.");
    } finally {
      setIsAILoading(false);
    }
  };

  const handleNewAgendamento = (novo: Agendamento) => {
    setAgendamentos([...agendamentos, novo]);
  };

  const handleOpenGlobalClient = (c: Cliente | null) => {
    setClienteParaEdicaoGlobal(c || { id: 0, nome: '', telefone: '', email: '', totalGasto: 0, totalAtendimentos: 0, observacoes: '' });
    setModalGlobalCliente(true);
  };

  const formatMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  // Projections and Stats
  const stats = useMemo(() => {
    const rMes = receitas.filter(r => r.mes === mesAtual && r.ano === anoAtual);
    const dMes = despesasVariaveis.filter(d => d.mes === mesAtual && d.ano === anoAtual);

    const faturamento = rMes.reduce((acc, r) => acc + r.valor, 0);
    const despesasV = dMes.reduce((acc, d) => acc + d.valor, 0);
    const fixos = gastosFixos.reduce((acc, g) => acc + g.valor, 0);

    const lucroBruto = faturamento - despesasV;
    const lucroLiquido = lucroBruto - fixos;
    const margem = faturamento > 0 ? (lucroLiquido / faturamento) * 100 : 0;

    const metaFaturamento = getSaved('metaFaturamento', 10000);
    const progressoMeta = (faturamento / metaFaturamento) * 100;

    return { faturamento, despesasV, fixos, lucroLiquido, margem, progressoMeta, metaFaturamento };
  }, [receitas, despesasVariaveis, gastosFixos, mesAtual, anoAtual]);

  // Auth Screen Guard
  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white font-black uppercase tracking-widest text-2xl text-center p-10">
      SISTEMA CARREGANDO...
    </div>
  );

  if (!isAuthenticated) return <AuthScreen onLogin={() => setIsAuthenticated(true)} />;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-outfit">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400 hover:text-slate-900 transition-all">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-900 rounded-lg text-white">
              <Activity size={18} />
            </div>
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-tighter">{appName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Bem-vindo(a)</span>
            <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{userName}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Users size={16} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {view === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <TrendingUp size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1">Faturamento {meses[mesAtual]}</p>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{formatMoeda(stats.faturamento)}</p>
              </div>

              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <TrendingDown size={24} />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1">Despesas Totais</p>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{formatMoeda(stats.despesasV + stats.fixos)}</p>
              </div>

              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <Target size={24} />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1">Lucro Líquido</p>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{formatMoeda(stats.lucroLiquido)}</p>
              </div>

              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <Activity size={24} />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1">Margem de Lucro</p>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.margem.toFixed(1)}%</p>
              </div>
            </div>

            {/* Goal Progress */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-1">Meta Mensal</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Acompanhamento de performance de vendas</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Restante</p>
                    <p className="text-sm font-black text-slate-900">{formatMoeda(Math.max(0, stats.metaFaturamento - stats.faturamento))}</p>
                  </div>
                  <button onClick={() => setModalMetas(true)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all">
                    <Settings size={20} />
                  </button>
                </div>
              </div>
              <div className="relative h-4 bg-slate-50 rounded-full overflow-hidden mb-4">
                <div className="absolute top-0 left-0 h-full bg-slate-900 transition-all duration-1000 ease-out" style={{ width: `${Math.min(100, stats.progressoMeta)}%` }}></div>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{stats.progressoMeta.toFixed(1)}% Alcançado</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta: {formatMoeda(stats.metaFaturamento)}</span>
              </div>
            </div>
          </div>
        )}

        {view === 'agenda' && <CalendarView agendamentos={agendamentos} onNewAgendamento={handleNewAgendamento} />}
        {view === 'clientes' && <ClientesView clientes={clientes} setClientes={setClientes} />}
        {view === 'marketing' && <MarketingView clientes={clientes} receitas={receitas} onOpenGlobalClient={handleOpenGlobalClient} />}
      </main>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[400] bg-slate-950/40 backdrop-blur-sm animate-fadeIn" onClick={() => setIsSidebarOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-[260px] sm:w-[280px] bg-white p-6 sm:p-10 shadow-2xl flex flex-col border-r border-slate-100 animate-fadeInLeft" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-10 sm:mb-14">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white"><Activity size={20} className="sm:size-[24px]" /></div>
              <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-slate-900 transition-all"><X size={20} /></button>
            </div>
            <nav className="space-y-3 sm:space-y-4 flex-1">
              <button onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-3.5 sm:p-4 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all ${view === 'dashboard' ? 'text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`} style={{ backgroundColor: view === 'dashboard' ? appColor : 'transparent' }}><LayoutDashboard size={18} className="sm:size-[20px]" /> Overview</button>
              <button onClick={() => { setView('agenda'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-3.5 sm:p-4 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all ${view === 'agenda' ? 'text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`} style={{ backgroundColor: view === 'agenda' ? appColor : 'transparent' }}><Calendar size={18} className="sm:size-[20px]" /> Agenda</button>
              <button onClick={() => { setView('reports'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-3.5 sm:p-4 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all ${view === 'reports' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}><BarChart3 size={18} className="sm:size-[20px]" /> Analytics</button>
              <button onClick={() => { setView('clientes'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-3.5 sm:p-4 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all ${view === 'clientes' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}><Users size={18} className="sm:size-[20px]" /> Clientes</button>
              <button onClick={() => { setView('marketing'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-3.5 sm:p-4 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all ${view === 'marketing' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}><PartyPopper size={18} className="sm:size-[20px]" /> Marketing</button>
              <button onClick={() => { setModalConfig(true); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 p-3.5 sm:p-4 rounded-xl font-bold text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest hover:text-slate-600 hover:bg-slate-50"><Palette size={18} className="sm:size-[20px]" /> Estilo</button>
              <div className="pt-4 mt-4 border-t border-slate-50 px-2">
                <button
                  onClick={() => { handleGenerateInsight(); setIsSidebarOpen(false); }}
                  className="w-full flex items-center justify-between gap-4 p-4 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.15em] hover:scale-[1.02] transition-all shadow-[0_10px_20px_rgba(99,102,241,0.3)] group"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                    <span>Estratégia IA</span>
                  </div>
                  <ChevronRight size={14} className="opacity-50" />
                </button>
              </div>
              <div className="pt-6 sm:pt-10 border-t mt-6 sm:mt-10">
                <button onClick={() => { handleLogout(); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 p-3.5 sm:p-4 text-rose-500 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:bg-rose-50 transition-all"><Lock size={18} className="sm:size-[20px]" /> Sair</button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Modals Container */}
      {[
        {
          isOpen: modalMetas, setOpen: setModalMetas, title: 'Configurar Metas', content: (
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Meta de Faturamento Mensal</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    defaultValue={getSaved('metaFaturamento', 10000)}
                    onChange={(e) => localStorage.setItem('metaFaturamento', e.target.value)}
                    className="w-full bg-slate-50 p-4 pl-12 rounded-2xl font-black border border-slate-100 outline-none focus:border-slate-900 transition-all"
                  />
                </div>
              </div>
              <button onClick={() => setModalMetas(false)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg">Salvar Meta</button>
            </div>
          )
        },
        {
          isOpen: modalSonhos, setOpen: setModalSonhos, title: 'Novo Alvo', content: (
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              setSonhos((prev) => [...prev, {
                id: Date.now(),
                nome: fd.get('nome') as string,
                valorTotal: parseFloat(fd.get('total') as string) || 0,
                juntado: 0,
                prazoMes: parseInt(fd.get('mes') as string),
                prazoAno: parseInt(fd.get('ano') as string)
              }]);
              setModalSonhos(false);
            }} className="space-y-4 sm:space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 mb-1 block">Nome do Sonho</label>
                  <input name="nome" placeholder="Ex: Viagem, Carro Novo..." required className="w-full bg-slate-50 p-3.5 sm:p-4 rounded-xl font-bold border border-slate-200 outline-none text-sm" />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 mb-1 block">Valor Total</label>
                  <input name="total" type="number" step="0.01" placeholder="0,00" required className="w-full bg-slate-50 p-3.5 sm:p-4 rounded-xl font-bold border border-slate-200 outline-none text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 mb-1 block">Mês Alvo</label>
                    <select name="mes" required className="w-full bg-slate-50 p-3.5 sm:p-4 rounded-xl font-bold border border-slate-200 outline-none text-sm uppercase appearance-none cursor-pointer">
                      <option value="">Selecione...</option>
                      {meses.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 mb-1 block">Ano Alvo</label>
                    <input name="ano" type="number" placeholder={new Date().getFullYear().toString()} required className="w-full bg-slate-50 p-3.5 sm:p-4 rounded-xl font-bold border border-slate-200 outline-none text-sm" />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-3.5 sm:py-4 rounded-xl font-bold uppercase text-[10px] sm:text-xs tracking-widest shadow-lg hover:bg-slate-800 transition-all">Criar Objetivo</button>
            </form>
          )
        },
        {
          isOpen: modalNovoServico, setOpen: setModalNovoServico, title: 'Gerenciar Serviços', content: (
            <div className="space-y-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const nome = fd.get('nome') as string;
                const valor = parseFloat(fd.get('valor') as string) || 0;
                setServicos((prev) => [...prev, { id: Date.now().toString(), nome, valor }]);
                e.currentTarget.reset();
              }} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Adicionar Novo</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input name="nome" placeholder="Procedimento" required className="w-full bg-white p-3 rounded-xl font-bold border border-slate-200 outline-none text-sm uppercase" />
                  <input name="valor" type="number" step="0.01" placeholder="R$ 0,00" required className="w-full bg-white p-3 rounded-xl font-bold border border-slate-200 outline-none text-sm" />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"><Plus size={14} /> Adicionar</button>
              </form>
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Serviços Cadastrados</p>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-2 text-xs font-bold uppercase">
                  {servicos.map(s => (
                    <div key={s.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl">
                      <span>{s.nome}</span>
                      <span className="text-emerald-500">{formatMoeda(s.valor)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        },
        {
          isOpen: modalClientes, setOpen: setModalClientes, title: 'Novo Cliente', content: (
            <form onSubmit={handleAddCliente} className="space-y-4 sm:space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Nome Completo</label>
                <input type="text" required value={formCliente.nome} onChange={e => setFormCliente({ ...formCliente, nome: e.target.value.toUpperCase() })} className="w-full bg-slate-50 p-3.5 sm:p-4 rounded-xl font-bold border border-slate-200 outline-none text-sm uppercase" placeholder="NOME DO CLIENTE" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Telefone</label>
                  <input type="text" value={formCliente.telefone} onChange={e => setFormCliente({ ...formCliente, telefone: e.target.value })} className="w-full bg-slate-50 p-3.5 sm:p-4 rounded-xl font-bold border border-slate-200 outline-none text-sm" placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Email</label>
                  <input type="email" value={formCliente.email} onChange={e => setFormCliente({ ...formCliente, email: e.target.value })} className="w-full bg-slate-50 p-3.5 sm:p-4 rounded-xl font-bold border border-slate-200 outline-none text-sm" placeholder="cliente@email.com" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Observações</label>
                <textarea value={formCliente.observacoes} onChange={e => setFormCliente({ ...formCliente, observacoes: e.target.value })} className="w-full bg-slate-50 p-3.5 sm:p-4 rounded-xl font-bold border border-slate-200 outline-none text-sm min-h-[100px] resize-none" placeholder="Alergias, preferências, etc..." />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-3.5 sm:py-4 rounded-xl font-bold uppercase text-[10px] sm:text-xs tracking-widest shadow-lg hover:shadow-indigo-500/20 transition-all font-sans" style={{ backgroundColor: appColor }}>Cadastrar Cliente</button>
            </form>
          )
        },
        {
          isOpen: modalFixos, setOpen: setModalFixos, title: 'Gastos Fixos', content: (
            <div className="space-y-6">
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {gastosFixos.map((g, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{g.nome}</p>
                      <p className="text-[10px] font-bold text-rose-500">{formatMoeda(g.valor)}</p>
                    </div>
                    <button onClick={() => setGastosFixos(prev => prev.filter((_, i) => i !== idx))} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {gastosFixos.length === 0 && <p className="text-center py-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nenhum gasto fixo...</p>}
              </div>
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input value={formNovoGastoFixo.nome} onChange={e => setFormNovoGastoFixo({ ...formNovoGastoFixo, nome: e.target.value.toUpperCase() })} placeholder="NOME" className="bg-slate-50 p-3 rounded-xl border border-slate-100 outline-none text-[10px] font-bold uppercase" />
                  <input type="number" value={formNovoGastoFixo.valor} onChange={e => setFormNovoGastoFixo({ ...formNovoGastoFixo, valor: e.target.value })} placeholder="VALOR" className="bg-slate-50 p-3 rounded-xl border border-slate-100 outline-none text-[10px] font-bold" />
                </div>
                <button
                  onClick={() => {
                    if (!formNovoGastoFixo.nome || !formNovoGastoFixo.valor) return;
                    setGastosFixos([...gastosFixos, { nome: formNovoGastoFixo.nome, valor: parseFloat(formNovoGastoFixo.valor) }]);
                    setFormNovoGastoFixo({ nome: '', valor: '' });
                  }}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Adicionar Gasto
                </button>
              </div>
            </div>
          )
        },
        {
          isOpen: modalConfig, setOpen: setModalConfig, title: 'Estilo', content: (
            <div className="space-y-6 sm:space-y-8">
              <input type="text" value={appName} onChange={e => setAppName(e.target.value)} className="w-full bg-slate-50 p-3.5 sm:p-4 rounded-xl font-bold border border-slate-200 outline-none text-sm" placeholder="Nome da Unidade" />
              <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                <input type="color" value={appColor} onChange={e => setAppColor(e.target.value)} className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl cursor-pointer border-none bg-transparent" />
                <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-widest">Paleta de Cores do App</span>
              </div>
              <button onClick={() => setModalConfig(false)} className="w-full text-white py-3.5 sm:py-4 rounded-xl font-bold uppercase text-[10px] sm:text-xs tracking-widest" style={{ backgroundColor: appColor }}>Aplicar Novo Estilo</button>
            </div>
          )
        },
        {
          isOpen: modalGlobalCliente, setOpen: setModalGlobalCliente, title: clienteParaEdicaoGlobal?.id === 0 ? 'Novo Cliente' : 'Editar Cliente', content: (
            <div className="space-y-6">
              <ClientesView
                clientes={clientes}
                setClientes={setClientes}
                isGlobalModal
                clienteParaEditarExterno={clienteParaEdicaoGlobal}
                onClose={() => setModalGlobalCliente(false)}
              />
            </div>
          )
        }
      ].map((modal, idx) => modal.isOpen && (
        <div key={idx} className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-lg p-6 sm:p-8 lg:p-12 rounded-[2rem] animate-scaleUp shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-black uppercase text-slate-900 tracking-tight">{modal.title}</h2>
              <button onClick={() => modal.setOpen(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-all"><X size={20} /></button>
            </div>
            {modal.content}
          </div>
        </div>
      ))}

      {/* AI Modal (Example) */}
      {modalIA && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-lg p-6 sm:p-8 lg:p-12 rounded-[1.5rem] sm:rounded-[2rem] animate-scaleUp shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 sm:mb-10 border-b pb-4 sm:pb-6">
              <h2 className="text-base sm:text-xl font-extrabold uppercase text-slate-800">Consultoria Estratégica IA</h2>
              <button onClick={() => setModalIA(false)} className="p-2 text-slate-300 hover:text-slate-800 transition-all"><X size={20} /></button>
            </div>
            <div className="space-y-6">
              {isAILoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Analisando seus dados...</p>
                </div>
              ) : (
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiResponse || "Carregando insights..."}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;