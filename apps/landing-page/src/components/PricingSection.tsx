import React, { useState } from 'react';
import { Check, Sparkles, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    badge: 'Standard',
    priceMonthly: '199',
    priceAnnual: '159',
    description: 'Perfect for small shops & individual creators automating basic WA queries.',
    features: [
      'Up to 2,500 AI Messages/mo',
      '1 WhatsApp Number Connection',
      'Basic Broadcast (500 contacts/day)',
      'Community & Email Support',
      'Standard AI Auto-Reply Engine',
    ],
    popular: false,
    cta: 'Start Free Trial',
  },
  {
    name: 'Pro Agent',
    badge: 'Most Popular',
    priceMonthly: '499',
    priceAnnual: '399',
    description: 'Ideal for growing businesses & e-commerce brands needing multi-agent & broadcast.',
    features: [
      'Up to 15,000 AI Messages/mo',
      '3 WhatsApp Number Connections',
      'Unlimited Broadcast Campaigns',
      'Multi-Agent Shared Inbox (5 Seats)',
      'Shopify & Webhook Integrations',
      'Priority 24/7 Support & SLA',
    ],
    popular: true,
    cta: 'Get Started Pro',
  },
  {
    name: 'Enterprise',
    badge: 'Scale',
    priceMonthly: '1,299',
    priceAnnual: '999',
    description: 'Custom AI model training, dedicated infrastructure, and unlimited volume.',
    features: [
      'Unlimited AI Messages',
      'Unlimited WhatsApp Connections',
      'Custom LLM Fine-Tuning on your Docs',
      'Dedicated Account Manager',
      'Custom API & Database Sync',
      '99.9% Uptime Guarantee',
    ],
    popular: false,
    cta: 'Contact Sales',
  },
];

export const PricingSection: React.FC = () => {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 bg-[#010102] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f1011] border border-[#23252a] text-xs font-mono text-[#25D366] mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Predictable Pricing
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Transparent plans for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#d0d6e0] to-[#25D366]">
              businesses of any size
            </span>
          </h2>
          <p className="mt-4 text-[#8a8f98] text-base sm:text-lg">
            No hidden setup fees. Upgrade, downgrade, or cancel anytime.
          </p>

          {/* Billing Switch Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 bg-[#0f1011] border border-[#23252a] p-1.5 rounded-xl">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                !annual ? 'bg-[#141516] text-white shadow' : 'text-[#8a8f98] hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                annual ? 'bg-[#25D366] text-black shadow font-bold' : 'text-[#8a8f98] hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="bg-black/20 text-xs px-1.5 py-0.5 rounded font-mono">SAVE 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`glass-panel p-8 rounded-2xl flex flex-col justify-between relative transition-all duration-300 ${
                plan.popular
                  ? 'border-[#25D366]/50 shadow-2xl shadow-[#25D366]/10 lg:-translate-y-2'
                  : 'hover:border-[#34343a]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#25D366] text-black text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow">
                  <Zap className="w-3 h-3 fill-black" /> {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white tracking-tight">{plan.name}</h3>
                  {!plan.popular && (
                    <span className="text-xs font-mono text-[#8a8f98] bg-[#141516] px-2.5 py-1 rounded border border-[#23252a]">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#8a8f98] min-h-[36px] leading-relaxed mb-6">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-xs text-[#8a8f98] font-mono">Rp</span>
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    {annual ? plan.priceAnnual : plan.priceMonthly}k
                  </span>
                  <span className="text-xs text-[#8a8f98] font-mono">/month</span>
                </div>

                <div className="space-y-3 pt-6 border-t border-[#23252a] mb-8">
                  <span className="text-[11px] font-mono text-[#62666d] uppercase tracking-wider">INCLUDED FEATURES:</span>
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-[#d0d6e0]">
                      <Check className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all shadow ${
                  plan.popular
                    ? 'bg-[#25D366] hover:bg-[#3ecf8e] text-black shadow-[#25D366]/20'
                    : 'bg-[#141516] hover:bg-[#18191a] text-white border border-[#23252a]'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
