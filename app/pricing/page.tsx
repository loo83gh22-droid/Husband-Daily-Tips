import { redirect } from 'next/navigation';

// Redirect /pricing to /dashboard/subscription
export default function PricingPage() {
  redirect('/dashboard/subscription');
}

