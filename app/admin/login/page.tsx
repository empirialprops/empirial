'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase/config';
import { saveUser, getStoredUser, DEMO_ADMIN } from '@/lib/utils/auth-store';
import { authenticateStaffCredentials } from '@/lib/utils/roles-store';
import { ShieldAlert, ShieldCheck, Lock, Mail, ArrowRight, Zap, UserCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in as staff/admin, immediately redirect to dashboard
  useEffect(() => {
    const stored = getStoredUser();
    if (stored && ['admin', 'super_admin', 'data_entry', 'reviews_support'].includes(stored.role)) {
      router.replace('/admin');
    }

    const handleAuth = (e: any) => {
      const user = e?.detail || getStoredUser();
      if (user && ['admin', 'super_admin', 'data_entry', 'reviews_support'].includes(user.role)) {
        router.replace('/admin');
      }
    };

    window.addEventListener('auth-changed', handleAuth);
    return () => window.removeEventListener('auth-changed', handleAuth);
  }, [router]);

  const handleLocalAdminLogin = () => {
    saveUser(DEMO_ADMIN);
    window.location.href = '/admin';
  };

  const handleAutoRegister = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured) {
        setError('Firebase API Key is not configured. Entering Local Admin mode...');
        setTimeout(() => handleLocalAdminLogin(), 800);
        return;
      }
      await createUserWithEmailAndPassword(auth, 'admin@anurajfx.com', 'Anuraj@admin12145');
      alert('Admin account created! You can now sign in.');
      setEmail('admin@anurajfx.com');
      setPassword('Anuraj@admin12145');
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        alert('Admin account already exists in Firebase Auth.');
      } else if (err.code === 'auth/api-key-not-valid' || err.message?.includes('api-key-not-valid')) {
        setError('Firebase API key is unconfigured. Redirecting via Local Admin Sandbox...');
        setTimeout(() => handleLocalAdminLogin(), 1000);
      } else {
        setError(err.message || 'An error occurred during account registration.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    // 1. Check local staff credentials database first
    const staffMatch = authenticateStaffCredentials(email, password);
    if (staffMatch) {
      const userObj = {
        uid: staffMatch.id,
        email: staffMatch.email,
        displayName: staffMatch.displayName,
        role: staffMatch.role as any,
        phoneNumber: '',
        traderId: `STAFF-${staffMatch.id}`,
        points: 0,
        accountsPurchased: [],
        is_verified: true,
      };
      saveUser(userObj as any);
      router.replace('/admin');
      setIsLoading(false);
      return;
    }

    try {
      if (!isFirebaseConfigured) {
        // Fallback for unconfigured Firebase
        handleLocalAdminLogin();
        return;
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential?.user) {
        const userObj = {
          uid: userCredential.user.uid,
          email: userCredential.user.email || email,
          displayName: userCredential.user.displayName || 'Staff Administrator',
          role: 'admin' as any,
          phoneNumber: '',
          traderId: `ADM-${userCredential.user.uid.substring(0, 5)}`,
          points: 0,
          accountsPurchased: [],
          is_verified: true,
        };
        saveUser(userObj as any);
      }
      router.replace('/admin');
    } catch (err: any) {
      console.error('Sign-in error:', err);
      if (err.code === 'auth/api-key-not-valid' || err.message?.includes('api-key-not-valid')) {
        setError('Firebase API key is unconfigured or invalid. Entering Local Sandbox Admin mode...');
        setTimeout(() => handleLocalAdminLogin(), 1000);
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid staff credentials. Access denied. Check email & password.');
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Decorative background light beam */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-zinc-900/40 blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[24px] p-6 sm:p-8 space-y-8 shadow-2xl relative z-10">
        {/* Logo and Brand Title */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-zinc-800 flex items-center justify-center text-white">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white mt-3">
              EMPIRIAL Admin Portal
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Sign in with your administrator credentials to access dashboard control modules.
            </p>
          </div>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-400">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-400 block">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@empirial.com"
                className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-400 block">
              Security Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-white text-black hover:bg-zinc-200 font-semibold text-xs transition-all cursor-pointer shadow flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            <span>{isLoading ? 'Verifying Credentials...' : 'Access Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleLocalAdminLogin}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Login as Local Sandbox Admin (Bypass Firebase)</span>
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 space-y-3 flex flex-col items-center">
          <button
            type="button"
            onClick={handleAutoRegister}
            className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold transition-colors underline cursor-pointer"
          >
            Auto-Register Admin Account
          </button>
          <button
            onClick={() => router.push('/')}
            className="text-[10px] text-zinc-500 hover:text-white transition-colors animate-pulse cursor-pointer"
          >
            ← Return to public website
          </button>
        </div>
      </div>
    </div>
  );
}
