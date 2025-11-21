'use client';

interface ChallengeErrorModalProps {
  challengeName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChallengeErrorModal({
  challengeName,
  isOpen,
  onClose,
}: ChallengeErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border-2 border-amber-500 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-slate-50 mb-2">
            Challenge Already Active
          </h2>
          <p className="text-slate-300 text-lg mb-1">
            You're currently participating in
          </p>
          <p className="text-primary-400 font-semibold text-xl mb-4">
            "{challengeName}"
          </p>
          <p className="text-slate-400 text-sm">
            Complete your current challenge before joining a new one. This helps you stay focused and get the most out of each challenge!
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-300 mb-2">
            <strong>💡 Why one challenge at a time?</strong>
          </p>
          <p className="text-xs text-amber-200/80">
            Focusing on one challenge ensures you can fully commit to all 7 days of actions and see real results. Complete this challenge first, then start a new one!
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-primary-500 hover:bg-primary-400 text-slate-950 font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Got It
        </button>

        <button
          onClick={() => window.location.href = '/dashboard'}
          className="w-full mt-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          View My Challenge →
        </button>
      </div>
    </div>
  );
}

