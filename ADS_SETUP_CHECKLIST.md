# Ads Setup Checklist - $2/Day Campaign

## ✅ Pre-Launch Checklist

### 1. Analytics & Tracking Setup

#### Google Analytics
- [ ] Create Google Analytics account
- [ ] Get Measurement ID (starts with `G-`)
- [ ] Add `NEXT_PUBLIC_GA_ID` to Vercel environment variables
- [ ] Verify tracking works (check Realtime reports)
- [ ] Set up conversion goals:
  - [ ] Signup event
  - [ ] Survey completion
  - [ ] Subscription purchase

#### Facebook Pixel
- [ ] Create Facebook Business Manager account (if needed)
- [ ] Create Facebook Pixel in Events Manager
- [ ] Get Pixel ID
- [ ] Add `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` to Vercel environment variables
- [ ] Verify Pixel is firing (use Facebook Pixel Helper browser extension)
- [ ] Set up conversion events:
  - [ ] CompleteRegistration (signup)
  - [ ] Purchase (subscription)

#### UTM Parameters
- [x] UTM tracking component installed
- [ ] Test UTM parameters work:
  - Visit: `https://besthusbandever.com?utm_source=facebook&utm_medium=cpc&utm_campaign=test`
  - Check sessionStorage for `utm_params`

### 2. Landing Page Optimization

- [ ] Test landing page load speed (<3 seconds)
- [ ] Verify mobile responsiveness
- [ ] Check all CTAs work
- [ ] Test signup flow end-to-end
- [ ] Verify no broken links
- [ ] Check for typos/errors
- [ ] Test on multiple devices (phone, tablet, desktop)

### 3. Ad Creative Preparation

#### Facebook/Instagram Ads
- [ ] Create 3-5 ad variations (different images/copy)
- [ ] Prepare images (1200x628px for link ads)
- [ ] Write ad copy (multiple versions)
- [ ] Create video ad (optional but recommended)
- [ ] Design carousel ad (optional)

#### Ad Copy Ideas
- [ ] Version 1: Problem-focused ("Tired of being on autopilot?")
- [ ] Version 2: Solution-focused ("One action a day. One smile tomorrow.")
- [ ] Version 3: Social proof ("Join husbands improving their relationships")
- [ ] Version 4: Benefit-focused ("Become the husband she deserves")

### 4. Audience Targeting

- [ ] Define primary audience:
  - [ ] Age: 25-50
  - [ ] Gender: Male
  - [ ] Interests: Relationships, Marriage, Self-improvement
  - [ ] Location: US (or your target country)
- [ ] Create lookalike audience (after getting 100+ signups)
- [ ] Set up retargeting audience (website visitors)

### 5. Campaign Setup

#### Campaign Structure
- [ ] Campaign name: "Best Husband Ever - Signups"
- [ ] Ad set name: "Men 25-50 - Relationship Interest"
- [ ] Budget: $2/day
- [ ] Optimization: Conversions (CompleteRegistration)
- [ ] Billing: Daily budget

#### Ad Setup
- [ ] Ad name: "Daily Actions - [Variation Name]"
- [ ] Destination: `https://besthusbandever.com?utm_source=facebook&utm_medium=cpc&utm_campaign=signup_campaign`
- [ ] Headline: "Daily Actions to Level Up Your Marriage"
- [ ] Description: "Stop winging it. Start winning it. Get personalized daily actions delivered."
- [ ] Call-to-action: "Sign Up" or "Learn More"

### 6. Testing & Validation

- [ ] Test full funnel:
  1. Click ad → Landing page loads
  2. Click "Get Started" → Signup page
  3. Complete signup → Dashboard loads
  4. Verify tracking events fire
- [ ] Test on mobile device
- [ ] Test on desktop
- [ ] Verify UTM parameters are captured
- [ ] Check Google Analytics shows traffic
- [ ] Check Facebook Pixel fires

### 7. Support & Monitoring

- [ ] Set up error monitoring (check Vercel logs)
- [ ] Prepare FAQ responses
- [ ] Set up support email auto-responder
- [ ] Create monitoring dashboard:
  - [ ] Daily signups
  - [ ] Cost per signup
  - [ ] Conversion rate
  - [ ] Ad performance

---

## 🚀 Launch Day Checklist

### Before Launching Ads
- [ ] All tracking verified and working
- [ ] Landing page tested and optimized
- [ ] Support system ready
- [ ] Budget set to $2/day
- [ ] Campaign scheduled to start
- [ ] Monitoring dashboard ready

### Launch Steps
1. [ ] Create campaign in Facebook Ads Manager
2. [ ] Set budget to $2/day
3. [ ] Upload ad creative
4. [ ] Set targeting
5. [ ] Review and publish
6. [ ] Monitor first hour closely

