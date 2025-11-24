'use client';

import { useState, useEffect } from 'react';
import SurveyPromptModal from './SurveyPromptModal';

interface SurveyPromptCheckerProps {
  userId: string;
  surveyCompleted: boolean;
}

export default function SurveyPromptChecker({ userId, surveyCompleted }: SurveyPromptCheckerProps) {
  const [showModal, setShowModal] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Only show modal if survey not completed and we haven't checked yet
    if (!surveyCompleted && !hasChecked) {
      // Check if user has dismissed this session (stored in sessionStorage)
      const dismissed = sessionStorage.getItem('survey-prompt-dismissed');
      if (!dismissed) {
        // Small delay to let page load first
        const timer = setTimeout(() => {
          setShowModal(true);
          setHasChecked(true);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        setHasChecked(true);
      }
    }
  }, [surveyCompleted, hasChecked]);

  const handleDismiss = () => {
    setShowModal(false);
    // Remember dismissal for this session only
    sessionStorage.setItem('survey-prompt-dismissed', 'true');
  };

  const handleSkip = () => {
    setShowModal(false);
    // Refresh will happen in the modal after skip
  };

  if (surveyCompleted || !showModal) {
    return null;
  }

  return (
    <SurveyPromptModal
      userId={userId}
      onDismiss={handleDismiss}
    />
  );
}

