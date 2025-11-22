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
  onComplete: () => void;
}

export default function OnboardingSurvey({ userId, onComplete }: OnboardingSurveyProps) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<number, number>>(new Map());
  const [submitting, setSubmitting] = useState(false);

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
        onComplete();
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

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

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
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-slate-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl p-8 md:p-10 border border-slate-700/50 shadow-2xl">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-primary-500/10 text-primary-300 text-xs font-semibold rounded-full mb-4">
              {currentQuestion.category.charAt(0).toUpperCase() + currentQuestion.category.slice(1)}
            </span>
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
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || submitting}
              className="px-6 py-2 text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            {submitting && (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                <span>Calculating your baseline...</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center mt-6">
          Your responses help us give you actions that fit your situation and show you where you're starting from.
        </p>
      </div>
    </div>
  );
}

