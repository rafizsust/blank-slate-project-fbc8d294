import { Play, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioPlayOverlayProps {
  onPlay: () => void;
  isVisible: boolean;
}

export function AudioPlayOverlay({ onPlay, isVisible }: AudioPlayOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-4 text-center">
        {/* Headphones Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Headphones size={80} strokeWidth={1.5} className="text-foreground" />
            {/* Play triangle inside headphones */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-0 h-0 ml-1 mt-2"
                style={{
                  borderLeft: '12px solid currentColor',
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                }}
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-foreground text-sm leading-relaxed mb-2">
          You will be listening to an audio clip during this test. You will not be permitted to pause or rewind the audio while answering the questions.
        </p>
        <p className="text-foreground text-sm mb-6">
          To continue, click Play.
        </p>

        {/* Play Button */}
        <Button 
          onClick={onPlay}
          className="bg-white hover:bg-gray-100 text-foreground border border-gray-300 rounded px-6 py-2 font-medium shadow-sm flex items-center gap-2 mx-auto"
          variant="outline"
        >
          <Play size={18} className="fill-current" />
          Play
        </Button>
      </div>
    </div>
  );
}
