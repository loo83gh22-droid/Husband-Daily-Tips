/**
 * Logic for handling recurring tips (weekly check-ins, etc.)
 */

import { supabase } from './supabase';

export interface RecurringTip {
  id: string;
  title: string;
  content: string;
  category: string;
  is_recurring: boolean;
  recurrence_type: 'weekly' | 'monthly' | 'yearly' | null;
  recurrence_day: number | null;
  recurrence_time: string | null;
}

/**
 * Check if a recurring tip is due today
 */
export async function getRecurringTipDueToday(
  userId: string,
  tip: RecurringTip,
): Promise<boolean> {
  if (!tip.is_recurring || !tip.recurrence_type) {
    return false;
  }

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

  if (tip.recurrence_type === 'weekly') {
    // Check if today matches the recurrence day
    if (tip.recurrence_day !== null && tip.recurrence_day === dayOfWeek) {
      // Check if already completed this week
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - dayOfWeek);
      weekStart.setHours(0, 0, 0, 0);

      const { data: completion } = await supabase
        .from('recurring_tip_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('tip_id', tip.id)
        .gte('scheduled_date', weekStart.toISOString().split('T')[0])
        .eq('completed', true)
        .single();

      // If not completed this week, it's due
      return !completion;
    }
  }

  return false;
}

/**
 * Get the next scheduled date for a recurring tip
 */
export function getNextScheduledDate(tip: RecurringTip): Date | null {
  if (!tip.is_recurring || !tip.recurrence_type || tip.recurrence_day === null) {
    return null;
  }

  const today = new Date();
  const dayOfWeek = today.getDay();

  if (tip.recurrence_type === 'weekly') {
    const daysUntilNext = (tip.recurrence_day - dayOfWeek + 7) % 7 || 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilNext);
    return nextDate;
  }

  return null;
}

/**
 * Mark a recurring tip as scheduled
 */
export async function scheduleRecurringTip(
  userId: string,
  tipId: string,
  scheduledDate: Date,
): Promise<void> {
  await supabase.from('recurring_tip_completions').upsert({
    user_id: userId,
    tip_id: tipId,
    scheduled_date: scheduledDate.toISOString().split('T')[0],
    completed: false,
  });
}

/**
 * Mark a recurring tip as completed
 */
export async function completeRecurringTip(
  userId: string,
  tipId: string,
  scheduledDate: Date,
): Promise<void> {
  await supabase
    .from('recurring_tip_completions')
    .update({
      completed: true,
      completed_date: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('tip_id', tipId)
    .eq('scheduled_date', scheduledDate.toISOString().split('T')[0]);
}

/**
 * Get all recurring tips for a user
 */
export async function getUserRecurringTips(userId: string): Promise<RecurringTip[]> {
  const { data: tips } = await supabase
    .from('tips')
    .select('*')
    .eq('is_recurring', true);

  return (tips || []) as RecurringTip[];
}

