import { Mail, MessageCircle, Brain, Sparkles, Github, Twitter } from 'lucide-react';

const footerLinks = {
  'IELTS Resources': [
    { label: 'Reading Practice', href: '/reading/cambridge-ielts-a' },
    { label: 'Listening Practice', href: '/listening/cambridge-ielts-a' },
    { label: 'Writing Practice', href: '/writing/cambridge-ielts-a' },
    { label: 'Speaking Practice', href: '/speaking/cambridge-ielts-a' },
  ],
  'Company': [
    { label: 'About Us', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-ai-blue-deep text-white py-16 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 neural-grid opacity-5" />
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl">
                IELTS<span className="text-primary"> AI</span>
              </span>
            </a>
            <p className="text-white/60 text-sm mb-4">
              AI-powered IELTS preparation trusted by learners in 120+ countries. 
              Smart analytics, instant feedback, and personalized learning paths.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary/50 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary/50 transition-colors">
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                {title}
                <Sparkles size={14} className="text-primary" />
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-white/60 hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">
              Get in Touch
            </h4>
            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center gap-3 text-white/60 hover:text-primary transition-colors text-sm"
              >
                <MessageCircle size={18} />
                Live Chat Support
              </a>
              <a
                href="mailto:support@ieltsai.net"
                className="flex items-center gap-3 text-white/60 hover:text-primary transition-colors text-sm"
              >
                <Mail size={18} />
                support@ieltsai.net
              </a>
            </div>
            
            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-sm text-white/60 mb-2">Stay updated with IELTS tips</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm placeholder:text-white/40 focus:outline-none focus:border-primary"
                />
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} IELTS AI. All rights reserved.
          </p>
          <p className="text-white/40 text-sm flex items-center gap-2">
            Powered by <Brain size={14} className="text-primary" /> Artificial Intelligence
          </p>
        </div>
      </div>
    </footer>
  );
};