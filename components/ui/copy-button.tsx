'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  size?: 'sm' | 'md';
  variant?: 'outline' | 'pill' | 'ghost';
  onCopySuccess?: () => void;
}

export function CopyButton({
  textToCopy,
  label,
  size = 'md',
  variant = 'outline',
  onCopySuccess,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      if (onCopySuccess) onCopySuccess();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const variantStyles = {
    outline: 'border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400',
    pill: 'bg-elevation-card border border-white/10 text-slate-200 hover:border-cyan-400 hover:text-white',
    ghost: 'text-slate-400 hover:text-cyan-400 hover:bg-white/5',
  }[variant];

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1 gap-1.5 rounded-md font-mono',
    md: 'text-xs px-3.5 py-1.5 gap-2 rounded-lg font-mono font-medium',
  }[size];

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`inline-flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer ${variantStyles} ${sizeStyles}`}
      title="Click to copy code"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400 animate-in zoom-in-50 duration-200" />
          <span className="text-emerald-400 font-semibold">{label || 'COPIED!'}</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 opacity-70" />
          <span>{label || textToCopy}</span>
        </>
      )}
    </button>
  );
}
