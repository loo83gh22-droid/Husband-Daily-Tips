/**
 * Calculate health score based on new algorithm:
 * 
 * 1. Baseline from initial survey (0-100)
 * 2. Daily actions: 1, 2, or 3 points (based on action health_point_value)
 * 3. Daily cap: 3 points max per day
 * 4. Weekly cap: 15 points max per rolling 7-day window
 * 5. 7-day event completion: +3 bonus points
 * 6. Decay: -2 points per missed day
 * 7. Repetition penalty: -1 point if same action within 30 days
 * 8. Badges: Do NOT affect health (reference only)
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
 * Calculate repetition penalty for an action
 * Returns the points to deduct (0, 1, 2, or 3)
 */
async function calculateRepetitionPenalty(
  supabase: any,
  userId: string,
  actionId: string,
  basePoints: number
): Promise<number> {
  // Get last completion of this action within 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const { data: recentCompletions } = await supabase
    .from('action_completion_history')
    .select('completed_at, penalty_applied')
    .eq('user_id', userId)
    .eq('action_id', actionId)
    .gte('completed_at', thirtyDaysAgoStr)
    .order('completed_at', { ascending: false })
    .limit(1);

  if (!recentCompletions || recentCompletions.length === 0) {
    // No recent completion, no penalty
    return 0;
  }

  // Get the penalty level from last completion
  const lastPenalty = recentCompletions[0].penalty_applied || 0;
  const newPenalty = lastPenalty + 1;

  // Penalty cannot exceed base points (can't go negative)
  return Math.min(newPenalty, basePoints);
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

  // Get all action completions with their points
  const { data: completions, error: completionsError } = await supabase
    .from('action_completion_history')
    .select('action_id, completed_at, points_earned, base_points')
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

  // Group completions by date
  const completionsByDate = new Map<string, ActionCompletion[]>();
  completions.forEach((c: any) => {
    const date = new Date(c.completed_at).toISOString().split('T')[0];
    if (!completionsByDate.has(date)) {
      completionsByDate.set(date, []);
    }
    completionsByDate.get(date)!.push({
      action_id: c.action_id,
      completed_at: c.completed_at,
      points_earned: c.points_earned,
      date,
    });
  });

  // Calculate points from actions (with daily and weekly caps)
  const weeklyPoints = new Map<string, number>(); // week_start -> total points
  let totalActionPoints = 0;

  const dateEntries = Array.from(completionsByDate.entries());
  for (let i = 0; i < dateEntries.length; i++) {
    const [date, dayCompletions] = dateEntries[i];
    // Daily cap: max 3 points per day
    const dayPoints = Math.min(
      dayCompletions.reduce((sum: number, c: ActionCompletion) => sum + c.points_earned, 0),
      3
    );

    // Add to weekly total
    const weekStart = getWeekStart(new Date(date));
    const currentWeekPoints = weeklyPoints.get(weekStart) || 0;
    weeklyPoints.set(weekStart, currentWeekPoints + dayPoints);

    totalActionPoints += dayPoints;
  }

  // Apply weekly cap: max 15 points per week
  // Need to recalculate with weekly cap
  let totalPointsAfterWeeklyCap = 0;
  const weeklyTotals = Array.from(weeklyPoints.entries());
  
  for (let i = 0; i < weeklyTotals.length; i++) {
    const [weekStart, weekPoints] = weeklyTotals[i];
    const cappedWeekPoints = Math.min(weekPoints, 15);
    totalPointsAfterWeeklyCap += cappedWeekPoints;
  }

  // Add event completion bonuses (+3 each)
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
  health = baseline + totalPointsAfterWeeklyCap + eventBonusTotal;

  // Apply decay for missed days
  health = await applyDecay(health, userId, supabase);

  // Ensure health stays between 0-100
  return Math.max(0, Math.min(100, health));
}

