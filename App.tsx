import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, TrendingUp, TrendingDown, Target,
  ChevronLeft, ChevronRight, Menu, X, LayoutDashboard,
  Activity, Lightbulb, Settings, Star, CreditCard, Users, ArrowUpRight, Clock, Calendar, PiggyBank, BarChart3, Palette, Trophy, PartyPopper, Receipt, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, ShoppingBag, Save, CalendarDays, ArrowUp, ArrowDown, Bell, Sparkles
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
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import SubscriptionWall from './components/SubscriptionWall';

const meses = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];

interface SonhoExpandido extends Sonho {
  poupancaMensal?: number;
  dataRealizacao?: string;
}

interface MetasFinanceiras {
  faturamento: number;
  gastosFixos: number;
  lucroLiquido: number;
  margemDesejada: number;
}

const App: React.FC = () => {
  const navigate = useNavigate();
  const getSaved = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) return defaultValue;
      const parsed = JSON.parse(saved);
      return parsed;
    } catch (e) { return defaultValue; }
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'loading' | 'active' | 'pending' | 'expired'>('loading');
  const isAdmin = userEmail === 'josecardio22@gmail.com';
  const [mesAtual, setMesAtual] = useState<number>(new Date().getMonth());
  const [anoAtual] = useState(new Date().getFullYear());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'reports' | 'agenda' | 'clientes' | 'marketing'>('dashboard');

  const [modalMetas, setModalMetas] = useState(false);
  const [modalFixos, setModalFixos] = useState(false);
  const [modalSonhos, setModalSonhos] = useState(false);
  const [modalNovoServico, setModalNovoServico] = useState(false);
  const [modalConfig, setModalConfig] = useState(false);
  const [modalClientes, setModalClientes] = useState(false);
  const [modalIA, setModalIA] = useState(false);
  const [modalGlobalCliente, setModalGlobalCliente] = useState(false);
  const [clienteParaEdicaoGlobal, setClienteParaEdicaoGlobal] = useState<Cliente | null>(null);
  const [clienteExternoParaEditar, setClienteExternoParaEditar] = useState<Cliente | null>(null);
  const [aiResponse, setAiResponse] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const [appName, setAppName] = useState(() => getSaved('appName', 'Gestão Clínica Estética'));
  const [appColor, setAppColor] = useState(() => getSaved('appColor', '#009b72'));
  const [projecaoSelecionada, setProjecaoSelecionada] = useState<number>(() => getSaved('projecaoSelecionada', 25));

  const [receitas, setReceitas] = useState<Receita[]>(() => getSaved('receitas', []));
  const [despesasVariaveis, setDespesasVariaveis] = useState<Despesa[]>(() => getSaved('despesasVariaveis', []));
  const [sonhos, setSonhos] = useState<SonhoExpandido[]>(() => getSaved('sonhos', []));
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
    if (Array.isArray(saved) && typeof saved[0] === 'string') {
      return saved.map((s: string, index: number) => ({ id: Date.now().toString() + Math.random().toString().slice(2), nome: s, valor: 0 }));
    }
    return saved;
  });
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(() => getSaved('agendamentos', []));
  const [clientes, setClientes] = useState<Cliente[]>(() => getSaved('clientes', []));

  const [metas, setMetas] = useState<MetasFinanceiras>(() => getSaved('metasFinanceiras', {
    faturamento: 10000,
    gastosFixos: 5000,
    lucroLiquido: 3000,
    margemDesejada: 30
  }));

  const [gastosFixos, setGastosFixos] = useState<GastoFixo[]>(() => getSaved('gastosFixos', [
    { id: '1', nome: 'ALUGUEL', valor: 0, isPadrao: true },
    { id: '2', nome: 'ÁGUA', valor: 0, isPadrao: true },
    { id: '3', nome: 'LUZ', valor: 0, isPadrao: true },
    { id: '4', nome: 'INTERNET', valor: 0, isPadrao: true },
    { id: '5', nome: 'SALÁRIOS FIXOS', valor: 0, isPadrao: true },
    { id: '6', nome: 'CONTADOR', valor: 0, isPadrao: true },
  ]));

  const [inputAportes, setInputAportes] = useState<Record<number, string>>({});

  const [formReceita, setFormReceita] = useState({
    data: new Date().toISOString().split('T')[0],
    cliente: '',
    procedimento: '',
    formaPagamento: 'Pix' as 'Pix' | 'Cartão' | 'Dinheiro',
    valor: ''
  });

  const [formDespesa, setFormDespesa] = useState({
    data: new Date().toISOString().split('T')[0],
    descricao: '',
    formaPagamento: 'Pix' as 'Pix' | 'Cartão' | 'Dinheiro',
    valor: ''
  });

  const [formCliente, setFormCliente] = useState({
    nome: '',
    telefone: '',
    email: '',
    observacoes: ''
  });

  const [formNovoGastoFixo, setFormNovoGastoFixo] = useState({
    nome: '',
    valor: ''
  });

  const formatMoeda = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setUserEmail(session?.user?.email || '');

      if (session?.user?.email === 'josecardio22@gmail.com') {
        setSubscriptionStatus('active');
        setIsLoading(false);
      } else if (session) {
        supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error || !data) {
              setSubscriptionStatus('pending');
            } else {
              setSubscriptionStatus(data.subscription_status);
            }
            setIsLoading(false);
          });
      } else {
        setSubscriptionStatus('loading');
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUserEmail(session?.user?.email || '');

      if (session?.user?.email === 'josecardio22@gmail.com') {
        setSubscriptionStatus('active');
      } else if (session) {
        supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setSubscriptionStatus(data.subscription_status);
          });
      } else {
        setSubscriptionStatus('loading');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const loadData = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
          setUserName(name);

          const { data, error } = await supabase.from('app_state').select('payload').eq('user_id', user.id).maybeSingle();

          if (data && data.payload) {
            const p = data.payload;
            if (p.receitas) setReceitas(p.receitas);
            if (p.despesasVariaveis) setDespesasVariaveis(p.despesasVariaveis);
            if (p.sonhos) setSonhos(p.sonhos);
            if (p.servicos) setServicos(p.servicos);
            if (p.metas) setMetas(p.metas);
            if (p.gastosFixos) setGastosFixos(p.gastosFixos);
            if (p.appName) setAppName(p.appName);
            if (p.appColor) setAppColor(p.appColor);
            if (p.projecaoSelecionada !== undefined) setProjecaoSelecionada(p.projecaoSelecionada);
            if (p.agendamentos) setAgendamentos(p.agendamentos);
            if (p.clientes) setClientes(p.clientes);
          }
          setHasLoadedData(true);
        } catch (err) {
          setHasLoadedData(true);
        }
      };
      loadData();
    } else {
      setHasLoadedData(false);
    }
  }, [isAuthenticated]);

  const receitasMes = useMemo(() => receitas.filter(r => r.mes === mesAtual).sort((a, b) => b.id - a.id), [receitas, mesAtual]);
  const despesasMes = useMemo(() => despesasVariaveis.filter(d => d.mes === mesAtual).sort((a, b) => b.id - a.id), [despesasVariaveis, mesAtual]);
  const totalReceitas = useMemo(() => receitasMes.reduce((acc, curr) => acc + curr.valor, 0), [receitasMes]);

  const totalReceitasAnterior = useMemo(() => {
    const mAnt = mesAtual === 0 ? 11 : mesAtual - 1;
    const aAnt = mesAtual === 0 ? anoAtual - 1 : anoAtual;
    return receitas.filter(r => r.mes === mAnt && r.ano === aAnt).reduce((acc, curr) => acc + curr.valor, 0);
  }, [receitas, mesAtual, anoAtual]);

  const totalFixos = useMemo(() => gastosFixos.reduce((acc, curr) => acc + curr.valor, 0), [gastosFixos]);
  const totalVariaveis = useMemo(() => despesasMes.reduce((acc, curr) => acc + curr.valor, 0), [despesasMes]);
  const totalDespesas = totalFixos + totalVariaveis;
  const lucroReal = totalReceitas - totalDespesas;
  const margemReal = totalReceitas > 0 ? (lucroReal / totalReceitas) * 100 : 0;

  const metaCalculadaPelaProjecao = useMemo(() => {
    return totalReceitasAnterior === 0 ? metas.faturamento : totalReceitasAnterior * (1 + projecaoSelecionada / 100);
  }, [totalReceitasAnterior, projecaoSelecionada, metas.faturamento]);

  const percFaturamento = metaCalculadaPelaProjecao > 0 ? Math.min(100, (totalReceitas / metaCalculadaPelaProjecao) * 100) : 0;

  const topClientes = useMemo(() => {
    const map = new Map<string, number>();
    receitasMes.forEach(r => {
      const n = r.cliente || 'Consumidor';
      map.set(n, (map.get(n) || 0) + r.valor);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [receitasMes]);

  const topServicos = useMemo(() => {
    const map = new Map<string, number>();
    receitasMes.forEach(r => {
      const n = r.procedimento || 'Procedimento';
      map.set(n, (map.get(n) || 0) + r.valor);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [receitasMes]);

  const pagamentosResumo = useMemo(() => {
    return receitasMes.reduce((acc, curr) => {
      acc[curr.formaPagamento] = (acc[curr.formaPagamento] || 0) + curr.valor;
      return acc;
    }, { Pix: 0, Cartão: 0, Dinheiro: 0 } as Record<string, number>);
  }, [receitasMes]);

  const analyticsData = useMemo(() => {
    const semanas = [
      { nome: 'Semana 1', faturamento: 0, lucro: 0 },
      { nome: 'Semana 2', faturamento: 0, lucro: 0 },
      { nome: 'Semana 3', faturamento: 0, lucro: 0 },
      { nome: 'Semana 4', faturamento: 0, lucro: 0 },
    ];
    receitasMes.forEach(r => {
      const dia = new Date(r.data).getUTCDate();
      let index = 3;
      if (dia <= 7) index = 0;
      else if (dia <= 14) index = 1;
      else if (dia <= 21) index = 2;
      semanas[index].faturamento += r.valor;
    });
    const fixoSemanal = totalFixos / 4;
    despesasMes.forEach(d => {
      const dia = new Date(d.data).getUTCDate();
      let index = 3;
      if (dia <= 7) index = 0;
      else if (dia <= 14) index = 1;
      else if (dia <= 21) index = 2;
      semanas[index].lucro -= d.valor;
    });
    semanas.forEach(s => {
      s.lucro += (s.faturamento - fixoSemanal);
    });
    const historicoMensal = meses.map((nome, i) => {
      const rec = receitas.filter(r => r.mes === i).reduce((acc, curr) => acc + curr.valor, 0);
      const varExp = despesasVariaveis.filter(d => d.mes === i).reduce((acc, curr) => acc + curr.valor, 0);
      return { nome, faturamento: rec, lucro: rec - (varExp + totalFixos) };
    });
    const proporcaoGastos = [
      { name: 'Fixos', value: totalFixos, color: '#6366f1' },
      { name: 'Variáveis', value: totalVariaveis, color: '#f43f5e' }
    ].filter(item => item.value > 0);
    return { semanas, historicoMensal, proporcaoGastos };
  }, [receitasMes, despesasMes, totalFixos, receitas, despesasVariaveis, totalVariaveis]);

  useEffect(() => {
    localStorage.setItem('receitas', JSON.stringify(receitas));
    localStorage.setItem('despesasVariaveis', JSON.stringify(despesasVariaveis));
    localStorage.setItem('sonhos', JSON.stringify(sonhos));
    localStorage.setItem('metasFinanceiras', JSON.stringify(metas));
    localStorage.setItem('servicosClinica', JSON.stringify(servicos));
    localStorage.setItem('appName', JSON.stringify(appName));
    localStorage.setItem('appColor', JSON.stringify(appColor));
    localStorage.setItem('gastosFixos', JSON.stringify(gastosFixos));
    localStorage.setItem('projecaoSelecionada', JSON.stringify(projecaoSelecionada));
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
    localStorage.setItem('clientes', JSON.stringify(clientes));

    if (isAuthenticated && hasLoadedData) {
      const syncWithSupabase = async () => {
        const payload = { receitas, despesasVariaveis, sonhos, metas, servicos, appName, appColor, gastosFixos, projecaoSelecionada, agendamentos, clientes };
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('app_state').upsert({ user_id: user.id, payload }, { onConflict: 'user_id' });
        }
      };
      const timeoutId = setTimeout(syncWithSupabase, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [receitas, despesasVariaveis, sonhos, metas, servicos, appName, appColor, gastosFixos, projecaoSelecionada, agendamentos, clientes, isAuthenticated, hasLoadedData]);

  const handleAddAgendamento = (ag: Omit<Agendamento, 'id'>) => {
    setAgendamentos(prev => [...prev, { ...ag, id: Date.now() }]);
    if (ag.formaPagamento && ag.valor && ag.valor > 0) {
      const dataAgendamento = new Date(ag.dataInicio);
      const novaReceita: Receita = {
        id: Date.now() + 1,
        cliente: ag.cliente,
        procedimento: ag.servico,
        valor: ag.valor,
        data: ag.dataInicio.split('T')[0],
        formaPagamento: ag.formaPagamento,
        mes: dataAgendamento.getMonth(),
        ano: dataAgendamento.getFullYear()
      };
      setReceitas(prev => [novaReceita, ...prev]);
    }
  };

  const handleAddCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCliente.nome) return;
    const novo: Cliente = { id: Date.now(), ...formCliente, totalGasto: 0, totalAtendimentos: 0 };
    setClientes(prev => [novo, ...prev]);
    setFormCliente({ nome: '', telefone: '', email: '', observacoes: '' });
    setModalClientes(false);
  };

  const handleUpdateAgendamento = (ag: Agendamento) => {
    setAgendamentos(prev => prev.map(item => item.id === ag.id ? ag : item));
  };

  const handleRemoveAgendamento = (id: number) => {
    setAgendamentos(prev => prev.filter(a => a.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('finanpro_auth');
    setIsAuthenticated(false);
    navigate('/', { replace: true });
  };

  const adicionarAporteSonho = (id: number) => {
    const vStr = inputAportes[id];
    if (!vStr) return;
    const v = parseFloat(vStr.replace(',', '.')) || 0;
    if (v > 0) {
      setSonhos((prev) => prev.map(s => s.id === id ? { ...s, juntado: Math.min(s.juntado + v, s.valorTotal) } : s));
      setInputAportes((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const handleAddReceita = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(formReceita.valor.replace(',', '.'));
    if (!v || v <= 0) return;
    const dObj = new Date(formReceita.data);
    setReceitas((prev) => [{
      id: Date.now(), valor: v, procedimento: formReceita.procedimento || 'Serviço',
      cliente: formReceita.cliente || 'Consumidor', formaPagamento: formReceita.formaPagamento,
      data: formReceita.data, mes: dObj.getUTCMonth(), ano: dObj.getUTCFullYear(),
      categoria: 'Entrada', descricao: 'Lançamento Manual'
    }, ...prev]);
    setFormReceita({ ...formReceita, cliente: '', valor: '', procedimento: '' });
  };

  const handleAddDespesa = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(formDespesa.valor.replace(',', '.'));
    if (!v || v <= 0) return;
    const dObj = new Date(formDespesa.data);
    setDespesasVariaveis((prev) => [{
      id: Date.now(), valor: v, descricao: formDespesa.descricao || 'Gasto',
      categoria: 'Saída', data: formDespesa.data, mes: dObj.getUTCMonth(), ano: dObj.getUTCFullYear(),
      formaPagamento: formDespesa.formaPagamento
    }, ...prev]);
    setFormDespesa({ ...formDespesa, descricao: '', valor: '' });
  };

  const agendamentosAmanha = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    return agendamentos.filter(a => a.dataInicio.split('T')[0] === tomorrowStr);
  }, [agendamentos]);

  const handleGenerateInsight = async () => {
    setIsAILoading(true);
    setModalIA(true);
    setAiResponse('');
    const summary = {
      faturamentoTotal: totalReceitas,
      faturamentoMesAnterior: totalReceitasAnterior,
      metaFaturamento: metaCalculadaPelaProjecao,
      despesasFixas: totalFixos,
      despesasVariaveis: totalVariaveis,
      lucroLiquido: lucroReal,
      margemLucro: margemReal,
      topServicos: topServicos.map(s => ({ nome: s[0], valor: s[1] })),
      totalAgendamentos: agendamentosMes.length,
      resumoPagamentos: pagamentosResumo,
      projeçãoCrescimento: projecaoSelecionada
    };
    try {
      const insight = await getAIInsight(summary);
      setAiResponse(insight);
    } catch (err) {
      setAiResponse("Erro ao gerar consultoria.");
    } finally {
      setIsAILoading(false);
    }
  };

  const agendamentosMes = useMemo(() => agendamentos.filter(a => {
    const d = new Date(a.dataInicio);
    return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
  }), [agendamentos, mesAtual, anoAtual]);

  useEffect(() => {
    if (agendamentosAmanha.length > 0 && 'Notification' in window) {
      if (Notification.permission === 'default') Notification.requestPermission();
      else if (Notification.permission === 'granted') {
        const todayStr = new Date().toISOString().split('T')[0];
        if (localStorage.getItem('last_notify_amanha') !== todayStr) {
          new Notification("💅 Lembrete de Agenda", { body: `Amanhã você tem ${agendamentosAmanha.length} atendimentos!` });
          localStorage.setItem('last_notify_amanha', todayStr);
        }
      }
    }
  }, [agendamentosAmanha]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage isAuthenticated={isAuthenticated} userEmail={userEmail} />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/app" replace /> : <AuthScreen appName={appName} appColor={appColor} />} />
      <Route path="/app/*" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
          <div className="min-h-screen bg-slate-50 font-outfit text-slate-800 overflow-x-hidden selection:bg-indigo-100 pb-20 md:pb-0">
            {subscriptionStatus !== 'active' && !isAdmin ? (
              <SubscriptionWall userEmail={userEmail} appColor={appColor} onLogout={handleLogout} />
            ) : (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-10">
                <header className="flex justify-between items-center mb-6 sm:mb-8 bg-white/70 backdrop-blur-md sticky top-4 z-[100] px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl border border-white shadow-sm">
                  <button onClick={() => setIsSidebarOpen(true)} className="p-2 sm:p-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition-all active:scale-95"><Menu size={20} /></button>
                  <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: appColor }}></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{currentView === 'dashboard' ? 'Overview' : currentView === 'agenda' ? 'Agenda' : currentView === 'clientes' ? 'Clientes' : currentView === 'marketing' ? 'Marketing' : 'Analytics'}</span>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-900 rounded-xl flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-white shadow-md">{userName.slice(0, 3).toUpperCase()}</div>
                </header>

                {currentView === 'agenda' && (
                  <div className="animate-fadeIn h-[calc(100vh-140px)]">
                    <CalendarView agendamentos={agendamentos} onAddAgendamento={handleAddAgendamento} onRemoveAgendamento={handleRemoveAgendamento} onUpdateAgendamento={handleUpdateAgendamento} appColor={appColor} servicos={servicos} clientes={clientes} onManageServices={() => setModalNovoServico(true)} />
                  </div>
                )}
                {currentView === 'clientes' && (
                  <ClientesView clientes={clientes} setClientes={setClientes} receitas={receitas} appColor={appColor} servicos={servicos.map(s => s.nome)} clienteExternoParaEditar={clienteExternoParaEditar} onClearExterno={() => setClienteExternoParaEditar(null)} />
                )}
                {currentView === 'marketing' && (
                  <MarketingView clientes={clientes} agendamentos={agendamentos} receitas={receitas} appColor={appColor} onEditCliente={(cliente) => { setClienteParaEdicaoGlobal(cliente); setModalGlobalCliente(true); }} isAdmin={isAdmin} />
                )}
                {currentView === 'reports' && (
                  /* ANALYTICS VIEW SIMPLIFICADA PARA RESTAURAÇÃO RÁPIDA */
                  <div className="animate-fadeIn space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Faturamento</p>
                        <p className="text-2xl font-black text-emerald-600">{formatMoeda(totalReceitas)}</p>
                      </div>
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Lucro Real</p>
                        <p className="text-2xl font-black text-indigo-600">{formatMoeda(lucroReal)}</p>
                      </div>
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Margem</p>
                        <p className="text-2xl font-black text-slate-800">{margemReal.toFixed(1)}%</p>
                      </div>
                    </div>
                    <button onClick={() => setCurrentView('dashboard')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Voltar</button>
                  </div>
                )}
                {currentView === 'dashboard' && (
                  <main className="animate-fadeIn space-y-8 sm:space-y-10 lg:space-y-14">
                    {/* Banner de Lembrete */}
                    {agendamentosAmanha.length > 0 && (
                      <div className="bg-slate-900 p-5 rounded-3xl flex items-center justify-between text-white shadow-xl border border-white/10 overflow-hidden relative group">
                        <div className="absolute right-0 top-0 p-4 opacity-10"><Bell size={80} /></div>
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400"><Bell size={24} className="animate-pulse" /></div>
                          <div>
                            <p className="text-[9px] font-black uppercase text-indigo-400 mb-1">Dica da Antigravity</p>
                            <p className="text-sm font-extrabold">{agendamentosAmanha.length} atendimentos para amanhã!</p>
                          </div>
                        </div>
                        <button onClick={() => setCurrentView('agenda')} className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest relative z-10">Ver Agenda</button>
                      </div>
                    )}

                    <section className="rounded-[2rem] p-8 sm:p-12 lg:p-16 text-white shadow-2xl relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${appColor}, ${appColor}EE)` }}>
                      <div className="relative z-10 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80 mb-4">Bem-vinda, {userName}</p>
                        <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter mb-8 leading-none">{appName}</h1>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                          <div className="flex items-center gap-4 bg-white/10 p-2 rounded-2xl backdrop-blur-sm border border-white/10">
                            <button onClick={() => setMesAtual(mesAtual > 0 ? mesAtual - 1 : 11)} className="p-3 hover:bg-white/10 rounded-xl transition-all"><ChevronLeft size={20} /></button>
                            <span className="text-lg font-black tracking-widest min-w-[120px]">{meses[mesAtual]}</span>
                            <button onClick={() => setMesAtual(mesAtual < 11 ? mesAtual + 1 : 0)} className="p-3 hover:bg-white/10 rounded-xl transition-all"><ChevronRight size={20} /></button>
                          </div>
                          <button onClick={() => isAdmin && handleGenerateInsight()} className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-3 transition-all ${isAdmin ? 'bg-white text-slate-900 border-white' : 'bg-slate-900/40 text-slate-400 border-white/10 cursor-not-allowed'}`}>
                            {isAdmin ? <Sparkles size={20} /> : <Lock size={16} />}
                            {isAdmin ? "Consultoria Estratégica" : "Consultoria (Em breve)"}
                          </button>
                        </div>
                      </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-full group transition-all hover:scale-[1.02]">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Entradas</p>
                        <p className="text-2xl font-black text-emerald-600">{formatMoeda(totalReceitas)}</p>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-600"><ArrowUpRight size={12} /> vs mês ant.</div>
                      </div>
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-full group transition-all hover:scale-[1.02]">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Saídas</p>
                        <p className="text-2xl font-black text-rose-600">{formatMoeda(totalDespesas)}</p>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-rose-500"><TrendingDown size={12} /> no mês</div>
                      </div>
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-full group transition-all hover:scale-[1.02]">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Lucro Limpo</p>
                        <p className="text-2xl font-black text-indigo-600">{formatMoeda(lucroReal)}</p>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-indigo-600"><Activity size={12} /> {margemReal.toFixed(0)}% margem</div>
                      </div>
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-full group transition-all hover:scale-[1.02]">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Meta Mensal</p>
                        <p className="text-2xl font-black text-slate-800">{formatMoeda(metaCalculadaPelaProjecao)}</p>
                        <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden"><div className="h-full bg-indigo-500" style={{ width: `${percFaturamento}%` }}></div></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14" id="section-lancamentos">
                      <section className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter mb-8 flex items-center gap-3"><Plus size={20} className="text-emerald-500" /> Lançar Receita</h3>
                        <form onSubmit={handleAddReceita} className="space-y-4">
                          <input type="text" placeholder="CLIENTE" value={formReceita.cliente} onChange={e => setFormReceita({ ...formReceita, cliente: e.target.value.toUpperCase() })} className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold text-xs uppercase" required />
                          <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="VALOR" value={formReceita.valor} onChange={e => setFormReceita({ ...formReceita, valor: e.target.value })} className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold text-xs" required />
                            <select value={formReceita.formaPagamento} onChange={e => setFormReceita({ ...formReceita, formaPagamento: e.target.value as any })} className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold text-[10px] uppercase">
                              <option value="Pix">PIX</option>
                              <option value="Cartão">CARTÃO</option>
                              <option value="Dinheiro">DINHEIRO</option>
                            </select>
                          </div>
                          <button type="submit" className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg">Salvar Entrada</button>
                        </form>
                      </section>
                      <section className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter mb-8 flex items-center gap-3"><TrendingDown size={20} className="text-rose-500" /> Lançar Despesa</h3>
                        <form onSubmit={handleAddDespesa} className="space-y-4">
                          <input type="text" placeholder="DESCRIÇÃO" value={formDespesa.descricao} onChange={e => setFormDespesa({ ...formDespesa, descricao: e.target.value.toUpperCase() })} className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold text-xs uppercase" required />
                          <input type="text" placeholder="VALOR" value={formDespesa.valor} onChange={e => setFormDespesa({ ...formDespesa, valor: e.target.value })} className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold text-xs" required />
                          <button type="submit" className="w-full py-4 bg-rose-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg">Salvar Saída</button>
                        </form>
                      </section>
                    </div>
                  </main>
                )}
              </div>
            )}

            {/* MODALS UNIFICADOS */}
            {modalConfig && (
              <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm">
                <div className="bg-white w-full max-w-sm p-10 rounded-[2rem] shadow-2xl relative">
                  <h2 className="text-lg font-black uppercase mb-8">Estilo do App</h2>
                  <input type="text" value={appName} onChange={e => setAppName(e.target.value)} className="w-full bg-slate-50 p-4 rounded-xl font-black border border-slate-200 mb-4" placeholder="Nome do App" />
                  <input type="color" value={appColor} onChange={e => setAppColor(e.target.value)} className="w-full h-14 rounded-xl border-none cursor-pointer mb-8" />
                  <button onClick={() => setModalConfig(false)} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px]">Aplicar</button>
                </div>
              </div>
            )}

            {modalIA && (
              <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm">
                <div className="bg-white w-full max-w-2xl p-10 rounded-[2rem] shadow-2xl relative max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-lg font-black uppercase">Consultoria Estratégica IA</h2>
                    <button onClick={() => setModalIA(false)} className="text-slate-300 hover:text-slate-900"><X size={24} /></button>
                  </div>
                  {isAILoading ? <div className="py-12 text-center animate-pulse text-[10px] font-black uppercase text-slate-400">Processando Inteligência...</div> : (
                    <div className="prose prose-indigo max-w-none text-sm font-medium leading-relaxed font-outfit">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiResponse}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SIDEBAR */}
            {isSidebarOpen && (
              <div className="fixed inset-0 z-[400] bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}>
                <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white p-10 shadow-2xl flex flex-col animate-fadeInLeft" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-16">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white"><Activity size={24} /></div>
                    <button onClick={() => setIsSidebarOpen(false)}><X size={24} className="text-slate-300" /></button>
                  </div>
                  <nav className="flex-1 space-y-4">
                    <button onClick={() => { setCurrentView('dashboard'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-xl font-black text-[10px] uppercase tracking-widest ${currentView === 'dashboard' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}><LayoutDashboard size={20} /> Overview</button>
                    <button onClick={() => { setCurrentView('agenda'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-xl font-black text-[10px] uppercase tracking-widest ${currentView === 'agenda' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}><Calendar size={20} /> Agenda</button>
                    <button onClick={() => { setCurrentView('clientes'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-xl font-black text-[10px] uppercase tracking-widest ${currentView === 'clientes' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}><Users size={20} /> Clientes</button>
                    <button onClick={() => { setCurrentView('marketing'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-xl font-black text-[10px] uppercase tracking-widest ${currentView === 'marketing' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}><PartyPopper size={20} /> Marketing</button>
                    <button onClick={() => { setModalConfig(true); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 p-4 rounded-xl font-black text-[10px] uppercase text-slate-400 hover:bg-slate-50"><Palette size={20} /> Estilo</button>
                  </nav>
                  <button onClick={handleLogout} className="mt-auto w-full flex items-center gap-4 p-4 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all"><Lock size={20} /> Sair</button>
                </div>
              </div>
            )}
          </div>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;