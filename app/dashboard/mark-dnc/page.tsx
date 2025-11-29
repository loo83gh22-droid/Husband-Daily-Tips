'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import Link from 'next/link';

function MarkDNCContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const actionId = searchParams.get('actionId');
  const userId = searchParams.get('userId');
  const date = searchParams.get('date');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function markDNC() {
      if (!actionId || !userId) {
        setError('Missing action ID or user ID');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/actions/dnc-from-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionId,
            userId,
            date: date || null,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess(true);
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setError(data.error || 'Failed to mark action as Did Not Complete');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to mark action as Did Not Complete');
      } finally {
        setLoading(false);
      }
    }

    markDNC();
  }, [actionId, userId, date, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <DashboardNav />
        <main className="container mx-auto px-4 py-8 md:py-12 max-w-full overflow-x-hidden">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 text-center">
              <p className="text-slate-300">Marking action as Did Not Complete...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950">
        <DashboardNav />
        <main className="container mx-auto px-4 py-8 md:py-12 max-w-full overflow-x-hidden">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900/80 border border-red-500/50 rounded-xl p-8">
              <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
              <p className="text-slate-300 mb-6">{error}</p>
              <Link
                href="/dashboard"
                className="inline-block px-6 py-2 bg-primary-500 text-slate-950 rounded-lg hover:bg-primary-400 transition-colors font-semibold"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950">
        <DashboardNav />
        <main className="container mx-auto px-4 py-8 md:py-12 max-w-full overflow-x-hidden">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900/80 border border-green-500/50 rounded-xl p-8 text-center">
              <h1 className="text-2xl font-bold text-green-400 mb-4">✓ Marked as Did Not Complete</h1>
              <p className="text-slate-300 mb-6">
                This action has been marked as Did Not Complete and will no longer appear in your outstanding actions.
              </p>
              <p className="text-slate-400 text-sm mb-6">Redirecting to dashboard...</p>
              <Link
                href="/dashboard"
                className="inline-block px-6 py-2 bg-primary-500 text-slate-950 rounded-lg hover:bg-primary-400 transition-colors font-semibold"
              >
                Go to Dashboard Now
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
}

export default function MarkDNCPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950">
        <DashboardNav />
        <main className="container mx-auto px-4 py-8 md:py-12 max-w-full overflow-x-hidden">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 text-center">
              <p className="text-slate-300">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    }>
      <MarkDNCContent />
    </Suspense>
  );
}

