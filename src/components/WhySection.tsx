import { BookOpen, Brain, PenTool, Mic, Globe, Award } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Authentic IELTS Practice Tests',
    description: 'Simulate the real IELTS exam experience with accurate question formats, listening audios, and reading passages.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Band Score Prediction',
    description: "Get instant feedback on your performance in Listening, Reading, Writing & Speaking, powered by real IELTS scoring standards.",
  },
  {
    icon: PenTool,
    title: 'Expert Writing Evaluations & Model Answers',
    description: 'Learn from Band 9 writing samples, grammar insights, and examiner-style corrections that help you write with confidence.',
  },
  {
    icon: Mic,
    title: 'Speaking Practice with AI & Community Feedback',
    description: 'Practice speaking topics, record your voice, and get instant pronunciation and fluency feedback.',
  },
  {
    icon: Globe,
    title: 'Global Access & Multilingual Support',
    description: 'No matter where you live, Bangladesh, Vietnam, India, UAE, UK, Canada, Philippines, or Africa, IELTS AI works 24/7 in your browser.',
  },
  {
    icon: Award,
    title: 'Backed by Educators & Real Test Takers',
    description: 'Created by certified IELTS trainers and improved by thousands of test-takers who achieved their target scores.',
  },
];

export const WhySection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">
            WHY IELTS AI
          </p>
          <h2 className="section-title text-foreground">
            Everything You Need to Achieve Your Target Band Score
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="card-hover bg-card rounded-2xl p-8 border border-border animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="feature-icon mb-6">
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
