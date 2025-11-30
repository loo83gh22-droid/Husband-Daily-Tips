import { MetadataRoute } from 'next';

// Import guide data from blog page (same source of truth)
// This ensures sitemap stays in sync with blog page
const guidesByCategory = {
  'communication': {
    guides: [
      { slug: 'be-present-quality-time' },
      { slug: 'listen-without-fixing' },
      { slug: 'have-hard-conversation' },
      { slug: 'ask-better-questions' },
      { slug: 'apologize-right-way' },
      { slug: 'share-your-feelings' },
      { slug: 'daily-check-in' },
      { slug: 'express-gratitude-to-partner' },
      { slug: 'practice-5-1-ratio' },
    ],
  },
  'intimacy': {
    guides: [
      { slug: 'practice-love-languages' },
      { slug: 'create-love-map' },
      { slug: 'practice-turning-toward' },
      { slug: 'non-sexual-physical-touch' },
      { slug: 'share-gratitude-for-character' },
      { slug: 'practice-acts-of-service' },
      { slug: 'practice-words-of-affirmation' },
      { slug: 'initiate-intimacy' },
      { slug: 'focus-on-her-pleasure' },
    ],
  },
  'partnership': {
    guides: [
      { slug: 'help-hosting-party' },
      { slug: 'handle-morning-routine' },
      { slug: 'notice-what-needs-doing' },
      { slug: 'help-when-shes-stressed' },
      { slug: 'handle-household-tasks' },
      { slug: 'support-her-goals' },
      { slug: 'plan-together' },
      { slug: 'take-over-chore-completely' },
      { slug: 'be-proactive-around-house' },
      { slug: 'talk-about-finances' },
      { slug: 'clean-together' },
      { slug: 'pet-responsibility' },
      { slug: 'breakfast-in-bed-for-mom' },
      { slug: 'poem-for-mom' },
      { slug: 'give-mom-a-break' },
    ],
  },
  'romance': {
    guides: [
      { slug: 'plan-perfect-date-night' },
      { slug: 'handle-surprise-right' },
      { slug: 'give-genuine-compliment' },
      { slug: 'write-love-note' },
      { slug: 'plan-weekend-getaway' },
      { slug: 'plan-surprise-date' },
      { slug: 'give-physical-affection' },
    ],
  },
  'gratitude': {
    guides: [
      { slug: 'express-gratitude-daily' },
      { slug: 'gratitude-list' },
      { slug: 'thank-her-for-chores' },
      { slug: 'appreciate-her-effort' },
      { slug: 'send-gratitude-text' },
      { slug: 'morning-gratitude' },
    ],
  },
  'conflict_resolution': {
    guides: [
      { slug: 'resolve-disagreement' },
      { slug: 'take-responsibility' },
      { slug: 'find-common-ground' },
      { slug: 'stay-calm-during-conflict' },
      { slug: 'use-i-statements' },
      { slug: 'make-amends' },
    ],
  },
  'reconnection': {
    guides: [
      { slug: 'have-20-minute-conversation' },
      { slug: 'ask-about-inner-world' },
      { slug: 'state-of-union-conversation' },
      { slug: 'do-something-you-used-to-enjoy' },
      { slug: 'plan-surprise-that-shows-you-know-her' },
      { slug: 'sit-close-and-talk' },
      { slug: 'relationship-games' },
      { slug: 'practice-turning-toward' },
    ],
  },
  'quality_time': {
    guides: [
      { slug: 'tech-free-quality-time' },
      { slug: 'weekly-date-night-conversation' },
      { slug: 'create-daily-ritual' },
      { slug: 'create-morning-ritual' },
      { slug: 'create-evening-ritual' },
      { slug: 'cook-together' },
      { slug: 'cook-her-favorite-meal' },
    ],
  },
};

// Extract all guide slugs
const allGuideSlugs = Object.values(guidesByCategory).flatMap(category => 
  category.guides.map(guide => guide.slug)
);

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.besthusbandever.com';
  
  // Blog posts (legacy - these may not exist anymore)
  const blogPosts = [
    {
      slug: 'how-to-become-a-better-husband',
      date: '2024-01-15',
    },
    {
      slug: 'product-hunt-launch-guide',
      date: '2024-01-10',
    },
    {
      slug: 'seo-setup-guide',
      date: '2024-01-05',
    },
    {
      slug: 'launch-announcement-guide',
      date: '2024-01-01',
    },
  ];
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/survey`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // Include all how-to guides in sitemap
    // Note: These are currently behind authentication, so they won't be indexed
    // If you want them indexed, you'll need to create public pages
    ...allGuideSlugs.map((slug) => ({
      url: `${baseUrl}/dashboard/how-to-guides/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6, // Lower priority since they're behind auth
    })),
    ...blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}

