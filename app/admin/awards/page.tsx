'use client';

import React, { useState, useEffect } from 'react';
import { Award, Plus, Trash2 } from 'lucide-react';
import { MOCK_AWARDS } from '@/lib/data/awards-data';
import { Award as AwardType } from '@/lib/types';
import { getAwards, createAward, deleteAward } from '@/lib/firebase/services';

export default function AdminAwardsPage() {
  const [awards, setAwards] = useState<AwardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [categoryName, setCategoryName] = useState('');
  const [year, setYear] = useState('2026');

  useEffect(() => {
    async function loadAwards() {
      try {
        const data = await getAwards();
        if (data && data.length > 0) {
          setAwards(data);
        } else {
          setAwards(MOCK_AWARDS);
        }
      } catch (err) {
        console.error('Failed to load awards:', err);
        setAwards(MOCK_AWARDS);
      } finally {
        setLoading(false);
      }
    }
    loadAwards();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this award category?')) return;
    try {
      await deleteAward(id);
      setAwards(awards.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to delete award category:', err);
      // Fallback
      setAwards(awards.filter(a => a.id !== id));
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName) return;

    const newAward: Omit<AwardType, 'id'> = {
      category_name: categoryName,
      description: '',
      year: parseInt(year) || 2026,
      nominated_firms: [
        { firm_id: 'nys', firm_name: 'NYS Capital', votes: 0 },
        { firm_id: 'ck-capital', firm_name: 'CK Capital', votes: 0 },
        { firm_id: 'alpha-capital', firm_name: 'Alpha Capital', votes: 0 }
      ],
      is_voting_open: true
    };

    try {
      const id = await createAward(newAward);
      setAwards([{ id, ...newAward }, ...awards]);
    } catch (err) {
      console.error('Failed to create award category:', err);
      // Fallback
      setAwards([{ id: 'aw-' + Date.now(), ...newAward }, ...awards]);
    }

    setIsAdding(false);
    setCategoryName('');
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-400 font-mono">Loading awards database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Prop Industry Awards 2026 Manager</h1>
          <p className="text-xs text-slate-400">Configure award categories, nominees, and monitor live voting tallies.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shadow cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-elevation-surface border border-white/10 rounded-2xl p-5 space-y-4 max-w-lg">
          <h3 className="text-sm font-bold text-white">Create New Award Category</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Category Name (e.g. Best Customer Support)"
              required
              className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
            />
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Award Year"
              className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
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
              className="px-4 py-1.5 rounded-lg bg-amber-500 text-white font-bold text-xs"
            >
              Create Category
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {awards.map((award) => {
          const total = award.nominated_firms.reduce((s, f) => s + f.votes, 0);

          return (
            <div key={award.id} className="bg-elevation-surface border border-white/10 rounded-2xl p-6 space-y-4 relative group">
              <div className="flex justify-between items-start pr-8">
                <div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase">{award.year} Category</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{award.category_name}</h3>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">{total.toLocaleString()} votes</span>
              </div>

              <div className="space-y-2">
                {award.nominated_firms.map((firm) => (
                  <div key={firm.firm_id} className="flex justify-between items-center p-2.5 rounded-xl bg-elevation-card border border-white/5 text-xs">
                    <span className="font-bold text-white">{firm.firm_name}</span>
                    <span className="font-mono text-amber-400 font-bold">{firm.votes.toLocaleString()} votes</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleDelete(award.id)}
                className="absolute top-4 right-4 p-1.5 rounded bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