### First 24 Hours
- [ ] Check ad delivery (is it showing?)
- [ ] Monitor click-through rate (CTR)
- [ ] Check cost per click (CPC)
- [ ] Verify conversions are tracking
- [ ] Check for any errors/issues
- [ ] Review landing page analytics

---

## 📊 Key Metrics to Monitor

### Daily Metrics
- **Spend**: Should be ~$2/day
- **Impressions**: How many people see your ad
- **Clicks**: How many people click
- **CTR**: Click-through rate (aim for >1%)
- **CPC**: Cost per click (aim for <$1)
- **Signups**: How many people sign up
- **Cost per Signup**: Total spend ÷ signups (aim for <$5-10)

### Weekly Review
- **Total spend**: Should be ~$14/week
- **Total signups**: Expected 6-30/week
- **Conversion rate**: Signups ÷ Clicks (aim for >5%)
- **ROI**: Revenue ÷ Ad spend (will be negative initially)

### Optimization Targets
- **CPC**: <$1.00 (good), <$0.50 (great)
- **CTR**: >1% (good), >2% (great)
- **Cost per Signup**: <$5 (good), <$2 (great)
- **Signup Rate**: >5% (good), >10% (great)

---

## 🎯 Ad Copy Templates

### Template 1: Problem-Solution
```
Headline: "Tired of Being on Autopilot in Your Relationship?"

Description: "You're not a bad husband. You're just busy. But small, consistent actions beat grand gestures every time. Get one personalized action delivered daily. Free 7-day trial."

CTA: "Start Your Free Trial"
```

### Template 2: Benefit-Focused
```
Headline: "Become the Husband She Deserves"

Description: "One action a day. One smile tomorrow. Daily personalized actions that show you care. She'll notice. You'll both feel the difference. No credit card required."

CTA: "Get Started Free"
```

### Template 3: Social Proof
```
Headline: "Join Husbands Improving Their Relationships"

Description: "Stop winging it. Start winning it. Get daily actions delivered to your inbox. Build your Husband Health score. Earn badges. See real progress. Free trial."

CTA: "Try Free for 7 Days"
```

### Template 4: Direct & Simple
```
Headline: "Daily Actions to Level Up Your Marriage"

Description: "Small actions. Big impact. Get one personalized action every day. Quick, meaningful, and actually doable. Free 7-day trial. No credit card required."

CTA: "Start Free Trial"
```

---

## 🔧 Troubleshooting

### Ads Not Showing
- Check ad approval status
- Verify budget is set correctly
- Check audience size (needs 1,000+ people)
- Review ad policy compliance

### No Conversions Tracking
- Verify Pixel is installed correctly
- Check Events Manager for events
- Test with Facebook Pixel Helper
- Verify UTM parameters are in URL

### High Cost Per Click
- Narrow audience targeting
- Improve ad relevance score
- Test different ad creative
- Consider different ad placements

### Low Click-Through Rate
- Test different headlines
- Try different images
- Improve ad copy
- Test different CTAs

### Low Conversion Rate
- Optimize landing page
- Improve value proposition
- Simplify signup process
- Add social proof

---

## 📈 Scaling Plan

### Week 1-2: Learning Phase ($2/day)
- Let Facebook learn
- Collect data
- Don't make major changes
- Monitor performance

### Week 3: Optimization ($2/day)
- Pause underperforming ads
- Increase budget on winners
- Test new creative
- Refine targeting

### Week 4: Scale ($5/day)
- If cost per signup <$5, increase to $5/day
- Scale winning ads
- Test new audiences
- Continue optimization

### Month 2+: Growth ($10-20/day)
- Scale what works
- Expand to new platforms
- Create lookalike audiences
- Focus on retention

---

## ✅ Final Pre-Launch Verification

Run through this checklist before launching:

1. [ ] Google Analytics tracking verified
2. [ ] Facebook Pixel installed and verified
3. [ ] UTM parameters working
4. [ ] Landing page loads fast (<3 seconds)
5. [ ] Signup flow tested end-to-end
6. [ ] Mobile experience tested
7. [ ] Support email ready
8. [ ] Budget set correctly ($2/day)
9. [ ] Ad creative approved
10. [ ] Monitoring dashboard set up

**Ready to launch?** ✅

---

## 📞 Support Resources

- **Facebook Ads Help**: https://www.facebook.com/business/help
- **Google Analytics Help**: https://support.google.com/analytics
- **Facebook Pixel Helper**: Chrome extension to verify Pixel
- **Vercel Analytics**: Built-in analytics in Vercel dashboard

---

**Remember**: The goal of $2/day ads isn't immediate profitability—it's learning what works, finding your audience, and optimizing your funnel. Be patient, track everything, and iterate based on data.

