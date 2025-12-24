import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Is IELTS AI for Academic or General Training?',
    answer: 'Both! Choose your version when you start your test.',
  },
  {
    question: 'How accurate is your band prediction?',
    answer: 'Our algorithm is built using thousands of official IELTS scoring patterns and reviewed by real IELTS teachers.',
  },
  {
    question: 'Can I prepare from anywhere?',
    answer: 'Yes, IELTS AI works worldwide. All you need is an internet connection.',
  },
  {
    question: 'What makes IELTS AI better than others?',
    answer: 'We combine AI feedback, expert input, and real-exam simulation, something no free platform does together.',
  },
];

export const FAQ = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">
            FAQ
          </p>
          <h2 className="section-title text-foreground">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 overflow-hidden"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
