import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SurveyForm from '@/components/SurveyForm';
import BrandLogo from '@/components/BrandLogo';

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

export default async function PublicSurveyPage() {
  const session = await getSession();

  // If already logged in, redirect to dashboard survey
  if (session?.user) {
    redirect('/dashboard/survey');
  }

  const questions = await getSurveyQuestions();

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <BrandLogo variant="nav" showTagline={false} />
          <div className="flex items-center gap-3">
            <a
              href="/api/auth/login"
              className="px-4 py-2 text-sm font-medium border border-slate-700 text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-50 mb-3">
              Get Your Husband Score
            </h1>
            <p className="text-slate-400 text-base md:text-lg">
              Take our quick 10-question survey to discover your baseline and get personalized actions.
              <br />
              <span className="text-sm text-slate-500 mt-2 block">
                Takes about 2 minutes • Free • No signup required to take the survey
              </span>
            </p>
          </div>

          <SurveyForm userId="" questions={questions} isPublic={true} />
        </div>
      </main>
    </div>
  );
}

