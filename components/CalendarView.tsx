
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Scissors, Plus, X, DollarSign, CreditCard } from 'lucide-react';
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

const CalendarView: React.FC<CalendarViewProps> = ({ agendamentos, onAddAgendamento, onRemoveAgendamento, onUpdateAgendamento, appColor, servicos, clientes }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAgendamento, setNewAgendamento] = useState({
        cliente: '',
        servico: '',
        data: new Date().toISOString().split('T')[0],
        hora: '09:00',
        duracao: '60', // minutes
        valor: '',
        formaPagamento: '',
        status: 'Agendado' as 'Agendado' | 'Atendido' | 'Cancelado',
        cor: '#6366f1' // Default Indigo
    });

    // Calculate start of the week (Sunday)
    const startOfWeek = useMemo(() => {
        const d = new Date(currentDate);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    }, [currentDate]);

    // Generate days for the header
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
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const startDateTime = new Date(`${newAgendamento.data}T${newAgendamento.hora}`);
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

    const getAgendamentosForDay = (date: Date) => {
        return agendamentos.filter(a => {
            const aDate = new Date(a.dataInicio);
            return aDate.getDate() === date.getDate() &&
                aDate.getMonth() === date.getMonth() &&
                aDate.getFullYear() === date.getFullYear();
        });
    };

    const statsHoje = useMemo(() => {
        const hoje = getAgendamentosForDay(new Date());
        const atendidos = hoje.filter(a => a.status === 'Atendido');
        const cancelados = hoje.filter(a => a.status === 'Cancelado');
        const agendados = hoje.filter(a => a.status === 'Agendado' || !a.status);

        const ganho = atendidos.reduce((acc, a) => acc + (a.valor || 0), 0);
        const perdido = cancelados.reduce((acc, a) => acc + (a.valor || 0), 0);

        return {
            total: hoje.length,
            atendidos: atendidos.length,
            cancelados: cancelados.length,
            agendados: agendados.length,
            ganho,
            perdido
        };
    }, [agendamentos]);

    const handleToggleStatus = (ag: Agendamento) => {
        const statuses: ('Agendado' | 'Atendido' | 'Cancelado')[] = ['Agendado', 'Atendido', 'Cancelado'];
        const currentIndex = statuses.indexOf(ag.status || 'Agendado');
        const nextIndex = (currentIndex + 1) % statuses.length;
        onUpdateAgendamento({ ...ag, status: statuses[nextIndex] });
    };

    return (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-100 shadow-sm animate-fadeIn h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-extrabold text-slate-800 uppercase flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500"><CalendarIcon size={24} /></div>
                    Agenda Semanal
                </h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                        <button onClick={() => navigateWeek('prev')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500"><ChevronLeft size={20} /></button>
                        <span className="px-4 text-xs font-bold text-slate-600 uppercase w-32 text-center">
                            {startOfWeek.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - {weekDays[6].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                        </span>
                        <button onClick={() => navigateWeek('next')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500"><ChevronRight size={20} /></button>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="py-2.5 px-5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg transition-all flex items-center gap-2">
                        <Plus size={16} /> Novo Agendamento
                    </button>
                </div>
            </div>

            {/* Dashboard de Estatísticas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                {[
                    { label: 'Hoje', val: statsHoje.total, color: 'text-slate-600', bg: 'bg-slate-50' },
                    { label: 'Atendidos', val: statsHoje.atendidos, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Cancelados', val: statsHoje.cancelados, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'Faturado', val: `R$ ${statsHoje.ganho.toFixed(0)}`, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Perdido', val: `R$ ${statsHoje.perdido.toFixed(0)}`, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((s, idx) => (
                    <div key={idx} className={`${s.bg} p-3 rounded-2xl border border-white shadow-sm flex flex-col justify-center`}>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className={`text-sm font-black ${s.color}`}>{s.val}</p>
                    </div>
                ))}
            </div>

            <div className="flex-1 overflow-x-auto custom-scrollbar relative bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="min-w-[800px] h-full flex flex-col">
                    {/* Header das Datas */}
                    <div className="grid grid-cols-8 border-b border-slate-200 bg-white sticky top-0 z-10">
                        <div className="p-1 text-[9px] font-bold text-slate-400 uppercase text-center border-r border-slate-100 py-2">Horário</div>
                        {weekDays.map((date, i) => (
                            <div key={i} className={`p-1 text-center border-r border-slate-100 last:border-r-0 py-2 ${date.toDateString() === new Date().toDateString() ? 'bg-indigo-50/30' : ''}`}>
                                <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">{DAYS_OF_WEEK[date.getDay()]}</p>
                                <p className={`text-sm font-black ${date.toDateString() === new Date().toDateString() ? 'text-indigo-600' : 'text-slate-800'}`}>{date.getDate()}</p>
                            </div>
                        ))}
                    </div>

                    {/* Grid de Horários */}
                    <div className="relative flex-1">
                        {HOURS.map(hour => (
                            <div key={hour} className="grid grid-cols-8 h-[48px] border-b border-slate-100 last:border-b-0">
                                <div className="text-[9px] font-bold text-slate-400 border-r border-slate-100 p-1 text-center relative -top-2 bg-transparent">{hour}:00</div>
                                {weekDays.map((date, i) => (
                                    <div key={i} className="border-r border-slate-100 last:border-r-0 relative group hover:bg-slate-50 transition-colors">
                                        {/* Botão invisível para adicionar ao clicar no horário (futuro) */}
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* Renderização dos Agendamentos (Posicionamento Absoluto) */}
                        {agendamentos.map(ag => {
                            const start = new Date(ag.dataInicio);
                            const end = new Date(ag.dataFim);

                            // Verificar se está na semana atual visível e horário dentro do range (simples)
                            if (start < startOfWeek || start > weekDays[6]) return null;

                            const dayIndex = start.getDay() + 1; // 0 is Sunday (col 1 is time, so day 0 is col 2 => index + 1)

                            const startHour = start.getHours();
                            const startMin = start.getMinutes();
                            const durationMins = (end.getTime() - start.getTime()) / 60000;

                            // Calcular posição top (Baseado em 48px de altura por hora, começando as 7h)
                            // 7h = 0px. 8h = 48px.
                            const topPosition = ((startHour - 7) * 48) + ((startMin / 60) * 48);
                            const height = (durationMins / 60) * 48;

                            if (topPosition < 0) return null; // Antes das 7h não mostramos por enqto

                            return (
                                <div
                                    key={ag.id}
                                    onClick={() => handleToggleStatus(ag)}
                                    className={`absolute rounded-lg p-2 border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden z-20 group ${ag.status === 'Cancelado' ? 'opacity-50 grayscale' : ''}`}
                                    style={{
                                        top: `${topPosition}px`,
                                        height: `${height}px`,
                                        left: `${(dayIndex) * (100 / 8)}%`, // Aproximado para grid de 8 colunas
                                        width: `${(100 / 8) - 0.5}%`,
                                        backgroundColor: ag.status === 'Atendido' ? '#ECFDF5' : ag.status === 'Cancelado' ? '#FEF2F2' : `${ag.cor || appColor}15`,
                                        borderColor: ag.status === 'Atendido' ? '#10B981' : ag.status === 'Cancelado' ? '#EF4444' : (ag.cor || appColor),
                                        marginLeft: '2px'
                                    }}
                                >
                                    <div className="flex justify-between items-start">
                                        <p className="text-[10px] font-bold text-slate-700 truncate leading-tight uppercase">{ag.cliente}</p>
                                        <button onClick={(e) => { e.stopPropagation(); onRemoveAgendamento(ag.id); }} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity"><X size={12} /></button>
                                    </div>
                                    <p className="text-[9px] font-semibold text-slate-500 truncate mt-0.5">{ag.servico}</p>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-[8px] font-bold text-slate-400 flex items-center gap-1"><Clock size={10} /> {startHour}:{startMin.toString().padStart(2, '0')}</p>
                                        {ag.status && (
                                            <span className={`text-[7px] font-black uppercase px-1 rounded ${ag.status === 'Atendido' ? 'text-emerald-500' : ag.status === 'Cancelado' ? 'text-rose-500' : 'text-indigo-500'}`}>{ag.status}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Modal Novo Agendamento */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
                        <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl">
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
