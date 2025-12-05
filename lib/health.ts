/**
 * Calculate health score based on Option 1: Conservative & Steady algorithm:
 * 
 * 1. Baseline from initial survey (0-100)
 * 2. Daily routine actions: +0.5 points per action, max 1.0 point per day
 * 3. Weekly planning actions: +2.0 points per action, max 2.0 points per week
 * 4. 7-day event completion: +3.0 bonus points
 * 5. Decay: -0.5 points per missed day (max -3.5 points per week)
 * 6. Badges: Do NOT affect health (reference only)
 * 
 * Philosophy: Slow, steady progress. Rewards consistency over speed.
 */

interface HealthCalculationInput {
  baselineHealth?: number | null; // From survey (0-100)
  userId: string;
  supabase: any; // Supabase client
}

interface ActionCompletion {
  action_id: string;
  completed_at: string;
  points_earned: number;
  date: string; // YYYY-MM-DD
}

/**
 * Get week start date (Monday) for a given date
 */
function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

/**
 * Determine if an action is a weekly planning action or daily routine action
 * Returns 'weekly' if planning_required, 'daily' otherwise
 */
async function getActionType(
  supabase: any,
  actionId: string
): Promise<'daily' | 'weekly'> {
  const { data: action } = await supabase
    .from('actions')
    .select('day_of_week_category')
    .eq('id', actionId)
    .single();

  // If action has day_of_week_category = 'planning_required', it's a weekly action
  if (action?.day_of_week_category === 'planning_required') {
    return 'weekly';
  }
  
  // Otherwise, it's a daily routine action
  return 'daily';
}

/**
 * Calculate health score based on new algorithm
 */
