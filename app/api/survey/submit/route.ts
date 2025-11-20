import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/lib/supabase';

/**
 * Submit survey responses and calculate baseline health + category scores
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const { userId, responses } = await request.json();

    if (!userId || !responses) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all questions to map responses
    const { data: questions, error: questionsError } = await supabase
      .from('survey_questions')
      .select('*')
      .order('order_index', { ascending: true });

    if (questionsError || !questions || questions.length === 0) {
      return NextResponse.json({ error: 'Survey questions not found' }, { status: 500 });
    }

    // Save responses to survey_responses table
    // Handle both array format and object format
    const responseRecords = questions
      .filter((q) => {
        // Check if responses is an array or object
        if (Array.isArray(responses)) {
          return responses.some((r: any) => r.questionId === q.id);
        } else {
          return responses[q.id] !== undefined;
        }
      })
      .map((question) => {
        let responseValue: number;
        if (Array.isArray(responses)) {
          const response = responses.find((r: any) => r.questionId === question.id);
          responseValue = response?.responseValue ?? 0;
        } else {
          responseValue = responses[question.id] ?? 0;
        }
        return {
          user_id: userId,
          question_id: question.id,
          question_text: question.question_text,
          category: question.category,
          response_value: responseValue,
          response_type: question.response_type,
        };
      });

    if (responseRecords.length !== questions.length) {
      return NextResponse.json({ error: 'Not all questions answered' }, { status: 400 });
    }

    // Insert all responses
    const { error: insertError } = await supabase
      .from('survey_responses')
      .insert(responseRecords);

    if (insertError) {
      console.error('Error inserting survey responses:', insertError);
      return NextResponse.json({ error: 'Failed to save survey responses' }, { status: 500 });
    }

    // Calculate category scores (average of responses per category)
    const categoryScores: Record<string, { total: number; count: number }> = {
      communication: { total: 0, count: 0 },
      romance: { total: 0, count: 0 },
      partnership: { total: 0, count: 0 },
      intimacy: { total: 0, count: 0 },
      conflict: { total: 0, count: 0 },
    };

    responseRecords.forEach((response) => {
      const category = response.category.toLowerCase();
      if (categoryScores[category]) {
        // For yes/no: 1 = 5, 0 = 1 (normalize to 1-5 scale)
        // For scale: already 1-5
        let normalizedValue = response.response_value;
        if (response.response_type === 'yes_no') {
          normalizedValue = response.response_value === 1 ? 5 : 1;
        }
        categoryScores[category].total += normalizedValue;
        categoryScores[category].count += 1;
      }
    });

    // Calculate average scores per category (scale to 0-100)
    // Handle division by zero for categories without questions
    const communicationScore = categoryScores.communication.count > 0
      ? (categoryScores.communication.total / categoryScores.communication.count) * 20
      : 50; // Default to 50 if no questions
    const romanceScore = categoryScores.romance.count > 0
      ? (categoryScores.romance.total / categoryScores.romance.count) * 20
      : 50; // Default to 50 if no questions
    const partnershipScore = categoryScores.partnership.count > 0
      ? (categoryScores.partnership.total / categoryScores.partnership.count) * 20
      : 50; // Default to 50 if no questions
    const intimacyScore = categoryScores.intimacy.count > 0
      ? (categoryScores.intimacy.total / categoryScores.intimacy.count) * 20
      : 50; // Default to 50 if no questions
    const conflictScore = categoryScores.conflict.count > 0
      ? (categoryScores.conflict.total / categoryScores.conflict.count) * 20
      : 50; // Default to 50 if no questions

    // Calculate baseline health from all category scores
    // For conflict: if no questions answered, use average of other categories
    const finalConflictScore = categoryScores.conflict.count > 0
      ? conflictScore
      : (communicationScore + romanceScore + partnershipScore + intimacyScore) / 4;

    // Baseline health is the average of all 5 category scores
    const baselineHealth = Math.round(
      (communicationScore + romanceScore + partnershipScore + intimacyScore + finalConflictScore) / 5
    );

    // Save survey summary
    const { error: summaryError } = await supabase.from('survey_summary').upsert({
      user_id: userId,
      baseline_health: baselineHealth,
      communication_score: Math.round(communicationScore * 100) / 100,
      romance_score: Math.round(romanceScore * 100) / 100,
      partnership_score: Math.round(partnershipScore * 100) / 100,
      intimacy_score: Math.round(intimacyScore * 100) / 100,
      conflict_score: Math.round(finalConflictScore * 100) / 100,
      completed_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

    if (summaryError) {
      console.error('Error saving survey summary:', summaryError);
      return NextResponse.json({ error: 'Failed to save survey summary' }, { status: 500 });
    }

    // Mark user as survey completed
    const { error: updateError } = await supabase
      .from('users')
      .update({ survey_completed: true })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user survey status:', updateError);
      // Don't fail the whole request if this fails
    }

    return NextResponse.json({
      success: true,
      baselineHealth,
      categoryScores: {
        communication: Math.round(communicationScore * 100) / 100,
        romance: Math.round(romanceScore * 100) / 100,
        partnership: Math.round(partnershipScore * 100) / 100,
        intimacy: Math.round(intimacyScore * 100) / 100,
        conflict: Math.round(finalConflictScore * 100) / 100,
      },
    });
  } catch (error) {
    console.error('Unexpected error submitting survey:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
