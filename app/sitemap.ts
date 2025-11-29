import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.besthusbandever.com';
  
  // Blog posts
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
    ...blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}

