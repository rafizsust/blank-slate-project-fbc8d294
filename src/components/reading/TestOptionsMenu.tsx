import { useState } from 'react';
import { Menu, X, ChevronRight, ChevronLeft, Contrast, ZoomIn, Send, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type ContrastMode = 'black-on-white' | 'white-on-black' | 'yellow-on-black';
export type TextSizeMode = 'regular' | 'large' | 'extra-large';

interface TestOptionsMenuProps {
  contrastMode: ContrastMode;
  setContrastMode: (mode: ContrastMode) => void;
  textSizeMode: TextSizeMode;
  setTextSizeMode: (mode: TextSizeMode) => void;
  onSubmit?: () => void;
  onOpenNotes?: () => void;
}

type MenuView = 'main' | 'contrast' | 'text-size';

export function TestOptionsMenu({
  contrastMode,
  setContrastMode,
  textSizeMode,
  setTextSizeMode,
  onSubmit,
}: TestOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<MenuView>('main');

  const handleClose = () => {
    setIsOpen(false);
    setCurrentView('main');
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setCurrentView('main');
    }
  };

  const contrastOptions: { value: ContrastMode; label: string }[] = [
    { value: 'black-on-white', label: 'Black on white' },
    { value: 'white-on-black', label: 'White on black' },
    { value: 'yellow-on-black', label: 'Yellow on black' },
  ];

  const textSizeOptions: { value: TextSizeMode; label: string }[] = [
    { value: 'regular', label: 'Regular' },
    { value: 'large', label: 'Large' },
    { value: 'extra-large', label: 'Extra large' },
  ];

  // Get text size class based on current text size mode
  const getTextSizeClass = () => {
    switch (textSizeMode) {
      case 'large':
        return 'text-lg';
      case 'extra-large':
        return 'text-xl';
      default:
        return 'text-base';
    }
  };

  const getHeaderTextSizeClass = () => {
    switch (textSizeMode) {
      case 'large':
        return 'text-2xl';
      case 'extra-large':
        return 'text-3xl';
      default:
        return 'text-xl';
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-9 w-9 ielts-hamburger-btn"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={24} />
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent 
          fullscreen 
          hideDefaultClose
          className="bg-[#5a5a5a]"
        >
          <DialogTitle className="sr-only">
            {currentView === 'main' && 'Options'}
            {currentView === 'contrast' && 'Contrast'}
            {currentView === 'text-size' && 'Text size'}
          </DialogTitle>
          
          {/* Header - IELTS Official Style */}
          <div className="relative px-6 py-4 shrink-0">
            {/* Back to Options button on left */}
            {currentView !== 'main' && (
              <button 
                onClick={() => setCurrentView('main')}
                className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 hover:opacity-80 transition-opacity font-medium text-white",
                  getTextSizeClass()
                )}
              >
                <ChevronLeft size={20} />
                <span>Options</span>
              </button>
            )}

            {/* Centered title */}
            <h2 className={cn("font-medium text-center text-white", getHeaderTextSizeClass())}>
              {currentView === 'main' && 'Options'}
              {currentView === 'contrast' && 'Contrast'}
              {currentView === 'text-size' && 'Text size'}
            </h2>

            {/* Close button on right - X icon */}
            <button 
              onClick={handleClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:opacity-80 transition-opacity text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-lg mx-auto">
              {currentView === 'main' && (
                <div className="space-y-3">
                  {/* Submit Button - Primary Action (Dark Red like official) */}
                  {onSubmit && (
                    <button
                      onClick={() => {
                        handleClose();
                        onSubmit();
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-5 py-4 rounded-sm transition-colors font-normal bg-[#7a2828] text-white hover:bg-[#8a3838]",
                        getTextSizeClass()
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Send size={18} />
                        <span>Go to submission page</span>
                      </div>
                      <ChevronRight size={18} />
                    </button>
                  )}

                  {/* Options Container - White background like official */}
                  <div className="bg-white rounded-sm overflow-hidden">
                    {/* Contrast Option */}
                    <button
                      onClick={() => setCurrentView('contrast')}
                      className={cn(
                        "w-full flex items-center justify-between px-5 py-4 hover:bg-gray-100 transition-colors border-b border-gray-200 text-gray-800",
                        getTextSizeClass()
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Contrast size={18} className="opacity-60" />
                        <span>Contrast</span>
                      </div>
                      <ChevronRight size={18} className="opacity-60" />
                    </button>

                    {/* Text Size Option */}
                    <button
                      onClick={() => setCurrentView('text-size')}
                      className={cn(
                        "w-full flex items-center justify-between px-5 py-4 hover:bg-gray-100 transition-colors text-gray-800",
                        getTextSizeClass()
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <ZoomIn size={18} className="opacity-60" />
                        <span>Text size</span>
                      </div>
                      <ChevronRight size={18} className="opacity-60" />
                    </button>
                  </div>
                </div>
              )}

              {currentView === 'contrast' && (
                <div className="bg-white rounded-sm overflow-hidden">
                  {contrastOptions.map((option, index) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setContrastMode(option.value);
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-100 transition-colors text-left text-gray-800",
                        getTextSizeClass(),
                        index < contrastOptions.length - 1 ? 'border-b border-gray-200' : ''
                      )}
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        {contrastMode === option.value && (
                          <Check size={20} className="text-gray-800" />
                        )}
                      </div>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {currentView === 'text-size' && (
                <div className="bg-white rounded-sm overflow-hidden">
                  {textSizeOptions.map((option, index) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTextSizeMode(option.value);
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-100 transition-colors text-left text-gray-800",
                        getTextSizeClass(),
                        index < textSizeOptions.length - 1 ? 'border-b border-gray-200' : ''
                      )}
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        {textSizeMode === option.value && (
                          <Check size={20} className="text-gray-800" />
                        )}
                      </div>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}