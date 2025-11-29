import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { generateEmailHTML } from '@/lib/email';

/**
 * Test endpoint to preview email format for any day of the week
 * Usage: /api/test/email-preview?dayOfWeek=0&userId=xxx
 * dayOfWeek: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const dayOfWeekParam = url.searchParams.get('dayOfWeek');
  const userIdParam = url.searchParams.get('userId');
  const adminSecret = url.searchParams.get('secret');

  // If ADMIN_SECRET is set in production, require it for access
  // If not set, allow access (for easier testing)
  if (process.env.NODE_ENV === 'production' && process.env.ADMIN_SECRET) {
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'This endpoint requires an admin secret. Add ?secret=YOUR_ADMIN_SECRET to the URL.'
      }, { status: 401 });
    }
  }

  const dayOfWeek = dayOfWeekParam ? parseInt(dayOfWeekParam, 10) : new Date().getDay();
  
  if (dayOfWeek < 0 || dayOfWeek > 6) {
    return NextResponse.json({ error: 'dayOfWeek must be 0-6 (0=Sunday, 6=Saturday)' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const baseUrl = process.env.AUTH0_BASE_URL || 'https://www.besthusbandever.com';

  // Get a test user or use provided userId
  let userId = userIdParam;
  if (!userId) {
    // Get first user from database
    const { data: users } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(1);
    
    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'No users found in database' }, { status: 404 });
    }
    
    userId = users[0].id;
  }

  // Get user data
  const { data: user } = await supabase
    .from('users')
    .select('id, email, name, subscription_tier, has_kids, kids_live_with_you, country, work_days')
    .eq('id', userId)
    .single();

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Get a sample weekly_routine action for daily action
  const { data: dailyAction } = await supabase
    .from('actions')
    .select('*')
    .eq('day_of_week_category', 'weekly_routine')
    .limit(1)
    .single();

  if (!dailyAction) {
    return NextResponse.json({ error: 'No weekly_routine actions found' }, { status: 404 });
  }

  // Get planning actions if Sunday, Monday, or weekday
  let weeklyPlanningActions: any[] = [];
  const isSunday = dayOfWeek === 0;
  const isMonday = dayOfWeek === 1;
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

  if (isSunday || isMonday || isWeekday) {
    // Get 5 planning actions
    const { data: planningActions } = await supabase
      .from('actions')
      .select('*')
      .eq('day_of_week_category', 'planning_required')
      .limit(5);

    weeklyPlanningActions = planningActions || [];
  }

  // Get all actions served last week for Sunday review
  // Last week = previous Monday through Sunday (7-13 days ago)
  let allActionsLastWeek: any[] = [];
  if (dayOfWeek === 0) {
    // Helper function to get Monday of a week
    const getMondayOfWeek = (date: Date): Date => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      return new Date(d.setDate(diff));
    };

    // Get last week's Monday (7 days ago, then get that week's Monday)
    const today = new Date();
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - 7); // Go back 7 days
    const lastWeekMonday = getMondayOfWeek(lastWeekStart);
    const lastWeekStartStr = lastWeekMonday.toISOString().split('T')[0];
    
    // Last week's Sunday (6 days after Monday)
    const lastWeekEnd = new Date(lastWeekMonday);
    lastWeekEnd.setDate(lastWeekMonday.getDate() + 6);
    const lastWeekEndStr = lastWeekEnd.toISOString().split('T')[0];

    // Get all actions served last week
    const { data: servedActions, error: servedError } = await supabase
      .from('user_daily_actions')
      .select('action_id, date, completed, actions(*)')
      .eq('user_id', userId)
      .gte('date', lastWeekStartStr)
      .lte('date', lastWeekEndStr)
      .order('date', { ascending: true });

    // If no actions in exact week range, try to get recent actions (last 14 days) as fallback
    if (!servedActions || servedActions.length === 0) {
      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(today.getDate() - 14);
      const twoWeeksAgoStr = twoWeeksAgo.toISOString().split('T')[0];
      
      const { data: recentActions } = await supabase
        .from('user_daily_actions')
        .select('action_id, date, completed, actions(*)')
        .eq('user_id', userId)
        .gte('date', twoWeeksAgoStr)
        .lte('date', today.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .limit(7); // Get up to 7 most recent actions
      
      if (recentActions && recentActions.length > 0) {
        // Use recent actions as fallback
        const recentActionIds = new Set(recentActions.map(ra => ra.action_id));
        const { data: recentCompletions } = await supabase
          .from('user_action_completions')
          .select('action_id')
          .eq('user_id', userId)
          .in('action_id', Array.from(recentActionIds));
        
        const completedActionIds = new Set(recentCompletions?.map(c => c.action_id) || []);
        
        allActionsLastWeek = recentActions
          .map((sa: any) => {
            const action = sa.actions;
            if (!action || Array.isArray(action) || !action.id) return null;
            return {
              id: action.id,
              name: action.name,
              description: action.description,
              benefit: action.benefit,
              category: action.category,
              date: sa.date,
              completed: sa.completed || completedActionIds.has(sa.action_id),
            };
          })
          .filter((a): a is { id: string; name: string; description: string; benefit: string; category: string; date: string; completed: boolean } => 
            a !== null && typeof a === 'object' && 'id' in a
          );
      }
    } else {
      // Get completed action IDs for the week
      const { data: completions } = await supabase
        .from('user_action_completions')
        .select('action_id')
        .eq('user_id', userId)
        .gte('completed_at', lastWeekStartStr)
        .lte('completed_at', lastWeekEndStr);

      const completedActionIds = new Set(completions?.map(c => c.action_id) || []);

      // Map with completion status
      allActionsLastWeek = servedActions
        .map((sa: any) => {
          const action = sa.actions;
          if (!action || Array.isArray(action) || !action.id) return null;
          return {
            id: action.id,
            name: action.name,
            description: action.description,
            benefit: action.benefit,
            category: action.category,
            date: sa.date,
            completed: sa.completed || completedActionIds.has(sa.action_id),
          };
        })
        .filter((a): a is { id: string; name: string; description: string; benefit: string; category: string; date: string; completed: boolean } => 
          a !== null && typeof a === 'object' && 'id' in a
        );
    }
  }

  // Get a random quote
  const { getRandomQuote } = await import('@/lib/quotes');
  const quote = await getRandomQuote();

  // Generate email HTML
  const emailHTML = generateEmailHTML({
    title: dailyAction.name,
    content: `${dailyAction.description}\n\nWhy this matters: ${dailyAction.benefit || 'Every action strengthens your relationship.'}`,
    category: dailyAction.category,
    quote: quote || undefined,
    actionId: dailyAction.id,
    userId: userId || undefined, // Include userId for "Mark as Done" buttons
    dayOfWeek,
    weeklyPlanningActions: weeklyPlanningActions.map(a => ({
      id: a.id,
      name: a.name || '',
      description: a.description ?? '',
      benefit: a.benefit ?? undefined,
      category: a.category || '',
    })),
    allActionsLastWeek: allActionsLastWeek.map(a => ({
      id: a.id,
      name: a.name || '',
      description: a.description ? a.description : undefined,
      category: a.category || '',
      date: a.date,
      completed: a.completed,
    })),
  }, baseUrl);

  // Return HTML for preview
  return new NextResponse(emailHTML, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

