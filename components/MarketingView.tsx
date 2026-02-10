import React, { useState, useMemo } from 'react';
import {
    MessageCircle, Calendar, Gift, AlertCircle,
    CheckCircle2, Copy, ExternalLink, RefreshCw,
    Edit2, User, Phone
} from 'lucide-react';
import { Cliente, Agendamento, Receita } from '../types';

interface MarketingViewProps {
    clientes: Cliente[];
    agendamentos: Agendamento[];
    receitas: Receita[];
    appColor: string;
    onEditCliente: (cliente: Cliente) => void;
}

type Tab = 'confirmacoes' | 'aniversarios' | 'resgate';

/**
 * MarketingView - Version 2.0 (Ultra Functional)
 * Logic for automated WhatsApp messaging and CRM.
 */
const MarketingView: React.FC<MarketingViewProps> = ({ clientes, agendamentos, receitas, appColor, onEditCliente }) => {
    const [activeTab, setActiveTab] = useState<Tab>('confirmacoes');

    // --- Helpers ---
    const formatTelefone = (tel: string) => {
        const numbers = tel.replace(/\D/g, '');
        return numbers.startsWith('55') ? numbers : `55${numbers}`;
    };

    const getLinkWhatsApp = (tel: string, msg: string) => {
        return `https://wa.me/${formatTelefone(tel)}?text=${encodeURIComponent(msg)}`;
    };

    // Normalize name for better matching (strips accents and extra spaces)
    const normalizeName = (name: string) => {
        return name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    };

    // --- Logic: Confirmações (Amanhã) ---
    const confirmacoes = useMemo(() => {
        const amanha = new Date();
        amanha.setDate(amanha.getDate() + 1);
        const amanhaStr = amanha.toISOString().split('T')[0];

        return agendamentos
            .filter(a => a.dataInicio.split('T')[0] === amanhaStr && a.status !== 'Cancelado')
            .map(a => {
                const normalizedAgendaName = normalizeName(a.cliente);
                const clientObj = clientes.find(c => normalizeName(c.nome) === normalizedAgendaName);

                const hora = new Date(a.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const firstFirstName = a.cliente.split(' ')[0];
                const msg = `Olá ${firstFirstName}! ✨ Passando para confirmar seu horário de ${a.servico} amanhã às ${hora}. Estamos preparando tudo com muito carinho para você! Podemos confirmar sua presença? 🥰`;

                return { ...a, clienteObj: clientObj, clienteTel: clientObj?.telefone, msg, hora };
            });
    }, [agendamentos, clientes]);

    // --- Logic: Aniversariantes (Mês Atual) ---
    const aniversariantes = useMemo(() => {
        const mesAtual = new Date().getMonth() + 1;
        return clientes.filter(c => {
            if (!c.aniversario) return false;
            const [, mes] = c.aniversario.split('/');
            return parseInt(mes) === mesAtual;
        }).map(c => {
            const firstFirstName = c.nome.split(' ')[0];
            const msg = `Parabéns, ${firstFirstName}! 🥳🎂 Hoje o dia é todo seu! Que tal vir comemorar ficando ainda mais maravilhosa? Preparamos um presente especial para você! Vamos agendar? ✨`;
            return { ...c, msg };
        });
    }, [clientes]);

    // --- Logic: Resgate (Sumidos > 30 dias) ---
    const resgate = useMemo(() => {
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

        return clientes.filter(c => {
            const ultimasReceitas = receitas.filter(r => normalizeName(r.cliente || '') === normalizeName(c.nome));
            const ultimaDataReceita = ultimasReceitas.length > 0
                ? new Date(Math.max(...ultimasReceitas.map(r => new Date(r.data).getTime())))
                : null;

            const ultimosAgendamentos = agendamentos.filter(a => normalizeName(a.cliente) === normalizeName(c.nome) && a.status === 'Atendido');
            const ultimaDataAgendamento = ultimosAgendamentos.length > 0
                ? new Date(Math.max(...ultimosAgendamentos.map(a => new Date(a.dataInicio).getTime())))
                : null;

            const ultimaInteracao = ultimaDataReceita || ultimaDataAgendamento;
            if (!ultimaInteracao) return false;
            return ultimaInteracao < trintaDiasAtras;
        }).map(c => {
            const firstFirstName = c.nome.split(' ')[0];
            const msg = `Oi ${firstFirstName}, tudo bem? Sumiu! 🙈 Notei que faz um tempinho que você não vem nos visitar e estamos com saudades. Preparei uma condição especial para sua volta... o que acha? 😘`;
            return { ...c, msg };
        });
    }, [clientes, receitas, agendamentos]);

    const WhatsAppAction = ({ tel, msg, cliente }: { tel?: string, msg: string, cliente?: Cliente }) => {
        const hasPhone = tel && tel.replace(/\D/g, '').length >= 10;

        if (hasPhone) {
            return (
                <div className="flex items-center gap-2">
                    <a
                        href={getLinkWhatsApp(tel!, msg)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-emerald-100 text-emerald-600 rounded-full hover:bg-emerald-200 transition-colors shadow-sm active:scale-90"
                        title="Enviar WhatsApp"
                    >
                        <MessageCircle size={20} />
                    </a>
                    <a
                        href={getLinkWhatsApp(tel!, msg)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:flex px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                    >
                        Enviar WhatsApp
                    </a>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={() => cliente && onEditCliente(cliente)}
                    className="p-2.5 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200 transition-colors shadow-sm"
                    title="Adicionar Telefone"
                >
                    <Phone size={20} />
                </button>
                <button
                    onClick={() => cliente && onEditCliente(cliente)}
                    className="flex-1 sm:flex-none px-4 py-3 bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 border border-transparent rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    Sem Telefone (Cadastrar)
                </button>
            </div>
        );
    };

    return (
        <div className="animate-fadeIn space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-3 font-outfit">
                        <div className="p-2.5 rounded-xl shadow-sm" style={{ backgroundColor: `${appColor}15`, color: appColor }}>
                            <MessageCircle size={24} />
                        </div>
                        Marketing Digital
                    </h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 ml-1">
                        Relacionamento & Faturamento
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-2xl overflow-x-auto shadow-inner border border-slate-200">
                <button
                    onClick={() => setActiveTab('confirmacoes')}
                    className={`flex-1 min-w-[120px] py-3.5 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'confirmacoes' ? 'bg-white shadow-md text-slate-800 border border-slate-200 translate-y-0' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Calendar size={18} className={activeTab === 'confirmacoes' ? 'text-indigo-500' : ''} />
                    Confirmar ({confirmacoes.length})
                </button>
                <button
                    onClick={() => setActiveTab('aniversarios')}
                    className={`flex-1 min-w-[120px] py-3.5 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'aniversarios' ? 'bg-white shadow-md text-slate-800 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Gift size={18} className={activeTab === 'aniversarios' ? 'text-pink-500' : ''} />
                    Aniversariantes ({aniversariantes.length})
                </button>
                <button
                    onClick={() => setActiveTab('resgate')}
                    className={`flex-1 min-w-[120px] py-3.5 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'resgate' ? 'bg-white shadow-md text-slate-800 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <RefreshCw size={18} className={activeTab === 'resgate' ? 'text-amber-500' : ''} />
                    Resgatar Clientes ({resgate.length})
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden min-h-[500px]">

                {/* === CONFIRMAÇÕES === */}
                {activeTab === 'confirmacoes' && (
                    <div className="p-6 sm:p-8">
                        <div className="mb-8 flex items-center gap-3 text-indigo-600 bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50 shadow-sm">
                            <AlertCircle size={24} className="shrink-0" />
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-wider">Ações Recomendadas</p>
                                <p className="text-xs font-bold text-slate-600">Confirme os agendamentos de <span className="text-indigo-600 underline font-black">Amanhã</span> para garantir sua produtividade.</p>
                            </div>
                        </div>

                        <div className="grid gap-5">
                            {confirmacoes.length === 0 ? (
                                <div className="text-center py-24 text-slate-300">
                                    <CheckCircle2 size={72} className="mx-auto mb-6 opacity-20" />
                                    <p className="text-lg font-black uppercase tracking-tighter text-slate-400">Tudo pronto por aqui!</p>
                                    <p className="text-xs font-medium uppercase tracking-widest">Nenhum agendamento para confirmar amanhã.</p>
                                </div>
                            ) : (
                                confirmacoes.map(item => (
                                    <div key={item.id} className="p-5 border border-slate-100 rounded-3xl hover:border-indigo-200 hover:shadow-lg transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center bg-slate-50/50 group">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className="bg-slate-800 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-md">{item.hora}</span>
                                                <div
                                                    onClick={() => item.clienteObj && onEditCliente(item.clienteObj)}
                                                    className="flex items-center gap-2 cursor-pointer group/name"
                                                >
                                                    <h3 className="text-lg font-black text-slate-800 uppercase truncate group-hover/name:text-indigo-600 group-hover/name:underline decoration-4 decoration-indigo-200 transition-all font-outfit">
                                                        {item.cliente}
                                                    </h3>
                                                    <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 opacity-50 group-hover/name:opacity-100 transition-opacity">
                                                        <Edit2 size={14} className="text-indigo-500" />
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                                                {item.servico}
                                            </p>

                                            {/* Message Box */}
                                            <div className="mt-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-inner relative group-hover:border-indigo-100 transition-colors">
                                                <div className="absolute -top-2 left-4 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">Mensagem Sugerida</div>
                                                <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic">
                                                    "{item.msg}"
                                                </p>
                                            </div>
                                        </div>

                                        <WhatsAppAction tel={item.clienteTel} msg={item.msg} cliente={item.clienteObj} />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* === ANIVERSARIANTES === */}
                {activeTab === 'aniversarios' && (
                    <div className="p-6 sm:p-8">
                        <div className="mb-8 flex items-center gap-3 text-pink-600 bg-pink-50/50 p-5 rounded-2xl border border-pink-100/50 shadow-sm">
                            <Gift size={24} className="shrink-0" />
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-wider">Fidelização</p>
                                <p className="text-xs font-bold text-slate-600">Encante suas clientes no dia especial delas. Mimos criam <span className="text-pink-600 font-black">Conexão</span>!</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {aniversariantes.length === 0 ? (
                                <div className="col-span-full text-center py-24 text-slate-300">
                                    <Gift size={72} className="mx-auto mb-6 opacity-20" />
                                    <p className="text-lg font-black uppercase tracking-tighter text-slate-400">Mês sem aniversários</p>
                                    <p className="text-xs font-medium uppercase tracking-widest">Nenhuma cliente faz niver este mês.</p>
                                </div>
                            ) : (
                                aniversariantes.map(cliente => (
                                    <div key={cliente.id} className="p-6 border border-pink-100 bg-pink-50/10 rounded-[32px] flex flex-col gap-5 relative overflow-hidden group hover:shadow-xl transition-all hover:bg-white">
                                        <div className="absolute -right-6 -top-6 opacity-[0.05] text-pink-500 transform rotate-12 group-hover:scale-125 transition-transform"><Gift size={120} /></div>

                                        <div className="flex justify-between items-start relative z-10">
                                            <div className="min-w-0">
                                                <div
                                                    onClick={() => onEditCliente(cliente)}
                                                    className="flex items-center gap-2 cursor-pointer group/name"
                                                >
                                                    <h3 className="text-xl font-black text-slate-800 uppercase truncate group-hover/name:text-pink-600 transition-all font-outfit">
                                                        {cliente.nome}
                                                    </h3>
                                                    <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 opacity-50 group-hover/name:opacity-100 transition-opacity">
                                                        <Edit2 size={14} className="text-pink-500" />
                                                    </div>
                                                </div>
                                                <p className="text-sm text-pink-500 font-black mt-1 uppercase tracking-tighter">🎉 Faz niver dia {cliente.aniversario}</p>
                                            </div>
                                        </div>

                                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-pink-100 shadow-sm relative z-10">
                                            <p className="text-[11px] text-pink-900/60 font-medium leading-relaxed italic">
                                                "{cliente.msg}"
                                            </p>
                                        </div>

                                        <div className="relative z-10 mt-auto">
                                            <WhatsAppAction tel={cliente.telefone} msg={cliente.msg} cliente={cliente} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* === RESGATE === */}
                {activeTab === 'resgate' && (
                    <div className="p-6 sm:p-8">
                        <div className="mb-8 flex items-center gap-3 text-amber-600 bg-amber-50/50 p-5 rounded-2xl border border-amber-100/50 shadow-sm">
                            <RefreshCw size={24} className="shrink-0" />
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-wider">Recuperação de Receita</p>
                                <p className="text-xs font-bold text-slate-600">Clientes que não aparecem há mais de 30 dias. <span className="text-amber-600 font-black">Resgate seu lucro</span>!</p>
                            </div>
                        </div>

                        <div className="grid gap-5">
                            {resgate.length === 0 ? (
                                <div className="text-center py-24 text-slate-300">
                                    <CheckCircle2 size={72} className="mx-auto mb-6 opacity-20" />
                                    <p className="text-lg font-black uppercase tracking-tighter text-slate-400">Sua retenção está ótima!</p>
                                    <p className="text-xs font-medium uppercase tracking-widest">Nenhuma cliente sumida detectada.</p>
                                </div>
                            ) : (
                                resgate.map(cliente => (
                                    <div key={cliente.id} className="p-6 border border-slate-100 rounded-3xl hover:border-amber-200 hover:shadow-xl transition-all flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-white relative group overflow-hidden">
                                        <div className="absolute left-0 top-0 w-1.5 h-full bg-amber-400 opacity-30"></div>
                                        <div className="min-w-0 flex-1">
                                            <div
                                                onClick={() => onEditCliente(cliente)}
                                                className="flex items-center gap-3 cursor-pointer group/name mb-2"
                                            >
                                                <h3 className="text-xl font-black text-slate-800 uppercase truncate group-hover/name:text-amber-700 transition-all font-outfit">
                                                    {cliente.nome}
                                                </h3>
                                                <div className="p-1.5 bg-slate-50 rounded-lg shadow-sm border border-slate-100 opacity-50 group-hover/name:opacity-100 transition-opacity">
                                                    <Edit2 size={14} className="text-amber-500" />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 mb-4">
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                                    Faturamento Total
                                                </p>
                                                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black shadow-sm">
                                                    R$ {cliente.totalGasto?.toFixed(2)}
                                                </span>
                                            </div>

                                            <div className="bg-amber-50/30 p-4 rounded-2xl border border-amber-100/50">
                                                <p className="text-[11px] text-amber-900/70 font-medium leading-relaxed italic">
                                                    "{cliente.msg}"
                                                </p>
                                            </div>
                                        </div>

                                        <div className="shrink-0 w-full lg:w-auto">
                                            <WhatsAppAction tel={cliente.telefone} msg={cliente.msg} cliente={cliente} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default MarketingView;
