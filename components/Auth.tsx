import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Loader2, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const glassInputClass = "w-full bg-white/50 border border-white/40 rounded-2xl p-4 pl-12 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white/80 outline-none transition-all placeholder-slate-400 text-slate-800 backdrop-blur-sm shadow-inner";

    return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white/40 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl border border-white/50">

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/20 transform rotate-3">
                            <Sparkles className="text-white" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Winning Offer AI</h1>
                        <p className="text-slate-500 font-medium">
                            {isSignUp ? "Create your account to start selling" : "Welcome back, deal closer"}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 flex items-center">
                                <span className="mr-2">⚠️</span> {error}
                            </div>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="email"
                                placeholder="Email address"
                                className={glassInputClass}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="password"
                                placeholder="Password"
                                className={glassInputClass}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center space-x-2 disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm font-medium">
                            {isSignUp ? "Already have an account?" : "Don't have an account?"}
                            <button
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="ml-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
                            >
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Auth;
