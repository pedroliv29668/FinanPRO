import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, Lock, Activity, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

interface AuthScreenProps {
    appName: string;
    appColor: string;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ appName, appColor }) => {
    const [searchParams] = useSearchParams();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const mode = searchParams.get('mode');
        if (mode === 'signup') {
            setIsLogin(false);
        }
    }, [searchParams]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
            } else {
                // SignUp
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            subscription_status: 'trial',
                            trial_start: new Date().toISOString(),
                            full_name: email.split('@')[0]
                        }
                    }
                });
                
                if (signUpError) throw signUpError;

                if (data.user) {
                    // Tentar criar perfil, mas não travar se falhar (o App.tsx tem fallback)
                    const { error: profileError } = await supabase.from('profiles').upsert([
                        { 
                            id: data.user.id, 
                            email: data.user.email, 
                            subscription_status: 'trial',
                            trial_start: new Date().toISOString()
                        }
                    ]);
                    
                    if (profileError) {
                        console.warn('Erro ao criar perfil inicial (RLS?), mas o sistema tentará recuperar logado:', profileError);
                    }
                }

                alert('Cadastro solicitado! Se o sistema não liberar direto, cheque seu e-mail para confirmar a conta.');
                setIsLogin(true); // Mudar para tela de login após cadastro
            }
        } catch (err: any) {
            console.error('Erro de Autenticação:', err);
            let friendlyMessage = err.message || 'Ocorreu um erro ao tentar autenticar.';
            
            // Tradução de erros comuns do Supabase
            if (err.message === 'email rate limit exceeded') {
                friendlyMessage = 'Muitas tentativas em pouco tempo. Por favor, aguarde alguns minutos e tente novamente.';
            } else if (err.message === 'User already registered') {
                friendlyMessage = 'Este e-mail já está cadastrado. Tente fazer login.';
            } else if (err.message === 'Invalid login credentials') {
                friendlyMessage = 'E-mail ou senha incorretos.';
            }
            
            setError(friendlyMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-3 sm:p-4 sm:p-6 font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-5 sm:p-6 sm:p-10 border border-slate-100 text-center animate-fadeIn relative overflow-hidden">

                {/* Decorativo de fundo */}
                <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: appColor }}></div>

                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform hover:scale-110 duration-500" style={{ backgroundColor: `${appColor}15`, color: appColor }}>
                    <Activity size={32} />
                </div>


                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 uppercase tracking-tight mb-2 leading-tight">
                    FinanPRO
                </h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 sm:mb-8">
                    {isLogin ? 'Bem-vindo(a) de volta' : 'Crie sua conta agora'}
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-left">
                        <AlertCircle className="text-rose-500 shrink-0" size={20} />
                        <p className="text-xs font-bold text-rose-600">{error}</p>
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4 sm:space-y-5 text-left">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">E-mail</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-100 focus:border-slate-300 outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-300"
                                style={{ paddingLeft: '48px' }}
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Senha</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-100 focus:border-slate-300 outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-300"
                                style={{ paddingLeft: '48px' }}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full text-white py-3.5 sm:py-4 rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-h-[48px]"
                        style={{ backgroundColor: appColor }}
                    >
                        {loading ? (
                            <Activity className="animate-spin text-white" size={18} />
                        ) : (
                            isLogin ? <><LogIn size={18} /> Entrar no Sistema</> : <><UserPlus size={18} /> Criar Conta</>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                    >
                        {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça Login'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;
