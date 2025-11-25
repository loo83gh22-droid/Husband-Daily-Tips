'use client';

import { useState } from 'react';
import SubscriptionButton from './SubscriptionButton';
import BillingToggle from './BillingToggle';

interface Plan {
  name: string;
  price: number;
  priceAnnual?: number;
  tier: string;
  features: string[];
  popular?: boolean;
}

interface SubscriptionPlansProps {
  plans: Plan[];
  currentTier: string;
  hasActiveTrial?: boolean | null;
  trialEndsAt?: string | null;
  isOnPremium?: boolean;
}

export default function SubscriptionPlans({
  plans,
  currentTier,
  hasActiveTrial,
  trialEndsAt,
  isOnPremium,
}: SubscriptionPlansProps) {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  return (
    <>
      <BillingToggle onIntervalChange={setBillingInterval} />
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = plan.tier === currentTier;
          const isPopular = plan.popular;
          const displayPrice = billingInterval === 'year' && plan.priceAnnual ? plan.priceAnnual : plan.price;
          const monthlyEquivalent = billingInterval === 'year' && plan.priceAnnual ? (plan.priceAnnual / 12).toFixed(2) : plan.price;

          return (
            <div
              key={plan.tier}
              className={`bg-slate-900/80 border rounded-xl shadow-lg p-8 border-2 ${
                isPopular
                  ? 'border-primary-600 transform scale-105'
                  : 'border-slate-800'
              } ${isCurrent ? 'ring-2 ring-primary-400' : ''}`}
            >
              {isPopular && (
                <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                  MOST POPULAR
                </div>
              )}
              {isCurrent && (
                <div className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4 border border-green-500/30">
                  CURRENT PLAN
                </div>
              )}
              {plan.price === 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/40 px-3 py-1 rounded-full inline-block mb-4 text-xs font-medium text-emerald-300">
                  7-DAY FREE TRIAL
                </div>
              )}
              {plan.popular && (
                <div className="bg-primary-500/20 border border-primary-500/40 px-3 py-1 rounded-full inline-block mb-4 text-xs font-medium text-primary-300">
                  7-DAY FREE TRIAL
                </div>
              )}
              <h3 className="text-2xl font-bold text-slate-50 mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold text-slate-50 mb-2">
                ${displayPrice}
                <span className="text-lg text-slate-400">
                  /{billingInterval === 'year' ? 'year' : 'month'}
                </span>
              </div>
              {billingInterval === 'year' && plan.priceAnnual && (
                <p className="text-xs text-slate-400 mb-2">
                  ${monthlyEquivalent}/month billed annually
                </p>
              )}
              {plan.price > 0 && billingInterval === 'month' && (
                <p className="text-sm text-primary-400 font-semibold mb-4">
                  $7 a month. Roughly $0.25 per day. A no-brainer to level up your biggest win.
                </p>
              )}
              {plan.price > 0 && billingInterval === 'year' && (
                <p className="text-sm text-primary-400 font-semibold mb-4">
                  Save 15% with annual billing. Only ${monthlyEquivalent}/month.
                </p>
              )}
              {plan.price === 0 && (
                <p className="text-xs text-slate-400 mb-4">Free forever</p>
              )}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => {
                  const isIncluded = !feature.toLowerCase().startsWith('no ');
                  return (
                    <li key={index} className="flex items-center text-slate-300">
                      {isIncluded ? (
                        <svg
                          className="w-5 h-5 text-green-400 mr-2 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-red-400 mr-2 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {feature}
                    </li>
                  );
                })}
              </ul>
              <SubscriptionButton
                plan={{
                  ...plan,
                  interval: billingInterval,
                  price: displayPrice,
                }}
                currentTier={currentTier}
                hasActiveTrial={hasActiveTrial}
                trialEndsAt={trialEndsAt}
                isOnPremium={isOnPremium}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

