import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SurveyForm from '@/components/SurveyForm';

async function getSurveyQuestions() {
  const { data: questions, error } = await supabase
    .from('survey_questions')
    .select('*')
    .order('order_index', { ascending: true });

  if (error || !questions) {
    return [];
  }

  return questions;
}

async function checkUserSurveyStatus(auth0Id: string) {
  const { data: user } = await supabase
    .from('users')
    .select('id, survey_completed')
    .eq('auth0_id', auth0Id)
    .single();

  return user;
}

export default async function SurveyPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  const user = await checkUserSurveyStatus(auth0Id);

  // If user has already completed survey, redirect to dashboard
  if (user?.survey_completed) {
    redirect('/dashboard');
  }

  const questions = await getSurveyQuestions();

  return (
    <div className="min-h-screen bg-slate-950">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-50 mb-3">
              Welcome! Let&apos;s get started
            </h1>
            <p className="text-slate-400 text-base md:text-lg">
              This 10-question survey helps us understand your relationship and give you actions that actually fit your situation.
              <br />
              <span className="text-sm text-slate-500 mt-2 block">
                Takes about 2 minutes • Your answers are private
              </span>
            </p>
          </div>

          <SurveyForm userId={user?.id || ''} questions={questions} isPublic={false} />
        </div>
      </main>
    </div>
  );
}
