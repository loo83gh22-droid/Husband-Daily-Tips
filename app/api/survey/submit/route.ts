import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase, getSupabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';
import { logger } from '@/lib/logger';
import { checkRateLimit, surveyRateLimiter } from '@/lib/rate-limit';
import { surveyResponseSchema } from '@/lib/validations';

const resend = new Resend(process.env.RESEND_API_KEY || '');

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

    // Add rate limiting
    const rateLimitResult = await checkRateLimit(
      surveyRateLimiter,
      auth0Id // Use Auth0 ID as identifier
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime || 60000) / 1000),
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Log the incoming data for debugging (remove in production if needed)
    logger.info('Survey submission received:', {
      hasUserId: !!body.userId,
      responsesType: Array.isArray(body.responses) ? 'array' : typeof body.responses,
      responsesKeys: Array.isArray(body.responses) ? body.responses.length : Object.keys(body.responses || {}).length,
      sampleResponse: Array.isArray(body.responses) 
        ? body.responses[0] 
        : Object.entries(body.responses || {}).slice(0, 3),
    });

    // Validate input
    const validationResult = surveyResponseSchema.safeParse(body);
    
    if (!validationResult.success) {
      logger.error('Survey validation failed:', {
        errors: validationResult.error.errors,
        receivedData: {
          userId: body.userId,
          responsesType: Array.isArray(body.responses) ? 'array' : typeof body.responses,
          responsesSample: Array.isArray(body.responses)
            ? body.responses.slice(0, 2)
            : Object.fromEntries(Object.entries(body.responses || {}).slice(0, 3)),
        },
      });
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { userId, responses, skip } = validationResult.data;

    // Use admin client for all database operations (bypasses RLS)
    const adminSupabase = getSupabaseAdmin();

    // If userId not provided, fetch it from the session
    let finalUserId = userId;
    if (!finalUserId) {
      const { data: user, error: userLookupError } = await adminSupabase
        .from('users')
        .select('id')
        .eq('auth0_id', auth0Id)
        .single();

      if (userLookupError || !user) {
        logger.error('User lookup error:', userLookupError);
        return NextResponse.json({ error: 'User not found. Please try logging in again.' }, { status: 404 });
      }

      finalUserId = user.id;
    }

    // Handle skip: set baseline to 50 and mark survey as completed
    const responsesLength = Array.isArray(responses) ? responses.length : Object.keys(responses || {}).length;
    if (skip || !responses || responsesLength === 0) {
      const { error: summaryError } = await adminSupabase.from('survey_summary').upsert({
        user_id: finalUserId,
        baseline_health: 50, // Default baseline
        communication_score: 50,
        romance_score: 50,
        partnership_score: 50,
        intimacy_score: 50,
        conflict_score: 50,
        completed_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

      if (summaryError) {
        logger.error('Error saving default survey summary:', summaryError);
        return NextResponse.json({ error: 'Failed to save survey summary' }, { status: 500 });
      }

      // Mark user as survey completed
      const { error: updateError } = await adminSupabase
        .from('users')
        .update({ survey_completed: true })
        .eq('id', finalUserId);

      if (updateError) {
        logger.error('Error updating user survey status:', updateError);
      }

      return NextResponse.json({
        success: true,
        baselineHealth: 50,
        skipped: true,
      });
    }

    // Verify user (need email and name for notification)
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('id, email, name, created_at')
      .eq('auth0_id', auth0Id)
      .eq('id', finalUserId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all questions to map responses
    const { data: questions, error: questionsError } = await adminSupabase
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
          const answer = response?.answer;
          // Convert answer to number if needed
          if (typeof answer === 'number') {
            responseValue = answer;
          } else if (typeof answer === 'boolean') {
            responseValue = answer ? 1 : 0;
          } else {
            responseValue = 0;
          }
        } else {
          // Handle both string and number keys (JSON stringifies number keys)
          const answer = responses[question.id] ?? responses[String(question.id)];
          if (typeof answer === 'number') {
            responseValue = answer;
          } else if (typeof answer === 'boolean') {
            responseValue = answer ? 1 : 0;
          } else {
            responseValue = 0;
          }
        }
        return {
          user_id: finalUserId,
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
    const { error: insertError } = await adminSupabase
      .from('survey_responses')
      .insert(responseRecords);

    if (insertError) {
      logger.error('Error inserting survey responses:', insertError);
      return NextResponse.json({ error: 'Failed to save survey responses' }, { status: 500 });
    }

    // Calculate category scores (average of responses per category)
    // Now includes: communication, intimacy, partnership, romance, gratitude, conflict_resolution, reconnection, quality_time, consistency
    const categoryScores: Record<string, { total: number; count: number }> = {
      communication: { total: 0, count: 0 },
      intimacy: { total: 0, count: 0 },
      partnership: { total: 0, count: 0 },
      romance: { total: 0, count: 0 },
      gratitude: { total: 0, count: 0 },
      conflict_resolution: { total: 0, count: 0 },
      reconnection: { total: 0, count: 0 },
      quality_time: { total: 0, count: 0 },
      consistency: { total: 0, count: 0 },
    };

    // Count Yes answers for baseline questions (questions 1-18)
    // Yes = 1 point, No = 0 points
    let yesCount = 0;
    let totalBaselineQuestions = 0;
    
    responseRecords.forEach((response) => {
      const questionId = response.question_id;
      // Only count baseline questions (1-18), not goal-setting questions (19-29)
      if (questionId <= 18) {
        totalBaselineQuestions++;
        if (response.response_type === 'yes_no' && response.response_value === 1) {
          yesCount++;
        }
      }
      
      // Still calculate category scores for goal-setting and other purposes
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

    // Calculate baseline health from Yes/No answers
    // Percentage = (Yes count / Total questions) * 100
    // Maximum baseline health is capped at 90%
    let baselineHealth = 50; // Default if no questions answered
    if (totalBaselineQuestions > 0) {
      const percentage = (yesCount / totalBaselineQuestions) * 100;
      baselineHealth = Math.min(90, Math.round(percentage)); // Cap at 90%
    }

    // Calculate average scores per category (scale to 0-100) for category breakdown
    // Each category has 2 questions (except consistency which has 2 now)
    // Scale: average (1-5) × 20 = score (0-100)
    const communicationScore = categoryScores.communication.count > 0
      ? (categoryScores.communication.total / categoryScores.communication.count) * 20
      : 50; // Default to 50 if no questions
    const intimacyScore = categoryScores.intimacy.count > 0
      ? (categoryScores.intimacy.total / categoryScores.intimacy.count) * 20
      : 50;
    const partnershipScore = categoryScores.partnership.count > 0
      ? (categoryScores.partnership.total / categoryScores.partnership.count) * 20
      : 50;
    const romanceScore = categoryScores.romance.count > 0
      ? (categoryScores.romance.total / categoryScores.romance.count) * 20
      : 50;
    const gratitudeScore = categoryScores.gratitude.count > 0
      ? (categoryScores.gratitude.total / categoryScores.gratitude.count) * 20
      : 50;
    const conflictResolutionScore = categoryScores.conflict_resolution.count > 0
      ? (categoryScores.conflict_resolution.total / categoryScores.conflict_resolution.count) * 20
      : 50;
    const reconnectionScore = categoryScores.reconnection.count > 0
      ? (categoryScores.reconnection.total / categoryScores.reconnection.count) * 20
      : 50;
    const qualityTimeScore = categoryScores.quality_time.count > 0
      ? (categoryScores.quality_time.total / categoryScores.quality_time.count) * 20
      : 50;
    const consistencyScore = categoryScores.consistency.count > 0
      ? (categoryScores.consistency.total / categoryScores.consistency.count) * 20
      : 50;

    // Extract goal-setting responses (self-ratings and improvement desires)
    // Questions 14-29 are the goal-setting questions
    const goalResponses: Record<string, { selfRating?: number; wantsImprovement?: boolean }> = {};
    
    responseRecords.forEach((response) => {
      const questionId = response.question_id;
      const category = response.category.toLowerCase();
      
      // Self-rating questions (even numbers: 14, 16, 18, 20, 22, 24, 26, 28)
      if (questionId % 2 === 0 && questionId >= 14 && questionId <= 28) {
        if (!goalResponses[category]) {
          goalResponses[category] = {};
        }
        goalResponses[category].selfRating = response.response_value;
      }
      
      // Improvement desire questions (odd numbers: 15, 17, 19, 21, 23, 25, 27, 29)
      if (questionId % 2 === 1 && questionId >= 15 && questionId <= 29) {
        if (!goalResponses[category]) {
          goalResponses[category] = {};
        }
        // yes_no: 1 = yes (wants improvement), 0 = no
        goalResponses[category].wantsImprovement = response.response_value === 1;
      }
    });

    // Save survey summary (connection score stored in intimacy_score for now, or we can add a new column later)
    const { error: summaryError } = await adminSupabase.from('survey_summary').upsert({
      user_id: finalUserId,
      baseline_health: baselineHealth,
      communication_score: Math.round(communicationScore * 100) / 100,
      romance_score: Math.round(romanceScore * 100) / 100,
      partnership_score: Math.round(partnershipScore * 100) / 100,
      intimacy_score: Math.round(intimacyScore * 100) / 100,
      conflict_score: Math.round(conflictResolutionScore * 100) / 100, // Now uses conflict_resolution category
      completed_at: new Date().toISOString(),
      // Goal preferences
      communication_self_rating: goalResponses.communication?.selfRating || null,
      communication_wants_improvement: goalResponses.communication?.wantsImprovement ?? null,
      intimacy_self_rating: goalResponses.intimacy?.selfRating || null,
      intimacy_wants_improvement: goalResponses.intimacy?.wantsImprovement ?? null,
      partnership_self_rating: goalResponses.partnership?.selfRating || null,
      partnership_wants_improvement: goalResponses.partnership?.wantsImprovement ?? null,
      romance_self_rating: goalResponses.romance?.selfRating || null,
      romance_wants_improvement: goalResponses.romance?.wantsImprovement ?? null,
      gratitude_self_rating: goalResponses.gratitude?.selfRating || null,
      gratitude_wants_improvement: goalResponses.gratitude?.wantsImprovement ?? null,
      conflict_resolution_self_rating: goalResponses.conflict_resolution?.selfRating || null,
      conflict_resolution_wants_improvement: goalResponses.conflict_resolution?.wantsImprovement ?? null,
      reconnection_self_rating: goalResponses.reconnection?.selfRating || null,
      reconnection_wants_improvement: goalResponses.reconnection?.wantsImprovement ?? null,
      quality_time_self_rating: goalResponses.quality_time?.selfRating || null,
      quality_time_wants_improvement: goalResponses.quality_time?.wantsImprovement ?? null,
    }, {
      onConflict: 'user_id',
    });

    if (summaryError) {
      logger.error('Error saving survey summary:', summaryError);
      return NextResponse.json({ error: 'Failed to save survey summary' }, { status: 500 });
    }

    // Mark user as survey completed
    const { error: updateError } = await adminSupabase
      .from('users')
      .update({ survey_completed: true })
      .eq('id', finalUserId);

    if (updateError) {
      console.error('Error updating user survey status:', updateError);
      // Don't fail the whole request if this fails
    }

    // Send email notification to admin with all responses
    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      try {
        const userDisplayName = user.name || user.email?.split('@')[0] || 'User';
        const daysSinceSignup = user.created_at 
          ? Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        // Format responses for email
        const formattedResponses = questions.map((question, index) => {
          let responseValue: number = 0;
          if (Array.isArray(responses)) {
            const response = responses.find((r: any) => r.questionId === question.id);
            const answer = response?.answer;
            // Convert answer to number if needed
            if (typeof answer === 'number') {
              responseValue = answer;
            } else if (typeof answer === 'boolean') {
              responseValue = answer ? 1 : 0;
            } else {
              responseValue = 0;
            }
          } else {
            const answer = responses[question.id];
            responseValue = typeof answer === 'number' ? answer : 0;
          }

          let formattedValue = '';
          if (question.response_type === 'scale') {
            const labels: Record<number, string> = {
              1: '1 (Strongly Disagree)',
              2: '2 (Disagree)',
              3: '3 (Neutral)',
              4: '4 (Agree)',
              5: '5 (Strongly Agree)',
            };
            formattedValue = labels[responseValue] || responseValue.toString();
          } else if (question.response_type === 'yes_no') {
            formattedValue = responseValue === 1 ? 'Yes' : 'No';
          } else {
            formattedValue = responseValue.toString();
          }

          return {
            question: question.question_text,
            answer: formattedValue,
            category: question.category,
          };
        });

        // Group by category for better readability
        const responsesByCategory: Record<string, typeof formattedResponses> = {};
        formattedResponses.forEach((item) => {
          const category = item.category || 'other';
          if (!responsesByCategory[category]) {
            responsesByCategory[category] = [];
          }
          responsesByCategory[category].push(item);
        });

        const categoryLabels: Record<string, string> = {
          communication: '💬 Communication',
          romance: '💕 Romance',
          partnership: '🤝 Partnership',
          intimacy: '💝 Intimacy',
          conflict_resolution: '⚖️ Conflict Resolution',
          gratitude: '🙏 Gratitude',
          reconnection: '🔗 Reconnection',
          quality_time: '⏰ Quality Time',
          consistency: '🔥 Consistency',
        };

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Best Husband Ever <action@besthusbandever.com>',
          to: process.env.ADMIN_EMAIL,
          replyTo: user.email || undefined,
          subject: `📊 Initial Survey Response from ${userDisplayName} (Baseline Health: ${baselineHealth})`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 0;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0ea5e9; font-size: 24px; margin: 0;">📊 Initial Survey Response</h1>
                    <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">Onboarding Survey</p>
                  </div>
                  
                  <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 10px 0;"><strong>User:</strong> ${userDisplayName}</p>
                    <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 10px 0;"><strong>Email:</strong> ${user.email || 'N/A'}</p>
                    <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 10px 0;"><strong>Days Since Signup:</strong> ${daysSinceSignup}</p>
                    <p style="color: #0ea5e9; font-size: 18px; margin: 15px 0 0 0; font-weight: 600;"><strong>Baseline Health Score: ${baselineHealth}/100</strong></p>
                  </div>
                  
                  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">Category Scores:</h2>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                      <div style="background-color: #ffffff; padding: 10px; border-radius: 6px;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">Communication</p>
                        <p style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 5px 0 0 0;">${Math.round(communicationScore * 100) / 100}</p>
                      </div>
                      <div style="background-color: #ffffff; padding: 10px; border-radius: 6px;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">Intimacy</p>
                        <p style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 5px 0 0 0;">${Math.round(intimacyScore * 100) / 100}</p>
                      </div>
                      <div style="background-color: #ffffff; padding: 10px; border-radius: 6px;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">Partnership</p>
                        <p style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 5px 0 0 0;">${Math.round(partnershipScore * 100) / 100}</p>
                      </div>
                      <div style="background-color: #ffffff; padding: 10px; border-radius: 6px;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">Romance</p>
                        <p style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 5px 0 0 0;">${Math.round(romanceScore * 100) / 100}</p>
                      </div>
                      <div style="background-color: #ffffff; padding: 10px; border-radius: 6px;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">Gratitude</p>
                        <p style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 5px 0 0 0;">${Math.round(gratitudeScore * 100) / 100}</p>
                      </div>
                      <div style="background-color: #ffffff; padding: 10px; border-radius: 6px;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">Conflict Resolution</p>
                        <p style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 5px 0 0 0;">${Math.round(conflictResolutionScore * 100) / 100}</p>
                      </div>
                      <div style="background-color: #ffffff; padding: 10px; border-radius: 6px;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">Reconnection</p>
                        <p style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 5px 0 0 0;">${Math.round(reconnectionScore * 100) / 100}</p>
                      </div>
                      <div style="background-color: #ffffff; padding: 10px; border-radius: 6px;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">Quality Time</p>
                        <p style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 5px 0 0 0;">${Math.round(qualityTimeScore * 100) / 100}</p>
                      </div>
                      <div style="background-color: #ffffff; padding: 10px; border-radius: 6px;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">Consistency</p>
                        <p style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 5px 0 0 0;">${Math.round(consistencyScore * 100) / 100}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">All Responses:</h2>
                    ${Object.entries(responsesByCategory).map(([category, items]) => `
                      <div style="margin-bottom: 25px;">
                        <h3 style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 10px 0;">${categoryLabels[category] || category}</h3>
                        ${items.map((item, index) => `
                          <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: ${index < items.length - 1 ? '1px solid #e5e7eb' : 'none'};">
                            <p style="color: #374151; font-size: 13px; font-weight: 500; margin: 0 0 5px 0;">${item.question}</p>
                            <p style="color: #6b7280; font-size: 13px; margin: 0; padding-left: 15px; border-left: 3px solid #0ea5e9;">${item.answer}</p>
                          </div>
                        `).join('')}
                      </div>
                    `).join('')}
                  </div>
                  
                  <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                      Survey completed at ${new Date().toLocaleString()}
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });

        logger.log(`✅ Initial survey response email sent to admin from ${user.email}`);
      } catch (emailError: any) {
        // Don't fail the request if email fails
        logger.error('Error sending initial survey response email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      baselineHealth,
      categoryScores: {
        communication: Math.round(communicationScore * 100) / 100,
        romance: Math.round(romanceScore * 100) / 100,
        partnership: Math.round(partnershipScore * 100) / 100,
        intimacy: Math.round(intimacyScore * 100) / 100,
        conflict: Math.round(conflictResolutionScore * 100) / 100,
        gratitude: Math.round(gratitudeScore * 100) / 100,
        reconnection: Math.round(reconnectionScore * 100) / 100,
        quality_time: Math.round(qualityTimeScore * 100) / 100,
        consistency: Math.round(consistencyScore * 100) / 100,
      },
    });
  } catch (error) {
    logger.error('Unexpected error submitting survey:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
