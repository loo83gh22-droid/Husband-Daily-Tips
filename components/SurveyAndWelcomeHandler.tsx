'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import OnboardingSurveyEnhanced from './OnboardingSurveyEnhanced';
import PersonalizedWelcomeModal from './PersonalizedWelcomeModal';

interface SurveyAndWelcomeHandlerProps {
  userId: string;
  surveyCompleted: boolean;
  onSurveyComplete?: () => void;
}

export default function SurveyAndWelcomeHandler({
  userId,
  surveyCompleted,
  onSurveyComplete,
}: SurveyAndWelcomeHandlerProps) {
  const [showSurvey, setShowSurvey] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeData, setWelcomeData] = useState<{
    baselineHealth?: number;
    categoryScores?: any;
  } | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if survey was just completed (from URL param or localStorage)
    const surveyJustCompleted = searchParams?.get('survey_completed') === 'true';
    const welcomeShown = localStorage.getItem(`welcome_shown_${userId}`) === 'true';
    
    if (surveyJustCompleted && !welcomeShown) {
      // Fetch survey results to show in welcome modal
      fetchSurveyResults();
      setShowWelcome(true);
      localStorage.setItem(`welcome_shown_${userId}`, 'true');
    } else if (!surveyCompleted) {
      // Show survey if not completed
      setShowSurvey(true);
    }
  }, [userId, surveyCompleted, searchParams]);

  const fetchSurveyResults = async () => {
    try {
      const response = await fetch('/api/user/survey-results');
      if (response.ok) {
        const data = await response.json();
        setWelcomeData(data);
      }
    } catch (error) {
      console.error('Error fetching survey results:', error);
    }
  };

  const handleSurveyComplete = (data?: { baselineHealth?: number; categoryScores?: any }) => {
    setShowSurvey(false);
    
    if (data) {
      setWelcomeData(data);
      setShowWelcome(true);
      localStorage.setItem(`welcome_shown_${userId}`, 'true');
    }
    
    // Reload to refresh dashboard
    if (onSurveyComplete) {
      onSurveyComplete();
    } else {
      window.location.href = '/dashboard?survey_completed=true';
    }
  };

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    // Remove URL param
    if (window.history.replaceState) {
      window.history.replaceState({}, '', '/dashboard');
    }
  };

  if (showSurvey) {
    return (
      <OnboardingSurveyEnhanced
        userId={userId}
        onComplete={handleSurveyComplete}
      />
    );
  }

  if (showWelcome && welcomeData) {
    return (
      <PersonalizedWelcomeModal
        isOpen={showWelcome}
        onClose={handleWelcomeClose}
        baselineHealth={welcomeData.baselineHealth}
        categoryScores={welcomeData.categoryScores}
        userId={userId}
      />
    );
  }

  return null;
}

