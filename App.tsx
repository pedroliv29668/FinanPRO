import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, TrendingUp, TrendingDown, Target,
  ChevronLeft, ChevronRight, Menu, X, LayoutDashboard, History, ArrowDownLeft,
  Activity, Lightbulb, Settings, Star, CreditCard, Users, ArrowUpRight, Clock, Calendar, PiggyBank, BarChart, Palette, Trophy, PartyPopper, Receipt, Lock, Mail, ArrowRight, Check, AlertCircle, ShoppingBag, Save, CalendarDays, ArrowUp, ArrowDown, Bell, Sparkles, PieChart as LucidePieChart
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
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

const CATEGORIAS_PESSOAIS = [
  'ALIMENTAÇÃO', 'MORADIA', 'TRANSPORTE', 'SAÚDE', 'ESTILO DE VIDA', 'LAZER', 'COMPRAS', 'INVESTIMENTOS', 'OUTROS'
];

const CATEGORIAS_RECEITA_PESSOAL = [
  'SALÁRIO', 'PRÓ-LABORE', 'INVESTIMENTOS', 'RENDAS EXTRAS', 'OUTROS'
];

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
  const [projectMode, setProjectMode] = useState<'business' | 'personal'>(() => getSaved('projectMode', 'business'));


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
    { id: '1', nome: 'ALUGUEL', valor: 0, isPadrao: true, mode: 'business' },
    { id: '2', nome: 'ÁGUA', valor: 0, isPadrao: true, mode: 'business' },
    { id: '3', nome: 'LUZ', valor: 0, isPadrao: true, mode: 'business' },
    { id: '4', nome: 'INTERNET', valor: 0, isPadrao: true, mode: 'business' },
    { id: '5', nome: 'SALÁRIOS FIXOS', valor: 0, isPadrao: true, mode: 'business' },
    { id: '6', nome: 'CONTADOR', valor: 0, isPadrao: true, mode: 'business' },
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
            if (p.projectMode) setProjectMode(p.projectMode);

            // Sanitização de dados legados (garantir mes/ano e modo default)
            setReceitas(prev => prev.map(r => {
              const d = new Date(r.data + 'T12:00:00');
              return {
                ...r,
                mes: r.mes !== undefined ? r.mes : d.getMonth(),
                ano: r.ano !== undefined ? r.ano : d.getFullYear(),
                mode: r.mode || 'business'
              };
            }));
            setDespesasVariaveis(prev => prev.map(d => {
              const dt = new Date(d.data + 'T12:00:00');
              return {
                ...d,
                mes: d.mes !== undefined ? d.mes : dt.getMonth(),
                ano: d.ano !== undefined ? d.ano : dt.getFullYear(),
                mode: d.mode || 'business'
              };
            }));
            setGastosFixos(prev => prev.map(g => ({ ...g, mode: g.mode ? g.mode : 'business' })));
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

  // Filtragem Global por Modo
  const receitasFiltradas = useMemo(() => receitas.filter(r => (r.mode || 'business') === projectMode), [receitas, projectMode]);
  const despesasFiltradas = useMemo(() => despesasVariaveis.filter(d => (d.mode || 'business') === projectMode), [despesasVariaveis, projectMode]);
  const gastosFixosFiltrados = useMemo(() => gastosFixos.filter(g => (g.mode || 'business') === projectMode), [gastosFixos, projectMode]);

  const receitasMes = useMemo(() => receitasFiltradas.filter(r => r.mes === mesAtual).sort((a, b) => b.id - a.id), [receitasFiltradas, mesAtual]);
  const despesasMes = useMemo(() => despesasFiltradas.filter(d => d.mes === mesAtual).sort((a, b) => b.id - a.id), [despesasFiltradas, mesAtual]);
  const totalReceitas = useMemo(() => receitasMes.reduce((acc, curr) => acc + curr.valor, 0), [receitasMes]);

  const totalReceitasAnterior = useMemo(() => {
    const mAnt = mesAtual === 0 ? 11 : mesAtual - 1;
    const aAnt = mesAtual === 0 ? anoAtual - 1 : anoAtual;
    return receitasFiltradas.filter(r => r.mes === mAnt && r.ano === aAnt).reduce((acc, curr) => acc + curr.valor, 0);
  }, [receitasFiltradas, mesAtual, anoAtual]);

  const totalFixos = useMemo(() => gastosFixosFiltrados.reduce((acc, curr) => acc + curr.valor, 0), [gastosFixosFiltrados]);
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
      const rec = receitasFiltradas.filter(r => r.mes === i).reduce((acc, curr) => acc + curr.valor, 0);
      const varExp = despesasFiltradas.filter(d => d.mes === i).reduce((acc, curr) => acc + curr.valor, 0);
      // Lucro agora considera gastos fixos em ambos os modos
      return { nome, faturamento: rec, lucro: rec - (varExp + totalFixos) };
    });
    const proporcaoGastos = [
      { name: 'Fixos', value: totalFixos, color: '#6366f1' },
      { name: 'Variáveis', value: totalVariaveis, color: '#f43f5e' }
    ].filter(item => item.value > 0);

    // Dados para o Gráfico de Pizza por Categorias (Modo Pessoal)
    const despesasPorCategoria = Array.from(
      despesasMes.reduce((acc, curr) => {
        const cat = curr.descricao || 'OUTROS';
        acc.set(cat, (acc.get(cat) || 0) + curr.valor);
        return acc;
      }, new Map<string, number>()).entries()
    ).map(([name, value]) => ({ name, value }));

    return { semanas, historicoMensal, proporcaoGastos, despesasPorCategoria };
  }, [receitasMes, despesasMes, totalFixos, receitas, despesasVariaveis, totalVariaveis, projectMode]);

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
        ano: dataAgendamento.getFullYear(),
        categoria: 'Entrada',
        descricao: `Atendimento: ${ag.servico}`,
        mode: 'business' // Agendamentos são sempre business por enquanto
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
      categoria: 'Entrada', descricao: 'Lançamento Manual',
      mode: projectMode
    }, ...prev]);
    setFormReceita({ ...formReceita, cliente: '', valor: '', procedimento: '' });
  };

  const handleAddDespesa = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(formDespesa.valor.replace(',', '.'));
    if (!v || v <= 0) return;
    const dObj = new Date(formDespesa.data);
    setDespesasVariaveis((prev) => [{
      id: Date.now(),
      descricao: formDespesa.descricao || 'Despesa',
      valor: v,
      formaPagamento: formDespesa.formaPagamento,
      data: formDespesa.data,
      mes: dObj.getUTCMonth(),
      ano: dObj.getUTCFullYear(),
      categoria: 'Saída',
      mode: projectMode
    }, ...prev]);
    setFormDespesa({ ...formDespesa, descricao: '', valor: '' });
  };

  const handleRetiradaProLabore = (valor: number) => {
    const agora = new Date();
    const dataIso = agora.toISOString().split('T')[0];

    // 1. Lança como Despesa na Clínica (Profissional)
    const novaDespesaClinica: Despesa = {
      id: Date.now(),
      descricao: 'RETIRADA PRÓ-LABORE',
      valor: valor,
      formaPagamento: 'Pix',
      data: dataIso,
      mes: agora.getUTCMonth(),
      ano: agora.getUTCFullYear(),
      categoria: 'Saída',
      mode: 'business'
    };

    // 2. Lança como Receita no Pessoal
    const novaReceitaPessoal: Receita = {
      id: Date.now() + 1,
      cliente: 'SAQUE CLÍNICA',
      procedimento: 'PRÓ-LABORE',
      valor: valor,
      data: dataIso,
      formaPagamento: 'Pix',
      mes: agora.getUTCMonth(),
      ano: agora.getUTCFullYear(),
      categoria: 'Entrada',
      descricao: 'Transferência de Pró-labore',
      mode: 'personal'
    };

    setDespesasVariaveis(prev => [novaDespesaClinica, ...prev]);
    setReceitas(prev => [novaReceitaPessoal, ...prev]);
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

  const isAppSubdomain = window.location.hostname.startsWith('app');

  const DashboardContent = (
    <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
      <div className="min-h-screen bg-slate-50 font-outfit text-slate-800 overflow-x-hidden selection:bg-indigo-100 pb-20 md:pb-0">
        {subscriptionStatus !== 'active' && !isAdmin ? (
          <SubscriptionWall userEmail={userEmail} appColor={appColor} onLogout={handleLogout} />
        ) : (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6 lg:py-10">
            <header className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-8 bg-white/70 backdrop-blur-md sticky top-2 sm:top-4 z-[100] px-3 sm:px-6 py-3 sm:py-3 rounded-2xl border border-white shadow-sm transition-all gap-3 sm:gap-0">
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 sm:p-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition-all active:scale-95"><Menu size={20} /></button>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: appColor }}></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{currentView === 'dashboard' ? 'Overview' : currentView === 'agenda' ? 'Agenda' : currentView === 'clientes' ? 'Clientes' : currentView === 'marketing' ? 'Marketing' : 'Analytics'}</span>
                  </div>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md self-start sm:self-auto ${projectMode === 'business' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-pink-50 text-pink-600 border border-pink-100'}`}>
                    {projectMode === 'business' ? 'Modo Profissional' : 'Modo Pessoal'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/50">
                <button
                  onClick={() => {
                    if (mesAtual === 0) {
                      // Se for janeiro, não fazemos nada ou voltamos para dezembro do ano anterior se tivéssemos controle de ano editável
                    } else {
                      setMesAtual(mesAtual - 1);
                    }
                  }}
                  className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest min-w-[100px] text-center">{meses[mesAtual]} {anoAtual}</span>
                <button
                  onClick={() => {
                    if (mesAtual === 11) {
                      // Próximo ano if editable
                    } else {
                      setMesAtual(mesAtual + 1);
                    }
                  }}
                  className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 bg-slate-900 rounded-xl items-center justify-center text-[10px] sm:text-[11px] font-bold text-white shadow-md">{userName.slice(0, 3).toUpperCase()}</div>
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
              /* REPORTS VIEW */
              <div className="animate-fadeIn pb-32 space-y-12 sm:space-y-16 lg:space-y-24 px-4 sm:px-6">
                <header className="flex items-center gap-4 sm:gap-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-indigo-600 border border-slate-100 shadow-sm shrink-0">
                    <BarChart size={24} className="sm:size-[32px]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tighter text-slate-800 truncate">Analytics</h2>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 sm:mt-2">{meses[mesAtual]} • {anoAtual}</p>
                  </div>
                </header>

                {/* COMPARATIVO SECTION */}
                <section className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-10 lg:p-14 border border-slate-100 shadow-sm relative overflow-hidden">
                  <h3 className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 sm:mb-10 px-1 border-b pb-4 sm:pb-0 sm:border-0">Comparativo: {meses[mesAtual]} vs {meses[mesAtual === 0 ? 11 : mesAtual - 1]}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                    <div className="p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-900 text-white shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform"><TrendingUp size={120} className="sm:size-[160px]" /></div>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 sm:mb-6">Faturamento</p>
                      <div className="flex flex-col gap-1 sm:gap-2 mb-6 sm:mb-8 min-w-0">
                        <span className="text-2xl sm:text-4xl font-black truncate">{formatMoeda(totalReceitas)}</span>
                        <span className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase truncate">Mês Anterior: {formatMoeda(totalReceitasAnterior)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {totalReceitasAnterior > 0 ? (
                          (() => {
                            const diff = ((totalReceitas - totalReceitasAnterior) / totalReceitasAnterior) * 100;
                            return (
                              <span className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase ${diff >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                {diff >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                                {Math.abs(diff).toFixed(1)}% {diff >= 0 ? 'Subiu' : 'Caiu'}
                              </span>
                            );
                          })()
                        ) : (
                          <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Sem base</span>
                        )}
                      </div>
                    </div>

                    <div className="p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform"><BarChart size={120} className="sm:size-[160px]" /></div>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 sm:mb-6">Lucro Líquido</p>
                      <div className="flex flex-col gap-1 sm:gap-2 mb-6 sm:mb-8 min-w-0">
                        <span className={`text-2xl sm:text-4xl font-black truncate ${lucroReal >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>{formatMoeda(lucroReal)}</span>
                        <span className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase">Margem: {margemReal.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase ${margemReal >= metas.margemDesejada ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                          {margemReal >= metas.margemDesejada ? 'Dentro da Meta' : 'Abaixo da Meta'}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* EVOLUÇÃO AND GASTOS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
                  <section className="bg-white p-4 sm:p-10 lg:p-14 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-8 sm:mb-12 pb-4 border-b border-slate-200">
                      {projectMode === 'business' ? 'Evolução Mensal (Faturamento)' : 'Evolução da Receita'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {analyticsData.historicoMensal.filter(h => h.faturamento > 0).slice(-4).map((h, idx, filteredArr) => {
                        const prev = filteredArr[idx - 1];
                        const diff = prev && prev.faturamento > 0 ? ((h.faturamento - prev.faturamento) / prev.faturamento) * 100 : 0;
                        return (
                          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{h.nome}</span>
                              {idx > 0 && diff !== 0 && (
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${diff > 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                  {diff > 0 ? '+' : ''}{diff.toFixed(0)}%
                                </span>
                              )}
                            </div>
                            <p className="text-xl font-black text-slate-800 tracking-tight">{formatMoeda(h.faturamento)}</p>
                            <div className="mt-4 h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (h.faturamento / metaCalculadaPelaProjecao) * 100)}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                      {analyticsData.historicoMensal.filter(h => h.faturamento > 0).length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-300 text-[10px] font-bold uppercase tracking-widest border-2 border-dashed border-slate-200 rounded-3xl">Sem dados históricos suficientes</div>
                      )}
                    </div>
                  </section>

                  <section className="bg-white p-4 sm:p-10 lg:p-14 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-8 sm:mb-12 pb-4 border-b border-slate-200">Detalhamento de Gastos</h3>
                    <div className="space-y-6">
                      {[
                        { label: 'Custos Fixos', val: totalFixos, color: 'bg-indigo-500', icon: <Lock size={14} />, desc: 'Aluguel, luz, internet...' },
                        { label: 'Custos Variáveis', val: totalVariaveis, color: 'bg-rose-500', icon: <TrendingDown size={14} />, desc: 'Produtos, materiais, taxas...' }
                      ].map((g, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl ${g.color} text-white shadow-sm`}>{g.icon}</div>
                              <div>
                                <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider">{g.label}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase">{g.desc}</p>
                              </div>
                            </div>
                            <p className="text-lg font-black text-slate-800 tracking-tight">{formatMoeda(g.val)}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                              <div className={`h-full ${g.color} rounded-full transition-all duration-1000`} style={{ width: `${totalReceitas > 0 ? Math.min(100, (g.val / totalReceitas) * 100) : 0}%` }}></div>
                            </div>
                            <span className="text-[9px] font-black text-slate-400 w-10 text-right">{totalReceitas > 0 ? ((g.val / totalReceitas) * 100).toFixed(0) : 0}%</span>
                          </div>
                          <p className="text-[8px] font-bold text-slate-400 uppercase mt-2">Impacto no faturamento</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* DESEMPENHO SEMANAL SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16">
                  <section className="lg:col-span-8 bg-white p-4 sm:p-10 lg:p-14 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 sm:mb-10 pb-4 sm:pb-6 border-b border-slate-200">Desempenho Semanal</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                      {analyticsData.semanas.map((s, idx) => (
                        <div key={idx} className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-100 hover:shadow-md transition-all">
                          <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase mb-3 sm:mb-4">{s.nome}</p>
                          <div className="flex justify-between items-center gap-2">
                            <div className="min-w-0">
                              <p className="text-[8px] sm:text-[9px] font-bold text-slate-300 uppercase truncate">Faturamento</p>
                              <p className="text-base sm:text-lg font-black text-slate-800 truncate">{formatMoeda(s.faturamento)}</p>
                            </div>
                            <div className="text-right min-w-0">
                              <p className="text-[8px] sm:text-[9px] font-bold text-slate-300 uppercase truncate">Lucro</p>
                              <p className={`text-base sm:text-lg font-black truncate ${s.lucro >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatMoeda(s.lucro)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* SIDEBARS */}
                  <div className="lg:col-span-4 flex flex-col gap-6 sm:gap-10">
                    <div className="flex-1 bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center shadow-sm">
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 sm:mb-4">Gasto Fixo Acumulado</p>
                      <p className="text-2xl sm:text-3xl font-black text-rose-500">{formatMoeda(totalFixos)}</p>
                    </div>
                    <div className="flex-1 bg-slate-900 p-6 sm:p-10 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center shadow-xl">
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 sm:mb-4 text-white/50">Eficiência</p>
                      <p className="text-2xl sm:text-3xl font-black text-white">{((totalReceitas / (totalDespesas || 1)) * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>

                {/* BACK BUTTON */}
                <div className="pt-4 px-4 sm:px-0">
                  <button onClick={() => setCurrentView('dashboard')} className="w-full py-4 sm:py-5 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-extrabold uppercase text-[10px] sm:text-xs tracking-widest shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98]">Voltar para o Painel</button>
                </div>
              </div>
            )}
            {currentView === 'dashboard' && (
              <main className="animate-fadeIn space-y-8 sm:space-y-10 lg:space-y-14">
                {/* Banner de Lembrete de Amanhã */}
                {projectMode === 'business' && agendamentosAmanha.length > 0 && (
                  <div className="bg-slate-900 p-5 rounded-2xl sm:rounded-3xl flex items-center justify-between text-white shadow-xl border border-white/10 overflow-hidden relative group transition-all hover:scale-[1.01]">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Bell size={80} /></div>
                    <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/5"><Bell size={24} className="animate-pulse" /></div>
                      <div>
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">Dica da Antigravity</p>
                        <p className="text-sm sm:text-lg font-extrabold tracking-tight">Você tem {agendamentosAmanha.length} atendimentos para amanhã!</p>
                      </div>
                    </div>
                    <button onClick={() => setCurrentView('agenda')} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all relative z-10 shadow-lg">Ver Agenda</button>
                  </div>
                )}

                <section className="rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[3rem] p-5 sm:p-10 lg:p-20 text-white shadow-2xl relative overflow-hidden group transition-all" style={{ background: `linear-gradient(135deg, ${appColor}, ${appColor}EE)` }}>
                  <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none"><Activity size={120} className="sm:size-[280px]" /></div>
                  <div className="relative z-10 text-center">
                    <p className="text-[10px] sm:text-xs lg:text-base font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-80 mb-3 sm:mb-4 animate-fadeIn">Bem-vinda(o), {userName}</p>
                    <h1 className="text-xl sm:text-3xl lg:text-5xl font-extrabold uppercase tracking-tighter mb-6 sm:mb-10 leading-tight">{appName}</h1>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                      <div className="flex items-center gap-3 sm:gap-4 lg:gap-8 order-2 sm:order-1">
                        <button onClick={() => setMesAtual(mesAtual > 0 ? mesAtual - 1 : 11)} className="p-3 sm:p-4 bg-white/10 hover:bg-white/20 rounded-xl sm:rounded-2xl border border-white/20 transition-all active:scale-90 backdrop-blur-sm"><ChevronLeft size={20} className="sm:size-[24px]" /></button>
                        <div className="bg-white/15 px-6 sm:px-10 py-3 sm:py-4 rounded-2xl sm:rounded-3xl border border-white/30 backdrop-blur-md shadow-xl min-w-[140px] sm:min-w-[200px]"><span className="text-sm sm:text-xl lg:text-3xl font-extrabold tracking-widest uppercase">{meses[mesAtual]}</span></div>
                        <button onClick={() => setMesAtual(mesAtual < 11 ? mesAtual + 1 : 0)} className="p-3 sm:p-4 bg-white/10 hover:bg-white/20 rounded-xl sm:rounded-2xl border border-white/20 transition-all active:scale-90 backdrop-blur-sm"><ChevronRight size={20} className="sm:size-[24px]" /></button>
                      </div>

                      <button
                        onClick={handleGenerateInsight}
                        className={`order-1 sm:order-2 px-8 py-5 text-white rounded-[2rem] font-black uppercase text-[11px] sm:text-xs tracking-widest shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(255,255,255,0.1)] transition-all flex items-center gap-3 border backdrop-blur-xl relative group overflow-hidden ${isAdmin ? 'bg-white/10 border-white/20 cursor-pointer active:scale-95' : 'bg-slate-900/40 border-white/5 cursor-not-allowed opacity-50'}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative flex items-center gap-3">
                          {isAdmin ? <Sparkles size={20} className="animate-pulse" /> : <Lock size={16} />}
                          <span className="relative z-10">{isAdmin ? "Consultoria Estratégica" : "Consultoria (Em breve)"}</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </section>

                {/* Seção Agenda de Hoje */}
                {projectMode === 'business' && (
                  <section className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-3"><div className="p-1.5 sm:p-2 bg-indigo-50 rounded-lg text-indigo-500"><Calendar size={18} className="sm:size-[20px]" /></div>Agenda de Hoje</h2>
                      <button onClick={() => setCurrentView('agenda')} className="text-[9px] sm:text-[10px] font-bold text-indigo-500 uppercase tracking-widest hover:underline">Ver Completa</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {agendamentos.filter(a => {
                        const today = new Date().toISOString().split('T')[0];
                        const agDate = new Date(a.dataInicio).toISOString().split('T')[0];
                        return agDate === today;
                      }).sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()).map(ag => (
                        <div
                          key={ag.id}
                          onClick={() => handleUpdateAgendamento({
                            ...ag,
                            status: (ag.status === 'Agendado' || !ag.status) ? 'Atendido' : ag.status === 'Atendido' ? 'Cancelado' : 'Agendado'
                          })}
                          className={`flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:shadow-md transition-all cursor-pointer group ${ag.status === 'Cancelado' ? 'opacity-50 grayscale' : ''}`}
                        >
                          <div className="p-3 bg-white rounded-lg text-slate-900 font-black text-xs border border-slate-100 shadow-sm flex flex-col items-center">
                            {new Date(ag.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-800 text-sm truncate uppercase">{ag.cliente}</p>
                            <p className="text-xs text-slate-400 font-semibold truncate">{ag.servico}</p>
                          </div>
                          <div className="flex flex-col items-end min-w-[70px]">
                            {ag.status === 'Atendido' || (ag.formaPagamento && (!ag.status || ag.status === 'Agendado')) ? (
                              <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wide">ATENDIDO</span>
                            ) : ag.status === 'Cancelado' ? (
                              <span className="px-2 py-1 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold uppercase tracking-wide">CANCELADO</span>
                            ) : (
                              <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-600 text-[10px] font-bold uppercase tracking-wide">AGENDADO</span>
                            )}
                          </div>
                        </div>
                      ))}
                      {agendamentos.filter(a => new Date(a.dataInicio).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]).length === 0 && (
                        <div className="col-span-full py-8 text-center text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          Nenhum cliente agendado para hoje (ainda!)
                        </div>
                      )}
                    </div>
                  </section>
                )}

                <section className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-12 border border-slate-100 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sm:mb-10 gap-6">
                    <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-3 sm:gap-4"><div className="p-1.5 sm:p-2 bg-amber-50 rounded-lg text-amber-500"><Target size={18} className="sm:size-[20px]" /></div>Metas Mensais</h2>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <button onClick={() => setModalMetas(true)} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase transition-all shadow-sm"><Settings size={14} /> Definir Metas</button>
                      <div className="flex gap-1.5 sm:gap-2 p-1 bg-slate-50 rounded-xl">
                        {[10, 25, 50, 100].map(p => (
                          <button key={p} onClick={() => setProjecaoSelecionada(p)} className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-bold transition-all ${projecaoSelecionada === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>+{p}%</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[
                      { label: 'Alvo Faturamento', valor: metaCalculadaPelaProjecao, color: appColor },
                      { label: 'Lucro Alvo', valor: metas.lucroLiquido, color: '#3b82f6' },
                      { label: 'Limite Gastos', valor: metas.gastosFixos, color: '#ef4444' },
                      { label: 'Margem Alvo', valor: `${metas.margemDesejada}%`, color: '#8b5cf6' }
                    ].map((m, idx) => (
                      <div key={idx} className="p-4 sm:p-6 bg-slate-50/50 rounded-xl sm:rounded-2xl border border-slate-100 hover:shadow-md transition-all">
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">{m.label}</p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-extrabold text-slate-800 break-all" style={{ color: idx === 0 ? m.color : '' }}>{typeof m.valor === 'number' ? formatMoeda(m.valor) : m.valor}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                  <div className="lg:col-span-8 bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4 relative z-10">
                      <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest flex items-center gap-3"><BarChart size={18} className="text-indigo-400 sm:size-[20px]" /> Performance Financeira</h2>
                      <span className="text-[10px] sm:text-xs font-bold px-4 py-1.5 rounded-full bg-white/10" style={{ color: appColor }}>{formatMoeda(lucroReal)} Lucro</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 relative z-10">
                      <div className="p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5">
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase mb-1">Entradas</p>
                        <p className="text-lg sm:text-xl font-extrabold text-emerald-400">{formatMoeda(totalReceitas)}</p>
                        <div className="mt-3 w-full bg-slate-800 h-1 rounded-full overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: `${percFaturamento}%` }}></div></div>
                      </div>
                      <div className="p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5">
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase mb-1">Saídas Totais</p>
                        <p className="text-lg sm:text-xl font-extrabold text-rose-400">{formatMoeda(totalDespesas)}</p>
                        <div className="mt-3 w-full bg-slate-800 h-1 rounded-full overflow-hidden"><div className="h-full bg-rose-400" style={{ width: `${Math.min(100, (totalDespesas / (totalReceitas || 1)) * 100)}%` }}></div></div>
                      </div>
                      <div className="p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5">
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase mb-1">Mês Anterior</p>
                        <p className="text-lg sm:text-xl font-extrabold text-slate-400">{formatMoeda(totalReceitasAnterior)}</p>
                        <p className="mt-2 text-[8px] sm:text-[9px] text-indigo-400 font-bold">PROJEÇÃO: +{projecaoSelecionada}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col">
                    <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase mb-6 sm:mb-8 flex items-center gap-3"><Receipt size={18} className="text-rose-500 sm:size-[20px]" /> Gastos Fixos</h2>
                    <div className="space-y-2 sm:space-y-3 flex-1 max-h-[240px] sm:max-h-[280px] overflow-y-auto custom-scrollbar pr-2">
                      {gastosFixos.map(g => (
                        <div key={g.id} className="flex justify-between items-center p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase">{g.nome}</span>
                          <span className="text-xs sm:text-sm font-extrabold text-slate-800">{formatMoeda(g.valor)}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setModalFixos(true)} className="mt-6 w-full py-3 sm:py-3.5 bg-slate-900 text-white rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all">Configurar Fixos</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8">
                  <section className="xl:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6 sm:mb-8">
                      <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase flex items-center gap-3"><PiggyBank size={18} className="text-pink-500 sm:size-[20px]" /> Objetivos e Sonhos</h2>
                      <button onClick={() => setModalSonhos(true)} className="text-[9px] sm:text-[10px] font-bold text-pink-500 uppercase tracking-widest hover:underline">Novo Sonho</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {sonhos.map(s => (
                        <div key={s.id} className="p-4 sm:p-5 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 relative group flex flex-col h-full">
                          <button onClick={() => setSonhos(prev => prev.filter(x => x.id !== s.id))} className="absolute top-3 right-3 text-slate-300 hover:text-rose-500 transition-colors z-10"><X size={14} /></button>

                          <div className="mb-4">
                            <div className="flex justify-between items-start mb-1 pr-6">
                              <p className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase leading-tight">{s.nome}</p>
                            </div>
                            <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase">
                              <Target size={12} />
                              <span>Meta: {meses[s.prazoMes]} / {s.prazoAno}</span>
                            </div>
                          </div>

                          <div className="mt-auto">
                            <div className="flex justify-between items-end mb-1.5">
                              <div className="flex flex-col">
                                <span className="text-[8px] font-bold text-slate-400 uppercase">Juntado</span>
                                <span className="text-xs font-black text-pink-500">{formatMoeda(s.juntado)}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-[8px] font-bold text-slate-400 uppercase">Total</span>
                                <span className="text-xs font-black text-slate-600">{formatMoeda(s.valorTotal)}</span>
                              </div>
                            </div>

                            <div className="w-full bg-slate-200 h-2 rounded-full mb-4 overflow-hidden shadow-inner">
                              <div className="h-full bg-pink-500 transition-all duration-1000 relative" style={{ width: `${Math.min(100, (s.juntado / (s.valorTotal || 1)) * 100)}%` }}>
                                <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <input type="text" placeholder="Aporte..." value={inputAportes[s.id] || ''} onChange={e => setInputAportes({ ...inputAportes, [s.id]: e.target.value })} className="flex-1 bg-white p-2.5 rounded-lg text-xs font-bold border border-slate-200 outline-none focus:border-pink-200 transition-colors" />
                              <button onClick={() => adicionarAporteSonho(s.id)} className="px-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all shadow-sm active:scale-95"><ArrowRight size={16} /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {projectMode === 'business' && (
                    <div className="xl:col-span-5 flex flex-col gap-4 sm:gap-6">
                      <section className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm flex-1">
                        <div className="flex justify-between items-center mb-4 sm:mb-5">
                          <h2 className="text-[9px] sm:text-[10px] font-extrabold text-slate-800 uppercase flex items-center gap-2"><Star size={14} className="text-indigo-500" /> Procedimentos Top</h2>
                          <button onClick={() => setModalNovoServico(true)} className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-500 transition-all"><Plus size={12} /></button>
                        </div>
                        <div className="space-y-1.5">
                          {topServicos.map(([nome, valor], i) => (
                            <div key={i} className="flex justify-between items-center p-2.5 sm:p-3 bg-slate-50/50 rounded-xl border border-slate-100/50 hover:bg-white transition-all">
                              <div className="flex items-center gap-2 sm:gap-3 shrink-0"><span className="text-[9px] font-bold text-slate-300">#{i + 1}</span><span className="text-[10px] font-bold text-slate-600 uppercase truncate max-w-[120px] sm:max-w-[140px]">{nome}</span></div>
                              <span className="text-[10px] sm:text-[11px] font-extrabold text-indigo-600">{formatMoeda(valor as number)}</span>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm flex-1">
                        <div className="flex justify-between items-center mb-4 sm:mb-5">
                          <h2 className="text-[9px] sm:text-[10px] font-extrabold text-slate-800 uppercase flex items-center gap-2"><Users size={14} className="text-amber-500" /> Clientes VIP</h2>
                        </div>
                        <div className="space-y-1.5">
                          {topClientes.map(([nome, valor], i) => (
                            <div key={i} className="flex justify-between items-center p-2.5 sm:p-3 bg-slate-50/50 rounded-xl border border-slate-100/50 hover:bg-white transition-all">
                              <div className="flex items-center gap-2 sm:gap-3 shrink-0"><span className="text-[9px] font-bold text-slate-300">#{i + 1}</span><span className="text-[10px] font-bold text-slate-600 uppercase truncate max-w-[120px] sm:max-w-[140px]">{nome}</span></div>
                              <span className="text-[10px] sm:text-[11px] font-extrabold text-amber-600">{formatMoeda(valor as number)}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  )}

                  {projectMode === 'personal' && (
                    <div className="xl:col-span-5 flex flex-col gap-4 sm:gap-6">
                      <section className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-[9px] sm:text-[10px] font-extrabold text-slate-800 uppercase flex items-center gap-2"><LucidePieChart size={14} className="text-pink-500" /> Distribuição de Gastos</h2>
                        </div>
                        <div className="flex-1 min-h-[220px] flex items-center justify-center">
                          {analyticsData.despesasPorCategoria.length > 0 ? (
                            <div className="flex flex-col h-full">
                              <div className="flex-1 min-h-[180px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={analyticsData.despesasPorCategoria}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={50}
                                      outerRadius={70}
                                      paddingAngle={5}
                                      dataKey="value"
                                    >
                                      {analyticsData.despesasPorCategoria.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'][index % 6]} />
                                      ))}
                                    </Pie>
                                    <Tooltip
                                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
                                      formatter={(value: number) => formatMoeda(value)}
                                    />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="mt-4 space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">Ranking de Gastos</p>
                                {[...analyticsData.despesasPorCategoria].sort((a, b) => b.value - a.value).map((cat, i) => (
                                  <div key={i} className="flex justify-between items-center text-[10px] font-bold py-1">
                                    <div className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'][i % 6] }}></div>
                                      <span className="text-slate-600 uppercase">{cat.name}</span>
                                    </div>
                                    <span className="text-slate-900">{formatMoeda(cat.value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center space-y-2 py-8">
                              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Nenhum gasto lançado</p>
                              <p className="text-[8px] text-slate-400 font-medium italic">Lance uma despesa para ver o gráfico e o ranking</p>
                            </div>
                          )}
                        </div>
                      </section>

                      <section className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl sm:rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><ArrowUpRight size={80} /></div>
                        <div className="relative z-10">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Ação Rápida</p>
                          <h3 className="text-lg font-black mb-4">Transferir Pró-labore</h3>
                          <p className="text-[10px] opacity-90 mb-6 leading-relaxed">Retire um valor do caixa da clínica para sua conta pessoal de forma organizada.</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const v = prompt('Qual valor deseja retirar da clínica?');
                                if (v) handleRetiradaProLabore(parseFloat(v.replace(',', '.')));
                              }}
                              className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md"
                            >
                              Retirar Agora
                            </button>
                          </div>
                        </div>
                      </section>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 items-stretch">
                  {Object.entries(pagamentosResumo).map(([tipo, valor], i) => (
                    <div key={i} className="p-4 bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md transition-all group">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0 transition-transform group-hover:scale-110"><CreditCard size={18} /></div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate">{tipo}</p>
                        <p className="text-sm font-extrabold text-slate-800 truncate">{formatMoeda(valor as number)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6" id="section-lancamentos">
                  <section className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:scale-110 transition-transform"><Plus size={80} /></div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-tighter mb-4 flex items-center gap-2 relative z-10">
                      <Plus size={16} className="text-emerald-500" />
                      {projectMode === 'business' ? 'Lançar Receita' : 'Lançar Entrada'}
                    </h3>
                    <form onSubmit={handleAddReceita} className="space-y-3 relative z-10">
                      <div className="grid grid-cols-2 gap-3">
                        <input type="date" value={formReceita.data} onChange={e => setFormReceita({ ...formReceita, data: e.target.value })} className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-bold text-[11px] uppercase text-slate-500" required />
                        <input
                          type="text"
                          placeholder={projectMode === 'business' ? 'CLIENTE' : 'ORIGEM / DESCRIÇÃO'}
                          value={formReceita.cliente}
                          onChange={e => setFormReceita({ ...formReceita, cliente: e.target.value.toUpperCase() })}
                          className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-bold text-[11px] uppercase"
                          required
                        />
                      </div>
                      {projectMode === 'business' ? (
                        <select value={formReceita.procedimento} onChange={e => setFormReceita({ ...formReceita, procedimento: e.target.value })} className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-bold text-[11px] uppercase text-slate-500" required>
                          <option value="">Selecione o Procedimento...</option>
                          {servicos.map(s => <option key={s.id} value={s.nome}>{s.nome} - {formatMoeda(s.valor)}</option>)}
                        </select>
                      ) : (
                        <select
                          value={formReceita.procedimento}
                          onChange={e => setFormReceita({ ...formReceita, procedimento: e.target.value })}
                          className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-bold text-[11px] uppercase text-slate-500"
                          required
                        >
                          <option value="">Selecione a Categoria...</option>
                          {CATEGORIAS_RECEITA_PESSOAL.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="VALOR (R$)" value={formReceita.valor} onChange={e => setFormReceita({ ...formReceita, valor: e.target.value })} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-bold text-[11px]" required />
                        <div className="flex gap-1.5">
                          {['Pix', 'Cartão', 'Dinheiro'].map(f => (
                            <button key={f} type="button" onClick={() => setFormReceita({ ...formReceita, formaPagamento: f as any })} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all border ${formReceita.formaPagamento === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}>{f}</button>
                          ))}
                        </div>
                      </div>
                      <button type="submit" className="w-full py-3 bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.15em] shadow-lg hover:scale-[1.01] transition-all">Salvar Entrada</button>
                    </form>
                  </section>

                  <section className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:scale-110 transition-transform"><TrendingDown size={80} /></div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-tighter mb-4 flex items-center gap-2 relative z-10">
                      <TrendingDown size={16} className="text-rose-500" />
                      {projectMode === 'business' ? 'Lançar Despesa' : 'Lançar Saída'}
                    </h3>
                    <form onSubmit={handleAddDespesa} className="space-y-3 relative z-10">
                      <div className="grid grid-cols-2 gap-3">
                        <input type="date" value={formDespesa.data} onChange={e => setFormDespesa({ ...formDespesa, data: e.target.value })} className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-bold text-[11px] uppercase text-slate-500" required />
                        {projectMode === 'business' ? (
                          <input type="text" placeholder="DESCRIÇÃO" value={formDespesa.descricao} onChange={e => setFormDespesa({ ...formDespesa, descricao: e.target.value.toUpperCase() })} className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-bold text-[11px] uppercase" required />
                        ) : (
                          <select
                            value={formDespesa.descricao}
                            onChange={e => setFormDespesa({ ...formDespesa, descricao: e.target.value })}
                            className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-bold text-[11px] uppercase text-slate-500"
                            required
                          >
                            <option value="">Selecione a Categoria...</option>
                            {CATEGORIAS_PESSOAIS.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="VALOR (R$)" value={formDespesa.valor} onChange={e => setFormDespesa({ ...formDespesa, valor: e.target.value })} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-bold text-[11px]" required />
                        <div className="flex gap-1.5">
                          {['Pix', 'Cartão', 'Dinheiro'].map(f => (
                            <button key={f} type="button" onClick={() => setFormDespesa({ ...formDespesa, formaPagamento: f as any })} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all border ${formDespesa.formaPagamento === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}>{f}</button>
                          ))}
                        </div>
                      </div>
                      <button type="submit" className="w-full py-3 bg-rose-500 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.15em] shadow-lg hover:scale-[1.01] transition-all">Salvar Saída</button>
                    </form>
                  </section>
                </div>


                <section className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm animate-fadeIn">
                  <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><History size={18} /></div>
                    Histórico do Mês
                  </h2>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                    {(() => {
                      try {
                        const listaReceitas = Array.isArray(receitasFiltradas) ? receitasFiltradas : [];
                        const listaDespesas = Array.isArray(despesasFiltradas) ? despesasFiltradas : [];
                        const todasFull = [
                          ...listaReceitas.map(r => ({ ...r, tipo: 'receita' as const })),
                          ...listaDespesas.map(d => ({ ...d, tipo: 'despesa' as const }))
                        ];

                        // Mostra as últimas 15 transações de todo o histórico, priorizando recência absoluta
                        const todas = todasFull
                          .filter(item => item && item.data)
                          .sort((a, b) => b.id - a.id)
                          .slice(0, 15);

                        if (todas.length === 0) {
                          return (
                            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Nenhuma transação neste mês ainda.</p>
                            </div>
                          );
                        }

                        return todas
                          .filter(item => item && item.data)
                          .sort((a, b) => b.id - a.id)
                          .map((item: any) => (
                            <div key={`${item.tipo}-${item.id}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white transition-colors group">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`p-1.5 rounded-lg shrink-0 ${item.tipo === 'receita' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                  {item.tipo === 'receita' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[11px] font-bold text-slate-800 uppercase truncate">
                                    {item.tipo === 'receita' ? (item.cliente || 'Entrada') : (item.descricao || 'Saída')}
                                  </p>
                                  <p className="text-[9px] font-semibold text-slate-400 truncate">
                                    {new Date(item.data + 'T12:00:00').toLocaleDateString('pt-BR')} {item.tipo === 'receita' && item.procedimento ? `• ${item.procedimento}` : ''}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-xs font-black ${item.tipo === 'receita' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {item.tipo === 'receita' ? '+' : '-'}{formatMoeda(item.valor || 0)}
                                </span>
                                <button
                                  onClick={() => {
                                    if (confirm('Remover esta transação?')) {
                                      if (item.tipo === 'receita') {
                                        setReceitas(prev => prev.filter(r => r.id !== item.id));
                                      } else {
                                        setDespesasVariaveis(prev => prev.filter(d => d.id !== item.id));
                                      }
                                    }
                                  }}
                                  className="p-1 text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ));
                      } catch (error) {
                        return <div className="text-[10px] text-rose-500 font-bold p-4">Erro ao carregar histórico</div>;
                      }
                    })()}
                  </div>
                </section>

                <section className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-12 border border-slate-100 shadow-sm animate-fadeIn">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-4"><div className="p-2 bg-indigo-50 rounded-lg text-indigo-500"><Lightbulb size={20} /></div>Insights & Sugestões</h2>
                    <div className="px-5 py-2.5 bg-slate-50 rounded-full border border-slate-100 flex items-center gap-3 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Análise de IA Ativa</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100/50 hover:bg-white transition-all group">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Saúde Financeira</p>
                      <div className="flex items-end gap-3 mb-6">
                        <span className="text-3xl font-black text-indigo-600 tracking-tighter">{percFaturamento.toFixed(0)}%</span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase mb-1.5 whitespace-nowrap">da Meta</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2 shadow-inner"><div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${percFaturamento}%` }}></div></div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{percFaturamento >= 100 ? 'Meta Superada!' : 'Continue evoluindo'}</p>
                    </div>
                    <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100/50 hover:bg-white transition-all">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Realização</p>
                      <div className="flex items-end gap-3 mb-6"><span className="text-3xl font-black text-emerald-600 tracking-tighter">92%</span><span className="text-[10px] font-bold text-slate-300 uppercase mb-1.5">Probabilidade</span></div>
                      <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">Com base no ritmo atual, você atingirá o faturamento alvo em 24 dias.</p>
                    </div>
                    {projectMode === 'business' && (
                      <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100/50 hover:bg-white transition-all">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Top Produto</p>
                        <div className="flex items-center gap-4 mb-6"><div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-amber-500"><Trophy size={20} /></div><div className="min-w-0"><p className="text-sm font-black text-slate-800 uppercase truncate">{topServicos[0]?.[0] || 'Nenhum'}</p></div></div>
                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">Este serviço representa a maior parte da sua receita este mês.</p>
                      </div>
                    )}
                    <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl group overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Target size={80} /></div>
                      <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4 relative z-10">Dica Estratégica</p>
                      <p className="text-[11px] font-bold text-white leading-relaxed relative z-10">Sua margem atual está em 68%. Tente reduzir gastos fixos em 10% para maximizar o lucro.</p>
                    </div>
                  </div>
                </section>
              </main>
            )}
          </div>
        )}

        {/* MODALS UNIFICADOS */}
        {/* MODALS AND SIDEBAR */}
        {[
          {
            isOpen: modalMetas, setOpen: setModalMetas, title: 'Definir Metas', content: (
              <div className="space-y-4 sm:space-y-6">
                {[
                  { label: 'Faturamento Alvo', key: 'faturamento' as keyof MetasFinanceiras },
                  { label: 'Gasto Fixo Limite', key: 'gastosFixos' as keyof MetasFinanceiras },
                  { label: 'Lucro Desejado', key: 'lucroLiquido' as keyof MetasFinanceiras },
                  { label: 'Margem %', key: 'margemDesejada' as keyof MetasFinanceiras }
                ].map((m, i) => (
                  <div key={i}>
                    <label className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-400 ml-1 mb-2 block">{m.label}</label>
                    <input
                      type="number"
                      value={metas[m.key]}
                      onChange={e => setMetas(prev => ({ ...prev, [m.key]: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-slate-50 p-3 sm:p-4 rounded-xl font-bold border border-slate-200 outline-none text-sm"
                    />
                  </div>
                ))}
                <button onClick={() => setModalMetas(false)} className="w-full text-white py-3.5 sm:py-4 rounded-xl font-bold uppercase text-[10px] sm:text-xs tracking-widest mt-4 sm:mt-6" style={{ backgroundColor: appColor }}>Salvar Alterações</button>
              </div>
            )
          },
          {
            isOpen: modalFixos, setOpen: setModalFixos, title: 'Gastos Fixos', content: (
              <div className="space-y-6 sm:space-y-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Gastos Cadastrados</p>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {gastosFixosFiltrados.length > 0 ? (
                      gastosFixosFiltrados.map((g, idx) => (
                        <div key={g.id} className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500 ml-1">{g.nome}</label>
                            <button
                              onClick={() => setGastosFixos(prev => prev.filter(item => item.id !== g.id))}
                              className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <input
                            type="number"
                            value={g.valor}
                            onChange={e => setGastosFixos(prev => prev.map((item) => item.id === g.id ? { ...item, valor: parseFloat(e.target.value) || 0 } : item))}
                            className="w-full bg-white p-2.5 rounded-lg font-bold border border-slate-200 outline-none text-sm"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Nenhum gasto fixo cadastrado para este modo</p>
                        <button
                          onClick={() => {
                            const defaults = [
                              { id: 'p1' + Date.now(), nome: 'ALUGUEL', valor: 0, isPadrao: true, mode: projectMode },
                              { id: 'p2' + Date.now(), nome: 'LUZ / ÁGUA', valor: 0, isPadrao: true, mode: projectMode },
                              { id: 'p3' + Date.now(), nome: 'INTERNET', valor: 0, isPadrao: true, mode: projectMode }
                            ];
                            setGastosFixos(prev => [...prev, ...defaults]);
                          }}
                          className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-indigo-100 transition-all"
                        >
                          + Adicionar Sugestões Base
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-4">Adicionar Novo Gasto Fixo</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 mb-1 block">Nome do Gasto</label>
                      <input
                        type="text"
                        value={formNovoGastoFixo.nome}
                        onChange={e => setFormNovoGastoFixo({ ...formNovoGastoFixo, nome: e.target.value.toUpperCase() })}
                        className="w-full bg-slate-50 p-3 rounded-xl font-bold border border-slate-200 outline-none text-sm uppercase"
                        placeholder="Ex: Aluguel"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 mb-1 block">Valor (R$)</label>
                      <input
                        type="number"
                        value={formNovoGastoFixo.valor}
                        onChange={e => setFormNovoGastoFixo({ ...formNovoGastoFixo, valor: e.target.value })}
                        className="w-full bg-slate-50 p-3 rounded-xl font-bold border border-slate-200 outline-none text-sm"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!formNovoGastoFixo.nome) return;
                      const novo: GastoFixo = {
                        id: Date.now().toString(),
                        nome: formNovoGastoFixo.nome,
                        valor: parseFloat(formNovoGastoFixo.valor) || 0,
                        isPadrao: false,
                        mode: projectMode
                      };
                      setGastosFixos(prev => [...prev, novo]);
                      setFormNovoGastoFixo({ nome: '', valor: '' });
                    }}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Adicionar Gasto
                  </button>
                </div>

                <div className="pt-4">
                  <button onClick={() => setModalFixos(false)} className="w-full text-white py-3.5 sm:py-4 rounded-xl font-bold uppercase text-[10px] sm:text-xs tracking-widest shadow-lg" style={{ backgroundColor: appColor }}>Fechar e Salvar</button>
                </div>
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
                {/* Add New Service Form */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const nome = fd.get('nome') as string;
                  const valor = parseFloat(fd.get('valor') as string) || 0;
                  setServicos((prev) => [...prev, { id: Date.now().toString(), nome, valor }]);
                  // Reset form
                  e.currentTarget.reset();
                }} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Adicionar Novo</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input name="nome" placeholder="Nome do Procedimento" required className="w-full bg-white p-3 rounded-xl font-bold border border-slate-200 outline-none text-sm uppercase" />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">R$</span>
                      <input name="valor" type="number" step="0.01" placeholder="0,00" required className="w-full bg-white p-3 pl-8 rounded-xl font-bold border border-slate-200 outline-none text-sm" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"><Plus size={14} /> Adicionar</button>
                </form>

                {/* List of Services */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Serviços Cadastrados</p>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
                    {servicos.map(s => (
                      <div key={s.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-all group">
                        <div>
                          <p className="text-xs font-extrabold text-slate-800 uppercase">{s.nome}</p>
                          <p className="text-[10px] font-bold text-emerald-500">{formatMoeda(s.valor)}</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => {
                            const novoNome = prompt('Novo nome do serviço:', s.nome);
                            const novoValor = prompt('Novo valor (R$):', s.valor.toString());
                            if (novoNome && novoValor) {
                              setServicos(prev => prev.map(item => item.id === s.id ? { ...item, nome: novoNome, valor: parseFloat(novoValor) || 0 } : item));
                            }
                          }} className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg"><Settings size={14} /></button>
                          <button onClick={() => {
                            if (confirm('Tem certeza que deseja remover este serviço?')) {
                              setServicos(prev => prev.filter(item => item.id !== s.id));
                            }
                          }} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          },
          {
            isOpen: modalConfig, setOpen: setModalConfig, title: 'Configurações', content: (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 mb-2 block">Modo de Uso</label>
                  <div className="p-1 bg-slate-100 rounded-xl flex gap-1 border border-slate-100 shadow-inner">
                    <button
                      onClick={() => { setProjectMode('business'); localStorage.setItem('projectMode', 'business'); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${projectMode === 'business' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Users size={14} /> Profissional
                    </button>
                    <button
                      onClick={() => { setProjectMode('personal'); localStorage.setItem('projectMode', 'personal'); setCurrentView('dashboard'); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${projectMode === 'personal' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Star size={14} /> Pessoal
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 mb-2 block">Nome da Unidade</label>
                  <input type="text" value={appName} onChange={e => setAppName(e.target.value)} className="w-full bg-slate-50 p-3.5 sm:p-4 rounded-xl font-bold border border-slate-200 outline-none text-sm" placeholder="Nome da Unidade" />
                </div>

                <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <input type="color" value={appColor} onChange={e => setAppColor(e.target.value)} className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl cursor-pointer border-none bg-transparent" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-widest">Paleta de Cores do App</span>
                </div>
                <button onClick={() => setModalConfig(false)} className="w-full text-white py-3.5 sm:py-4 rounded-xl font-bold uppercase text-[10px] sm:text-xs tracking-widest shadow-lg active:scale-[0.98] transition-all" style={{ backgroundColor: appColor }}>Salvar e Aplicar</button>
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
            isOpen: modalIA, setOpen: setModalIA, title: 'Consultoria Estratégica IA', content: (
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {isAILoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Analisando seus dados...</p>
                  </div>
                ) : (
                  <div className="prose prose-slate max-w-none">
                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-500 text-white rounded-lg shadow-lg">
                          <Lightbulb size={20} />
                        </div>
                        <h3 className="text-lg font-black text-indigo-900 uppercase tracking-tight">Insights do Consultor</h3>
                      </div>
                      <div className="text-slate-700 text-sm leading-relaxed prose prose-indigo prose-sm max-w-none font-medium font-outfit">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {aiResponse || "Carregando insights estratégicos..."}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <button
                      onClick={() => setModalIA(false)}
                      className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg hover:bg-slate-800 transition-all"
                    >
                      Entendido, obrigado!
                    </button>
                  </div>
                )}
              </div>
            )
          }
        ].map((modal, idx) => modal.isOpen && (
          <div key={idx} className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-lg p-6 sm:p-8 lg:p-12 rounded-[1.5rem] sm:rounded-[2rem] animate-scaleUp shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-6 sm:mb-10 border-b pb-4 sm:pb-6">
                <h2 className="text-base sm:text-xl font-extrabold uppercase text-slate-800">{modal.title}</h2>
                <button onClick={() => modal.setOpen(false)} className="p-2 text-slate-300 hover:text-slate-800 transition-all"><X size={20} /></button>
              </div>
              {modal.content}
            </div>
          </div>
        ))}

        {isSidebarOpen && (
          <div className="fixed inset-0 z-[400] bg-slate-950/40 backdrop-blur-sm animate-fadeIn" onClick={() => setIsSidebarOpen(false)}>
            <div className="absolute left-0 top-0 bottom-0 w-[260px] sm:w-[280px] bg-white p-6 sm:p-8 shadow-2xl flex flex-col border-r border-slate-100 animate-fadeInLeft" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white"><Activity size={18} /></div>
                  <span className="font-outfit font-black text-slate-900 text-sm tracking-tighter uppercase">{appName}</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="text-slate-300 hover:text-slate-900 transition-all"><X size={20} /></button>
              </div>

              {/* MODE TOGGLE */}
              <div className="mb-8 p-1 bg-slate-100 rounded-xl flex gap-1 border border-slate-100 shadow-inner">
                <button
                  onClick={() => { setProjectMode('business'); localStorage.setItem('projectMode', 'business'); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${projectMode === 'business' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Users size={12} /> Profissional
                </button>
                <button
                  onClick={() => { setProjectMode('personal'); localStorage.setItem('projectMode', 'personal'); setCurrentView('dashboard'); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${projectMode === 'personal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Star size={12} /> Pessoal
                </button>
              </div>

              <nav className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                <button onClick={() => { setCurrentView('dashboard'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-3.5 sm:p-4 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all ${currentView === 'dashboard' ? 'text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`} style={{ backgroundColor: currentView === 'dashboard' ? appColor : 'transparent' }}><LayoutDashboard size={18} /> Overview</button>

                {projectMode === 'business' && (
                  <>
                    <button onClick={() => { setCurrentView('agenda'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-3.5 sm:p-4 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all ${currentView === 'agenda' ? 'text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`} style={{ backgroundColor: currentView === 'agenda' ? appColor : 'transparent' }}><Calendar size={18} /> Agenda</button>
                    <button onClick={() => { setCurrentView('clientes'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-3.5 sm:p-4 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all ${currentView === 'clientes' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}><Users size={18} /> Clientes</button>
                    <button onClick={() => { setCurrentView('marketing'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-3.5 sm:p-4 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all ${currentView === 'marketing' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}><PartyPopper size={18} /> Marketing</button>
                  </>
                )}

                <button onClick={() => { setCurrentView('reports'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-3.5 sm:p-4 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all ${currentView === 'reports' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}><BarChart size={18} /> Analytics</button>
                <button onClick={() => { setModalConfig(true); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 p-3.5 sm:p-4 rounded-xl font-bold text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest hover:text-slate-600 hover:bg-slate-50"><Palette size={18} /> Estilo</button>

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
                <div className="pt-6 border-t mt-6">
                  <button onClick={() => { handleLogout(); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 p-3.5 sm:p-4 text-rose-500 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:bg-rose-50 transition-all"><Lock size={18} /> Sair</button>
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute >
  );

  return (
    <Routes>
      <Route path="/" element={isAppSubdomain ? DashboardContent : <LandingPage isAuthenticated={isAuthenticated} userEmail={userEmail} />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthScreen appName={appName} appColor={appColor} />} />
      <Route path="/app/*" element={isAppSubdomain ? <Navigate to="/" replace /> : DashboardContent} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;