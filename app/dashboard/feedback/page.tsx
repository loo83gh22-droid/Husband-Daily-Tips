import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import FeedbackForm from '@/components/FeedbackForm';

export default async function FeedbackPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-50 mb-3">
              Share Your Thoughts
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              We're building this for you. Your feedback, suggestions, and ideas help us make this better. 
              What's working? What's not? What do you need that we're missing? 
              <span className="text-primary-400 font-medium"> We're listening.</span>
            </p>
          </div>

          <FeedbackForm />
        </div>
      </main>
    </div>
  );
}

