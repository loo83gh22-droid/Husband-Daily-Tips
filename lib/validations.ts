import { z } from 'zod';

// Survey response validation
// Accepts both array format [{questionId, answer}] and object format {[questionId]: value}
export const surveyResponseSchema = z.object({
  userId: z.string().uuid().optional(),
  responses: z.union([
    // Array format: [{questionId: 1, answer: 5}, ...]
    z.array(
      z.object({
        questionId: z.number().int().positive(),
        answer: z.union([
          z.number().int().min(0).max(5), // Rating scale or yes/no (0 or 1)
          z.boolean(), // Yes/No questions
          z.string().min(1).max(1000), // Text responses
        ]),
      })
    ).min(1).max(30),
    // Object format: {1: 5, 2: 1, ...} where key is questionId and value is response
    z.record(z.string().regex(/^\d+$/).transform(Number), z.union([
      z.number().int().min(0).max(5),
      z.boolean(),
    ])),
  ]),
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

