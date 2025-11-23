# Legal Requirements for Best Husband Ever

## ✅ What We've Created

### 1. Terms of Service (`/legal/terms`)
- **Location**: `app/legal/terms/page.tsx`
- **Covers**:
  - Service description and disclaimer (not professional therapy)
  - Subscription terms and cancellation policy
  - User responsibilities and prohibited uses
  - Intellectual property rights
  - Limitation of liability
  - Refund policy (case-by-case within 30 days)

### 2. Privacy Policy (`/legal/privacy`)
- **Location**: `app/legal/privacy/page.tsx`
- **Covers**:
  - What data we collect (email, profile info, usage data)
  - How we use the data
  - Data storage and security (Supabase, Auth0)
  - Data sharing practices
  - User rights (access, correction, deletion, export)
  - GDPR considerations for EU users
  - Cookie usage
  - Children's privacy (18+ only)

## 🔍 Additional Legal Considerations

### Required (High Priority)

1. **Cookie Policy** (if using analytics/tracking)
   - Currently: We use cookies for session management
   - Action: May need a cookie banner if you add analytics (Google Analytics, etc.)

2. **Refund Policy** (for subscriptions)
   - Currently: Mentioned in Terms as "case-by-case within 30 days"
   - Action: Consider a dedicated refund policy page for clarity

3. **Disclaimer** (for relationship advice)
   - Currently: Included in Terms of Service
   - Action: Consider making it more prominent on the landing page

### Recommended (Medium Priority)

4. **GDPR Compliance** (if serving EU users)
   - ✅ Privacy Policy mentions GDPR rights
   - ⚠️ May need: Cookie consent banner, data processing agreement with Supabase/Auth0
   - ⚠️ May need: Data Protection Officer (DPO) if processing large amounts of EU data

5. **CCPA Compliance** (if serving California users)
   - Similar to GDPR - right to know, delete, opt-out
   - Privacy Policy should cover this

6. **Accessibility Statement**
   - If you want to be ADA compliant
   - States your commitment to accessibility

### Optional (Lower Priority)

7. **DMCA Policy** (if users can upload content)
   - Currently: Users can create journal entries (private)
   - May not be needed unless you allow public content sharing

8. **Acceptable Use Policy**
   - Currently: Covered in Terms of Service
   - Could be separate for clarity

9. **Business Information**
   - Legal business name
   - Business address
   - Contact information (already have: action@besthusbandever.com)

## 📋 Implementation Checklist

- [x] Terms of Service page created
- [x] Privacy Policy page created
- [x] Links added to footer (landing page)
- [ ] Add links to footer on dashboard pages
- [ ] Add links in hamburger menu
- [ ] Add links in signup/login flow
- [ ] Cookie consent banner (if adding analytics)
- [ ] Review with lawyer (recommended before launch)

## ⚠️ Important Notes

1. **Not Legal Advice**: These templates are starting points. You should have a lawyer review them before launch, especially if:
   - You're processing payments
   - You're serving EU users (GDPR)
   - You're serving California users (CCPA)
   - You're a registered business entity

2. **Payment Processing**: When you integrate Stripe, you'll need to:
   - Review Stripe's terms
   - Ensure your refund policy aligns with Stripe's policies
   - Consider chargeback policies

3. **Data Processing**: Since you use:
   - **Auth0**: Review their data processing agreement
   - **Supabase**: Review their privacy policy and data processing terms
   - **Resend**: Review their data processing terms for email

4. **Relationship Advice Disclaimer**: Your Terms clearly state you're not providing professional therapy. This is important for liability protection.

## 🚀 Next Steps

1. **Review the created pages** - Make sure they reflect your actual business practices
2. **Add links throughout the site** - Footer, signup flow, email footers
3. **Consult with a lawyer** - Especially for:
   - Subscription terms
   - Refund policies
   - Data processing agreements
   - Business entity structure
4. **Update as needed** - Legal requirements change, and your business will evolve

## 📧 Contact for Legal Questions

For legal inquiries: action@besthusbandever.com

