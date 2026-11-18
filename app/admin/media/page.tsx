'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Trash2, Copy, Check } from 'lucide-react';
import { CopyButton } from '@/components/ui/copy-button';

export default function AdminMediaPage() {
  const assets = [
    { name: 'FTMO Logo', url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&auto=format&fit=crop&q=80', size: '24 KB' },
    { name: 'The5ers Logo', url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=120&auto=format&fit=crop&q=80', size: '18 KB' },
    { name: 'Funding Pips Logo', url: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=120&auto=format&fit=crop&q=80', size: '22 KB' },
    { name: 'Topstep Logo', url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=120&auto=format&fit=crop&q=80', size: '20 KB' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Media Assets & Logo Library</h1>
          <p className="text-xs text-slate-400">Upload and manage firm logos, tournament banners, and review receipts.</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>Upload Image</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {assets.map((asset, idx) => (
          <div key={idx} className="bg-elevation-surface border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="h-28 rounded-xl bg-elevation-card border border-white/5 flex items-center justify-center overflow-hidden">
              <img src={asset.url} alt={asset.name} className="h-full object-cover" />
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white truncate max-w-[120px]">{asset.name}</span>
              <span className="text-slate-400 font-mono text-[10px]">{asset.size}</span>
            </div>
            <CopyButton textToCopy={asset.url} label="Copy URL" size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
