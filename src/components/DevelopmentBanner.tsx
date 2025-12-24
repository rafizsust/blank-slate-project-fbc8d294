import { Construction, X } from 'lucide-react';
import { useState } from 'react';

export const DevelopmentBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2.5 text-center text-sm font-medium relative">
      <div className="flex items-center justify-center gap-2">
        <Construction size={16} />
        <span>🚧 Site under construction — Only a few features are available and no real data yet. Stay tuned!</span>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
        aria-label="Dismiss banner"
      >
        <X size={16} />
      </button>
    </div>
  );
};
