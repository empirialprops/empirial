'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  Building2,
  Award,
  Sparkles,
} from 'lucide-react';
import { UserProfile, openAuthModal } from '@/lib/utils/auth-store';
import {
  submitVerificationApplication,
  getStoredVerificationApplications,
} from '@/lib/utils/social-store';
import { VerificationApplication } from '@/lib/types';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onApplicationSubmitted?: () => void;
}

export function VerificationModal({
  isOpen,
  onClose,
  currentUser,
  onApplicationSubmitted,
}: VerificationModalProps) {
  const [category, setCategory] = useState<VerificationApplication['category']>('Funded Trader');
  const [tradingExperience, setTradingExperience] = useState('');
  const [proofLinks, setProofLinks] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentStatus = currentUser?.verification_status || 'not_applied';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal();
      return;
    }
    if (!tradingExperience.trim()) {
      setErrorMsg('Please describe your trading background or prop firm affiliation.');
      return;
    }

    try {
      submitVerificationApplication(
        currentUser,
        tradingExperience,
        category,
        proofLinks
      );
      setIsSubmitted(true);
      if (onApplicationSubmitted) onApplicationSubmitted();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit application.');
    }
  };

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl cursor-default"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
                <span>EMPIRIAL Creator Verification</span>
              </div>
              <h3 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
                Apply for Verified Creator
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Verified traders and official prop firms can post analysis, share promo codes, and publish trading frameworks.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Existing Application Status if Pending or Approved */}
          {currentStatus === 'pending' || isSubmitted ? (
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 text-foreground flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">Application Under Review</h4>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                Your verification request has been submitted to the EMPIRIAL Admin Desk. Reviews are typically completed within 2–6 hours.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-medium text-xs transition-all cursor-pointer"
              >
                Close Window
              </button>
            </div>
          ) : currentStatus === 'approved' ? (
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 text-foreground flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">You are a Verified Creator!</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your profile has active publishing permissions. You can compose and share posts directly in the social feed.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-medium text-xs transition-all cursor-pointer"
              >
                Start Posting
              </button>
            </div>
          ) : (
            /* Application Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Category Select */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground text-[11px]">
                  Verification Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
                >
                  <option value="Funded Trader">Funded Trader (Certificate / Payout Holder)</option>
                  <option value="Prop Firm Official">Prop Firm Official / Firm Representative</option>
                  <option value="Market Analyst">Market Analyst / SMC Research Author</option>
                  <option value="Educator">Trading Educator / Community Leader</option>
                </select>
              </div>

              {/* Trading Background Textarea */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground text-[11px]">
                  Trading Background & Verification Summary
                </label>
                <textarea
                  required
                  value={tradingExperience}
                  onChange={(e) => setTradingExperience(e.target.value)}
                  placeholder="Describe your funded prop firm accounts, trading instruments (Gold, Indices, FX), or firm affiliation..."
                  rows={4}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
                />
              </div>

              {/* Proof / Social Links */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground text-[11px]">
                  Proof Links, Payout Certificates or Discord Handle <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={proofLinks}
                  onChange={(e) => setProofLinks(e.target.value)}
                  placeholder="e.g. MyFxBook link, certificate URL, or @discord_handle"
                  className="w-full bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
                />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-rose-500 font-medium text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-medium text-xs sm:text-sm transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <span>Submit Verification Application</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Footer Note */}
          <p className="text-[10px] text-muted-foreground text-center">
            Verification ensures quality and security across EMPIRIAL Social. Spammers and false claims are subject to permanent suspension.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
