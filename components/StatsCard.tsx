interface StatsCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
  color?: 'warm' | 'blue' | 'green';
  currentStreak?: number;
}

export default function StatsCard({ title, value, subtitle, icon, color, currentStreak }: StatsCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'warm':
        return 'border-orange-500/30 hover:border-orange-500/50 bg-gradient-to-br from-slate-900/90 via-orange-950/20 to-slate-800/90';
      case 'blue':
        return 'border-blue-500/30 hover:border-blue-500/50 bg-gradient-to-br from-slate-900/90 via-blue-950/20 to-slate-800/90';
      case 'green':
        return 'border-emerald-500/30 hover:border-emerald-500/50 bg-gradient-to-br from-slate-900/90 via-emerald-950/20 to-slate-800/90';
      default:
        return 'border-slate-700/50 hover:border-slate-600/50 bg-gradient-to-br from-slate-900/90 to-slate-800/90';
    }
  };

  const getEncouragement = () => {
    if (title === 'Current streak' && currentStreak !== undefined) {
      if (currentStreak >= 30) return "🔥 You're a legend. Keep going.";
      if (currentStreak >= 7) return "🔥 You're on fire!";
      if (currentStreak >= 3) return "💪 Look at you. Actually doing it.";
      if (currentStreak > 0) return "✨ Great start. Keep going.";
    }
    if (title === 'Total actions' && value > 0) {
      if (value >= 50) return "🎯 You're not playing. You're winning.";
      if (value >= 30) return "🎯 Consistency pays off. You're proof.";
      if (value >= 10) return "📈 Building momentum. That's the move.";
    }
    if (title === 'Active days' && value > 0) {
      if (value >= 30) return "🌟 You're committed. She notices.";
      if (value >= 10) return "💯 Showing up. That's what matters.";
    }
    return null;
  };

  const encouragement = getEncouragement();

  return (
    <div className={`${getColorClasses()} rounded-xl shadow-lg p-6 md:p-7 border transition-all duration-200 backdrop-blur-sm hover:shadow-xl`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300 tracking-normal">
          {title}
        </h3>
        <span className="text-2xl md:text-3xl opacity-90">{icon}</span>
      </div>
      <div className="text-4xl md:text-5xl font-bold text-slate-50 mb-2 drop-shadow-sm">{value}</div>
      <p className="text-sm md:text-base text-slate-400 mb-1">{subtitle}</p>
      {encouragement && (
        <p className="text-xs text-slate-500 mt-2 font-medium">{encouragement}</p>
      )}
    </div>
  );
}