export async function calculateHealthScore(input: HealthCalculationInput): Promise<number> {
  const { baselineHealth = 50, userId, supabase } = input;

  // Start with baseline (from survey)
  let health = Math.max(0, Math.min(100, baselineHealth || 50));

  // Check if new health algorithm tables exist (migration 045)
  // If not, fall back to baseline health
  try {
    // Try to query action_completion_history to see if new tables exist
    const { error: tableCheckError } = await supabase
      .from('action_completion_history')
      .select('id')
      .limit(1);

    // If table doesn't exist, return baseline (new algorithm not set up yet)
    if (tableCheckError && tableCheckError.code === '42P01') {
      // Table doesn't exist - return baseline health
      return Math.max(0, Math.min(100, baselineHealth || 50));
    }
  } catch (error) {
    // If there's any error checking for tables, fall back to baseline
    return Math.max(0, Math.min(100, baselineHealth || 50));
  }

  // Get all action completions with action type info
  // For old records without action_type, we'll determine it from the action itself
  const { data: completions, error: completionsError } = await supabase
    .from('action_completion_history')
    .select(`
      action_id,
      completed_at,
      points_earned,
      action_type,
      actions(day_of_week_category)
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: true });

  // If error or no completions, just return baseline with decay
  if (completionsError || !completions || completions.length === 0) {
    // No completions yet, just apply decay (if table exists)
    try {
      return await applyDecay(health, userId, supabase);
    } catch (error) {
      // If decay fails (table doesn't exist), just return baseline
      return Math.max(0, Math.min(100, baselineHealth || 50));
    }
  }

  // Separate daily and weekly completions
  const dailyCompletionsByDate = new Map<string, number>(); // date -> total points (capped at 1.0)
  const weeklyCompletionsByWeek = new Map<string, number>(); // week_start -> total points (capped at 2.0)

  for (const completion of completions) {
    const date = new Date(completion.completed_at).toISOString().split('T')[0];
    const weekStart = getWeekStart(new Date(date));
    
    // Determine action type: use stored action_type if available, otherwise check action's day_of_week_category
    let actionType: 'daily' | 'weekly' = 'daily';
    if (completion.action_type) {
      actionType = completion.action_type as 'daily' | 'weekly';
    } else if (completion.actions?.day_of_week_category === 'planning_required') {
      actionType = 'weekly';
    }

    if (actionType === 'weekly') {
      // Weekly planning action: +2.0 points, max 2.0 per week
      const currentWeekPoints = weeklyCompletionsByWeek.get(weekStart) || 0;
      const newWeekPoints = Math.min(currentWeekPoints + 2.0, 2.0);
      weeklyCompletionsByWeek.set(weekStart, newWeekPoints);
    } else {
      // Daily routine action: +0.5 points, max 1.0 per day
      const currentDayPoints = dailyCompletionsByDate.get(date) || 0;
      const newDayPoints = Math.min(currentDayPoints + 0.5, 1.0);
      dailyCompletionsByDate.set(date, newDayPoints);
    }
  }

  // Sum all daily points
  let totalDailyPoints = 0;
  for (const points of Array.from(dailyCompletionsByDate.values())) {
    totalDailyPoints += points;
  }

  // Sum all weekly points (already capped at 2.0 per week)
  let totalWeeklyPoints = 0;
  for (const points of Array.from(weeklyCompletionsByWeek.values())) {
    totalWeeklyPoints += points;
  }

  // Add event completion bonuses (+3.0 each)
  let eventBonusTotal = 0;
  try {
    const { data: eventBonuses } = await supabase
      .from('event_completion_bonuses')
      .select('bonus_points')
      .eq('user_id', userId);

    eventBonusTotal = (eventBonuses || []).reduce(
      (sum: number, eb: any) => sum + (eb.bonus_points || 0),
      0
    );
  } catch (error) {
    // Table doesn't exist yet, no bonuses
    eventBonusTotal = 0;
  }

  // Calculate total health
  const baseline = baselineHealth || 50;
  health = baseline + totalDailyPoints + totalWeeklyPoints + eventBonusTotal;

  // Apply decay for missed days
  health = await applyDecay(health, userId, supabase);

  // Ensure health stays between 0-100
  return Math.max(0, Math.min(100, health));
}

/**
 * Apply decay for missed days (-0.5 points per missed day, max -3.5 per week)
 */
async function applyDecay(
  currentHealth: number,
  userId: string,
  supabase: any
): Promise<number> {
  // Get all missed days (from health_decay_log)
  try {
    const { data: missedDays, error } = await supabase
      .from('health_decay_log')
      .select('missed_date, decay_applied')
      .eq('user_id', userId);

    // If table doesn't exist, return current health without decay
    if (error && error.code === '42P01') {
      return currentHealth;
    }

    // Group decay by week and apply weekly cap of -3.5
    const decayByWeek = new Map<string, number>(); // week_start -> total decay
    
    for (const missedDay of missedDays || []) {
      const weekStart = getWeekStart(new Date(missedDay.missed_date));
      const currentWeekDecay = decayByWeek.get(weekStart) || 0;
      const decayAmount = missedDay.decay_applied || 0.5;
      const newWeekDecay = Math.min(currentWeekDecay + decayAmount, 3.5); // Cap at -3.5 per week
      decayByWeek.set(weekStart, newWeekDecay);
    }

    // Sum all decay (already capped per week)
    const totalDecay = Array.from(decayByWeek.values()).reduce(
      (sum: number, decay: number) => sum + decay,
      0
    );

    return Math.max(0, currentHealth - totalDecay);
  } catch (error) {
    // If table doesn't exist or any error, return current health
    return currentHealth;
  }
}

/**
 * Calculate points for a completed action (Option 1: Conservative & Steady)
 * Daily routine actions: +0.5 points
 * Weekly planning actions: +2.0 points
 * No repetition penalty
 */
export async function calculateActionPoints(
  supabase: any,
  userId: string,
  actionId: string,
  actionPointValue?: number // Not used in Option 1, kept for compatibility
): Promise<{ pointsEarned: number; penaltyApplied: number; actionType: 'daily' | 'weekly' }> {
  const actionType = await getActionType(supabase, actionId);
  
  // Option 1: Fixed points based on action type
  const pointsEarned = actionType === 'weekly' ? 2.0 : 0.5;

  return {
    pointsEarned,
    penaltyApplied: 0, // No repetition penalty in Option 1
    actionType,
  };
}

/**
 * Check and apply daily/weekly caps when recording action completion (Option 1)
 * Daily routine: +0.5 points, max 1.0 per day
 * Weekly planning: +2.0 points, max 2.0 per week
 */
export async function recordActionCompletion(
  supabase: any,
  userId: string,
  actionId: string,
  actionPointValue: number, // Not used in Option 1, kept for compatibility
  completionDate: string // YYYY-MM-DD
): Promise<{ pointsEarned: number; capped: boolean }> {
  // Calculate points and determine action type
  const { pointsEarned, penaltyApplied, actionType } = await calculateActionPoints(
    supabase,
    userId,
    actionId,
    actionPointValue
  );

  const weekStart = getWeekStart(new Date(completionDate));
  let actualPointsEarned = pointsEarned;
  let wasCapped = false;

  if (actionType === 'weekly') {
    // Weekly planning action: check weekly cap (max 2.0 per week)
    const { data: weeklyPoints } = await supabase
      .from('weekly_health_points')
      .select('points_earned')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .single();

    const existingWeeklyPoints = weeklyPoints?.points_earned || 0;
    const availableWeeklyPoints = Math.max(0, 2.0 - existingWeeklyPoints);
    actualPointsEarned = Math.min(pointsEarned, availableWeeklyPoints);
    wasCapped = pointsEarned > availableWeeklyPoints;

    // Update weekly_health_points
    await supabase
      .from('weekly_health_points')
      .upsert({
        user_id: userId,
        week_start: weekStart,
        points_earned: existingWeeklyPoints + actualPointsEarned,
      }, {
        onConflict: 'user_id,week_start',
      });
  } else {
    // Daily routine action: check daily cap (max 1.0 per day)
    const { data: dailyPoints } = await supabase
      .from('daily_health_points')
      .select('action_points')
      .eq('user_id', userId)
      .eq('date', completionDate)
      .single();

    const existingDailyPoints = dailyPoints?.action_points || 0;
    const availableDailyPoints = Math.max(0, 1.0 - existingDailyPoints);
    actualPointsEarned = Math.min(pointsEarned, availableDailyPoints);
    wasCapped = pointsEarned > availableDailyPoints;

    // Update daily_health_points
    await supabase
      .from('daily_health_points')
      .upsert({
        user_id: userId,
        date: completionDate,
        action_points: existingDailyPoints + actualPointsEarned,
        total_points: existingDailyPoints + actualPointsEarned,
      }, {
        onConflict: 'user_id,date',
      });
  }

  // Record in action_completion_history with action_type
  await supabase.from('action_completion_history').insert({
    user_id: userId,
    action_id: actionId,
    completed_at: new Date(completionDate).toISOString(),
    points_earned: actualPointsEarned,
    base_points: actionType === 'weekly' ? 2.0 : 0.5,
    penalty_applied: penaltyApplied,
    action_type: actionType,
  });

  return {
    pointsEarned: actualPointsEarned,
    capped: wasCapped,
  };
}

/**
 * Record 7-day event completion bonus (+3.0 points for Option 1)
 */
export async function recordEventCompletionBonus(
  supabase: any,
  userId: string,
  challengeId: string,
  completionDate: string // YYYY-MM-DD
): Promise<void> {
  // Record the bonus
  await supabase.from('event_completion_bonuses').insert({
    user_id: userId,
    challenge_id: challengeId,
    completed_date: completionDate,
    bonus_points: 3.0,
  });

  // Add to daily_health_points
  const { data: dailyPoints } = await supabase
    .from('daily_health_points')
    .select('event_bonus, total_points')
    .eq('user_id', userId)
    .eq('date', completionDate)
    .single();

    const existingBonus = dailyPoints?.event_bonus || 0;
    const newTotal = (dailyPoints?.total_points || 0) + 3.0;

  await supabase
    .from('daily_health_points')
      .upsert({
        user_id: userId,
        date: completionDate,
        event_bonus: existingBonus + 3.0,
        total_points: newTotal,
      }, {
        onConflict: 'user_id,date',
      });
}

/**
 * Record a missed day (for decay calculation)
 * Should be called by a daily cron job
 */
export async function recordMissedDay(
  supabase: any,
  userId: string,
  missedDate: string // YYYY-MM-DD
): Promise<void> {
  // Check if action was completed on this date
  const { data: dailyPoints } = await supabase
    .from('daily_health_points')
    .select('action_points')
    .eq('user_id', userId)
    .eq('date', missedDate)
    .single();

  // If no action completed (or 0 points), record as missed
  // Option 1: -0.5 points per missed day
  if (!dailyPoints || dailyPoints.action_points === 0) {
    await supabase.from('health_decay_log').insert({
      user_id: userId,
      missed_date: missedDate,
      decay_applied: 0.5,
    });
  }
}
