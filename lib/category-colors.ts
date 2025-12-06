/**
 * Category color mapping for visual distinction
 * Maps each of the 8 action categories to a unique color scheme
 */

export interface CategoryColorScheme {
  badgeBg: string;      // Background for category badge
  badgeText: string;     // Text color for category badge
  badgeBorder: string;   // Border color for category badge
  borderAccent: string;  // Left border accent color for card
  cardBg: string;        // Card background tint
  cardBorder: string;    // Card border color
  cardHoverBorder: string; // Card hover border color
}

export type CategoryName = 
  | 'Communication'
  | 'Intimacy'
  | 'Partnership'
  | 'Romance'
  | 'Gratitude'
  | 'Conflict Resolution'
  | 'Reconnection'
  | 'Quality Time';

/**
 * Get color scheme for a category
 * Returns default primary colors if category not found
 */
export function getCategoryColors(category: string): CategoryColorScheme {
  const normalizedCategory = category.trim();
  
  const colorMap: Record<string, CategoryColorScheme> = {
    // Communication - Blue/Cyan (trust, clarity) - Option C: Bold
    'Communication': {
      badgeBg: 'bg-cyan-500/20',
      badgeText: 'text-cyan-300',
      badgeBorder: 'border-cyan-500/30',
      borderAccent: 'border-l-4 border-cyan-500',
      cardBg: 'from-slate-900/95 via-cyan-950/40 to-slate-900/95',
      cardBorder: 'border-2 border-cyan-500/50',
      cardHoverBorder: 'hover:border-cyan-500',
    },
    
    // Intimacy - Purple/Violet (deep connection)
    'Intimacy': {
      badgeBg: 'bg-purple-500/20',
      badgeText: 'text-purple-300',
      badgeBorder: 'border-purple-500/30',
      borderAccent: 'border-l-4 border-purple-500',
      cardBg: 'from-slate-900/95 via-purple-950/40 to-slate-900/95',
      cardBorder: 'border-2 border-purple-500/50',
      cardHoverBorder: 'hover:border-purple-500',
    },
    
    // Partnership - Teal/Emerald (balance, teamwork)
    'Partnership': {
      badgeBg: 'bg-emerald-500/20',
      badgeText: 'text-emerald-300',
      badgeBorder: 'border-emerald-500/30',
      borderAccent: 'border-l-4 border-emerald-500',
      cardBg: 'from-slate-900/95 via-emerald-950/40 to-slate-900/95',
      cardBorder: 'border-2 border-emerald-500/50',
      cardHoverBorder: 'hover:border-emerald-500',
    },
    
    // Romance - Pink/Rose (love, passion)
    'Romance': {
      badgeBg: 'bg-pink-500/20',
      badgeText: 'text-pink-300',
      badgeBorder: 'border-pink-500/30',
      borderAccent: 'border-l-4 border-pink-500',
      cardBg: 'from-slate-900/95 via-pink-950/40 to-slate-900/95',
      cardBorder: 'border-2 border-pink-500/50',
      cardHoverBorder: 'hover:border-pink-500',
    },
    
    // Gratitude - Gold/Amber (warmth, appreciation)
    'Gratitude': {
      badgeBg: 'bg-amber-500/20',
      badgeText: 'text-amber-300',
      badgeBorder: 'border-amber-500/30',
      borderAccent: 'border-l-4 border-amber-500',
      cardBg: 'from-slate-900/95 via-amber-950/40 to-slate-900/95',
      cardBorder: 'border-2 border-amber-500/50',
      cardHoverBorder: 'hover:border-amber-500',
    },
    
    // Conflict Resolution - Orange (energy, resolution)
    'Conflict Resolution': {
      badgeBg: 'bg-orange-500/20',
      badgeText: 'text-orange-300',
      badgeBorder: 'border-orange-500/30',
      borderAccent: 'border-l-4 border-orange-500',
      cardBg: 'from-slate-900/95 via-orange-950/40 to-slate-900/95',
      cardBorder: 'border-2 border-orange-500/50',
      cardHoverBorder: 'hover:border-orange-500',
    },
    
    // Reconnection - Indigo (depth, presence)
    'Reconnection': {
      badgeBg: 'bg-indigo-500/20',
      badgeText: 'text-indigo-300',
      badgeBorder: 'border-indigo-500/30',
      borderAccent: 'border-l-4 border-indigo-500',
      cardBg: 'from-slate-900/95 via-indigo-950/40 to-slate-900/95',
      cardBorder: 'border-2 border-indigo-500/50',
      cardHoverBorder: 'hover:border-indigo-500',
    },
    
    // Quality Time - Blue (calm, togetherness)
    'Quality Time': {
      badgeBg: 'bg-blue-500/20',
      badgeText: 'text-blue-300',
      badgeBorder: 'border-blue-500/30',
      borderAccent: 'border-l-4 border-blue-500',
      cardBg: 'from-slate-900/95 via-blue-950/40 to-slate-900/95',
      cardBorder: 'border-2 border-blue-500/50',
      cardHoverBorder: 'hover:border-blue-500',
    },
  };

  // Return mapped colors or default primary colors
  return colorMap[normalizedCategory] || {
    badgeBg: 'bg-primary-500/20',
    badgeText: 'text-primary-300',
    badgeBorder: 'border-primary-500/30',
    borderAccent: 'border-l-4 border-primary-500/60',
    cardBg: 'from-slate-900/95 via-amber-950/10 to-slate-900/95',
    cardBorder: 'border-primary-500/20',
    cardHoverBorder: 'hover:border-primary-500/30',
  };
}

