'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Lock, Mail, Loader2, AlertCircle, Trees, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // Initialize Supabase Browser Client (this handles setting the secure cookies for Middleware)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const supabase = createBrowserClient(supabaseUrl, supabaseKey);

    const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMsg(null);

        startTransition(async () => {
            // 1. Sign in with Supabase (automatically sets the HttpOnly cookie)
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError || !authData.user) {
                setErrorMsg(authError?.message || 'Invalid authentication credentials.');
                return;
            }

            // 2. Fetch the user's role profile
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (profile) {
                // Store UI state for quick rendering
                localStorage.setItem('reginas_user_session', JSON.stringify(profile));
            }

            // 3. Redirect to the admin dashboard and force a refresh to trigger middleware
            router.push('/admin');
            router.refresh();
        });
    };

    return (
        <div className="min-h-screen bg-stone-100 flex flex-col justify-center items-center px-4 py-8 font-sans selection:bg-amber-200">
            <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-6">
                {/* Branding Header */}
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-amber-300 flex items-center justify-center mx-auto shadow-md border border-emerald-900">
                        <Trees className="w-6 h-6" />
                    </div>
                    <span className="text-amber-700 text-[10px] font-extrabold uppercase tracking-widest block pt-1">
                        Regina’s Garden Portal
                    </span>
                    <h1 className="font-serif font-bold text-2xl text-stone-900">Staff & Admin Login</h1>
                    <p className="text-xs text-stone-500 font-medium">
                        Enter your authorized credentials to access reservation management.
                    </p>
                </div>

                {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4 text-xs">
                    <div>
                        <label className="font-bold text-stone-700 block mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                required
                                placeholder="staff@reginasgarden.ph"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3.5 py-3 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="font-bold text-stone-700 block mb-1">Password</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-3.5 py-3 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-emerald-950 hover:bg-emerald-900 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-xs flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                    >
                        {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                        ) : (
                            <>
                                <span>Sign In to Dashboard</span>
                                <ArrowRight className="w-4 h-4 text-amber-300" />
                            </>
                        )}
                    </button>
                </form>

                <div className="pt-2 border-t border-stone-100 text-center">
                    <span className="text-[11px] text-stone-400 font-medium flex items-center justify-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
                        Role-Based Access Control (Admin • Manager • Staff)
                    </span>
                </div>
            </div>
        </div>
    );
}