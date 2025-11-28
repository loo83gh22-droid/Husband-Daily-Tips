import { getSupabaseAdmin } from './supabase';

export type MarketingMessageCategory = 'pricing' | 'value' | 'motivation' | 'social_proof' | 'urgency' | 'conversion' | 'cta';
export type MarketingMessageContext = 'subscription_page' | 'dashboard' | 'landing_page' | 'social_post' | 'banner' | 'all';

export interface MarketingMessage {
  id: string;
  message: string;
  category: MarketingMessageCategory;
  context: string | null;
  is_active: boolean;
  display_order: number;
}

/**
 * Get a random marketing message by category and/or context
 */
export async function getMarketingMessage(
  category?: MarketingMessageCategory,
  context?: MarketingMessageContext
): Promise<MarketingMessage | null> {
  const adminSupabase = getSupabaseAdmin();
  
  let query = adminSupabase
    .from('marketing_messages')
    .select('*')
    .eq('is_active', true);
  
  if (category) {
    query = query.eq('category', category);
  }
  
  if (context && context !== 'all') {
    query = query.or(`context.eq.${context},context.is.null`);
  }
  
  const { data, error } = await query
    .order('display_order', { ascending: true })
    .limit(100); // Get all matching messages, then randomize in code
  
  if (error) {
    // Table might not exist yet - silently fail (migration not run)
    // Only log if it's not a "relation does not exist" error
    if (error.code !== '42P01' && error.code !== 'PGRST116') {
      console.error('Error fetching marketing messages:', error);
    }
    return null;
  }
  
  if (!data || data.length === 0) {
    return null;
  }
  
  // Return a random message from the results
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex] as MarketingMessage;
}

/**
 * Get multiple marketing messages (for rotating display)
 */
export async function getMarketingMessages(
  category?: MarketingMessageCategory,
  context?: MarketingMessageContext,
  limit: number = 5
): Promise<MarketingMessage[]> {
  const adminSupabase = getSupabaseAdmin();
  
  let query = adminSupabase
    .from('marketing_messages')
    .select('*')
    .eq('is_active', true);
  
  if (category) {
    query = query.eq('category', category);
  }
  
  if (context && context !== 'all') {
    query = query.or(`context.eq.${context},context.is.null`);
  }
  
  const { data, error } = await query
    .order('display_order', { ascending: true })
    .limit(100);
  
  if (error) {
    // Table might not exist yet - silently fail (migration not run)
    // Only log if it's not a "relation does not exist" error
    if (error.code !== '42P01' && error.code !== 'PGRST116') {
      console.error('Error fetching marketing messages:', error);
    }
    return [];
  }
  
  if (!data || data.length === 0) {
    return [];
  }
  
  // Shuffle and return limited results
  const shuffled = [...data].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit) as MarketingMessage[];
}

