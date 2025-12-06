/**
 * Category color mapping for visual distinction
 * Maps each of the 8 action categories to a unique color scheme
 */

export interface CategoryColorScheme {
  badgeBg: string;      // Background for category badge
  badgeText: string;     // Text color for category badge
  badgeBorder: string;   // Border color for category badge
  borderAccent: string;  // Left border accent color for card
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
    // Communication - Blue/Cyan (trust, clarity)
    'Communication': {
      badgeBg: 'bg-cyan-500/20',
      badgeText: 'text-cyan-300',
      badgeBorder: 'border-cyan-500/30',
      borderAccent: 'border-l-cyan-500/50',
    },
    
    // Intimacy - Purple/Violet (deep connection)
    'Intimacy': {
      badgeBg: 'bg-purple-500/20',
      badgeText: 'text-purple-300',
      badgeBorder: 'border-purple-500/30',
      borderAccent: 'border-l-purple-500/50',
    },
    
    // Partnership - Teal/Emerald (balance, teamwork)
    'Partnership': {
      badgeBg: 'bg-emerald-500/20',
      badgeText: 'text-emerald-300',
      badgeBorder: 'border-emerald-500/30',
      borderAccent: 'border-l-emerald-500/50',
    },
    
    // Romance - Pink/Rose (love, passion)
    'Romance': {
      badgeBg: 'bg-pink-500/20',
      badgeText: 'text-pink-300',
      badgeBorder: 'border-pink-500/30',
      borderAccent: 'border-l-pink-500/50',
    },
    
    // Gratitude - Gold/Amber (warmth, appreciation)
    'Gratitude': {
      badgeBg: 'bg-amber-500/20',
      badgeText: 'text-amber-300',
      badgeBorder: 'border-amber-500/30',
      borderAccent: 'border-l-amber-500/50',
    },
    
    // Conflict Resolution - Orange (energy, resolution)
    'Conflict Resolution': {
      badgeBg: 'bg-orange-500/20',
      badgeText: 'text-orange-300',
      badgeBorder: 'border-orange-500/30',
      borderAccent: 'border-l-orange-500/50',
    },
    
    // Reconnection - Indigo (depth, presence)
    'Reconnection': {
      badgeBg: 'bg-indigo-500/20',
      badgeText: 'text-indigo-300',
      badgeBorder: 'border-indigo-500/30',
      borderAccent: 'border-l-indigo-500/50',
    },
    
    // Quality Time - Sky Blue (calm, togetherness)
    'Quality Time': {
      badgeBg: 'bg-sky-500/20',
      badgeText: 'text-sky-300',
      badgeBorder: 'border-sky-500/30',
      borderAccent: 'border-l-sky-500/50',
    },
  };

  // Return mapped colors or default primary colors
  return colorMap[normalizedCategory] || {
    badgeBg: 'bg-primary-500/20',
    badgeText: 'text-primary-300',
    badgeBorder: 'border-primary-500/30',
    borderAccent: 'border-l-primary-500/50',
  };
}

