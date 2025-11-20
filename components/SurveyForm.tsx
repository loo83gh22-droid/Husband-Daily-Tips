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
}

export default function SurveyForm({ userId, questions }: SurveyFormProps) {
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

    // Auto-advance after a brief delay for better UX
    setTimeout(() => {
      if (!isLastQuestion) {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(responses).length !== questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

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
            {[1, 2, 3, 4, 5].map((value) => (
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
                  <span className="font-medium">
                    {value === 1 && 'Strongly Disagree'}
                    {value === 2 && 'Disagree'}
                    {value === 3 && 'Neutral'}
                    {value === 4 && 'Agree'}
                    {value === 5 && 'Strongly Agree'}
                  </span>
                  <span className="text-2xl">{value}</span>
                </div>
              </button>
            ))}
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
            onClick={handleSubmit}
            disabled={isSubmitting || responses[currentQuestion.id] === undefined}
            className="px-6 py-2 bg-primary-500 disabled:bg-primary-900 disabled:text-slate-400 text-slate-950 text-sm font-semibold rounded-lg hover:bg-primary-400 transition-colors disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Complete Survey →'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
            disabled={responses[currentQuestion.id] === undefined}
            className="px-4 py-2 bg-primary-500 disabled:bg-primary-900 disabled:text-slate-400 text-slate-950 text-sm font-semibold rounded-lg hover:bg-primary-400 transition-colors disabled:cursor-not-allowed"
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

