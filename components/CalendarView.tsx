
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Scissors, Plus, X, DollarSign, CreditCard, Trash } from 'lucide-react';
import { Agendamento, Cliente } from '../types';

interface CalendarViewProps {
    agendamentos: Agendamento[];
    onAddAgendamento: (agendamento: Omit<Agendamento, 'id'>) => void;
    onRemoveAgendamento: (id: number) => void;
    onUpdateAgendamento: (agendamento: Agendamento) => void;
    appColor: string;
    servicos: string[];
    clientes: Cliente[];
}

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 to 20:00

const CalendarView: React.FC<CalendarViewProps> = ({ agendamentos = [], onAddAgendamento, onRemoveAgendamento, onUpdateAgendamento, appColor, servicos, clientes }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Calculate start of the week (Sunday) based on current reference date
    const startOfWeek = useMemo(() => {
        const d = new Date(currentDate);
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

    const navigateWeek = (direction: 'next' | 'prev') => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        setCurrentDate(newDate);
        // Also move selection to the start of that week or keep same day index?
        // Let's keep it simple: just change the week view, user clicks day to select.
        // Or better: Auto-select the same weekday of new week
        const newSelected = new Date(brandNewDate(newDate, selectedDate.getDay()));
        setSelectedDate(newSelected);
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
            cor: newAgendamento.cor
        });
        setIsModalOpen(false);
        setNewAgendamento({ ...newAgendamento, cliente: '', servico: '', valor: '', formaPagamento: '', status: 'Agendado' });
    };

    // Filter appointments for the SELECTED DATE
    const agendamentosDoDia = useMemo(() => {
        if (!agendamentos || !Array.isArray(agendamentos)) return [];
        return agendamentos.filter(a => {
            if (!a.dataInicio) return false;
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
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 ml-1">
                            {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto py-3 px-6 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2" style={{ backgroundColor: appColor }}>
                        <Plus size={18} /> Novo Agendamento
                    </button>
                </div>

                {/* Week Strip */}
                <div className="flex items-center gap-2 sm:gap-4 bg-slate-50/50 p-2 rounded-2xl">
                    <button onClick={() => navigateWeek('prev')} className="p-2 sm:p-3 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400 hover:text-slate-600"><ChevronLeft size={20} /></button>
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
                    <button onClick={() => navigateWeek('next')} className="p-2 sm:p-3 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400 hover:text-slate-600"><ChevronRight size={20} /></button>
                </div>
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
                                        <div className="text-right hidden xs:block">
                                            <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase mb-1 ${isDone ? 'bg-emerald-100 text-emerald-600' :
                                                isCanceled ? 'bg-rose-100 text-rose-600' :
                                                    'bg-indigo-50 text-indigo-600'
                                                }`}>
                                                {ag.status}
                                            </div>
                                            <p className="text-sm font-black text-slate-700">R$ {ag.valor?.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {/* Mobile Only Status Footer */}
                                    <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center xs:hidden">
                                        <span className={`text-[9px] font-black uppercase ${isDone ? 'text-emerald-500' :
                                            isCanceled ? 'text-rose-500' :
                                                'text-indigo-500'
                                            }`}>{ag.status}</span>
                                        <span className="text-xs font-black text-slate-700">R$ {ag.valor?.toFixed(2)}</span>
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
            {
                isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
                        <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-extrabold text-slate-800 uppercase flex items-center gap-3"><CalendarIcon size={20} className="text-indigo-500" /> Novo Agendamento</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Cliente</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input type="text" list="clientes-list" value={newAgendamento.cliente} onChange={e => setNewAgendamento({ ...newAgendamento, cliente: e.target.value.toUpperCase() })} className="w-full bg-slate-50 p-3 pl-12 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-100 outline-none uppercase" placeholder="Nome do Cliente" required />
                                        <datalist id="clientes-list">
                                            {clientes.map(c => <option key={c.id} value={c.nome} />)}
                                        </datalist>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Serviço</label>
                                    <div className="relative">
                                        <Scissors className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <select value={newAgendamento.servico} onChange={e => setNewAgendamento({ ...newAgendamento, servico: e.target.value })} className="w-full bg-slate-50 p-3 pl-12 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-100 outline-none uppercase appearance-none" required>
                                            <option value="">Selecione...</option>
                                            {servicos.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Data</label>
                                        <input type="date" value={newAgendamento.data} onChange={e => setNewAgendamento({ ...newAgendamento, data: e.target.value })} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-100 outline-none" required />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Horário</label>
                                        <input type="time" value={newAgendamento.hora} onChange={e => setNewAgendamento({ ...newAgendamento, hora: e.target.value })} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-100 outline-none" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Valor (R$)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                            <input type="number" step="0.01" value={newAgendamento.valor} onChange={e => setNewAgendamento({ ...newAgendamento, valor: e.target.value })} className="w-full bg-slate-50 p-3 pl-10 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-100 outline-none" placeholder="0,00" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Pagamento</label>
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
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Duração (min)</label>
                                    <div className="flex gap-2">
                                        {[30, 60, 90, 120].map(m => (
                                            <button key={m} type="button" onClick={() => setNewAgendamento({ ...newAgendamento, duracao: m.toString() })} className={`flex-1 py-2 rounded-lg text-[10px] font-bold border ${newAgendamento.duracao === m.toString() ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{m} min</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Status Inicial</label>
                                    <div className="flex gap-2">
                                        {(['Agendado', 'Atendido', 'Cancelado'] as const).map(s => (
                                            <button key={s} type="button" onClick={() => setNewAgendamento({ ...newAgendamento, status: s })} className={`flex-1 py-2 rounded-lg text-[9px] font-bold border transition-all ${newAgendamento.status === s ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{s.toUpperCase()}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Cor do Destaque</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#3b82f6'].map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setNewAgendamento({ ...newAgendamento, cor: color })}
                                                className={`w-7 h-7 rounded-full border-2 transition-all ${newAgendamento.cor === color ? 'border-slate-900 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                        <input
                                            type="color"
                                            value={newAgendamento.cor}
                                            onChange={e => setNewAgendamento({ ...newAgendamento, cor: e.target.value })}
                                            className="w-7 h-7 rounded-full border-2 border-slate-200 bg-transparent cursor-pointer p-0 overflow-hidden"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-indigo-500 text-white py-3.5 rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg hover:bg-indigo-600 transition-all mt-4">Salvar Agendamento</button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default CalendarView;
