import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CTA = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary to-coral-dark relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-foreground rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-foreground rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-primary-foreground/80 font-semibold text-sm uppercase tracking-wider mb-2">
            FINAL CALL TO ACTION
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Achieve Your Dream IELTS Band - Smarter, Faster, Anywhere
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
            Every dream starts with a score. Whether you're studying abroad, migrating, or growing your career, IELTS AI helps you make it happen.
          </p>
          <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg px-10 py-6 h-auto font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            Take a Free IELTS Mock Test Now
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </div>
      </div>
    </section>
  );
};
