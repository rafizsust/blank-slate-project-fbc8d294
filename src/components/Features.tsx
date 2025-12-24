import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  'Realistic computer-based IELTS mock tests',
  'Instant scoring & detailed answer explanations',
  'Real test environment with timer and auto-submit',
  'Writing & Speaking evaluation with model responses',
  'Vocabulary & grammar training for all levels',
  'Global ranking & performance dashboard',
  'Access from mobile, tablet, or desktop',
];

export const Features = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">
            FEATURES DESIGNED FOR RESULTS
          </p>
          <h2 className="section-title text-foreground">
            Why Learners Worldwide Love IELTS AI
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={feature}
                className="flex items-center gap-4 p-4 bg-secondary rounded-xl animate-fade-in-left"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                  <Check size={18} className="text-success-foreground" />
                </div>
                <span className="text-foreground font-medium">{feature}</span>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 lg:p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Ready to boost your IELTS score?
              </h3>
              <p className="text-muted-foreground mb-8">
                Join thousands of successful test-takers who achieved their dream band scores with IELTS AI.
              </p>
              <Button className="btn-primary text-lg px-8 py-5 h-auto">
                Start Free IELTS Test
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
