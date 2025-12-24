import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Brain, Home, Sparkles, AlertTriangle, ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const sarcasticMessages = [
    "Looks like our AI is smarter than you thought... it can't find what doesn't exist!",
    "Even artificial intelligence has its limits. This page is one of them.",
    "Error 404: Page not found. But hey, at least your IELTS score isn't lost!",
    "Our neural networks searched everywhere. Nope, nothing here.",
    "The page you're looking for has achieved Band 0. It doesn't exist.",
  ];

  const randomMessage = sarcasticMessages[Math.floor(Math.random() * sarcasticMessages.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center relative overflow-hidden">
      {/* Neural grid background */}
      <div className="absolute inset-0 neural-grid opacity-5" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-destructive/20 to-primary/10 blur-3xl animate-float-orb" />
      <div className="absolute bottom-32 right-20 w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 blur-3xl animate-float-orb-delayed" />
      
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        {/* Glitchy 404 */}
        <div className="relative mb-8">
          <h1 className="text-[150px] md:text-[200px] font-bold leading-none gradient-text-static opacity-20">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-destructive/80 to-primary flex items-center justify-center ai-glow">
                <AlertTriangle className="w-16 h-16 text-white animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Brain className="w-8 h-8 text-primary animate-bounce" />
              </div>
            </div>
          </div>
        </div>

        {/* Sarcastic message */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            {randomMessage}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <Zap className="w-4 h-4" />
            <span className="font-mono">{location.pathname}</span>
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            className="gap-2 min-w-[160px]"
          >
            <ArrowLeft size={18} />
            Go Back
          </Button>
          <Link to="/">
            <Button className="btn-ai gap-2 min-w-[160px]">
              <Home size={18} />
              Return Home
            </Button>
          </Link>
        </div>

        {/* Fun suggestions */}
        <div className="mt-12 p-6 rounded-2xl bg-muted/50 border border-border/50">
          <p className="text-sm text-muted-foreground mb-4">
            While you're here, why not try something that actually exists?
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/reading/cambridge-ielts-a">
              <Button variant="ghost" size="sm">Reading Practice</Button>
            </Link>
            <Link to="/listening/cambridge-ielts-a">
              <Button variant="ghost" size="sm">Listening Practice</Button>
            </Link>
            <Link to="/writing/cambridge-ielts-a">
              <Button variant="ghost" size="sm">Writing Practice</Button>
            </Link>
            <Link to="/speaking/cambridge-ielts-a">
              <Button variant="ghost" size="sm">Speaking Practice</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
