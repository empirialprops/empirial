'use client';

import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, ShieldCheck, UserCheck, Sparkles, ArrowRight } from 'lucide-react';
import { DEMO_ADMIN, DEMO_TRADER, UserProfile } from '@/lib/utils/auth-store';

export function LoginModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Check local storage for persisted user
    const saved = localStorage.getItem('empirial_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-login-modal', handleOpen);
    return () => window.removeEventListener('open-login-modal', handleOpen);
  }, []);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('empirial_user', JSON.stringify(user));
    setIsOpen(false);
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem('empirial_user');
    setCurrentUser(null);
    window.location.reload();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const newUser: UserProfile = {
      uid: 'user-' + Date.now(),
      email: email,
      displayName: email.split('@')[0],
      phoneNumber: '',
      role: email.includes('admin') ? 'admin' : 'trader',
      traderId: 'EMP-' + Math.floor(10000 + Math.random() * 90000),
      points: 500,
      accountsPurchased: [],
    };
    handleLogin(newUser);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-elevation-modal border border-white/10 rounded-2xl p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Welcome Back to EMPIRIAL' : 'Create Trader Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access exclusive challenge discounts, save watchlists, and earn loyalty rewards.
          </p>
        </div>

        {/* Quick Demo Fast-Logins */}
        <div className="mb-5 p-3 rounded-xl bg-elevation-card border border-white/5 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Instant Demo Access</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleLogin(DEMO_TRADER)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 text-xs font-semibold transition-all"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Demo Trader</span>
            </button>
            <button
              onClick={() => handleLogin(DEMO_ADMIN)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 text-xs font-semibold transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Mode</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trader@example.com"
                required
                className="w-full bg-elevation-base border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-elevation-base border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            <span>{mode === 'login' ? 'Sign In' : 'Create Account (+200 pts)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-4 pt-4 border-t border-white/5 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
