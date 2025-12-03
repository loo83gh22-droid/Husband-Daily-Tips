-- Enable Row Level Security on payment_history table
-- Payment history contains user-specific data (user_id)
-- Users should only see their own payment history
-- INSERT/UPDATE/DELETE are handled by Stripe webhooks via service role

-- Enable RLS
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PAYMENT_HISTORY TABLE POLICIES
-- ============================================================================
-- Following the same pattern as other user-data tables (migration 028)
-- Uses Auth0 context (current_setting('app.auth0_id')) to identify the user

-- Users can read their own payment history
-- (e.g., to view invoices/receipts in their account)
CREATE POLICY "Users can read own payment history" ON payment_history
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Note: INSERT, UPDATE, and DELETE are NOT allowed for regular users
-- Payment history is managed exclusively by Stripe webhooks via service role
-- This ensures payment records are immutable and auditable
-- Users cannot create, modify, or delete their own payment records

-- Note: The indexes on user_id already exist (created in migration 037)
-- This ensures RLS policy checks are performant

