import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Maximize, Minimize, ZoomIn, ZoomOut, Pause, Play, 
  AlertTriangle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SpeakingTestControlsProps {
  fontSize: number;
  setFontSize: (size: number) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  isPaused: boolean;
  togglePause: () => void;
}

export function SpeakingTestControls({
  fontSize,
  setFontSize,
  isFullscreen,
  toggleFullscreen,
  isPaused,
  togglePause,
}: SpeakingTestControlsProps) {
  const [showPauseWarning, setShowPauseWarning] = useState(false);

  const handlePauseClick = () => {
    if (!isPaused) {
      setShowPauseWarning(true);
    } else {
      togglePause();
    }
  };

  const confirmPause = () => {
    setShowPauseWarning(false);
    togglePause();
  };

  const increaseFontSize = () => {
    if (fontSize < 24) setFontSize(fontSize + 2);
  };

  const decreaseFontSize = () => {
    if (fontSize > 12) setFontSize(fontSize - 2);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Font Size Controls */}
        <div className="flex items-center border border-border rounded-md">
          <Button 
            variant="ghost" 
            size="sm" 
            className="px-2 h-8"
            onClick={decreaseFontSize}
            disabled={fontSize <= 12}
          >
            <ZoomOut size={16} />
          </Button>
          <span className="text-xs px-2 border-x border-border">{fontSize}px</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="px-2 h-8"
            onClick={increaseFontSize}
            disabled={fontSize >= 24}
          >
            <ZoomIn size={16} />
          </Button>
        </div>

        {/* Pause Button */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={handlePauseClick}
          className={isPaused ? "bg-amber-500/10 border-amber-500 text-amber-600" : ""}
        >
          {isPaused ? <Play size={16} /> : <Pause size={16} />}
        </Button>

        {/* Fullscreen Toggle */}
        <Button variant="outline" size="sm" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
        </Button>
      </div>

      {/* Pause Warning Dialog */}
      <Dialog open={showPauseWarning} onOpenChange={setShowPauseWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle size={20} />
              Practice Mode Warning
            </DialogTitle>
            <DialogDescription className="pt-4">
              <div className="space-y-3">
                <p>
                  You are about to <strong>pause the timer</strong>. This feature is only 
                  available in practice mode.
                </p>
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                    ⚠️ In the real IELTS exam, you will NOT be able to pause the test!
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use this feature wisely for learning purposes only.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowPauseWarning(false)}>
              Cancel
            </Button>
            <Button onClick={confirmPause} className="bg-amber-500 hover:bg-amber-600">
              Pause Anyway
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}