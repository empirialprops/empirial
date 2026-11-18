'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Plus, Trash2 } from 'lucide-react';
import { MOCK_SPREADS } from '@/lib/data/spreads-data';
import { BrokerSpread } from '@/lib/types';
import { getBrokerSpreads, createBrokerSpread, deleteBrokerSpread } from '@/lib/firebase/services';

export default function AdminSpreadsPage() {
  const [spreads, setSpreads] = useState<BrokerSpread[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [brokerName, setBrokerName] = useState('');
  const [pair, setPair] = useState<'EURUSD' | 'GBPUSD' | 'USDJPY' | 'XAUUSD' | 'BTCUSD' | 'US30'>('EURUSD');
  const [spreadVal, setSpreadVal] = useState('0.1');
  const [commVal, setCommVal] = useState('3.0');

  useEffect(() => {
    async function loadSpreads() {
      try {
        const data = await getBrokerSpreads();
        if (data && data.length > 0) {
          setSpreads(data);
        } else {
          setSpreads(MOCK_SPREADS);
        }
      } catch (err) {
        console.error('Failed to load spreads:', err);
        setSpreads(MOCK_SPREADS);
      } finally {
        setLoading(false);
      }
    }
    loadSpreads();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this spread telemetry feed?')) return;
    try {
      await deleteBrokerSpread(id);
      setSpreads(spreads.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to delete spread feed:', err);
      // Fallback
      setSpreads(spreads.filter(s => s.id !== id));
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokerName) return;

    const newSpread: Omit<BrokerSpread, 'id'> = {
      broker_name: brokerName,
      pair,
      spread_pips: parseFloat(spreadVal),
      commission_per_lot: parseFloat(commVal),
      account_type: 'Raw Spread',
      platform: 'cTrader / MT5',
      is_active: true,
    };

    try {
      const id = await createBrokerSpread(newSpread);
      setSpreads([{ id, ...newSpread }, ...spreads]);
    } catch (err) {
      console.error('Failed to create spread feed:', err);
      // Fallback
      setSpreads([{ id: 'sp-' + Date.now(), ...newSpread }, ...spreads]);
    }

    setIsAdding(false);
    setBrokerName('');
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-400 font-mono">Loading spreads telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Broker Spreads Manager</h1>
          <p className="text-xs text-slate-400">Configure bid/ask spread feeds and commission models.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Spread Feed</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-elevation-surface border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">Add Spread Telemetry Feed</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              value={brokerName}
              onChange={(e) => setBrokerName(e.target.value)}
              placeholder="Broker Feed (e.g. FTMO Prime)"
              required
              className="bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
            />
            <select
              value={pair}
              onChange={(e) => setPair(e.target.value as any)}
              className="bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="EURUSD">EURUSD</option>
              <option value="GBPUSD">GBPUSD</option>
              <option value="USDJPY">USDJPY</option>
              <option value="XAUUSD">XAUUSD</option>
              <option value="BTCUSD">BTCUSD</option>
              <option value="US30">US30</option>
            </select>
            <input
              type="number"
              step="0.1"
              value={spreadVal}
              onChange={(e) => setSpreadVal(e.target.value)}
              placeholder="Spread Pips (0.1)"
              className="bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
            <input
              type="number"
              step="0.1"
              value={commVal}
              onChange={(e) => setCommVal(e.target.value)}
              placeholder="Commission ($3.0)"
              className="bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg bg-elevation-card text-xs text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-purple-500 text-white font-bold text-xs"
            >
              Save Feed
            </button>
          </div>
        </form>
      )}

      {/* Spreads Table */}
      <div className="bg-elevation-surface border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-elevation-card text-slate-400 uppercase font-bold text-[10px]">
              <th className="p-4">Broker</th>
              <th className="p-4">Pair</th>
              <th className="p-4">Raw Spread</th>
              <th className="p-4">Commission</th>
              <th className="p-4">Platform</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-200">
            {spreads.map((s) => (
              <tr key={s.id} className="hover:bg-elevation-raised/60">
                <td className="p-4 font-bold text-white">{s.broker_name}</td>
                <td className="p-4 font-mono font-bold text-cyan-400">{s.pair}</td>
                <td className="p-4 font-mono text-emerald-400">{s.spread_pips} pips</td>
                <td className="p-4 font-mono">${s.commission_per_lot.toFixed(2)}</td>
                <td className="p-4 text-slate-400">{s.platform}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-1.5 rounded bg-rose-950/40 text-rose-400 hover:bg-rose-900/60"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
