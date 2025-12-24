import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ScrollProgressIndicatorProps {
  containerRef?: React.RefObject<HTMLElement>;
  className?: string;
}

export function ScrollProgressIndicator({ 
  containerRef, 
  className 
}: ScrollProgressIndicatorProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = useCallback(() => {
    const container = containerRef?.current || document.documentElement;
    
    let scrollTop: number;
    let scrollHeight: number;
    let clientHeight: number;

    if (containerRef?.current) {
      scrollTop = container.scrollTop;
      scrollHeight = container.scrollHeight;
      clientHeight = container.clientHeight;
    } else {
      scrollTop = window.scrollY || document.documentElement.scrollTop;
      scrollHeight = document.documentElement.scrollHeight;
      clientHeight = window.innerHeight;
    }

    const maxScroll = scrollHeight - clientHeight;
    const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
    
    setScrollProgress(Math.min(100, Math.max(0, progress)));
    setIsVisible(maxScroll > 50);
  }, [containerRef]);

  useEffect(() => {
    const target = containerRef?.current || window;
    
    handleScroll();
    target.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      target.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll, containerRef]);

  if (!isVisible) return null;

  // Calculate ball size based on scroll progress (grows as you scroll)
  const ballSize = 12 + (scrollProgress / 100) * 8; // From 12px to 20px
  const trackHeight = 180 + (scrollProgress / 100) * 40; // From 180px to 220px

  return (
    <div 
      className={cn(
        "fixed right-6 top-1/2 -translate-y-1/2 z-50",
        "flex flex-col items-center",
        className
      )}
    >
      {/* Track container */}
      <div 
        className="relative bg-border/20 rounded-full overflow-visible transition-all duration-300 ease-out"
        style={{ 
          width: '4px',
          height: `${trackHeight}px`
        }}
      >
        {/* Progress fill - the "string" that extends */}
        <div 
          className="absolute top-0 left-0 w-full rounded-full transition-all duration-150 ease-out"
          style={{ 
            height: `${scrollProgress}%`,
            background: 'linear-gradient(180deg, hsl(var(--primary)), hsl(var(--accent)))'
          }}
        />
        
        {/* Ball indicator - grows as you scroll */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 transition-all duration-150 ease-out"
          style={{ 
            top: `calc(${scrollProgress}% - ${ballSize / 2}px)`,
            width: `${ballSize}px`,
            height: `${ballSize}px`,
          }}
        >
          {/* Outer glow */}
          <div 
            className="absolute inset-0 rounded-full transition-all duration-150"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.3), transparent)',
              transform: `scale(${1.5 + (scrollProgress / 100) * 0.5})`,
            }}
          />
          {/* Main ball */}
          <div 
            className="absolute inset-0 rounded-full bg-background border-2 border-primary shadow-lg transition-all duration-150"
            style={{
              boxShadow: `0 0 ${10 + (scrollProgress / 100) * 10}px hsl(var(--primary) / 0.4)`
            }}
          >
            {/* Inner dot */}
            <div 
              className="absolute rounded-full bg-gradient-to-br from-primary to-accent transition-all duration-150"
              style={{
                inset: '3px',
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Percentage label */}
      <div 
        className="mt-4 px-2 py-1 rounded-full bg-background/80 border border-border/50 backdrop-blur-sm transition-all duration-150"
        style={{
          transform: `scale(${0.9 + (scrollProgress / 100) * 0.2})`
        }}
      >
        <span className="text-xs font-semibold tabular-nums text-foreground">
          {Math.round(scrollProgress)}%
        </span>
      </div>
    </div>
  );
}