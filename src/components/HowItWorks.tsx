import { ClipboardList, BarChart3, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    number: '1',
    icon: ClipboardList,
    title: 'Take a Free Mock Test',
    description: 'Choose Academic or General Training. Experience the official test timing, layout, and pressure.',
  },
  {
    number: '2',
    icon: BarChart3,
    title: 'Get AI-Generated Band Score & Insights',
    description: 'Receive detailed analysis, know exactly where you stand, and what to improve.',
  },
  {
    number: '3',
    icon: TrendingUp,
    title: 'Train Smarter & Improve Fast',
    description: 'Follow targeted lessons, vocabulary lists, and personalized writing and speaking practice to boost your band.',
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">
            HOW IT WORKS
          </p>
          <h2 className="section-title text-foreground">
            Your 3-Step Path to IELTS Excellence
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="text-center animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <step.icon size={40} className="text-primary" />
                </div>
                <div className="step-number absolute -top-2 -right-2">
                  {step.number}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {step.title}
              </h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button className="btn-primary text-lg px-10 py-6 h-auto">
            Start Free IELTS Test
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </div>
      </div>
    </section>
  );
};
