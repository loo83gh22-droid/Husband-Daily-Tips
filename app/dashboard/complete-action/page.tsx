'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import ActionCompletionModal from '@/components/ActionCompletionModal';
import Link from 'next/link';

function CompleteActionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const actionId = searchParams.get('actionId');
  
  const [action, setAction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchAction() {
      if (!actionId) {
        setError('No action ID provided');
        setLoading(false);
        return;
      }

      try {
        // Fetch action details
        const response = await fetch(`/api/actions/${actionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch action');
        }
        const data = await response.json();
        setAction(data);
        setShowModal(true);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load action');
        setLoading(false);
      }
    }

    fetchAction();
  }, [actionId]);

  const handleComplete = async (notes?: string, linkToJournal?: boolean) => {
    if (!actionId) return;

    try {
      const response = await fetch('/api/actions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId,
          notes: notes?.trim() || undefined,
          linkToJournal: linkToJournal ?? true,
        }),
      });

      if (response.ok) {
        // Redirect to dashboard or journal
        if (linkToJournal) {
          router.push('/dashboard/journal');
        } else {
          router.push('/dashboard');
        }
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to complete action');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete action');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <DashboardNav />
        <main className="container mx-auto px-4 py-8 md:py-12 max-w-full overflow-x-hidden">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 text-center">
              <p className="text-slate-300">Loading action...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !action) {
    return (
      <div className="min-h-screen bg-slate-950">
        <DashboardNav />
        <main className="container mx-auto px-4 py-8 md:py-12 max-w-full overflow-x-hidden">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900/80 border border-red-500/50 rounded-xl p-8">
              <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
              <p className="text-slate-300 mb-6">{error || 'Action not found'}</p>
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

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-full overflow-x-hidden">
        <div className="max-w-4xl mx-auto">
          {/* Action Completion Modal */}
          {showModal && (
            <ActionCompletionModal
              isOpen={showModal}
              onClose={() => {
                setShowModal(false);
                router.push('/dashboard');
              }}
              action={{
                id: action.id,
                name: action.name,
                description: action.description,
                icon: action.icon || '💝',
              }}
              onComplete={handleComplete}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default function CompleteActionPage() {
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
      <CompleteActionContent />
    </Suspense>
  );
}

