'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ReferralStats {
  totalReferrals: number;
  convertedReferrals: number;
  referralCredits: number;
  referralCode: string | null;
}

export default function ReferralCard() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/referrals/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!stats?.referralCode) return;

    const referralLink = `${window.location.origin}?ref=${stats.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-1/2 mb-3"></div>
          <div className="h-3 bg-slate-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/30 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-slate-50 flex items-center gap-2">
          <span>🎁</span>
          Referral Program
        </h3>
        <Link
          href="/dashboard/referrals"
          className="text-xs text-primary-300 hover:text-primary-200 font-medium"
        >
          View All →
        </Link>
      </div>

      <p className="text-sm text-slate-300 mb-4">
        Share your link and both you and your friend get <span className="font-semibold text-primary-300">1 free month</span> when they subscribe!
      </p>

      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 font-mono text-sm text-slate-50">
          {stats.referralCode || 'Loading...'}
        </div>
        <button
          onClick={copyReferralLink}
          className="px-4 py-2 bg-primary-500 text-slate-950 font-semibold rounded-lg hover:bg-primary-400 transition-colors text-sm"
        >
          {copied ? '✓' : 'Copy'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-xl font-bold text-slate-50">{stats.totalReferrals}</div>
          <div className="text-xs text-slate-400">Total</div>
        </div>
        <div>
          <div className="text-xl font-bold text-green-400">{stats.convertedReferrals}</div>
          <div className="text-xs text-slate-400">Converted</div>
        </div>
        <div>
          <div className="text-xl font-bold text-primary-400">{stats.referralCredits}</div>
          <div className="text-xs text-slate-400">Free Months</div>
        </div>
      </div>
    </div>
  );
}

