'use client';

import { useState, useEffect } from 'react';
import FollowUpSurveyModal from './FollowUpSurveyModal';

export default function FollowUpSurveyChecker() {
  const [availableSurvey, setAvailableSurvey] = useState<'day_3_feedback' | 'day_7_conversion' | 'day_30_checkin' | 'day_90_nps' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSurveys() {
      try {
        const response = await fetch('/api/survey/follow-up/status');
        if (response.ok) {
          const data = await response.json();
          if (data.has_available && data.available && data.available.length > 0) {
            // Show the first available survey (prioritize by order: 3-day, 7-day, 30-day, 90-day)
            const threeDay = data.available.find((s: any) => s.survey_type === 'day_3_feedback');
            const sevenDay = data.available.find((s: any) => s.survey_type === 'day_7_conversion');
            const thirtyDay = data.available.find((s: any) => s.survey_type === 'day_30_checkin');
            const ninetyDay = data.available.find((s: any) => s.survey_type === 'day_90_nps');
            
            if (threeDay) {
              setAvailableSurvey('day_3_feedback');
            } else if (sevenDay) {
              setAvailableSurvey('day_7_conversion');
            } else if (thirtyDay) {
              setAvailableSurvey('day_30_checkin');
            } else if (ninetyDay) {
              setAvailableSurvey('day_90_nps');
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

