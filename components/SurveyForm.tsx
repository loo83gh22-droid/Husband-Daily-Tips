'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  id: number;
  question_text: string;
  category: string;
  response_type: 'scale' | 'yes_no';
  order_index: number;
}

interface SurveyFormProps {
  userId: string;
  questions: Question[];
  isPublic?: boolean;
}

export default function SurveyForm({ userId, questions, isPublic = false }: SurveyFormProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleResponse = (value: number) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
    
    // Auto-advance to next question (unless it's the last question)
    if (!isLastQuestion) {
      // Small delay to show the selection before advancing
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        setError(null); // Clear any previous errors
      }, 300);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setError(null); // Clear errors when going back
    }
  };

  const handleNext = () => {
    // Check if current question is answered
    if (responses[currentQuestion.id] === undefined) {
      setError('Please answer this question before continuing.');
      return;
    }

    setError(null);
    if (!isLastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Last question - submit
      handleSubmit();
    }
  };


  const [showResults, setShowResults] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);

  const calculatePublicResults = () => {
    // Count Yes answers for baseline questions (questions 1-18)
    // Yes = 1 point, No = 0 points
    let yesCount = 0;
    let totalBaselineQuestions = 0;
    
    questions.forEach((question) => {
      // Only count baseline questions (1-18), not goal-setting questions (19+)
      if (question.id <= 18) {
        totalBaselineQuestions++;
        const responseValue = responses[question.id];
        if (responseValue !== undefined && question.response_type === 'yes_no' && responseValue === 1) {
          yesCount++;
        }
      }
    });

    // Calculate baseline health from Yes/No answers
    // Percentage = (Yes count / Total questions) * 100
    // Maximum baseline health is capped at 90%
    let baselineHealth = 50; // Default if no questions answered
    if (totalBaselineQuestions > 0) {
      const percentage = (yesCount / totalBaselineQuestions) * 100;
      baselineHealth = Math.min(90, Math.round(percentage)); // Cap at 90%
    }

    return baselineHealth;
  };

  const handleSubmit = async () => {
    // Check that all questions are answered
    const unansweredQuestions = questions.filter(q => responses[q.id] === undefined);
    if (unansweredQuestions.length > 0) {
      // Find the first unanswered question and go to it
      const firstUnansweredIndex = questions.findIndex(q => responses[q.id] === undefined);
      setCurrentQuestionIndex(firstUnansweredIndex);
      setError(`Please answer all questions before submitting. You have ${unansweredQuestions.length} unanswered question${unansweredQuestions.length > 1 ? 's' : ''}.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // If public survey, calculate results client-side and show signup prompt
    if (isPublic) {
      const score = calculatePublicResults();
      setCalculatedScore(score);
      setShowResults(true);
      setIsSubmitting(false);
      return;
    }

    // If logged in user, submit to server
    try {
      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          responses,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit survey');
      }

      // Redirect to dashboard after successful submission
      router.push('/dashboard');
    } catch (err) {
      console.error('Error submitting survey:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit survey. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 text-center">
        <p className="text-slate-300">No survey questions available. Please contact support.</p>
      </div>
    );
  }

  // Show results for public survey
  if (showResults && calculatedScore !== null) {
    const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-emerald-400';
      if (score >= 60) return 'text-yellow-400';
      return 'text-red-400';
    };

    const getScoreLabel = (score: number) => {
      if (score >= 80) return 'Strong';
      if (score >= 60) return 'Good';
      if (score >= 40) return 'Needs Work';
      return 'Needs Attention';
    };

    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 md:p-10 text-center">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-50 mb-2">Your Husband Score</h2>
          <div className={`text-6xl font-bold mb-2 ${getScoreColor(calculatedScore)}`}>
            {calculatedScore}
          </div>
          <p className={`text-xl font-semibold ${getScoreColor(calculatedScore)}`}>
            {getScoreLabel(calculatedScore)}
          </p>
        </div>

        <div className="mb-8 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-slate-300 mb-4">
            Great! You've completed the survey. Now sign up to:
          </p>
          <ul className="text-left space-y-2 text-slate-300 mb-6">
            <li className="flex items-center gap-2">
              <span className="text-primary-400">✓</span>
              Save your baseline score and track improvements
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary-400">✓</span>
              Get daily actions that fit your situation based on your results
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary-400">✓</span>
              Access your Husband Health and track your progress
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/api/auth/login"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg bg-primary-500 text-slate-950 text-sm font-semibold shadow-lg shadow-primary-500/20 hover:bg-primary-400 transition-colors"
          >
            Sign Up Free →
          </a>
          <a
            href="/"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg border border-slate-700 text-sm font-semibold text-slate-100 hover:bg-slate-900 transition-colors"
          >
            Learn More
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <div className="mb-2">
          <span className="inline-block px-3 py-1 bg-primary-500/10 text-primary-300 text-xs font-semibold rounded-full mb-4">
            {currentQuestion.category.charAt(0).toUpperCase() + currentQuestion.category.slice(1)}
          </span>
        </div>
        <h2 className="text-xl md:text-2xl font-semibold text-slate-50 mb-8 leading-relaxed">
          {currentQuestion.question_text}
        </h2>

        {/* Response Options */}
        {currentQuestion.response_type === 'scale' ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((value) => {
              // Determine scale labels based on question text
              const questionText = currentQuestion.question_text.toLowerCase();
              const isRatingQuestion = questionText.includes('how would you rate') || 
                                      questionText.includes('how well do you') ||
                                      questionText.includes('how much') ||
                                      questionText.includes('how romantic') ||
                                      questionText.includes('how connected');
              
              let label = '';
              if (isRatingQuestion) {
                // Rating scale: Poor to Excellent
                label = value === 1 ? 'Poor' : 
                       value === 2 ? 'Fair' : 
                       value === 3 ? 'Good' : 
                       value === 4 ? 'Very Good' : 
                       'Excellent';
              } else {
                // Agreement scale: Strongly Disagree to Strongly Agree
                label = value === 1 ? 'Strongly Disagree' : 
                       value === 2 ? 'Disagree' : 
                       value === 3 ? 'Neutral' : 
                       value === 4 ? 'Agree' : 
                       'Strongly Agree';
              }

              return (
                <button
                  key={value}
                  onClick={() => handleResponse(value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    responses[currentQuestion.id] === value
                      ? 'border-primary-500 bg-primary-500/20 text-slate-50'
                      : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{label}</span>
                    <span className="text-2xl">{value}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleResponse(1)}
              className={`p-6 rounded-lg border-2 transition-all ${
                responses[currentQuestion.id] === 1
                  ? 'border-primary-500 bg-primary-500/20 text-slate-50'
                  : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              <span className="text-2xl mb-2 block">✓</span>
              <span className="font-semibold text-lg">Yes</span>
            </button>
            <button
              onClick={() => handleResponse(0)}
              className={`p-6 rounded-lg border-2 transition-all ${
                responses[currentQuestion.id] === 0
                  ? 'border-primary-500 bg-primary-500/20 text-slate-50'
                  : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              <span className="text-2xl mb-2 block">✗</span>
              <span className="font-semibold text-lg">No</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 border border-slate-700 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleNext}
            disabled={isSubmitting || responses[currentQuestion.id] === undefined}
            className="px-6 py-2 bg-primary-500 text-slate-950 text-sm font-semibold rounded-lg hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Complete Survey →'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={responses[currentQuestion.id] === undefined}
            className="px-6 py-2 bg-primary-500 text-slate-950 text-sm font-semibold rounded-lg hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg">
          <p className="text-sm text-rose-400">{error}</p>
        </div>
      )}
    </div>
  );
}

