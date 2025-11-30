import { z } from 'zod';

// Survey response validation
// Accepts both array format [{questionId, answer}] and object format {[questionId]: value}
export const surveyResponseSchema = z.object({
  userId: z.union([
    z.string().uuid(),
    z.string().length(0), // Allow empty string
    z.undefined(),
  ]).optional(),
  responses: z.union([
    // Array format: [{questionId: 1, answer: 5}, ...]
    z.array(
      z.object({
        questionId: z.number().int().positive(),
        answer: z.union([
          z.number().int().min(0).max(5), // Rating scale or yes/no (0 or 1)
          z.boolean(), // Yes/No questions
          z.string().min(1).max(1000), // Text responses
          z.array(z.number().int().min(0).max(6)), // Multi-select questions (e.g., work_days: array of days 0-6)
        ]),
      })
    ).min(1).max(30),
    // Object format: {1: 5, 2: 1, ...} or {"1": 5, "2": 1, ...} where key is questionId and value is response
    // Accept any object with string/number keys and number/boolean/array values (will be validated more strictly in processing)
    // Arrays are for multi_select questions (e.g., work_days)
    z.record(z.unknown(), z.unknown()).refine(
      (val) => {
        // Check that all values are valid (number 0-5, boolean, or array of numbers 0-6)
        return Object.values(val).every((v) => {
          if (typeof v === 'number') {
            return Number.isInteger(v) && v >= 0 && v <= 5;
          }
          if (typeof v === 'boolean') {
            return true;
          }
          // Allow arrays (for multi_select questions like work_days)
          if (Array.isArray(v)) {
            // Validate that array contains only numbers 0-6 (days of week)
            return v.every((item) => typeof item === 'number' && Number.isInteger(item) && item >= 0 && item <= 6);
          }
          return false;
        });
      },
      { message: 'All response values must be numbers (0-5), booleans, or arrays of numbers (0-6) for multi-select questions' }
    ),
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

