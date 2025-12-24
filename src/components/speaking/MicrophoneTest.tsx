import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Play, Pause, StopCircle, Loader2, CheckCircle2, XCircle, Volume2, VolumeX, SkipForward } from 'lucide-react'; // Added SkipForward icon
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

interface MicrophoneTestProps {
  onTestComplete: () => void;
  onSkipTest: () => void; // New prop for skipping the test
}

export function MicrophoneTest({ onTestComplete, onSkipTest }: MicrophoneTestProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const recordedAudioUrl = useRef<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const [loading, setLoading] = useState(false);
  const [testPassed, setTestPassed] = useState<boolean | null>(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const startRecording = useCallback(async () => {
    setLoading(true);
    setTestPassed(null);
    recordedAudioUrl.current = null;
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      audioChunks.current = [];
      recorder.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        recordedAudioUrl.current = url;
        setTestPassed(true); // Assume test passed if recording successful
        stream.getTracks().forEach(track => track.stop());
        setLoading(false);
        // toast.success('Recording complete. You can now play it back.'); // Removed redundant toast
      };

      recorder.start();
      setIsRecording(true);
      setMediaRecorder(recorder);
      setLoading(false);
      // toast.info('Recording started. Speak into your microphone.'); // Removed redundant toast
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setLoading(false);
      setTestPassed(false);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  }, [mediaRecorder]);

  const playRecording = useCallback(() => {
    if (recordedAudioUrl.current && audioPlayerRef.current) {
      audioPlayerRef.current.src = recordedAudioUrl.current;
      audioPlayerRef.current.play().catch(e => console.error("Error playing audio:", e));
      setIsPlaying(true);
    } else {
      toast.error('No recording available to play.');
    }
  }, []);

  // Note: stopPlaying is kept for potential future use
  // @ts-expect-error - kept for potential future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const stopPlaying = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const handleAudioPlayerTimeUpdate = useCallback(() => {
    if (audioPlayerRef.current) {
      setCurrentTime(audioPlayerRef.current.currentTime);
      setDuration(audioPlayerRef.current.duration);
    }
  }, []);

  const handleAudioPlayerEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0] / 100;
    if (audioPlayerRef.current) {
      audioPlayerRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.muted = !audioPlayerRef.current.muted;
      setIsMuted(audioPlayerRef.current.muted);
    }
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-card border border-border rounded-lg shadow-lg space-y-6 text-center">
      <h2 className="text-2xl font-bold text-foreground">Microphone Test</h2>
      <p className="text-muted-foreground">
        Click "Record" to test your microphone. Speak a few words, then click "Stop" and "Play" to listen.
      </p>

      <div className="flex justify-center gap-4">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={loading || isPlaying}
          className={cn(
            "h-12 w-28",
            isRecording ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
          )}
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : isRecording ? <StopCircle size={20} className="mr-2" /> : <Mic size={20} className="mr-2" />}
          {loading ? 'Loading...' : isRecording ? 'Stop' : 'Record'}
        </Button>
        <Button
          onClick={playRecording}
          disabled={!recordedAudioUrl.current || isRecording || isPlaying}
          className="h-12 w-28"
          variant="outline"
        >
          {isPlaying ? <Pause size={20} className="mr-2" /> : <Play size={20} className="mr-2" />}
          {isPlaying ? 'Playing...' : 'Play'}
        </Button>
      </div>

      {recordedAudioUrl.current && (
        <div className="space-y-3 mt-4">
          <audio
            ref={audioPlayerRef}
            onTimeUpdate={handleAudioPlayerTimeUpdate}
            onEnded={handleAudioPlayerEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            preload="auto"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
              disabled={isRecording || !recordedAudioUrl.current}
            />
            <span className="text-sm text-muted-foreground w-10 text-left">
              {formatTime(duration)}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleMute} className="h-8 w-8">
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-24"
              disabled={isRecording || !recordedAudioUrl.current}
            />
          </div>
        </div>
      )}

      {testPassed === true && (
        <p className="text-success flex items-center justify-center gap-2 mt-4">
          <CheckCircle2 size={20} /> Microphone test successful!
        </p>
      )}
      {testPassed === false && (
        <p className="text-destructive flex items-center justify-center gap-2 mt-4">
          <XCircle size={20} /> Microphone test failed. Please try again.
        </p>
      )}

      <div className="flex flex-col gap-3 mt-6">
        <Button
          onClick={onTestComplete}
          disabled={testPassed !== true}
          className="w-full"
        >
          Start Speaking Test
        </Button>
        <Button
          onClick={onSkipTest} // New button to skip test
          variant="outline"
          className="w-full"
        >
          <SkipForward size={16} className="mr-2" />
          Skip Microphone Test
        </Button>
      </div>
    </div>
  );
}