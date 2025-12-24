import { ArrowRight, Brain, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import heroBg from '@/assets/hero-bg.jpg';

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section 
      className="relative min-h-[650px] lg:min-h-[750px] flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* AI-themed overlay */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Neural grid effect */}
      <div className="absolute inset-0 neural-grid opacity-10" />
      
      {/* Floating AI orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 blur-3xl animate-float-orb" />
      <div className="absolute bottom-32 right-20 w-40 h-40 rounded-full bg-gradient-to-br from-accent/30 to-primary/20 blur-3xl animate-float-orb-delayed" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-primary/20 blur-2xl animate-pulse" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        {/* AI Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 animate-fade-in">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">AI-Powered IELTS Preparation</span>
          <Sparkles className="w-4 h-4 text-accent" />
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 max-w-5xl mx-auto leading-tight animate-fade-in animation-delay-200">
          Master IELTS with{' '}
          <span className="gradient-text-static">Artificial Intelligence</span>
        </h1>

        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-white/80 animate-fade-in animation-delay-400">
          Experience the future of IELTS preparation with <span className="text-primary font-semibold">IELTS AI</span>. 
          Get instant AI feedback, personalized analytics, and smart practice recommendations 
          to achieve your target band score faster.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 animate-fade-in animation-delay-600">
          <Button 
            onClick={() => navigate('/reading/cambridge-ielts-a')}
            className="btn-ai text-lg px-10 py-6 h-auto group"
          >
            <Zap className="mr-2 w-5 h-5 group-hover:animate-pulse" />
            Start Free Practice
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            onClick={() => navigate('/analytics/demo')}
            variant="outline" 
            className="text-lg px-8 py-6 h-auto border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
          >
            View Analytics
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in animation-delay-600">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold gradient-text-static">500K+</p>
            <p className="text-white/60 text-sm mt-1">Active Learners</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold gradient-text-static">95%</p>
            <p className="text-white/60 text-sm mt-1">Success Rate</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold gradient-text-static">AI</p>
            <p className="text-white/60 text-sm mt-1">Powered Analysis</p>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};