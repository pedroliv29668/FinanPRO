import React, { useState, useMemo } from 'react';
import {
    Users, Plus, Search, Phone, Mail, Trash2, X,
    Edit3, MessageCircle, Award, FileText, AlertTriangle, Save, Cake, ChevronRight, ArrowLeft
} from 'lucide-react';
import { Cliente, Receita } from '../types';

interface ClientesViewProps {
    clientes: Cliente[];
    setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
    receitas: Receita[];
    appColor: string;
    servicos: string[];
    clienteExternoParaEditar?: Cliente | null;
    onClearExterno?: () => void;
}

type ViewMode = 'lista' | 'cadastro' | 'detalhes';

const ClientesView: React.FC<ClientesViewProps> = ({
    clientes,
    setClientes,
    receitas,
    appColor,
    servicos,
    clienteExternoParaEditar,
    onClearExterno
}) => {
    const [busca, setBusca] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('lista');
    const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
    const [clienteDetalhes, setClienteDetalhes] = useState<Cliente | null>(null);
    const [ordenacao, setOrdenacao] = useState<'nome' | 'gastos'>('gastos');

    const [formCliente, setFormCliente] = useState({
        nome: '',
        telefone: '',
        email: '',
        aniversario: '',
        observacoes: '',
        anamnese: {
            alergias: '',
            problemasSaude: '',
            medicamentos: '',
            gestante: false,
            observacoesClinicas: ''
        }
    });

    // Calcular gastos e procedimentos por cliente baseado nas receitas
    const clientesComDados = useMemo(() => {
        return clientes.map(cliente => {
            const receitasCliente = receitas.filter(r =>
                r.cliente?.toLowerCase() === cliente.nome.toLowerCase()
            );
            const totalGasto = receitasCliente.reduce((acc, r) => acc + r.valor, 0);
            const procedimentos = receitasCliente.map(r => ({
                nome: r.procedimento || 'Procedimento',
                data: r.data,
                valor: r.valor
            }));
            return {
                ...cliente,
                totalGasto,
                totalAtendimentos: receitasCliente.length,
                procedimentosRealizados: procedimentos
            };
        });
    }, [clientes, receitas]);

    // Verificar aniversariantes do mês
    const mesAtual = new Date().getMonth() + 1;
    const aniversariantesDoMes = useMemo(() => {
        return clientesComDados.filter(c => {
            if (!c.aniversario) return false;
            const [dia, mes] = c.aniversario.split('/');
            return parseInt(mes) === mesAtual;
        });
    }, [clientesComDados, mesAtual]);

    // Filtrar e ordenar clientes
    const clientesFiltrados = useMemo(() => {
        let resultado = clientesComDados.filter(c =>
            c.nome.toLowerCase().includes(busca.toLowerCase()) ||
            c.telefone?.includes(busca) ||
            c.email?.toLowerCase().includes(busca.toLowerCase())
        );

        if (ordenacao === 'gastos') {
            resultado.sort((a, b) => (b.totalGasto || 0) - (a.totalGasto || 0));
        } else {
            resultado.sort((a, b) => a.nome.localeCompare(b.nome));
        }

        return resultado;
    }, [clientesComDados, busca, ordenacao]);

    const formatMoeda = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const formatTelefoneWhatsApp = (telefone: string) => {
        const limpo = telefone.replace(/\D/g, '');
        return limpo.startsWith('55') ? limpo : `55${limpo}`;
    };

    const handleAbrirWhatsApp = (telefone: string) => {
        const numero = formatTelefoneWhatsApp(telefone);
        window.open(`https://wa.me/${numero}`, '_blank');
    };

    const handleNovoCliente = () => {
        setClienteEditando(null);
        setFormCliente({
            nome: '',
            telefone: '',
            email: '',
            aniversario: '',
            observacoes: '',
            anamnese: {
                alergias: '',
                problemasSaude: '',
                medicamentos: '',
                gestante: false,
                observacoesClinicas: ''
            }
        });
        setViewMode('cadastro');
    };

    const handleEditarCliente = (cliente: Cliente) => {
        setClienteEditando(cliente);
        setFormCliente({
            nome: cliente.nome,
            telefone: cliente.telefone || '',
            email: cliente.email || '',
            aniversario: cliente.aniversario || '',
            observacoes: cliente.observacoes || '',
            anamnese: cliente.anamnese || {
                alergias: '',
                problemasSaude: '',
                medicamentos: '',
                gestante: false,
                observacoesClinicas: ''
            }
        });
        setViewMode('cadastro');
    };

    const handleVerDetalhes = (cliente: Cliente) => {
        setClienteDetalhes(cliente);
        setViewMode('detalhes');
    };

    // Efeito para tratar edição externa ( vindo do Marketing )
    React.useEffect(() => {
        if (clienteExternoParaEditar) {
            setClienteEditando(clienteExternoParaEditar);
            setFormCliente({
                nome: clienteExternoParaEditar.nome,
                telefone: clienteExternoParaEditar.telefone || '',
                email: clienteExternoParaEditar.email || '',
                aniversario: clienteExternoParaEditar.aniversario || '',
                observacoes: clienteExternoParaEditar.observacoes || '',
                anamnese: {
                    alergias: clienteExternoParaEditar.anamnese?.alergias || '',
                    problemasSaude: clienteExternoParaEditar.anamnese?.problemasSaude || '',
                    medicamentos: clienteExternoParaEditar.anamnese?.medicamentos || '',
                    gestante: clienteExternoParaEditar.anamnese?.gestante || false,
                    observacoesClinicas: clienteExternoParaEditar.anamnese?.observacoesClinicas || ''
                }
            });
            setViewMode('cadastro');
            onClearExterno?.();
        }
    }, [clienteExternoParaEditar, onClearExterno]);

    const handleSalvarCliente = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formCliente.nome.trim()) return;

        if (clienteEditando) {
            setClientes(prev => prev.map(c =>
                c.id === clienteEditando.id
                    ? { ...c, ...formCliente }
                    : c
            ));
        } else {
            const novoCliente: Cliente = {
                id: Date.now(),
                ...formCliente,
                totalGasto: 0,
                totalAtendimentos: 0
            };
            setClientes(prev => [novoCliente, ...prev]);
        }

        setViewMode('lista');
        setClienteEditando(null);
    };

    const handleExcluirCliente = (id: number) => {
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            setClientes(prev => prev.filter(c => c.id !== id));
            setViewMode('lista');
            setClienteDetalhes(null);
        }
    };

    const handleVoltar = () => {
        setViewMode('lista');
        setClienteDetalhes(null);
        setClienteEditando(null);
    };

    const isAniversariante = (aniversario?: string) => {
        if (!aniversario) return false;
        const [, mes] = aniversario.split('/');
        return parseInt(mes) === mesAtual;
    };

    // ========== VIEW: LISTA ==========
    if (viewMode === 'lista') {
        return (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-24">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-lg sm:text-xl font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-2 sm:gap-3">
                            <div className="p-2 sm:p-2.5 rounded-xl" style={{ backgroundColor: `${appColor}15`, color: appColor }}>
                                <Users size={20} className="sm:hidden" />
                                <Users size={24} className="hidden sm:block" />
                            </div>
                            Meus Clientes
                        </h1>
                        <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                            {clientes.length} clientes cadastrados
                        </p>
                    </div>
                </div>

                {/* Aniversariantes do Mês */}
                {aniversariantesDoMes.length > 0 && (
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-3 sm:p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-pink-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Cake size={16} className="text-pink-500" />
                            <p className="text-[10px] sm:text-xs font-extrabold text-pink-600 uppercase tracking-widest">
                                🎂 Aniversariantes ({aniversariantesDoMes.length})
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {aniversariantesDoMes.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => handleVerDetalhes(c)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-pink-100 hover:shadow-md transition-all text-xs"
                                >
                                    <span className="font-bold text-slate-700">{c.nome.split(' ')[0]}</span>
                                    <span className="font-bold text-pink-500">{c.aniversario}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Busca e Ordenação */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className="w-full bg-white p-3 sm:p-3.5 pl-10 rounded-xl border border-slate-200 text-sm font-medium focus:border-slate-300 outline-none"
                        />
                    </div>
                    <div className="flex gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto w-full sm:w-auto">
                        <button
                            onClick={() => setOrdenacao('gastos')}
                            className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase transition-all ${ordenacao === 'gastos' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
                                }`}
                        >
                            💰 Top
                        </button>
                        <button
                            onClick={() => setOrdenacao('nome')}
                            className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase transition-all ${ordenacao === 'nome' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
                                }`}
                        >
                            A-Z
                        </button>
                    </div>
                </div>

                {/* Lista de Clientes */}
                <div className="space-y-3">
                    {clientesFiltrados.map((cliente, index) => (
                        <div
                            key={cliente.id}
                            className={`bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.99] ${isAniversariante(cliente.aniversario) ? 'ring-2 ring-pink-200' : ''
                                }`}
                            onClick={() => handleVerDetalhes(cliente)}
                        >
                            <div className="flex items-center gap-3 sm:gap-4">
                                {/* Avatar com Ranking */}
                                <div className="relative">
                                    <div
                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-white text-base sm:text-lg font-black shrink-0"
                                        style={{ backgroundColor: appColor }}
                                    >
                                        {cliente.nome.charAt(0).toUpperCase()}
                                    </div>
                                    {ordenacao === 'gastos' && index < 3 && (
                                        <div className={`absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow ${index === 0 ? 'bg-amber-400' : index === 1 ? 'bg-slate-400' : 'bg-amber-600'
                                            }`}>
                                            {index + 1}
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-extrabold text-slate-800 uppercase truncate">{cliente.nome}</p>
                                        {isAniversariante(cliente.aniversario) && (
                                            <span className="text-xs">🎂</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] sm:text-xs text-slate-400 font-medium">
                                        {cliente.totalAtendimentos || 0} atendimentos
                                    </p>
                                    <p className="text-sm sm:text-base font-black mt-0.5" style={{ color: appColor }}>
                                        {formatMoeda(cliente.totalGasto || 0)}
                                    </p>
                                </div>

                                {/* Arrow */}
                                <ChevronRight className="text-slate-300" size={20} />
                            </div>
                        </div>
                    ))}
                </div>

                {clientesFiltrados.length === 0 && (
                    <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                        <Users className="mx-auto text-slate-300 mb-3" size={40} />
                        <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest">
                            {busca ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                        </p>
                        <button
                            onClick={handleNovoCliente}
                            className="mt-3 text-xs font-bold uppercase tracking-widest hover:underline"
                            style={{ color: appColor }}
                        >
                            Cadastrar primeiro cliente
                        </button>
                    </div>
                )}

                {/* Botão Flutuante */}
                <button
                    onClick={handleNovoCliente}
                    className="fixed bottom-6 right-6 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white shadow-xl hover:brightness-110 transition-all active:scale-95 z-50"
                    style={{ backgroundColor: appColor }}
                >
                    <Plus size={24} className="sm:hidden" />
                    <Plus size={28} className="hidden sm:block" />
                </button>
            </div>
        );
    }

    // ========== VIEW: CADASTRO ==========
    if (viewMode === 'cadastro') {
        return (
            <div className="animate-fadeIn pb-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={handleVoltar}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <h1 className="text-lg font-extrabold text-slate-800 uppercase tracking-tight">
                        {clienteEditando ? 'Editar Cliente' : 'Nova Cliente'}
                    </h1>
                </div>

                <form onSubmit={handleSalvarCliente} className="space-y-5">
                    {/* Dados Básicos */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 space-y-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">📋 Dados Pessoais</p>

                        <input
                            type="text"
                            required
                            value={formCliente.nome}
                            onChange={(e) => setFormCliente({ ...formCliente, nome: e.target.value })}
                            className="w-full bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-sm font-bold focus:border-slate-300 outline-none uppercase placeholder:normal-case placeholder:font-normal"
                            placeholder="Nome completo *"
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="tel"
                                value={formCliente.telefone}
                                onChange={(e) => setFormCliente({ ...formCliente, telefone: e.target.value })}
                                className="w-full bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-slate-300 outline-none"
                                placeholder="📱 Telefone"
                            />
                            <input
                                type="text"
                                value={formCliente.aniversario}
                                onChange={(e) => setFormCliente({ ...formCliente, aniversario: e.target.value })}
                                className="w-full bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-slate-300 outline-none"
                                placeholder="🎂 DD/MM"
                            />
                        </div>

                        <input
                            type="email"
                            value={formCliente.email}
                            onChange={(e) => setFormCliente({ ...formCliente, email: e.target.value })}
                            className="w-full bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-slate-300 outline-none"
                            placeholder="✉️ Email (opcional)"
                        />
                    </div>

                    {/* Anamnese */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 space-y-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                            <FileText size={12} /> Ficha de Anamnese
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={formCliente.anamnese.alergias}
                                onChange={(e) => setFormCliente({
                                    ...formCliente,
                                    anamnese: { ...formCliente.anamnese, alergias: e.target.value }
                                })}
                                className="w-full bg-red-50 p-3 rounded-xl border border-red-100 text-sm font-medium outline-none"
                                placeholder="⚠️ Alergias"
                            />
                            <input
                                type="text"
                                value={formCliente.anamnese.medicamentos}
                                onChange={(e) => setFormCliente({
                                    ...formCliente,
                                    anamnese: { ...formCliente.anamnese, medicamentos: e.target.value }
                                })}
                                className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none"
                                placeholder="💊 Medicamentos"
                            />
                        </div>

                        <input
                            type="text"
                            value={formCliente.anamnese.problemasSaude}
                            onChange={(e) => setFormCliente({
                                ...formCliente,
                                anamnese: { ...formCliente.anamnese, problemasSaude: e.target.value }
                            })}
                            className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none"
                            placeholder="🏥 Problemas de saúde"
                        />

                        <label className="flex items-center gap-3 cursor-pointer bg-purple-50 px-4 py-3 rounded-xl border border-purple-100">
                            <input
                                type="checkbox"
                                checked={formCliente.anamnese.gestante}
                                onChange={(e) => setFormCliente({
                                    ...formCliente,
                                    anamnese: { ...formCliente.anamnese, gestante: e.target.checked }
                                })}
                                className="w-5 h-5 rounded accent-purple-500"
                            />
                            <span className="text-sm font-bold text-purple-600">🤰 Gestante</span>
                        </label>

                        <textarea
                            value={formCliente.anamnese.observacoesClinicas}
                            onChange={(e) => setFormCliente({
                                ...formCliente,
                                anamnese: { ...formCliente.anamnese, observacoesClinicas: e.target.value }
                            })}
                            className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none resize-none"
                            rows={2}
                            placeholder="📝 Observações clínicas..."
                        />
                    </div>

                    {/* Observações */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100">
                        <textarea
                            value={formCliente.observacoes}
                            onChange={(e) => setFormCliente({ ...formCliente, observacoes: e.target.value })}
                            className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none resize-none"
                            rows={2}
                            placeholder="💬 Observações gerais (preferências, etc.)"
                        />
                    </div>

                    {/* Botão Salvar */}
                    <button
                        type="submit"
                        className="w-full py-4 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg hover:brightness-110 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        style={{ backgroundColor: appColor }}
                    >
                        <Save size={18} />
                        {clienteEditando ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                    </button>
                </form>
            </div>
        );
    }

    // ========== VIEW: DETALHES ==========
    if (viewMode === 'detalhes' && clienteDetalhes) {
        return (
            <div className="animate-fadeIn pb-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={handleVoltar}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-extrabold text-slate-800 uppercase tracking-tight truncate">
                            {clienteDetalhes.nome}
                        </h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">
                            {clienteDetalhes.totalAtendimentos || 0} atendimentos
                        </p>
                    </div>
                </div>

                {/* Total Gasto */}
                <div className="p-5 rounded-2xl mb-4" style={{ backgroundColor: `${appColor}10` }}>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total Investido</p>
                    <p className="text-2xl sm:text-3xl font-black" style={{ color: appColor }}>
                        {formatMoeda(clienteDetalhes.totalGasto || 0)}
                    </p>
                </div>

                {/* Contatos */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {clienteDetalhes.telefone && (
                        <button
                            onClick={() => handleAbrirWhatsApp(clienteDetalhes.telefone!)}
                            className="flex items-center gap-2 p-3 sm:p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all"
                        >
                            <MessageCircle className="text-emerald-500" size={18} />
                            <div className="text-left min-w-0 flex-1">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">WhatsApp</p>
                                <p className="text-xs font-bold text-emerald-600 truncate">{clienteDetalhes.telefone}</p>
                            </div>
                        </button>
                    )}
                    {clienteDetalhes.email && (
                        <a
                            href={`mailto:${clienteDetalhes.email}`}
                            className="flex items-center gap-2 p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all"
                        >
                            <Mail className="text-blue-500" size={18} />
                            <div className="text-left min-w-0 flex-1">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Email</p>
                                <p className="text-xs font-bold text-blue-600 truncate">{clienteDetalhes.email}</p>
                            </div>
                        </a>
                    )}
                    {clienteDetalhes.aniversario && (
                        <div className="flex items-center gap-2 p-3 sm:p-4 bg-pink-50 rounded-xl col-span-2 sm:col-span-1">
                            <Cake className="text-pink-500" size={18} />
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Aniversário</p>
                                <p className="text-xs font-bold text-pink-600">{clienteDetalhes.aniversario}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Anamnese */}
                {clienteDetalhes.anamnese && (
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 mb-4">
                        <h3 className="text-[10px] font-extrabold text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <FileText size={14} /> Ficha de Anamnese
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {clienteDetalhes.anamnese.alergias && (
                                <div className="p-3 bg-red-50 rounded-xl">
                                    <p className="text-[9px] font-bold text-red-400 uppercase flex items-center gap-1">
                                        <AlertTriangle size={10} /> Alergias
                                    </p>
                                    <p className="text-xs font-medium text-slate-700 mt-1">{clienteDetalhes.anamnese.alergias}</p>
                                </div>
                            )}
                            {clienteDetalhes.anamnese.medicamentos && (
                                <div className="p-3 bg-amber-50 rounded-xl">
                                    <p className="text-[9px] font-bold text-amber-500 uppercase">Medicamentos</p>
                                    <p className="text-xs font-medium text-slate-700 mt-1">{clienteDetalhes.anamnese.medicamentos}</p>
                                </div>
                            )}
                            {clienteDetalhes.anamnese.problemasSaude && (
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Problemas de Saúde</p>
                                    <p className="text-xs font-medium text-slate-700 mt-1">{clienteDetalhes.anamnese.problemasSaude}</p>
                                </div>
                            )}
                            {clienteDetalhes.anamnese.gestante && (
                                <div className="p-3 bg-purple-50 rounded-xl">
                                    <p className="text-xs font-bold text-purple-600">🤰 Gestante</p>
                                </div>
                            )}
                            {clienteDetalhes.anamnese.observacoesClinicas && (
                                <div className="p-3 bg-slate-50 rounded-xl sm:col-span-2">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Observações Clínicas</p>
                                    <p className="text-xs font-medium text-slate-700 mt-1">{clienteDetalhes.anamnese.observacoesClinicas}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Histórico de Procedimentos */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 mb-4">
                    <h3 className="text-[10px] font-extrabold text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Award size={14} /> Histórico
                    </h3>
                    {clienteDetalhes.procedimentosRealizados && clienteDetalhes.procedimentosRealizados.length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {clienteDetalhes.procedimentosRealizados.map((proc, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-slate-700 uppercase truncate">{proc.nome}</p>
                                        <p className="text-[10px] font-medium text-slate-400">{new Date(proc.data + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <p className="text-sm font-black ml-3" style={{ color: appColor }}>{formatMoeda(proc.valor)}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-4 text-xs font-bold text-slate-400 uppercase bg-slate-50 rounded-xl">
                            Nenhum procedimento
                        </p>
                    )}
                </div>

                {/* Observações */}
                {clienteDetalhes.observacoes && (
                    <div className="p-4 bg-slate-50 rounded-xl mb-4">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Observações</p>
                        <p className="text-sm text-slate-600">{clienteDetalhes.observacoes}</p>
                    </div>
                )}

                {/* Ações */}
                <div className="flex gap-3">
                    <button
                        onClick={() => handleEditarCliente(clienteDetalhes)}
                        className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                        <Edit3 size={16} /> Editar
                    </button>
                    <button
                        onClick={() => handleExcluirCliente(clienteDetalhes.id)}
                        className="py-3.5 px-5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl transition-all"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default ClientesView;
