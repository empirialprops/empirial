'use client';

import React, { useState, useEffect } from 'react';
import { Radio, Edit2, Check, X } from 'lucide-react';
import { MOCK_TICKERS } from '@/lib/data/site-data';
import { MarketTicker } from '@/lib/types';
import { getMarketTickers, updateMarketTicker } from '@/lib/firebase/services';

export default function AdminTickerPage() {
  const [tickers, setTickers] = useState<MarketTicker[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSymbol, setEditingSymbol] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editChange, setEditChange] = useState('');

  useEffect(() => {
    async function loadTickers() {
      try {
        const data = await getMarketTickers();
        if (data && data.length > 0) {
          setTickers(data);
        } else {
          setTickers(MOCK_TICKERS);
        }
      } catch (err) {
        console.error('Failed to load tickers:', err);
        setTickers(MOCK_TICKERS);
      } finally {
        setLoading(false);
      }
    }
    loadTickers();
  }, []);

  const startEdit = (t: MarketTicker) => {
    setEditingSymbol(t.symbol);
    setEditPrice(t.price);
    setEditChange(t.change_24h);
  };

  const handleSave = async (symbol: string) => {
    const isPositive = !editChange.startsWith('-');
    const updatedData = {
      price: editPrice,
      change_24h: editChange,
      is_positive: isPositive
    };

    try {
      await updateMarketTicker(symbol, updatedData);
      setTickers(tickers.map(t => t.symbol === symbol ? { ...t, ...updatedData } : t));
    } catch (err) {
      console.error('Failed to update ticker:', err);
      // Fallback
      setTickers(tickers.map(t => t.symbol === symbol ? { ...t, ...updatedData } : t));
    }
    setEditingSymbol(null);
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-400 font-mono">Loading ticker database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold text-white">Live Market Ticker Feeds</h1>
        <p className="text-xs text-slate-400">Configure continuous market liquidity quotes displayed in the global ticker ribbon.</p>
      </div>

      <div className="bg-elevation-surface border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-elevation-card text-slate-400 uppercase font-bold text-[10px]">
              <th className="p-4">Symbol</th>
              <th className="p-4">Live Price Quote</th>
              <th className="p-4">24h Change %</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-200 font-mono">
            {tickers.map((t, idx) => (
              <tr key={idx} className="hover:bg-elevation-raised/60">
                <td className="p-4 font-bold text-white">{t.symbol}</td>
                <td className="p-4 text-cyan-400">
                  {editingSymbol === t.symbol ? (
                    <input
                      type="text"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="bg-elevation-base border border-white/10 rounded px-2 py-1 text-xs text-white w-28"
                    />
                  ) : (
                    t.price
                  )}
                </td>
                <td className="p-4 font-bold" style={{ color: t.is_positive ? '#22C55E' : '#F43F5E' }}>
                  {editingSymbol === t.symbol ? (
                    <input
                      type="text"
                      value={editChange}
                      onChange={(e) => setEditChange(e.target.value)}
                      className="bg-elevation-base border border-white/10 rounded px-2 py-1 text-xs text-white w-20"
                    />
                  ) : (
                    t.change_24h
                  )}
                </td>
                <td className="p-4 text-right">
                  {editingSymbol === t.symbol ? (
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => handleSave(t.symbol)}
                        className="p-1 rounded bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingSymbol(null)}
                        className="p-1 rounded bg-rose-950/40 text-rose-400 hover:bg-rose-900/60"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(t)}
                      className="p-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
