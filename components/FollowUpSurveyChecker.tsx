'use client';

import { useState, useEffect } from 'react';
import FollowUpSurveyModal from './FollowUpSurveyModal';

export default function FollowUpSurveyChecker() {
  const [availableSurvey, setAvailableSurvey] = useState<'day_3_feedback' | 'day_7_conversion' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSurveys() {
      try {
        const response = await fetch('/api/survey/follow-up/status');
        if (response.ok) {
          const data = await response.json();
          if (data.has_available && data.available && data.available.length > 0) {
            // Show the first available survey (prioritize 3-day, then 7-day)
            const threeDay = data.available.find((s: any) => s.survey_type === 'day_3_feedback');
            const sevenDay = data.available.find((s: any) => s.survey_type === 'day_7_conversion');
            
            if (threeDay) {
              setAvailableSurvey('day_3_feedback');
            } else if (sevenDay) {
              setAvailableSurvey('day_7_conversion');
            }
          }
        }
      } catch (error) {
        console.error('Error checking survey status:', error);
      } finally {
        setLoading(false);
      }
    }

    checkSurveys();
  }, []);

  const handleComplete = () => {
    setAvailableSurvey(null);
    // Refresh the page or update state to check for next survey
    window.location.reload();
  };

  const handleDismiss = () => {
    setAvailableSurvey(null);
  };

  if (loading || !availableSurvey) {
    return null;
  }

  return (
    <FollowUpSurveyModal
      surveyType={availableSurvey}
      onComplete={handleComplete}
      onDismiss={handleDismiss}
    />
  );
}

