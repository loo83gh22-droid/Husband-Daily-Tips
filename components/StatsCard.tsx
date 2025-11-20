interface StatsCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
}

export default function StatsCard({ title, value, subtitle, icon }: StatsCardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-xl shadow-lg p-5 md:p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </h3>
        <span className="text-xl md:text-2xl opacity-80">{icon}</span>
      </div>
      <div className="text-3xl md:text-4xl font-bold text-slate-100 mb-1.5 drop-shadow-sm">{value}</div>
      <p className="text-xs md:text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}


