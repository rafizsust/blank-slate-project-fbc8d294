import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "IELTS AI gave me the confidence I needed. The AI writing and speaking feedback was a game-changer — I scored Band 8!",
    author: 'Bodhijit Chakma',
    location: 'Australia',
  },
  {
    quote: "The platform feels exactly like the real exam. Tips from the analytics sections helped me jump from Band 6.5 to 7.5.",
    author: 'Faisal Ahmed Shuvo',
    location: 'Bangladesh',
  },
  {
    quote: "Automatically importing unfamiliar words and phrases from passages into flashcards, with AI-powered auto translations, and practicing them on the same site is extremely convenient and has greatly helped me expand my vocabulary.",
    author: 'Maruf Ahmed',
    location: 'USA',
  },
];

export const Testimonials = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">
            Success Stories
          </p>
          <h2 className="section-title text-white">
            From Band 6.0 to 8.0 — Real Results from Real People
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 relative animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <Quote size={40} className="text-primary/30 absolute top-6 left-6" />
              <p className="text-slate-200 text-lg mb-6 pt-8 relative z-10 leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {testimonial.author}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};