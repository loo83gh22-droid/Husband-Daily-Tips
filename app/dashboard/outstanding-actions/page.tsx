import { redirect } from 'next/navigation';

/**
 * Redirect outstanding-actions page to dashboard with anchor
 * Outstanding actions are now displayed directly on the dashboard
 */
export default async function OutstandingActionsPage() {
  // Redirect to dashboard, scrolling to outstanding actions section
  redirect('/dashboard#outstanding-actions');
}

