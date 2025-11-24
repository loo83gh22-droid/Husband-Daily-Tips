'use client';

import { useState, useEffect } from 'react';

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  convertedReferrals: number;
  rewardedReferrals: number;
  referralCredits: number;
  referralCode: string | null;
}

export default function ReferralDashboard() {
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
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-50">Referral Program</h2>
        <div className="bg-primary-500/20 border border-primary-500/40 px-3 py-1 rounded-full text-xs font-medium text-primary-300">
          Earn Free Months
        </div>
      </div>

      <div className="mb-6">
        <p className="text-slate-300 mb-4">
          Share your referral link and both you and your friend get <span className="font-semibold text-primary-400">1 free month of Premium</span> when they subscribe!
        </p>
      </div>

      {/* Referral Code Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Your Referral Code
        </label>
        <div className="flex gap-2">
          <div className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 font-mono text-lg text-slate-50">
            {stats.referralCode || 'Loading...'}
          </div>
          <button
            onClick={copyReferralLink}
            className="px-4 py-3 bg-primary-500 text-slate-950 font-semibold rounded-lg hover:bg-primary-400 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-slate-50 mb-1">
            {stats.totalReferrals}
          </div>
          <div className="text-xs text-slate-400">Total Referrals</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-400 mb-1">
            {stats.pendingReferrals}
          </div>
          <div className="text-xs text-slate-400">Pending</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {stats.convertedReferrals}
          </div>
          <div className="text-xs text-slate-400">Converted</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-primary-400 mb-1">
            {stats.referralCredits}
          </div>
          <div className="text-xs text-slate-400">Free Months</div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-primary-300 mb-2">How It Works</h3>
        <ol className="text-xs text-slate-300 space-y-1 list-decimal list-inside">
          <li>Share your referral link with friends</li>
          <li>When they sign up using your link, they get 1 free month of Premium</li>
          <li>When they subscribe to Premium, you both get 1 free month credit</li>
          <li>Free months are automatically applied to your subscription</li>
        </ol>
      </div>
    </div>
  );
}

