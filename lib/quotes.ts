import { getSupabaseAdmin } from './supabase';

export interface Quote {
  id: string;
  quote_text: string;
  author: string | null;
}

/**
 * Get a random quote from the database
 */
export async function getRandomQuote(): Promise<Quote | null> {
  try {
    const supabase = getSupabaseAdmin();
    
    // Get all quotes
    const { data: quotes, error } = await supabase
      .from('quotes')
      .select('id, quote_text, author');
    
    if (error || !quotes || quotes.length === 0) {
      console.error('Error fetching quotes:', error);
      return null;
    }
    
    // Select a random quote
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  } catch (error) {
    console.error('Unexpected error fetching quote:', error);
    return null;
  }
}

