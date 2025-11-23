'use client';

import { useState, useEffect } from 'react';

interface FollowUpQuestion {
  id: string;
  question_text: string;
  question_type: 'scale' | 'yes_no' | 'multiple_choice' | 'text';
  order_index: number;
  options?: { options: string[] };
  required: boolean;
}

interface FollowUpSurveyModalProps {
  surveyType: 'day_3_feedback' | 'day_7_conversion';
  onComplete: () => void;
  onDismiss: () => void;
}

export default function FollowUpSurveyModal({ surveyType, onComplete, onDismiss }: FollowUpSurveyModalProps) {
  const [questions, setQuestions] = useState<FollowUpQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, { value?: string; text?: string }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch(`/api/survey/follow-up/questions?type=${surveyType}`);
        if (response.ok) {
          const data = await response.json();
          setQuestions(data.questions || []);
        } else {
          setError('Failed to load survey questions');
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to load survey questions');
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [surveyType]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleResponse = (value: string) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: { value },
    }));

    // Auto-advance for non-text questions
    if (currentQuestion.question_type !== 'text') {
      setTimeout(() => {
        if (!isLastQuestion) {
          setCurrentQuestionIndex((prev) => prev + 1);
        }
      }, 300);
    }
  };

  const handleTextChange = (text: string) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: { ...prev[currentQuestion.id], text },
    }));
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate required questions
    const requiredQuestions = questions.filter((q) => q.required);
    const missingRequired = requiredQuestions.some((q) => !responses[q.id] || (!responses[q.id].value && !responses[q.id].text));

    if (missingRequired) {
      setError('Please answer all required questions');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const responseData = questions.map((question) => ({
        question_id: question.id,
        response_value: responses[question.id]?.value || null,
        response_text: responses[question.id]?.text || null,
      }));

      const response = await fetch('/api/survey/follow-up/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          survey_type: surveyType,
          responses: responseData,
        }),
      });

      if (response.ok) {
        onComplete();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit survey');
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      setError('Failed to submit survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    try {
      await fetch('/api/survey/follow-up/dismiss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ survey_type: surveyType }),
      });
      onDismiss();
    } catch (error) {
      console.error('Error dismissing survey:', error);
      onDismiss(); // Still dismiss even if API call fails
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error && !currentQuestion) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 rounded-xl p-8 max-w-md w-full">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={onDismiss}
            className="w-full px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const surveyTitle = surveyType === 'day_3_feedback' 
    ? 'Quick Feedback (3 Days In)' 
    : 'How\'s It Going? (7 Days In)';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-2xl p-6 md:p-8 max-w-2xl w-full border border-slate-700/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-50">{surveyTitle}</h2>
            <p className="text-sm text-slate-400 mt-1">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Dismiss survey"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h3 className="text-lg md:text-xl font-medium text-slate-50 mb-4">
            {currentQuestion.question_text}
          </h3>

          {/* Response Options */}
          <div className="space-y-3">
            {currentQuestion.question_type === 'scale' && (
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((value) => {
                  const isSelected = responses[currentQuestion.id]?.value === value.toString();
                  return (
                    <button
                      key={value}
                      onClick={() => handleResponse(value.toString())}
                      disabled={submitting}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'bg-primary-500 border-primary-400 text-slate-50 shadow-lg scale-105'
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="text-2xl font-bold mb-1">{value}</div>
                      <div className="text-[10px] text-slate-400">
                        {value === 1 ? 'Poor' : value === 2 ? 'Fair' : value === 3 ? 'Good' : value === 4 ? 'Very Good' : 'Excellent'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion.question_type === 'yes_no' && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleResponse('0')}
                  disabled={submitting}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    responses[currentQuestion.id]?.value === '0'
                      ? 'bg-red-500/20 border-red-400 text-red-300 shadow-lg scale-105'
                      : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="text-2xl font-bold mb-2">No</div>
                </button>
                <button
                  onClick={() => handleResponse('1')}
                  disabled={submitting}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    responses[currentQuestion.id]?.value === '1'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg scale-105'
                      : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="text-2xl font-bold mb-2">Yes</div>
                </button>
              </div>
            )}

            {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
              <div className="space-y-2">
                {currentQuestion.options.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleResponse(option)}
                    disabled={submitting}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      responses[currentQuestion.id]?.value === option
                        ? 'bg-primary-500/20 border-primary-400 text-primary-300'
                        : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.question_type === 'text' && (
              <textarea
                value={responses[currentQuestion.id]?.text || ''}
                onChange={(e) => handleTextChange(e.target.value)}
                disabled={submitting}
                placeholder="Type your response here..."
                className="w-full p-4 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500 min-h-[120px] disabled:opacity-50"
              />
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0 || submitting}
            className="px-6 py-2 text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-3 bg-primary-500 text-slate-950 font-semibold rounded-lg hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Survey →'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              disabled={submitting || (!responses[currentQuestion.id] && currentQuestion.required)}
              className="px-6 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          )}
        </div>

        {/* Skip option for non-required surveys */}
        {!currentQuestion.required && (
          <button
            onClick={handleDismiss}
            className="mt-4 text-sm text-slate-500 hover:text-slate-400 transition-colors"
          >
            Skip this question
          </button>
        )}
      </div>
    </div>
  );
}

