'use client';

import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, ShieldCheck, UserCheck, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { DEMO_TRADER, UserProfile } from '@/lib/utils/auth-store';
import {
  loginWithGoogle,
  loginWithDiscord,
  loginWithEmailPassword,
  signupWithEmailPassword,
  AuthSyncResult,
} from '@/lib/firebase/auth-sync';
import { PhoneCaptureModal } from './phone-capture-modal';

export function LoginModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pending OAuth user needing phone input
  const [pendingOAuthUser, setPendingOAuthUser] = useState<{
    uid: string;
    email: string;
    displayName?: string | null;
    provider: string;
    createdAt?: string;
  } | null>(null);

  useEffect(() => {
    const handleOpen = () => {
      setErrorMessage('');
      setIsOpen(true);
    };
    window.addEventListener('open-login-modal', handleOpen);
    return () => window.removeEventListener('open-login-modal', handleOpen);
  }, []);

  const handleSuccessfulAuth = (userProfile: UserProfile) => {
    localStorage.setItem('empirial_user', JSON.stringify(userProfile));
    setIsOpen(false);
    setPendingOAuthUser(null);
    window.location.reload();
  };

  // 1. Google OAuth Sign-In
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const authResult: AuthSyncResult = await loginWithGoogle();

      const profile: UserProfile = {
        uid: authResult.user.uid,
        email: authResult.user.email || '',
        displayName: authResult.user.displayName || authResult.user.email?.split('@')[0] || 'Trader',
        phoneNumber: authResult.user.phoneNumber || '',
        role: authResult.user.email?.includes('admin') ? 'admin' : 'trader',
        traderId: 'EMP-' + Math.floor(10000 + Math.random() * 90000),
        points: 500,
        accountsPurchased: [],
      };

      if (authResult.needsPhonePrompt) {
        // Open phone capture modal before finishing
        setPendingOAuthUser({
          uid: authResult.user.uid,
          email: authResult.user.email || '',
          displayName: authResult.user.displayName,
          provider: 'google.com',
          createdAt: authResult.user.metadata.creationTime,
        });
        return;
      }

      handleSuccessfulAuth(profile);
    } catch (err: any) {
      console.error('Google Auth Failed:', err);
      setErrorMessage(err?.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Discord OAuth Sign-In
  const handleDiscordLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const authResult: AuthSyncResult = await loginWithDiscord();

      const profile: UserProfile = {
        uid: authResult.user.uid,
        email: authResult.user.email || '',
        displayName: authResult.user.displayName || authResult.user.email?.split('@')[0] || 'Trader',
        phoneNumber: authResult.user.phoneNumber || '',
        role: authResult.user.email?.includes('admin') ? 'admin' : 'trader',
        traderId: 'EMP-' + Math.floor(10000 + Math.random() * 90000),
        points: 500,
        accountsPurchased: [],
      };

      if (authResult.needsPhonePrompt) {
        // Open phone capture modal
        setPendingOAuthUser({
          uid: authResult.user.uid,
          email: authResult.user.email || '',
          displayName: authResult.user.displayName,
          provider: 'discord.com',
          createdAt: authResult.user.metadata.creationTime,
        });
        return;
      }

      handleSuccessfulAuth(profile);
    } catch (err: any) {
      console.error('Discord Auth Failed:', err);
      setErrorMessage(err?.message || 'Discord Sign-In failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Email & Password Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setIsLoading(true);
      setErrorMessage('');

      if (mode === 'register') {
        const authResult = await signupWithEmailPassword(
          email,
          password,
          fullName || email.split('@')[0],
          phoneNumber
        );

        const profile: UserProfile = {
          uid: authResult.user.uid,
          email: authResult.user.email || email,
          displayName: fullName || email.split('@')[0],
          phoneNumber: phoneNumber,
          role: email.includes('admin') ? 'admin' : 'trader',
          traderId: 'EMP-' + Math.floor(10000 + Math.random() * 90000),
          points: 500,
          accountsPurchased: [],
        };
        handleSuccessfulAuth(profile);
      } else {
        const authResult = await loginWithEmailPassword(email, password);
        const profile: UserProfile = {
          uid: authResult.user.uid,
          email: authResult.user.email || email,
          displayName: authResult.user.displayName || email.split('@')[0],
          phoneNumber: authResult.user.phoneNumber || '',
          role: email.includes('admin') ? 'admin' : 'trader',
          traderId: 'EMP-' + Math.floor(10000 + Math.random() * 90000),
          points: 500,
          accountsPurchased: [],
        };
        handleSuccessfulAuth(profile);
      }
    } catch (err: any) {
      console.error('Email Auth Failed:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErrorMessage('Invalid email or password. Please check your credentials.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('An account already exists with this email. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('Password must be at least 6 characters.');
      } else {
        setErrorMessage(err?.message || 'Authentication error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Handle Phone Modal Completion
  const handlePhoneModalComplete = (phone: string) => {
    if (!pendingOAuthUser) return;
    const profile: UserProfile = {
      uid: pendingOAuthUser.uid,
      email: pendingOAuthUser.email,
      displayName: pendingOAuthUser.displayName || pendingOAuthUser.email.split('@')[0],
      phoneNumber: phone,
      role: pendingOAuthUser.email.includes('admin') ? 'admin' : 'trader',
      traderId: 'EMP-' + Math.floor(10000 + Math.random() * 90000),
      points: 500,
      accountsPurchased: [],
    };
    handleSuccessfulAuth(profile);
  };

  if (!isOpen && !pendingOAuthUser) return null;

  return (
    <>
      {/* Phone Capture Modal */}
      {pendingOAuthUser && (
        <PhoneCaptureModal
          isOpen={!!pendingOAuthUser}
          user={pendingOAuthUser}
          onComplete={handlePhoneModalComplete}
          onCancel={() => setPendingOAuthUser(null)}
        />
      )}

      {isOpen && !pendingOAuthUser && (
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
            <div className="text-center mb-5">
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

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Social OAuth Buttons */}
            <div className="space-y-2 mb-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-black hover:bg-slate-100 font-semibold text-xs transition-all flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={handleDiscordLogin}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <span>Continue with Discord</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Or with Email
              </span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-3">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Morgan"
                    required
                    className="w-full bg-elevation-base border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              )}

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

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Phone Number / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-elevation-base border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              )}

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
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account & Sync'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Fast-Logins */}
            <div className="mt-4 p-2.5 rounded-xl bg-elevation-card border border-white/5 space-y-1.5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Instant Demo Access</span>
              </div>
              <button
                type="button"
                onClick={() => handleSuccessfulAuth(DEMO_TRADER)}
                className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 text-[11px] font-semibold transition-all cursor-pointer"
              >
                <UserCheck className="w-3 h-3" />
                <span>Demo Trader</span>
              </button>
            </div>

            {/* Footer Toggle */}
            <div className="mt-3 pt-3 border-t border-white/5 text-center text-xs text-slate-400">
              {mode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('register');
                      setErrorMessage('');
                    }}
                    className="text-cyan-400 hover:underline font-semibold"
                  >
                    Sign up free
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('login');
                      setErrorMessage('');
                    }}
                    className="text-cyan-400 hover:underline font-semibold"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
