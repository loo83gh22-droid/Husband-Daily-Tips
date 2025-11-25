'use client';

import { useState } from 'react';
import DailyTipCard from './DailyTipCard';

interface Tip {
  id: string;
  title?: string;
  name?: string;
  content?: string;
  description?: string;
  benefit?: string;
  category: string;
  theme?: string;
  tier?: string;
  created_at: string;
  favorited?: boolean;
  userTipId?: string;
  userActionId?: string;
  isAction?: boolean;
  icon?: string;
}

interface DailyActionCardProps {
  initialTip: Tip;
  subscriptionTier?: string;
}

export default function DailyActionCard({ initialTip, subscriptionTier = 'free' }: DailyActionCardProps) {
  const [currentTip, setCurrentTip] = useState<Tip>(initialTip);

  const handleActionReplaced = (newAction: Tip) => {
    setCurrentTip(newAction);
  };

  return (
    <DailyTipCard 
      tip={currentTip} 
      subscriptionTier={subscriptionTier}
      onActionReplaced={handleActionReplaced}
    />
  );
}

