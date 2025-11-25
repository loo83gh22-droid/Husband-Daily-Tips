import { z } from 'zod';

// Survey response validation
export const surveyResponseSchema = z.object({
  userId: z.string().uuid().optional(),
  responses: z.array(
    z.object({
      questionId: z.number().int().positive(),
      answer: z.union([
        z.number().int().min(1).max(5), // Rating scale
        z.boolean(), // Yes/No questions
        z.string().min(1).max(1000), // Text responses
      ]),
    })
  ).min(1).max(30), // Reasonable limits
  skip: z.boolean().optional(),
});

// User profile update validation
export const userProfileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  country: z.enum(['US', 'CA', 'Other']).optional(),
  has_kids: z.boolean().optional(),
  kids_live_with_you: z.boolean().optional(),
});

// Referral code validation
export const referralCodeSchema = z.object({
  referralCode: z.string().regex(/^[A-Z0-9]{8}$/, 'Invalid referral code format'),
});

// Action completion validation
export const actionCompleteSchema = z.object({
  actionId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  completed: z.boolean().optional(),
  dnc: z.boolean().optional(), // Do not complete
});

