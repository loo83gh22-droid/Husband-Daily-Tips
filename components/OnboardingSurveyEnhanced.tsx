'use client';

import { useState, useEffect } from 'react';

interface SurveyQuestion {
  id: number;
  question_text: string;
  category: string;
  response_type: 'scale' | 'yes_no';
  order_index: number;
}

interface SurveyResponse {
  questionId: number;
  questionText: string;
  category: string;
  responseValue: number;
  responseType: 'scale' | 'yes_no';
}

interface OnboardingSurveyProps {
  userId: string;
  onComplete: (data?: { baselineHealth: number; categoryScores?: any }) => void;
}

// Category context explanations
const categoryContext: Record<string, string> = {
  communication: "This helps us personalize actions that improve how you talk, listen, and connect with your partner.",
  intimacy: "Understanding your emotional and physical connection helps us suggest actions that deepen your bond.",
  partnership: "This helps us recommend actions that show you're a true teammate in your relationship.",
  romance: "Knowing your romance level helps us suggest gestures and actions that keep the spark alive.",
  gratitude: "This helps us personalize actions that help you express appreciation and recognition.",
  conflict_resolution: "Understanding how you handle disagreements helps us suggest healthier conflict patterns.",
  reconnection: "This helps us identify if you're in 'roommate mode' and suggest actions to reconnect.",
  quality_time: "This helps us recommend actions that create meaningful time together.",
  consistency: "This helps us understand your current habits and suggest actions that build consistency.",
};

// Progress messages based on completion
const getProgressMessage = (current: number, total: number): string => {
  const remaining = total - current;
  if (remaining === 0) return "Almost done!";
  if (remaining === 1) return "Last question!";
  if (remaining <= 3) return `Almost there! ${remaining} more questions.`;
  if (remaining <= 5) return `You're doing great! ${remaining} more questions.`;
  if (current <= 3) return `Getting started... ${remaining} more questions.`;
  return `${remaining} more questions to go.`;
};

