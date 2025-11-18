interface HealthBarProps {
  /**
   * 0–100 value representing current relationship health.
   * We derive this from streak + recent activity.
   */
  value: number;
}

export default function HealthBar({ value }: HealthBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  let label = 'Holding steady';
  if (clamped >= 85) label = 'Strong';
  else if (clamped >= 65) label = 'Good';
  else if (clamped >= 45) label = 'Needs attention';
  else label = 'At risk';

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em]">
            Relationship health
          </p>
          <p className="mt-1 text-xs text-slate-300">
            A simple mirror of how consistently you&apos;re showing up.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-100">{label}</p>
          <p className="text-xs text-slate-500">{clamped}%</p>
        </div>
      </div>

      <div className="h-4 w-full rounded-full bg-slate-800 overflow-hidden border border-slate-700 mb-2">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-500 transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
        <p className="text-[11px] text-slate-400">
          • Completing today&apos;s action nudges this up.
        </p>
        <p className="text-[11px] text-slate-400">
          • Missing days in a row slowly drains it.
        </p>
        <p className="text-[11px] text-slate-400">
          • Big husband moves give visible boosts.
        </p>
      </div>
    </div>
  );
}


