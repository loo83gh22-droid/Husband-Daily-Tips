// Shared guides data - single source of truth for all how-to guides
// This file is imported by both dashboard and public blog pages

// Import the guides object from dashboard (we'll refactor this to be the source of truth)
// For now, we'll re-export it so both can use it
export { guides } from '@/app/dashboard/how-to-guides/[slug]/page';

// Category mapping for organizing guides
export const categoryInfo = {
  'communication': {
    name: 'Communication',
    description: 'Listen, communicate, and actually be there.',
    icon: '💬',
  },
  'intimacy': {
    name: 'Intimacy',
    description: 'Build emotional and physical connection that goes deeper.',
    icon: '💝',
  },
  'partnership': {
    name: 'Partnership',
    description: 'Actually help. Be a partner, not just a passenger.',
    icon: '🤝',
  },
  'romance': {
    name: 'Romance',
    description: 'Dates, surprises, and making her feel special—without the cheesy stuff.',
    icon: '💕',
  },
  'gratitude': {
    name: 'Gratitude',
    description: 'Show appreciation in ways that actually matter.',
    icon: '🙏',
  },
  'conflict_resolution': {
    name: 'Conflict Resolution',
    description: 'Handle disagreements in ways that strengthen, not weaken, your relationship.',
    icon: '⚖️',
  },
  'reconnection': {
    name: 'Reconnection',
    description: 'Move from roommates back to partners. Rebuild emotional connection.',
    icon: '🔗',
  },
  'quality_time': {
    name: 'Quality Time',
    description: 'Spend meaningful time together that actually connects you.',
    icon: '⏰',
  },
  'outdoor': {
    name: 'Outdoor Activities',
    description: 'Get outside together. Nature, adventure, and shared experiences.',
    icon: '🌲',
  },
  'active': {
    name: 'Active Together',
    description: 'Get moving together. Exercise, fitness, and shared physical activity.',
    icon: '💪',
  },
};

// Build guidesByCategory from guides object
// This ensures blog and dashboard always stay in sync
export function getGuidesByCategory(guides: Record<string, any>) {
  const guidesByCategory: Record<string, any> = {};

  // Initialize categories
  Object.keys(categoryInfo).forEach((categoryKey) => {
    guidesByCategory[categoryKey] = {
      ...categoryInfo[categoryKey as keyof typeof categoryInfo],
      guides: [],
    };
  });

  // Group guides by category
  Object.entries(guides).forEach(([slug, guide]) => {
    if (!guide || !guide.category) return;

    // Map category name to category key
    const categoryKey = Object.keys(categoryInfo).find(
      (key) => categoryInfo[key as keyof typeof categoryInfo].name === guide.category
    ) || guide.category.toLowerCase().replace(/\s+/g, '_');

    if (!guidesByCategory[categoryKey]) {
      guidesByCategory[categoryKey] = {
        name: guide.category,
        description: '',
        icon: '📚',
        guides: [],
      };
    }

    guidesByCategory[categoryKey].guides.push({
      slug,
      title: guide.title,
      excerpt: guide.excerpt,
      difficulty: guide.difficulty,
      time: guide.time,
    });
  });

  return guidesByCategory;
}

