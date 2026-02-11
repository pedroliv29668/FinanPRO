import React, { useState, useMemo } from 'react';
import {
    MessageCircle, Calendar, Gift, AlertCircle,
    CheckCircle2, Copy, ExternalLink, RefreshCw,
    Edit2, User, Phone, Sparkles, Wand2
} from 'lucide-react';
import { Cliente, Agendamento, Receita } from '../types';
import { generateMarketingCopy } from '../services/geminiService';

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
    const [editingMsgId, setEditingMsgId] = useState<string | number | null>(null);
    const [customMessages, setCustomMessages] = useState<Record<string, string>>({});
    const [isGenerating, setIsGenerating] = useState<string | number | null>(null);

    // --- Helpers ---
    const formatTelefone = (tel: string) => {
        const numbers = tel.replace(/\D/g, '');
        return numbers.startsWith('55') ? numbers : `55${numbers}`;
    };

    const getLinkWhatsApp = (tel: string, msg: string) => {
        return `https://wa.me/${formatTelefone(tel)}?text=${encodeURIComponent(msg)}`;
    };

    // Normalize name for better matching (strips accents and extra spaces)
    const normalizeName = (name: any) => {
        if (!name || typeof name !== 'string') return '';
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

        if (!agendamentos) return [];

        return agendamentos
            .filter(a => a && a.dataInicio && typeof a.dataInicio === 'string' && a.dataInicio.split('T')[0] === amanhaStr && a.status !== 'Cancelado')
            .map(a => {
                const normalizedAgendaName = normalizeName(a.cliente);
                const clientObj = clientes ? clientes.find(c => c && normalizeName(c.nome) === normalizedAgendaName) : undefined;
                const lastServiceObj = receitas
                    ? receitas
                        .filter(r => r && normalizeName(r.cliente || '') === normalizedAgendaName)
                        .sort((a, b) => (new Date(b.data).getTime() || 0) - (new Date(a.data).getTime() || 0))[0]
                    : undefined;

                const hora = a.dataInicio ? new Date(a.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--';
                const firstFirstName = a.cliente ? a.cliente.split(' ')[0] : 'Cliente';
                const msg = `Olá ${firstFirstName}! ✨ Passando para confirmar seu horário de ${a.servico || 'atendimento'} amanhã às ${hora}. Estamos preparando tudo com muito carinho para você! Podemos confirmar sua presença? 🥰`;

                return { ...a, clienteObj: clientObj, clienteTel: clientObj?.telefone, msg, hora, lastService: lastServiceObj?.procedimento };
            });
    }, [agendamentos, clientes, receitas]);

    // --- Logic: Aniversariantes (Mês Atual) ---
    const aniversariantes = useMemo(() => {
        if (!clientes) return [];
        const mesAtual = new Date().getMonth() + 1;
        return clientes.filter(c => {
            if (!c || !c.aniversario) return false;
            const parts = c.aniversario.split('/');
            if (parts.length < 2) return false;
            const [, mes] = parts;
            return parseInt(mes) === mesAtual;
        }).map(c => {
            const firstFirstName = c.nome ? c.nome.split(' ')[0] : 'Cliente';
            const msg = `Parabéns, ${firstFirstName}! 🥳🎂 Hoje o dia é todo seu! Que tal vir comemorar ficando ainda mais maravilhosa? Preparamos um presente especial para você! Vamos agendar? ✨`;
            return { ...c, msg };
        });
    }, [clientes]);

    // --- Logic: Resgate (Sumidos > 30 dias) ---
    const resgate = useMemo(() => {
        if (!clientes) return [];
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

        return clientes.filter(c => {
            if (!c || !c.nome) return false;
            const clientNameNormalized = normalizeName(c.nome);

            const ultimasReceitas = receitas ? receitas.filter(r => r && normalizeName(r.cliente || '') === clientNameNormalized) : [];
            const ultimaDataReceita = ultimasReceitas.length > 0
                ? new Date(Math.max(...ultimasReceitas.map(r => new Date(r.data).getTime())))
                : null;

            const ultimosAgendamentos = agendamentos ? agendamentos.filter(a => a && a.cliente && normalizeName(a.cliente) === clientNameNormalized && a.status === 'Atendido') : [];
            const ultimaDataAgendamento = ultimosAgendamentos.length > 0
                ? new Date(Math.max(...ultimosAgendamentos.map(a => new Date(a.dataInicio).getTime())))
                : null;

            const ultimaInteracao = ultimaDataReceita || ultimaDataAgendamento;
            if (!ultimaInteracao || isNaN(ultimaInteracao.getTime())) return false;
            return ultimaInteracao < trintaDiasAtras;
        }).map(c => {
            const firstFirstName = c.nome ? c.nome.split(' ')[0] : 'Cliente';
            const msg = `Oi ${firstFirstName}, tudo bem? Sumiu! 🙈 Notei que faz um tempinho que você não vem nos visitar e estamos com saudades. Preparei uma condição especial para sua volta... o que acha? 😘`;
            return { ...c, msg };
        });
    }, [clientes, receitas, agendamentos]);

    const handleGenerateCopy = async (id: string | number, type: 'personalized' | 'upsell', name: string, lastService?: string) => {
        setIsGenerating(id);
        try {
            const copy = await generateMarketingCopy(type, name, lastService);
            if (copy) {
                setCustomMessages(prev => ({ ...prev, [id]: copy }));
            }
        } catch (error) {
            console.error("Erro ao gerar copy:", error);
        } finally {
            setIsGenerating(null);
        }
    };

    const WhatsAppAction = ({ id, tel, msg, cliente, lastService }: { id: string | number, tel?: string, msg: string, cliente?: Cliente, lastService?: string }) => {
        const hasPhone = tel && tel.replace(/\D/g, '').length >= 10;
        const currentMsg = customMessages[id] || msg;

        // Tenta encontrar o objeto cliente se ele não foi passado
        const targetCliente = cliente || clientes.find(c => normalizeName(c.nome) === normalizeName(id.toString()));

        return (
            <div className="flex flex-col gap-3 w-full sm:w-auto">
                {/* Editable Message Area */}
                <div className="relative group">
                    <textarea
                        value={currentMsg}
                        onChange={(e) => setCustomMessages(prev => ({ ...prev, [id]: e.target.value }))}
                        className="w-full sm:w-[350px] p-4 pr-10 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none h-24 shadow-inner"
                        placeholder="Edite sua mensagem aqui..."
                    />
                    <div className="absolute right-3 top-3 opacity-30 group-hover:opacity-100 transition-opacity">
                        <Edit2 size={12} className="text-slate-400" />
                    </div>
                </div>

                {/* AI & Send Actions */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => handleGenerateCopy(id, 'personalized', targetCliente?.nome || 'Cliente')}
                        disabled={isGenerating === id}
                        className="flex-1 sm:flex-none p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 border border-indigo-100 shadow-sm disabled:opacity-50"
                        title="Tornar Única (IA)"
                    >
                        {isGenerating === id ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        <span className="text-[9px] font-black uppercase">Personalizar</span>
                    </button>

                    {/* Vender + agora aparece sempre que tivermos o último serviço ou estivermos no resgate */}
                    {(activeTab === 'resgate' || !!lastService) && (
                        <button
                            onClick={() => handleGenerateCopy(id, 'upsell', targetCliente?.nome || 'Cliente', lastService)}
                            disabled={isGenerating === id}
                            className="flex-1 sm:flex-none p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all flex items-center justify-center gap-2 border border-amber-100 shadow-sm disabled:opacity-50"
                            title="Vender Mais (IA)"
                        >
                            <Wand2 size={14} />
                            <span className="text-[9px] font-black uppercase">Vender +</span>
                        </button>
                    )}

                    {!hasPhone ? (
                        <button
                            onClick={() => {
                                if (targetCliente) {
                                    onEditCliente(targetCliente);
                                } else {
                                    // Se não encontrar o cliente, abre o cadastro com esse nome
                                    onEditCliente({ id: 0, nome: id.toString() } as Cliente);
                                }
                            }}
                            className="flex-1 sm:flex-none px-4 py-3 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all shadow-sm"
                        >
                            <Phone size={14} /> Cadastrar Tel.
                        </button>
                    ) : (
                        <a
                            href={getLinkWhatsApp(tel!, currentMsg)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                        >
                            <MessageCircle size={16} /> Enviar
                        </a>
                    )}
                </div>
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
                                                    onClick={() => {
                                                        if (item.clienteObj) onEditCliente(item.clienteObj);
                                                        else {
                                                            const found = clientes.find(c => normalizeName(c.nome) === normalizeName(item.cliente));
                                                            if (found) onEditCliente(found);
                                                        }
                                                    }}
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

                                            {/* Message Area moved to WhatsAppAction */}
                                        </div>
                                        <WhatsAppAction id={item.id} tel={item.clienteTel} msg={item.msg} cliente={item.clienteObj} lastService={item.lastService} />
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

                                        {/* Message moved to action area */}
                                        <div className="relative z-10 mt-auto">
                                            <WhatsAppAction id={cliente.id} tel={cliente.telefone} msg={cliente.msg} cliente={cliente} lastService={receitas.filter(r => normalizeName(r.cliente || '') === normalizeName(cliente.nome)).pop()?.procedimento} />
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

                                            {/* Message moved to action area */}
                                        </div>
                                        <div className="shrink-0 w-full lg:w-auto">
                                            <WhatsAppAction
                                                id={cliente.id}
                                                tel={cliente.telefone}
                                                msg={cliente.msg}
                                                cliente={cliente}
                                                lastService={receitas.filter(r => normalizeName(r.cliente || '') === normalizeName(cliente.nome)).pop()?.procedimento}
                                            />
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
