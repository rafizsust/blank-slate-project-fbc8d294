import { Check, X, Crown, Zap, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Free Plan',
    price: 'Free',
    period: '',
    icon: Zap,
    features: [
      { text: 'AI Writing & Speaking Evaluation', included: true },
      { text: 'AI Analytics with Weak Areas', included: true },
      { text: 'Flashcard Creation', included: true },
      { text: 'Auto Import Words to Flashcards', included: true },
      { text: 'Full Module Practice Tests', included: false },
      { text: 'Full Mock Tests', included: false },
    ],
    cta: 'Get Started Free',
    featured: false,
  },
  {
    name: 'Weekly',
    price: '৳50',
    period: '/week',
    icon: Zap,
    features: [
      { text: 'Everything in Free Plan', included: true },
      { text: 'Full Module Practice Tests', included: true },
      { text: 'Full Mock Tests (All 4 Modules)', included: true },
      { text: 'Unlimited AI Evaluations', included: true },
      { text: 'Priority Support', included: true },
      { text: 'Best for: Quick Exam Prep', included: true },
    ],
    cta: 'Start Weekly',
    featured: false,
  },
  {
    name: 'Monthly',
    price: '৳150',
    period: '/month',
    icon: Crown,
    features: [
      { text: 'Everything in Free Plan', included: true },
      { text: 'Full Module Practice Tests', included: true },
      { text: 'Full Mock Tests (All 4 Modules)', included: true },
      { text: 'Unlimited AI Evaluations', included: true },
      { text: 'Priority Support', included: true },
      { text: 'Best Value for Regular Practice', included: true },
    ],
    cta: 'Start Monthly',
    featured: true,
  },
  {
    name: 'Six Months',
    price: '৳600',
    period: '/6 months',
    icon: Gem,
    features: [
      { text: 'Everything in Monthly Plan', included: true },
      { text: 'Save ৳300 (33% off)', included: true },
      { text: 'Full Access for 6 Months', included: true },
      { text: 'Extended Support', included: true },
      { text: 'Best for: Serious Preparation', included: true },
      { text: 'Ideal for Target Score Goals', included: true },
    ],
    cta: 'Get Best Value',
    featured: false,
  },
];

export const Pricing = () => {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">
            PRICING PLANS
          </p>
          <h2 className="section-title text-foreground">
            Flexible Options for Every Learner
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <div
                key={plan.name}
                className={`${plan.featured ? 'pricing-card-featured ring-2 ring-primary scale-105' : 'pricing-card'} flex flex-col animate-scale-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary px-4 py-1 rounded-full text-sm font-semibold">
                    <span className="text-white">Most Popular</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <IconComponent size={24} className={plan.featured ? 'text-primary-foreground' : 'text-primary'} />
                  <h3 className={`text-xl font-bold ${plan.featured ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {plan.name}
                  </h3>
                </div>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.featured ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {plan.price}
                  </span>
                  <span className={plan.featured ? 'text-primary-foreground/80' : 'text-muted-foreground'}>
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check size={18} className={plan.featured ? 'text-primary-foreground' : 'text-success'} />
                      ) : (
                        <X size={18} className="text-muted-foreground" />
                      )}
                      <span className={`text-sm ${plan.featured ? 'text-primary-foreground/90' : feature.included ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plan.featured ? 'bg-white text-primary hover:bg-white/90' : 'btn-outline'}`}
                >
                  {plan.cta}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
