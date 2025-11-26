/**
 * Utility function to check if content (action or badge) is "new"
 * Content is considered "new" if it was created within the last 7 days
 */

export function isNewContent(createdAt: string | Date | null | undefined): boolean {
  if (!createdAt) return false;

  const createdDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return createdDate >= sevenDaysAgo;
}

