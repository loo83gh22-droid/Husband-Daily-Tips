import { redirect } from 'next/navigation';

export default function AboutPage() {
  // Redirect to the dashboard about page (which is now public)
  redirect('/dashboard/about');
}

