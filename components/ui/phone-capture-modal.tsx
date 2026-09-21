'use client';

import React, { useState } from 'react';
import { Phone, CheckCircle2, Sparkles, Shield, ArrowRight, X } from 'lucide-react';
import { dispatchUserToSheet } from '@/lib/firebase/auth-sync';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

interface PhoneCaptureModalProps {
  isOpen: boolean;
  user: {
    uid: string;
    email: string;
    displayName?: string | null;
    provider: string;
    createdAt?: string;
  } | null;
  onComplete: (phone: string) => void;
  onCancel?: () => void;
}

export function PhoneCaptureModal({
  isOpen,
  user,
  onComplete,
  onCancel,
}: PhoneCaptureModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError('Please enter a valid phone or WhatsApp number to continue.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // 1. Update in Firestore if available
      if (db && user.uid) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            phoneNumber: phoneNumber.trim(),
          });
        } catch (dbErr) {
          console.warn('Could not update phone in Firestore:', dbErr);
        }
      }

      // 2. Dispatch to Google Sheet
      await dispatchUserToSheet({
        uid: user.uid,
        name: user.displayName || user.email.split('@')[0] || 'Trader',
        email: user.email,
        phone: phoneNumber.trim(),
        provider: user.provider || 'google.com',
        createdAt: user.createdAt || new Date().toISOString(),
      });

      // 3. Complete callback
      onComplete(phoneNumber.trim());
    } catch (err: any) {
      console.error('Failed to submit phone number:', err);
      setError(err?.message || 'Failed to save phone number. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0e0e12] border border-white/10 rounded-2xl p-6 shadow-2xl">
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-3">
            <Phone className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Complete Your Registration
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enter your mobile / WhatsApp number to receive proprietary deal alerts and account verification.
          </p>
        </div>

        {/* User Card */}
        <div className="mb-5 p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-sm">
            {(user.displayName || user.email)[0].toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-white truncate">
              {user.displayName || 'New Trader'}
            </div>
            <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
          </div>
          <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300 uppercase">
            {user.provider}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mobile Number / WhatsApp <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000 or +91 98765 43210"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all"
              />
            </div>
            {error && <p className="text-xs text-rose-400 mt-1.5">{error}</p>}
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[11px] text-emerald-300/80 flex items-center gap-2">
            <Shield className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>Encrypted and synced directly with our secure municipal & trader records.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Saving & Connecting...</span>
            ) : (
              <>
                <span>Complete Registration & Access</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
