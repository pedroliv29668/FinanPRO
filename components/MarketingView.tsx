import React, { useState, useMemo } from 'react';
import {
    MessageCircle, Calendar, Gift, AlertCircle,
    CheckCircle2, Copy, ExternalLink, RefreshCw
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

    // --- Logic: Confirmações (Amanhã) ---
    const confirmacoes = useMemo(() => {
        const amanha = new Date();
        amanha.setDate(amanha.getDate() + 1);
        const amanhaStr = amanha.toISOString().split('T')[0];

        return agendamentos
            .filter(a => a.dataInicio.split('T')[0] === amanhaStr && a.status !== 'Cancelado')
            .map(a => {
                const cliente = clientes.find(c => c.nome === a.cliente);
                const hora = new Date(a.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const msg = `Olá ${a.cliente.split(' ')[0]}! ✨ Passando para confirmar seu horário de ${a.servico} amanhã às ${hora}. Estamos preparando tudo com muito carinho para você! Podemos confirmar sua presença? 🥰`;
                return { ...a, clienteObj: cliente, clienteTel: cliente?.telefone, msg, hora };
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
            const msg = `Parabéns, ${c.nome.split(' ')[0]}! 🥳🎂 Hoje o dia é todo seu! Que tal vir comemorar ficando ainda mais maravilhosa? Preparamos um presente especial para você! Vamos agendar? ✨`;
            return { ...c, msg };
        });
    }, [clientes]);

    // --- Logic: Resgate (Sumidos > 30 dias) ---
    const resgate = useMemo(() => {
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

        return clientes.filter(c => {
            // Última receita
            const ultimasReceitas = receitas.filter(r => r.cliente === c.nome);
            const ultimaDataReceita = ultimasReceitas.length > 0
                ? new Date(Math.max(...ultimasReceitas.map(r => new Date(r.data).getTime())))
                : null;

            // Último agendamento atendido
            const ultimosAgendamentos = agendamentos.filter(a => a.cliente === c.nome && a.status === 'Atendido');
            const ultimaDataAgendamento = ultimosAgendamentos.length > 0
                ? new Date(Math.max(...ultimosAgendamentos.map(a => new Date(a.dataInicio).getTime())))
                : null;

            const ultimaInteracao = ultimaDataReceita || ultimaDataAgendamento;

            // Se nunca veio, não é resgate
            if (!ultimaInteracao) return false;

            return ultimaInteracao < trintaDiasAtras;
        }).map(c => {
            const msg = `Oi ${c.nome.split(' ')[0]}, tudo bem? Sumiu! 🙈 Notei que faz um tempinho que você não vem nos visitar e estamos com saudades. Preparei uma condição especial para sua volta... o que acha? 😘`;
            return { ...c, msg };
        });
    }, [clientes, receitas, agendamentos]);

    return (
        <div className="animate-fadeIn space-y-6 pb-20">
            {/* Header Styles */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-3">
                        <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${appColor}15`, color: appColor }}>
                            <MessageCircle size={24} />
                        </div>
                        Marketing & CRM
                    </h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 ml-1">
                        Automatize sua comunicação
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl overflow-x-auto">
                <button
                    onClick={() => setActiveTab('confirmacoes')}
                    className={`flex-1 min-w-[120px] py-3 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'confirmacoes' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Calendar size={16} className={activeTab === 'confirmacoes' ? 'text-indigo-500' : ''} />
                    Confirmar ({confirmacoes.length})
                </button>
                <button
                    onClick={() => setActiveTab('aniversarios')}
                    className={`flex-1 min-w-[120px] py-3 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'aniversarios' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Gift size={16} className={activeTab === 'aniversarios' ? 'text-pink-500' : ''} />
                    Niver ({aniversariantes.length})
                </button>
                <button
                    onClick={() => setActiveTab('resgate')}
                    className={`flex-1 min-w-[120px] py-3 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'resgate' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <RefreshCw size={16} className={activeTab === 'resgate' ? 'text-amber-500' : ''} />
                    Resgate ({resgate.length})
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[400px]">

                {/* === CONFIRMAÇÕES === */}
                {activeTab === 'confirmacoes' && (
                    <div className="p-6">
                        <div className="mb-6 flex items-center gap-2 text-indigo-500 bg-indigo-50 p-4 rounded-xl">
                            <AlertCircle size={20} />
                            <p className="text-xs font-bold uppercase">Clientes agendados para <span className="underline">Amanhã</span>. Confirme para evitar faltas!</p>
                        </div>

                        <div className="grid gap-4">
                            {confirmacoes.length === 0 ? (
                                <div className="text-center py-10 text-slate-300">
                                    <CheckCircle2 size={48} className="mx-auto mb-3 opacity-50" />
                                    <p className="text-sm font-bold uppercase">Agenda de amanhã vazia ou tudo confirmado!</p>
                                </div>
                            ) : (
                                confirmacoes.map(item => (
                                    <div key={item.id} className="p-4 border border-slate-100 rounded-xl hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-black uppercase whitespace-nowrap">{item.hora}</span>
                                                <h3
                                                    onClick={() => item.clienteObj && onEditCliente(item.clienteObj)}
                                                    className="font-extrabold text-slate-700 uppercase truncate hover:underline cursor-pointer decoration-2 decoration-indigo-300"
                                                >
                                                    {item.cliente}
                                                </h3>
                                            </div>
                                            <p className="text-xs text-slate-400 font-medium truncate">{item.servico}</p>
                                        </div>


                                        {item.clienteTel ? (
                                            <a
                                                href={getLinkWhatsApp(item.clienteTel, item.msg)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full sm:w-auto px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                                            >
                                                <MessageCircle size={16} /> Enviar WhatsApp
                                            </a>
                                        ) : (
                                            <span className="text-[10px] text-rose-400 font-bold uppercase px-3">Sem Telefone</span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* === ANIVERSARIANTES === */}
                {activeTab === 'aniversarios' && (
                    <div className="p-6">
                        <div className="mb-6 flex items-center gap-2 text-pink-500 bg-pink-50 p-4 rounded-xl">
                            <Gift size={20} />
                            <p className="text-xs font-bold uppercase">Clientes fazendo aniversário este mês. Envie um mimo!</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {aniversariantes.length === 0 ? (
                                <div className="col-span-full text-center py-10 text-slate-300">
                                    <Gift size={48} className="mx-auto mb-3 opacity-50" />
                                    <p className="text-sm font-bold uppercase">Nenhum aniversariante este mês.</p>
                                </div>
                            ) : (
                                aniversariantes.map(cliente => (
                                    <div key={cliente.id} className="p-4 border border-pink-100 bg-pink-50/30 rounded-xl flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div className="min-w-0">
                                                <h3
                                                    onClick={() => onEditCliente(cliente)}
                                                    className="font-extrabold text-slate-700 uppercase truncate hover:underline cursor-pointer decoration-2 decoration-pink-300"
                                                >
                                                    {cliente.nome}
                                                </h3>
                                                <p className="text-xs text-pink-500 font-bold mt-1">Dia {cliente.aniversario}</p>
                                            </div>
                                            <div className="w-8 h-8 bg-pink-100 text-pink-50 rounded-full flex items-center justify-center shrink-0">
                                                <Gift size={16} className="text-pink-500" />
                                            </div>
                                        </div>


                                        {cliente.telefone ? (
                                            <a
                                                href={getLinkWhatsApp(cliente.telefone, cliente.msg)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                                            >
                                                <MessageCircle size={16} /> Dar Parabéns
                                            </a>
                                        ) : (
                                            <span className="text-[10px] text-slate-400 font-bold uppercase text-center">Sem WhatsApp</span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* === RESGATE === */}
                {activeTab === 'resgate' && (
                    <div className="p-6">
                        <div className="mb-6 flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-xl">
                            <RefreshCw size={20} />
                            <p className="text-xs font-bold uppercase">Clientes sumidos há +30 dias. Chame de volta!</p>
                        </div>

                        <div className="grid gap-4">
                            {resgate.length === 0 ? (
                                <div className="text-center py-10 text-slate-300">
                                    <CheckCircle2 size={48} className="mx-auto mb-3 opacity-50" />
                                    <p className="text-sm font-bold uppercase">Todos os clientes estão ativos recentemente!</p>
                                </div>
                            ) : (
                                resgate.map(cliente => (
                                    <div key={cliente.id} className="p-4 border border-slate-100 rounded-xl hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                        <div className="min-w-0">
                                            <h3
                                                onClick={() => onEditCliente(cliente)}
                                                className="font-extrabold text-slate-700 uppercase truncate hover:underline cursor-pointer decoration-2 decoration-amber-300"
                                            >
                                                {cliente.nome}
                                            </h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                                Total Gasto: R$ {cliente.totalGasto?.toFixed(2)}
                                            </p>
                                        </div>


                                        {cliente.telefone ? (
                                            <a
                                                href={getLinkWhatsApp(cliente.telefone, cliente.msg)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full sm:w-auto px-4 py-3 bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all active:scale-95"
                                            >
                                                <MessageCircle size={16} /> Resgatar
                                            </a>
                                        ) : (
                                            <span className="text-[10px] text-slate-300 font-bold uppercase">Sem contato</span>
                                        )}
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
