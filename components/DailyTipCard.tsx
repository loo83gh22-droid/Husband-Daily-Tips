'use client';

import { format } from 'date-fns';

interface Tip {
  id: string;
  title: string;
  content: string;
  category: string;
  tier: string;
  created_at: string;
}

interface DailyTipCardProps {
  tip: Tip;
}

export default function DailyTipCard({ tip }: DailyTipCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border-l-4 border-primary-600">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-2">
            {tip.category}
          </span>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{tip.title}</h3>
        </div>
        <div className="text-sm text-gray-500">
          {format(new Date(), 'MMM d, yyyy')}
        </div>
      </div>
      
      <div className="prose max-w-none">
        <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
          {tip.content}
        </p>
      </div>

      <div className="mt-6 flex gap-4">
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          Mark as Done ✓
        </button>
        <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors">
          Save for Later
        </button>
      </div>
    </div>
  );
}


