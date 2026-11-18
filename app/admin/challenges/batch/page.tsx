'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFirms } from '@/lib/firebase/services';
import { MOCK_FIRMS } from '@/lib/data/firms-data';
import { Firm, Challenge } from '@/lib/types';
import BatchChallengePortal from '@/components/admin/BatchChallengePortal';

export default function AdminBatchChallengesPage() {
  const router = useRouter();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFirms() {
      try {
        const firmsData = await getFirms();
        setFirms(firmsData.length > 0 ? firmsData : MOCK_FIRMS);
      } catch (err) {
        console.error('Failed to load firms for batch portal:', err);
        setFirms(MOCK_FIRMS);
      } finally {
        setLoading(false);
      }
    }
    loadFirms();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-foreground rounded-full animate-spin mx-auto" />
        <p className="text-xs text-muted-foreground font-mono">Initializing Batch Challenge Portal...</p>
      </div>
    );
  }

  return (
    <BatchChallengePortal
      firms={firms}
      onSwitchToSingleView={() => router.push('/admin/challenges')}
      onBatchCreated={(newChallenges) => {
        console.log('Batch created successfully:', newChallenges.length);
      }}
    />
  );
}
