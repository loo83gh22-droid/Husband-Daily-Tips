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

  // Redirect non-authenticated users to signup
  redirect('/api/auth/login?returnTo=/dashboard/survey');
}

