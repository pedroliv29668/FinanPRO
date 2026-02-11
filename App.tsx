import React, { useState, useMemo, useEffect } from 'react';
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
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white font-black uppercase tracking-widest text-2xl text-center p-10">
      SISTEMA CARREGANDO... <br />
      <span className="text-xs font-bold mt-4 opacity-50">Isolando erro de tela branca</span>
    </div>
  );
};

export default App;