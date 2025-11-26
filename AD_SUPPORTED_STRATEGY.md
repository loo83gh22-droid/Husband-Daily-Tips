# Ad-Supported Version Strategy

## Overview

An ad-supported (freemium) version can be a great way to monetize free users while providing value. Here's how it works and how to implement it.

## How Ad-Supported Versions Work

### 1. **Revenue Model**
- **Display Ads**: Show banner ads, native ads, or interstitial ads between actions
- **Sponsored Content**: Feature sponsored actions or tips (clearly labeled)
- **Affiliate Links**: Earn commission from relationship-related products/services
- **Ad Networks**: Use Google AdSense, Media.net, or specialized relationship/wellness ad networks

### 2. **User Experience**
- Free users see ads but get full access to features
- Premium users pay to remove ads
- Ads should be:
  - Non-intrusive (don't block content)
  - Relevant (relationship/wellness focused)
  - Clearly marked as ads
  - Easy to dismiss (for premium users)

## Implementation Approaches

### Option A: Ad-Supported Free Tier (Recommended)
**Free users get:**
- Full access to all actions
- Journal access
- All features
- **But see ads**

**Premium users get:**
- Everything free users get
- **No ads**
- Priority support
- Early access to new features

**Pros:**
- Higher engagement (users can use all features)
- Better conversion funnel (users experience full value)
- Ad revenue from free users
- Subscription revenue from premium users

**Cons:**
- Need to implement ad infrastructure
- Ad revenue can be unpredictable
- Need to balance ad frequency with UX

### Option B: Hybrid Model (Current + Ads)
**Free users:**
- Limited to daily action (current restriction)
- No journal
- **See ads on dashboard/actions page**

**Premium users:**
- Full access
- No ads

**Pros:**
- Clear value proposition for premium
- Ad revenue from free users
- Simpler to implement (fewer features to gate)

**Cons:**
- Lower engagement from free users
- Less ad inventory (fewer page views)

## Technical Implementation

### 1. **Ad Network Integration**

#### Google AdSense (Easiest)
```tsx
// components/AdBanner.tsx
'use client';
import { useEffect } from 'react';
import Script from 'next/script';

export default function AdBanner({ slotId }: { slotId: string }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    }
  }, []);

  return (
    <div className="my-4">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXX"
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
```

#### Next.js Script Component
```tsx
<Script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
  crossOrigin="anonymous"
  strategy="afterInteractive"
/>
```

### 2. **Conditional Ad Display**

```tsx
// components/ConditionalAd.tsx
'use client';
import { useEffect, useState } from 'react';
import AdBanner from './AdBanner';

export default function ConditionalAd() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      const res = await fetch('/api/user/subscription-status');
      const data = await res.json();
      setSubscriptionStatus(data);
      setIsLoading(false);
    }
    fetchStatus();
  }, []);

  // Don't show ads to premium users
  if (isLoading) return null;
  if (subscriptionStatus?.isOnPremium || subscriptionStatus?.hasActiveTrial) {
    return null;
  }

  return <AdBanner slotId="1234567890" />;
}
```

### 3. **Ad Placement Strategy**

**Best Locations:**
1. **Dashboard** - After the daily action card
2. **Actions Page** - Between action categories
3. **Journal Page** - After journal entries (if free users had access)
4. **Team Wins** - Between posts

**Ad Frequency:**
- 1 ad per page view (non-intrusive)
- Or 1 ad per 3-4 content sections (more revenue, slightly more intrusive)

### 4. **Ad Revenue Estimation**

**Typical CPM (Cost Per 1000 impressions):**
- Google AdSense: $1-5 CPM (varies by niche)
- Relationship/Wellness niche: $2-8 CPM
- Mobile: Lower CPM ($0.50-2)

**Example Calculation:**
- 1,000 free users
- 3 page views per user per week
- = 3,000 page views/week
- At $3 CPM = $9/week = ~$36/month
- At scale (10,000 users) = ~$360/month

**Note:** Ad revenue is typically much lower than subscription revenue, but it's passive income from users who won't pay.

## Recommended Approach for Best Husband Ever

### Phase 1: Current Model (Restricted Free)
- Free: Daily action only, no journal
- Premium: Full access, no ads
- **Focus on conversion to paid**

### Phase 2: Add Ads to Free Tier (If Needed)
- Keep current restrictions
- Add ads to free user experience
- **Monetize free users without giving away premium features**

### Phase 3: Ad-Supported Full Access (If Conversion is Low)
- Free: Full access with ads
- Premium: Full access without ads
- **Maximize engagement and ad revenue**

## Ad Network Options

1. **Google AdSense** - Easiest, most common
2. **Media.net** - Contextual ads, good for content sites
3. **Ezoic** - AI-optimized ad placement
4. **Mediavine** - Requires 50k+ monthly sessions
5. **AdThrive** - Requires 100k+ monthly page views

## Best Practices

1. **User Experience First**
   - Ads should enhance, not detract
   - Clear "Upgrade to remove ads" messaging
   - Don't block critical functionality

2. **Ad Quality**
   - Use reputable ad networks
   - Filter inappropriate ads
   - Monitor ad performance

3. **Privacy Compliance**
   - GDPR compliance (EU users)
   - CCPA compliance (California users)
   - Cookie consent banners

4. **A/B Testing**
   - Test ad placement
   - Test ad frequency
   - Measure impact on conversion

## Implementation Checklist

- [ ] Choose ad network (start with AdSense)
- [ ] Get ad network approval
- [ ] Create `AdBanner` component
- [ ] Create `ConditionalAd` component
- [ ] Add ads to dashboard (free users only)
- [ ] Add ads to actions page (free users only)
- [ ] Add "Upgrade to remove ads" messaging
- [ ] Test ad display logic
- [ ] Monitor ad revenue
- [ ] Optimize ad placement based on data

## Revenue Comparison

**Subscription Model (Current):**
- 1,000 users × 5% conversion = 50 paid users
- 50 × $7/month = $350/month

**Ad-Supported Model:**
- 1,000 free users × 3 page views/week × $3 CPM = ~$36/month
- 50 paid users × $7/month = $350/month
- **Total: ~$386/month**

**Hybrid (Ads + Restrictions):**
- Lower engagement = lower ad revenue
- But higher conversion rate potentially
- **Test and optimize**

## Recommendation

**Start with current model (restricted free tier)** to maximize conversion. If conversion is low after 3-6 months, consider adding ads to free tier to monetize non-converting users while keeping premium value proposition strong.

