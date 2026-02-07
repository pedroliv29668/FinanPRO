
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Scissors, Plus, X, DollarSign, CreditCard, Trash, Settings } from 'lucide-react';
import { Agendamento, Cliente } from '../types';

interface CalendarViewProps {
    agendamentos: Agendamento[];
    onAddAgendamento: (agendamento: Omit<Agendamento, 'id'>) => void;
    onRemoveAgendamento: (id: number) => void;
    onUpdateAgendamento: (agendamento: Agendamento) => void;
    appColor: string;
    servicos: { id: string; nome: string; valor: number }[];
    clientes: Cliente[];
    onManageServices: () => void;
}

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 to 20:00

const CalendarView: React.FC<CalendarViewProps> = ({ agendamentos = [], onAddAgendamento, onRemoveAgendamento, onUpdateAgendamento, appColor, servicos = [], clientes = [], onManageServices }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAgendamento, setNewAgendamento] = useState({
        cliente: '',
        servico: '',
        data: '',
        hora: '',
        valor: '',
        formaPagamento: '',
        status: 'Agendado' as 'Agendado' | 'Atendido' | 'Cancelado',
        cor: '#6366f1',
        duracao: '60',
        statusPagamento: 'Pendente' as 'Pago' | 'Pendente'
    });
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

    // Generic navigation that handles both Week and Month modes
    const navigateDate = (direction: 'next' | 'prev') => {
        const newDate = new Date(currentDate);
        if (viewMode === 'week') {
            newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
            const newSelected = new Date(brandNewDate(newDate, selectedDate.getDay()));
            setSelectedDate(newSelected);
        } else {
            newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
            // When changing months, select the 1st of the new month
            const firstDay = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
            setSelectedDate(firstDay);
        }
        setCurrentDate(newDate);
    };

    // Calculate start of the week (Sunday) based on current reference date
    const startOfWeek = useMemo(() => {
        const d = new Date(currentDate);
        if (isNaN(d.getTime())) return new Date();
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    }, [currentDate]);

    // Generate days for the header strip
    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            return d;
        });
    }, [startOfWeek]);

    // Generate days for the Month Grid
    const monthDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];
        const startPadding = firstDay.getDay(); // 0 (Sun) to 6 (Sat)

        // Add padding days from previous month
        for (let i = 0; i < startPadding; i++) {
            days.push(null);
        }

        // Add actual days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    }, [currentDate]);

    const getAgendamentosForDate = (date: Date) => {
        if (!agendamentos) return [];
        return agendamentos.filter(a => {
            const aDate = new Date(a.dataInicio);
            return aDate.getDate() === date.getDate() &&
                aDate.getMonth() === date.getMonth() &&
                aDate.getFullYear() === date.getFullYear();
        });
    };

    function brandNewDate(base: Date, dayIndex: number) {
        const result = new Date(base);
        const currentDay = result.getDay();
        const distance = dayIndex - currentDay;
        result.setDate(result.getDate() + distance);
        return result;
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const datePart = newAgendamento.data; // YYYY-MM-DD
        const timePart = newAgendamento.hora; // HH:MM

        const startDateTime = new Date(`${datePart}T${timePart}`);
        const endDateTime = new Date(startDateTime.getTime() + parseInt(newAgendamento.duracao) * 60000);

        onAddAgendamento({
            cliente: newAgendamento.cliente,
            servico: newAgendamento.servico,
            dataInicio: startDateTime.toISOString(),
            dataFim: endDateTime.toISOString(),
            valor: parseFloat(newAgendamento.valor) || 0,
            formaPagamento: newAgendamento.formaPagamento as 'Pix' | 'Cartão' | 'Dinheiro' | undefined,
            status: newAgendamento.status,
            cor: newAgendamento.cor,
            statusPagamento: newAgendamento.statusPagamento
        });
        setIsModalOpen(false);
        setNewAgendamento({
            ...newAgendamento,
            cliente: '',
            servico: '',
            valor: '',
            formaPagamento: '',
            status: 'Agendado',
            statusPagamento: 'Pendente'
        });
    };

    // Filter appointments for the SELECTED DATE
    const agendamentosDoDia = useMemo(() => {
        if (!agendamentos || !Array.isArray(agendamentos)) return [];
        return agendamentos.filter(a => {
            if (!a || !a.dataInicio) return false;
            const aDate = new Date(a.dataInicio);
            return aDate.getDate() === selectedDate.getDate() &&
                aDate.getMonth() === selectedDate.getMonth() &&
                aDate.getFullYear() === selectedDate.getFullYear();
        }).sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());
    }, [agendamentos, selectedDate]);

    // Stats for the SELECTED DATE (not just today)
    const statsDia = useMemo(() => {
        const total = agendamentosDoDia.length;
        const atendidos = agendamentosDoDia.filter(a => a.status === 'Atendido').length;
        const pendentes = agendamentosDoDia.filter(a => a.status === 'Agendado').length;
        const faturado = agendamentosDoDia.filter(a => a.status === 'Atendido').reduce((acc, curr) => acc + (curr.valor || 0), 0);
        const projetado = agendamentosDoDia.reduce((acc, curr) => acc + (curr.valor || 0), 0);

        return { total, atendidos, pendentes, faturado, projetado };
    }, [agendamentosDoDia]);

    const handleToggleStatus = (ag: Agendamento) => {
        const statuses: ('Agendado' | 'Atendido' | 'Cancelado')[] = ['Agendado', 'Atendido', 'Cancelado'];
        const currentIndex = statuses.indexOf(ag.status || 'Agendado');
        const nextIndex = (currentIndex + 1) % statuses.length;
        onUpdateAgendamento({ ...ag, status: statuses[nextIndex] });
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const isSelected = (date: Date) => {
        return date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear();
    };

    return (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm animate-fadeIn h-full flex flex-col overflow-hidden">
            {/* Header / Week Navigation */}
            <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-100 bg-white z-10">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-500"><CalendarIcon size={24} /></div>
                            Agenda
                        </h2>
                        <div className="flex bg-slate-100 rounded-lg p-1 ml-4 self-center">
                            <button
                                onClick={() => setViewMode('week')}
                                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${viewMode === 'week' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Semana
                            </button>
                            <button
                                onClick={() => setViewMode('month')}
                                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${viewMode === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Mês
                            </button>
                        </div>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 ml-1">
                            {viewMode === 'week'
                                ? (selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Data Inválida')
                                : currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                            }
                        </p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto py-3 px-6 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2" style={{ backgroundColor: appColor }}>
                        <Plus size={18} /> Novo Agendamento
                    </button>
                </div>

                {/* Week Strip */}
                {/* Content based on View Mode */}
                {viewMode === 'week' ? (
                    <div className="flex items-center gap-2 sm:gap-4 bg-slate-50/50 p-2 rounded-2xl">
                        <button onClick={() => navigateDate('prev')} className="p-2 sm:p-3 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400 hover:text-slate-600"><ChevronLeft size={20} /></button>
                        <div className="flex-1 flex justify-between gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
                            {weekDays.map((date, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDate(date)}
                                    className={`flex-1 min-w-[45px] sm:min-w-[60px] flex flex-col items-center justify-center py-2 sm:py-3 rounded-xl transition-all border-2 ${isSelected(date)
                                        ? 'bg-white border-indigo-500 shadow-md transform scale-105'
                                        : 'bg-transparent border-transparent hover:bg-white hover:shadow-sm'
                                        }`}
                                    style={{ borderColor: isSelected(date) ? appColor : 'transparent' }}
                                >
                                    <span className={`text-[9px] sm:text-[10px] font-black uppercase mb-1 ${isSelected(date) ? 'text-indigo-600' : 'text-slate-400'}`} style={{ color: isSelected(date) ? appColor : '' }}>{DAYS_OF_WEEK[date.getDay()]}</span>
                                    <span className={`text-base sm:text-lg font-black ${isSelected(date) ? 'text-slate-800' : 'text-slate-500'} ${isToday(date) && !isSelected(date) ? 'text-indigo-500' : ''}`}>{date.getDate()}</span>
                                    {isToday(date) && <div className="mt-1 w-1 h-1 rounded-full bg-indigo-500" style={{ backgroundColor: appColor }}></div>}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => navigateDate('next')} className="p-2 sm:p-3 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400 hover:text-slate-600"><ChevronRight size={20} /></button>
                    </div>
                ) : (
                    <div className="p-2 bg-slate-50/50 rounded-2xl">
                        <div className="flex items-center justify-between mb-2 px-2">
                            <button onClick={() => navigateDate('prev')} className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400"><ChevronLeft size={20} /></button>
                            <span className="text-sm font-black text-slate-700 uppercase">{currentDate.toLocaleDateString('pt-BR', { month: 'long' })}</span>
                            <button onClick={() => navigateDate('next')} className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400"><ChevronRight size={20} /></button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 sm:gap-2">
                            {DAYS_OF_WEEK.map(d => <div key={d} className="text-center text-[9px] font-black text-slate-400 uppercase py-2">{d[0]}</div>)}
                            {monthDays.map((date, i) => {
                                if (!date) return <div key={`empty-${i}`} className="aspect-square"></div>;
                                const count = getAgendamentosForDate(date).length;
                                const hasPending = getAgendamentosForDate(date).some(a => a.statusPagamento === 'Pendente');

                                return (
                                    <button
                                        key={date.toISOString()}
                                        onClick={() => {
                                            setSelectedDate(date);
                                            setViewMode('week');
                                            // Ensure week view focuses on this week
                                            setCurrentDate(date);
                                        }}
                                        className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all border ${isToday(date) ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-transparent hover:shadow-md text-slate-600'
                                            }`}
                                    >
                                        <span className="text-xs sm:text-sm font-bold">{date.getDate()}</span>
                                        {count > 0 && (
                                            <div className="flex gap-0.5 mt-1">
                                                {hasPending && <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>}
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" style={{ backgroundColor: hasPending ? undefined : appColor }}></div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Daily Stats */}
            <div className="px-4 sm:px-6 lg:px-8 py-4 bg-slate-50/30 border-b border-slate-100 flex gap-4 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center"><User size={16} /></div>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Clientes</p>
                        <p className="text-sm font-black text-slate-800">{statsDia.total}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center"><CalendarIcon size={16} /></div>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Confirmados</p>
                        <p className="text-sm font-black text-slate-800">{statsDia.atendidos}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center"><DollarSign size={16} /></div>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Projetado</p>
                        <p className="text-sm font-black text-slate-800">R$ {statsDia.projetado.toFixed(0)}</p>
                    </div>
                </div>
            </div>

            {/* Appointments List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar bg-slate-50/30">
                {agendamentosDoDia.length > 0 ? (
                    <div className="space-y-3 max-w-3xl mx-auto">
                        {agendamentosDoDia.map(ag => {
                            const time = new Date(ag.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                            const isDone = ag.status === 'Atendido';
                            const isCanceled = ag.status === 'Cancelado';

                            return (
                                <div key={ag.id} onClick={() => handleToggleStatus(ag)} className={`group bg-white p-4 sm:p-5 rounded-2xl border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${isDone ? 'opacity-80' : ''}`}
                                    style={{ borderLeftColor: ag.cor || appColor }}>

                                    {isDone && <div className="absolute right-4 top-4 text-emerald-500 opacity-20"><CalendarIcon size={64} /></div>}
                                    {isCanceled && <div className="absolute right-4 top-4 text-rose-500 opacity-20"><X size={64} /></div>}

                                    <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                                        {/* Time Box */}
                                        <div className="flex flex-col items-center justify-center min-w-[60px] sm:min-w-[80px] py-2 border-r border-slate-100 pr-4 sm:pr-6">
                                            <span className="text-lg sm:text-xl font-black text-slate-800">{time}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{ag.duracao} min</span>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className={`text-base sm:text-lg font-extrabold uppercase truncate ${isCanceled ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{ag.cliente}</h3>
                                                <div className="flex gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); onRemoveAgendamento(ag.id); }} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash size={16} /></button>
                                                </div>
                                            </div>
                                            <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1 flex items-center gap-2">
                                                <Scissors size={14} className="text-slate-300" />
                                                {ag.servico}
                                            </p>
                                        </div>

                                        {/* Status & Value */}
                                        <div className="text-right hidden sm:block">
                                            <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase mb-1 ${isDone ? 'bg-emerald-100 text-emerald-600' :
                                                isCanceled ? 'bg-rose-100 text-rose-600' :
                                                    'bg-indigo-50 text-indigo-600'
                                                }`}>
                                                {ag.status}
                                            </div>
                                            <p className="text-sm font-black text-slate-700">R$ {ag.valor?.toFixed(2)}</p>
                                            {ag.statusPagamento === 'Pendente' && (
                                                <div className="mt-1 flex items-center justify-end gap-1 text-[9px] font-bold text-rose-500 uppercase tracking-wide">
                                                    <DollarSign size={10} /> Pendente
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mobile Only Status Footer */}
                                    <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center sm:hidden">
                                        <span className={`text-[9px] font-black uppercase ${isDone ? 'text-emerald-500' :
                                            isCanceled ? 'text-rose-500' :
                                                'text-indigo-500'
                                            }`}>{ag.status}</span>
                                        <span className="text-xs font-black text-slate-700 flex flex-col items-end">
                                            <span>R$ {ag.valor?.toFixed(2)}</span>
                                            {ag.statusPagamento === 'Pendente' && <span className="text-[9px] text-rose-500 uppercase mt-0.5">Pgto Pendente</span>}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
                            <CalendarIcon size={48} />
                        </div>
                        <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">Dia Livre</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase mt-2 max-w-[200px]">Nenhum agendamento para este dia. Aproveite para descansar!</p>
                        <button onClick={() => setIsModalOpen(true)} className="mt-8 text-indigo-500 font-bold text-xs uppercase hover:underline" style={{ color: appColor }}>+ Adicionar Agendamento</button>
                    </div>
                )}
            </div>

            {/* Modal Novo Agendamento */}
            {/* Modal Novo Agendamento - Premium Design */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />

                    {/* Modal Card */}
                    <div className="bg-white w-full sm:w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-all animate-fadeIn flex flex-col max-h-[90vh] sm:max-h-[85vh] relative z-10">

                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Novo Agendamento</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Preencha os detalhes abaixo</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto p-6 custom-scrollbar space-y-6">
                            <form id="agendamento-form" onSubmit={handleSave} className="space-y-6">

                                {/* Cliente Input - Featured */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider ml-1">Cliente</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 group-focus-within:bg-indigo-500 group-focus-within:text-white transition-all">
                                            <User size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            list="clientes-list"
                                            value={newAgendamento.cliente}
                                            onChange={e => setNewAgendamento({ ...newAgendamento, cliente: e.target.value.toUpperCase() })}
                                            className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white p-4 pl-16 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none text-base font-bold text-slate-800 placeholder:text-slate-400 transition-all shadow-sm"
                                            placeholder="Nome do cliente"
                                            required
                                        />
                                        <datalist id="clientes-list">
                                            {clientes.map(c => <option key={c.id} value={c.nome} />)}
                                        </datalist>
                                    </div>
                                </div>

                                {/* Servico & Valor Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Serviço</label>
                                        <div className="flex gap-2">
                                            <div className="relative group flex-1">
                                                <Scissors className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                                <select
                                                    value={newAgendamento.servico}
                                                    onChange={e => {
                                                        const selectedService = servicos.find(s => s.nome === e.target.value);
                                                        setNewAgendamento({
                                                            ...newAgendamento,
                                                            servico: e.target.value,
                                                            valor: selectedService ? selectedService.valor.toString() : newAgendamento.valor
                                                        });
                                                    }}
                                                    className="w-full bg-slate-50 p-3.5 pl-12 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-100 outline-none appearance-none cursor-pointer hover:border-indigo-200 transition-all"
                                                    required
                                                >
                                                    <option value="">Selecione...</option>
                                                    {servicos.map(s => <option key={s.id} value={s.nome}>{s.nome} - {s.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</option>)}
                                                </select>
                                            </div>
                                            <button type="button" onClick={onManageServices} className="p-3.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all" title="Gerenciar Serviços">
                                                <Settings size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Valor</label>
                                        <div className="relative group">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                            <input type="number" step="0.01" value={newAgendamento.valor} onChange={e => setNewAgendamento({ ...newAgendamento, valor: e.target.value })} className="w-full bg-slate-50 p-3.5 pl-10 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-emerald-100 outline-none" placeholder="0,00" />
                                        </div>
                                    </div>
                                </div>

                                {/* Date & Time Check */}
                                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-wider ml-1">Data</label>
                                            <input type="date" value={newAgendamento.data} onChange={e => setNewAgendamento({ ...newAgendamento, data: e.target.value })} className="w-full bg-white p-3 rounded-xl border border-indigo-100 text-sm font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-200 outline-none" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-wider ml-1">Horário</label>
                                            <input type="time" value={newAgendamento.hora} onChange={e => setNewAgendamento({ ...newAgendamento, hora: e.target.value })} className="w-full bg-white p-3 rounded-xl border border-indigo-100 text-sm font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-200 outline-none" required />
                                        </div>
                                    </div>

                                    {/* Duration Pills */}
                                    <div className="space-y-2 pt-2 border-t border-indigo-100/50">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-wider ml-1">Duração Estimada</label>
                                        <div className="flex gap-2">
                                            {[30, 60, 90, 120].map(m => (
                                                <button key={m} type="button" onClick={() => setNewAgendamento({ ...newAgendamento, duracao: m.toString() })} className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${newAgendamento.duracao === m.toString() ? 'bg-indigo-500 text-white shadow-md transform scale-105' : 'bg-white text-indigo-300 hover:bg-indigo-50'}`}>{m} min</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Payment & Status */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Pagamento</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                            <select value={newAgendamento.formaPagamento} onChange={e => setNewAgendamento({ ...newAgendamento, formaPagamento: e.target.value })} className="w-full bg-slate-50 p-3 pl-10 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-100 outline-none appearance-none uppercase text-slate-600">
                                                <option value="">Pendente</option>
                                                <option value="Pix">Pix</option>
                                                <option value="Cartão">Cartão</option>
                                                <option value="Dinheiro">Dinheiro</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Status</label>
                                        <select value={newAgendamento.status} onChange={e => setNewAgendamento({ ...newAgendamento, status: e.target.value as any })} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-100 outline-none appearance-none uppercase text-slate-600">
                                            <option value="Agendado">Agendado</option>
                                            <option value="Atendido">Atendido</option>
                                            <option value="Cancelado">Cancelado</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Pagamento Status</label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setNewAgendamento({ ...newAgendamento, statusPagamento: 'Pago' })}
                                                className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase transition-all ${newAgendamento.statusPagamento === 'Pago' ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                            >
                                                Pago
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNewAgendamento({ ...newAgendamento, statusPagamento: 'Pendente' })}
                                                className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase transition-all ${newAgendamento.statusPagamento === 'Pendente' ? 'bg-rose-100 text-rose-600 ring-2 ring-rose-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                            >
                                                Pendente
                                            </button>
                                        </div>
                                    </div>
                                </div>


                                {/* Color */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Etiqueta de Cor</label>
                                    <div className="flex flex-wrap gap-3">
                                        {['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#3b82f6'].map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setNewAgendamento({ ...newAgendamento, cor: color })}
                                                className={`w-8 h-8 rounded-full transition-all flex items-center justify-center ${newAgendamento.cor === color ? 'ring-4 ring-slate-100 scale-110 shadow-lg' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                                                style={{ backgroundColor: color }}
                                            >
                                                {newAgendamento.cor === color && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                            </form>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl">
                            <button type="submit" form="agendamento-form" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3" style={{ backgroundColor: appColor }}>
                                <CalendarIcon size={18} /> Confirmar Agendamento
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div >
    );
};

export default CalendarView;