export default function OnboardingSurveyEnhanced({ userId, onComplete }: OnboardingSurveyProps) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<number, number>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [showCategoryContext, setShowCategoryContext] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string>('');

  // Load saved progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(`survey_progress_${userId}`);
    const savedResponses = localStorage.getItem(`survey_responses_${userId}`);
    
    if (savedProgress && savedResponses) {
      const progress = JSON.parse(savedProgress);
      const responsesData = JSON.parse(savedResponses);
      
      // Restore progress
      setCurrentQuestionIndex(progress.currentQuestionIndex || 0);
      setResponses(new Map(Object.entries(responsesData).map(([k, v]) => [Number(k), v as number])));
    }
  }, [userId]);

  // Save progress to localStorage
  useEffect(() => {
    if (questions.length > 0 && responses.size > 0) {
      localStorage.setItem(`survey_progress_${userId}`, JSON.stringify({
        currentQuestionIndex,
        timestamp: new Date().toISOString(),
      }));
      localStorage.setItem(`survey_responses_${userId}`, JSON.stringify(Object.fromEntries(responses)));
    }
  }, [currentQuestionIndex, responses, userId, questions.length]);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch('/api/survey/questions');
        if (response.ok) {
          const data = await response.json();
          setQuestions(data.questions || []);
        }
      } catch (error) {
        console.error('Error fetching survey questions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  // Update current category when question changes
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const category = questions[currentQuestionIndex]?.category || '';
      setCurrentCategory(category);
      setShowCategoryContext(false); // Reset when category changes
    }
  }, [currentQuestionIndex, questions]);

  const handleResponse = (value: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const newResponses = new Map(responses);
    newResponses.set(currentQuestion.id, value);
    setResponses(newResponses);

    // Auto-advance after a brief delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Last question - submit
        handleSubmit(newResponses);
      }
    }, 300);
  };

  const handleSubmit = async (finalResponses: Map<number, number>) => {
    setSubmitting(true);
    try {
      const responseData: SurveyResponse[] = [];
      questions.forEach((question) => {
        const responseValue = finalResponses.get(question.id);
        if (responseValue !== undefined) {
          responseData.push({
            questionId: question.id,
            questionText: question.question_text,
            category: question.category,
            responseValue,
            responseType: question.response_type,
          });
        }
      });

      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          responses: responseData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Clear saved progress
        localStorage.removeItem(`survey_progress_${userId}`);
        localStorage.removeItem(`survey_responses_${userId}`);
        
        // Pass data to onComplete for personalized welcome
        onComplete(data);
      } else {
        console.error('Error submitting survey');
        alert('Failed to submit survey. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Failed to submit survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuickStart = async () => {
    if (confirm('Skip to dashboard? You can complete the survey later from your account settings for personalized actions.')) {
      setSubmitting(true);
      try {
        const response = await fetch('/api/survey/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            responses: [],
            skip: true,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Clear saved progress
          localStorage.removeItem(`survey_progress_${userId}`);
          localStorage.removeItem(`survey_responses_${userId}`);
          onComplete(data);
        } else {
          console.error('Error skipping survey');
          alert('Failed to skip survey. Please try again.');
        }
      } catch (error) {
        console.error('Error skipping survey:', error);
        alert('Failed to skip survey. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const progressMessage = questions.length > 0 ? getProgressMessage(currentQuestionIndex + 1, questions.length) : '';
  const questionsRemaining = questions.length - (currentQuestionIndex + 1);
  const categoryContextText = currentCategory ? categoryContext[currentCategory.toLowerCase()] : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Quick Start Option - More Prominent */}
        {currentQuestionIndex === 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-primary-500/10 to-primary-500/5 border border-primary-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-300 mb-2">
                  <strong className="text-primary-300">Quick Start:</strong> Skip the survey and jump right in. You can complete it later for personalized actions.
                </p>
              </div>
              <button
                onClick={handleQuickStart}
                disabled={submitting}
                className="ml-4 px-4 py-2 bg-primary-500 text-slate-950 font-semibold rounded-lg hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
              >
                Quick Start →
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-300">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              {progressMessage && (
                <span className="text-xs text-primary-400 mt-1">
                  {progressMessage}
                </span>
              )}
            </div>
            <span className="text-sm text-slate-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-400 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl p-8 md:p-10 border border-slate-700/50 shadow-2xl">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-block px-3 py-1 bg-primary-500/10 text-primary-300 text-xs font-semibold rounded-full">
                {currentQuestion.category.charAt(0).toUpperCase() + currentQuestion.category.slice(1).replace('_', ' ')}
              </span>
              {categoryContextText && (
                <button
                  onClick={() => setShowCategoryContext(!showCategoryContext)}
                  className="text-xs text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-1"
                  title="Why we ask this"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Why we ask
                </button>
              )}
            </div>

            {/* Category Context Tooltip */}
            {showCategoryContext && categoryContextText && (
              <div className="mb-4 p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {categoryContextText}
                </p>
              </div>
            )}

            <h2 className="text-2xl md:text-3xl font-semibold text-slate-50 leading-tight">
              {currentQuestion.question_text}
            </h2>
          </div>

          {/* Response Options */}
          <div className="space-y-3">
            {currentQuestion.response_type === 'scale' ? (
              // 1-5 Scale Options
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((value) => {
                  const isSelected = responses.get(currentQuestion.id) === value;
                  return (
                    <button
                      key={value}
                      onClick={() => handleResponse(value)}
                      disabled={submitting}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'bg-primary-500 border-primary-400 text-slate-50 shadow-lg scale-105'
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="text-2xl font-bold mb-1">{value}</div>
                      <div className="text-[10px] text-slate-400">
                        {value === 1 ? 'Never' : value === 2 ? 'Rarely' : value === 3 ? 'Sometimes' : value === 4 ? 'Often' : 'Always'}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              // Yes/No Options
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleResponse(0)}
                  disabled={submitting}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    responses.get(currentQuestion.id) === 0
                      ? 'bg-red-500/20 border-red-400 text-red-300 shadow-lg scale-105'
                      : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="text-3xl font-bold mb-2">No</div>
                  <div className="text-xs text-slate-400">Not true for me</div>
                </button>
                <button
                  onClick={() => handleResponse(1)}
                  disabled={submitting}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    responses.get(currentQuestion.id) === 1
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg scale-105'
                      : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="text-3xl font-bold mb-2">Yes</div>
                  <div className="text-xs text-slate-400">True for me</div>
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <div className="flex gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0 || submitting}
                className="px-6 py-2 text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
            </div>
            {submitting && (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                <span>Calculating your baseline...</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center mt-6">
          Your responses help us personalize your actions and show you where you're starting from. You can always update your survey later.
        </p>
      </div>
    </div>
  );
}

