import { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Clock, Save } from 'lucide-react';

interface PartTimestamp {
  partNumber: number;
  startTime: number; // in seconds
  endTime: number; // in seconds
}

interface AudioTimestampEditorProps {
  audioUrl: string | null;
  partTimestamps: PartTimestamp[];
  onTimestampsChange: (timestamps: PartTimestamp[]) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const parseTime = (timeStr: string): number => {
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return 0;
};

export function AudioTimestampEditor({
  audioUrl,
  partTimestamps,
  onTimestampsChange,
}: AudioTimestampEditorProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Initialize with 4 parts if empty
  const timestamps = partTimestamps.length > 0 ? partTimestamps : [
    { partNumber: 1, startTime: 0, endTime: 600 },
    { partNumber: 2, startTime: 600, endTime: 1200 },
    { partNumber: 3, startTime: 1200, endTime: 1800 },
    { partNumber: 4, startTime: 1800, endTime: 2400 },
  ];

  useEffect(() => {
    if (partTimestamps.length === 0) {
      onTimestampsChange(timestamps);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const updatePartTimestamp = (partNumber: number, field: 'startTime' | 'endTime', value: number) => {
    const newTimestamps = timestamps.map(t => 
      t.partNumber === partNumber ? { ...t, [field]: value } : t
    );
    onTimestampsChange(newTimestamps);
  };

  const setCurrentAsStart = (partNumber: number) => {
    updatePartTimestamp(partNumber, 'startTime', Math.floor(currentTime));
  };

  const setCurrentAsEnd = (partNumber: number) => {
    updatePartTimestamp(partNumber, 'endTime', Math.floor(currentTime));
  };

  if (!audioUrl) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="py-8 text-center text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Upload an audio file first to configure part timestamps</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Audio Player with Timestamp Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock size={16} />
            Audio Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <audio ref={audioRef} src={audioUrl} className="hidden" />
          
          {/* Playback Controls */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </Button>
            
            <div className="flex-1">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            
            <div className="text-sm font-mono text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Part Timestamp Markers - Visual */}
          <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
            {timestamps.map((part, idx) => {
              const startPercent = duration > 0 ? (part.startTime / duration) * 100 : 0;
              const widthPercent = duration > 0 ? ((part.endTime - part.startTime) / duration) * 100 : 25;
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
              
              return (
                <div
                  key={idx}
                  className={`absolute top-0 h-full ${colors[idx]} opacity-60 flex items-center justify-center text-white text-xs font-bold`}
                  style={{ left: `${startPercent}%`, width: `${widthPercent}%` }}
                  title={`Part ${part.partNumber}: ${formatTime(part.startTime)} - ${formatTime(part.endTime)}`}
                >
                  P{part.partNumber}
                </div>
              );
            })}
            {/* Current position indicator */}
            <div 
              className="absolute top-0 w-0.5 h-full bg-destructive z-10"
              style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Part Timestamp Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {timestamps.map((part) => (
          <Card key={part.partNumber} className="border-l-4" style={{ borderLeftColor: ['#3b82f6', '#22c55e', '#eab308', '#a855f7'][part.partNumber - 1] }}>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Part {part.partNumber} (Q{(part.partNumber - 1) * 10 + 1}-{part.partNumber * 10})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Start Time</Label>
                  <div className="flex gap-1">
                    <Input
                      value={formatTime(part.startTime)}
                      onChange={(e) => updatePartTimestamp(part.partNumber, 'startTime', parseTime(e.target.value))}
                      className="text-xs h-8"
                      placeholder="00:00"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => setCurrentAsStart(part.partNumber)}
                      title="Set current time as start"
                    >
                      <Save size={12} />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">End Time</Label>
                  <div className="flex gap-1">
                    <Input
                      value={formatTime(part.endTime)}
                      onChange={(e) => updatePartTimestamp(part.partNumber, 'endTime', parseTime(e.target.value))}
                      className="text-xs h-8"
                      placeholder="00:00"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => setCurrentAsEnd(part.partNumber)}
                      title="Set current time as end"
                    >
                      <Save size={12} />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Quick seek buttons */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs flex-1"
                  onClick={() => seekTo(part.startTime)}
                >
                  Go to Start
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs flex-1"
                  onClick={() => seekTo(part.endTime)}
                >
                  Go to End
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        💡 Tip: Play the audio and click the save icon when you hear each part start/end to set timestamps precisely.
      </p>
    </div>
  );
}