/**
 * Apply decay for missed days (-2 points per missed day)
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
      .select('decay_applied')
      .eq('user_id', userId);

    // If table doesn't exist, return current health without decay
    if (error && error.code === '42P01') {
      return currentHealth;
    }

    const totalDecay = (missedDays || []).reduce(
      (sum: number, md: any) => sum + (md.decay_applied || 2),
      0
    );

    return Math.max(0, currentHealth - totalDecay);
  } catch (error) {
    // If table doesn't exist or any error, return current health
    return currentHealth;
  }
}

/**
 * Calculate points for a completed action (with repetition penalty)
 * This should be called when an action is completed
 */
export async function calculateActionPoints(
  supabase: any,
  userId: string,
  actionId: string,
  actionPointValue: number // 1, 2, or 3
): Promise<{ pointsEarned: number; penaltyApplied: number }> {
  const penalty = await calculateRepetitionPenalty(
    supabase,
    userId,
    actionId,
    actionPointValue
  );

  const pointsEarned = Math.max(0, actionPointValue - penalty);

  return {
    pointsEarned,
    penaltyApplied: penalty,
  };
}

/**
 * Check and apply daily/weekly caps when recording action completion
 */
export async function recordActionCompletion(
  supabase: any,
  userId: string,
  actionId: string,
  actionPointValue: number,
  completionDate: string // YYYY-MM-DD
): Promise<{ pointsEarned: number; capped: boolean }> {
  // Calculate points with repetition penalty
  const { pointsEarned, penaltyApplied } = await calculateActionPoints(
    supabase,
    userId,
    actionId,
    actionPointValue
  );

  // Check daily cap (3 points max per day)
  const { data: dailyPoints } = await supabase
    .from('daily_health_points')
    .select('action_points')
    .eq('user_id', userId)
    .eq('date', completionDate)
    .single();

  const existingDailyPoints = dailyPoints?.action_points || 0;
  const availableDailyPoints = Math.max(0, 3 - existingDailyPoints);
  const actualPointsEarned = Math.min(pointsEarned, availableDailyPoints);
  const wasCapped = pointsEarned > availableDailyPoints;

  // Record in action_completion_history
  await supabase.from('action_completion_history').insert({
    user_id: userId,
    action_id: actionId,
    completed_at: new Date(completionDate).toISOString(),
    points_earned: actualPointsEarned,
    base_points: actionPointValue,
    penalty_applied: penaltyApplied,
  });

  // Update daily_health_points
  const weekStart = getWeekStart(new Date(completionDate));
  
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

  // Update weekly_health_points (check weekly cap of 15)
  const { data: weeklyPoints } = await supabase
    .from('weekly_health_points')
    .select('points_earned')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .single();

  const existingWeeklyPoints = weeklyPoints?.points_earned || 0;
  const newWeeklyTotal = existingWeeklyPoints + actualPointsEarned;
  const cappedWeeklyTotal = Math.min(newWeeklyTotal, 15);

  await supabase
    .from('weekly_health_points')
    .upsert({
      user_id: userId,
      week_start: weekStart,
      points_earned: cappedWeeklyTotal,
    }, {
      onConflict: 'user_id,week_start',
    });

  return {
    pointsEarned: actualPointsEarned,
    capped: wasCapped,
  };
}

/**
 * Record 7-day event completion bonus (+3 points)
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
    bonus_points: 3,
  });

  // Add to daily_health_points
  const { data: dailyPoints } = await supabase
    .from('daily_health_points')
    .select('event_bonus, total_points')
    .eq('user_id', userId)
    .eq('date', completionDate)
    .single();

  const existingBonus = dailyPoints?.event_bonus || 0;
  const newTotal = (dailyPoints?.total_points || 0) + 3;

  await supabase
    .from('daily_health_points')
    .upsert({
      user_id: userId,
      date: completionDate,
      event_bonus: existingBonus + 3,
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
  if (!dailyPoints || dailyPoints.action_points === 0) {
    await supabase.from('health_decay_log').insert({
      user_id: userId,
      missed_date: missedDate,
      decay_applied: 2,
    });
  }
}
