import { MetadataRoute } from 'next';
import { guides } from '@/app/dashboard/how-to-guides/[slug]/page';

// Extract all guide slugs from the shared guides object
// This automatically includes all guides - no manual updates needed!
const allGuideSlugs = Object.keys(guides);

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.besthusbandever.com';
  
  // Blog posts (only include pages that actually exist)
  const blogPosts = [
    {
      slug: 'product-hunt-launch-guide',
      date: '2024-01-10',
    },
    {
      slug: 'seo-setup-guide',
      date: '2024-01-05',
    },
    // Removed 'how-to-become-a-better-husband' - doesn't exist (404)
    // Removed 'launch-announcement-guide' - doesn't exist (404)
  ];
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // Removed /survey - it just redirects to login, not a public page
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // Include all how-to guides in sitemap (public pages)
    // These are now public and will be indexed by Google
    ...allGuideSlugs.map((slug) => ({
      url: `${baseUrl}/blog/how-to-guides/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7, // Good priority for SEO
    })),
    ...blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}

