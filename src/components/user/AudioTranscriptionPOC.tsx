import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, Loader2, Play, Pause, FileAudio, Clock, ListOrdered, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TranscriptSegment {
  text: string;
  start_time: number;
  end_time: number;
}

interface QuestionGroup {
  start_question: number;
  end_question: number;
  start_time: number;
  end_time: number;
  description: string;
}

interface PartInfo {
  part_number: number;
  start_time: number;
  end_time: number;
  question_groups: QuestionGroup[];
}

interface TranscriptionResult {
  full_transcript: string;
  segments: TranscriptSegment[];
  parts: PartInfo[];
  total_duration: number;
}

const MAX_FILE_SIZE_MB = 50; // Storage supports larger files than edge function body

export function AudioTranscriptionPOC() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState<'idle' | 'uploading' | 'transcribing'>('idle');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast.error('Please select an audio file');
        return;
      }
      const fileSizeMB = file.size / 1024 / 1024;
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        toast.error(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB. Your file is ${fileSizeMB.toFixed(1)}MB.`);
        return;
      }
      setAudioFile(file);
      setAudioUrl('');
      const url = URL.createObjectURL(file);
      setAudioSrc(url);
    }
  };

  const handleUrlChange = (url: string) => {
    setAudioUrl(url);
    setAudioFile(null);
    if (url) {
      setAudioSrc(url);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const processAudio = async () => {
    if (!audioFile && !audioUrl) {
      toast.error('Please provide an audio file or URL');
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setUploadProgress(0);

    try {
      let transcriptionUrl = audioUrl;

      // If user selected a file, upload to Storage first
      if (audioFile) {
        setProcessingStep('uploading');
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('You must be logged in to transcribe audio.');
        }

        const fileExt = audioFile.name.split('.').pop() || 'mp3';
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('listening-audio')
          .upload(filePath, audioFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        setUploadProgress(100);

        // Get signed URL (bucket is private) for transcription
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('listening-audio')
          .createSignedUrl(filePath, 60 * 30); // 30 min expiry

        if (signedUrlError || !signedUrlData?.signedUrl) {
          throw new Error('Failed to create signed URL for audio file.');
        }

        transcriptionUrl = signedUrlData.signedUrl;
      }

      setProcessingStep('transcribing');

      // Call edge function with URL (avoids body size limit)
      const formData = new FormData();
      formData.append('audioUrl', transcriptionUrl);

      const { data, error } = await supabase.functions.invoke('transcribe-listening-audio', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      toast.success('Audio transcribed successfully!');
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to transcribe audio');
    } finally {
      setIsProcessing(false);
      setProcessingStep('idle');
      setUploadProgress(0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const clearResults = () => {
    setResult(null);
    setAudioFile(null);
    setAudioUrl('');
    setAudioSrc(null);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const isSegmentActive = (segment: TranscriptSegment) => {
    return currentTime >= segment.start_time && currentTime < segment.end_time;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileAudio size={20} className="text-primary" />
          Audio Transcription POC
          <Badge variant="secondary" className="ml-2">Experimental</Badge>
        </CardTitle>
        <CardDescription>
          Test Gemini-powered audio transcription for IELTS listening tests. 
          Upload audio to get sentence-level timestamps, part boundaries, and question groups.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Audio Input */}
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="url">Audio URL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="audio-file">Audio File (max {MAX_FILE_SIZE_MB}MB)</Label>
              <Input
                id="audio-file"
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
              {audioFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="audio-url">Audio URL</Label>
              <Input
                id="audio-url"
                type="url"
                placeholder="https://example.com/audio.mp3"
                value={audioUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {processingStep === 'uploading' && 'Uploading to storage...'}
              {processingStep === 'transcribing' && 'Transcribing with Gemini (this may take a few minutes)...'}
            </div>
            {processingStep === 'uploading' && (
              <Progress value={uploadProgress} className="w-full" />
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={processAudio} 
            disabled={isProcessing || (!audioFile && !audioUrl)}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload size={16} />
                Transcribe Audio
              </>
            )}
          </Button>
          
          {result && (
            <Button variant="outline" onClick={clearResults} className="gap-2">
              <Trash2 size={16} />
              Clear Results
            </Button>
          )}
        </div>

        {/* Audio Player */}
        {audioSrc && (
          <div className="space-y-2">
            <audio 
              ref={audioRef}
              src={audioSrc}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <Button 
                size="icon" 
                variant="outline" 
                onClick={togglePlayPause}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={14} className="text-muted-foreground" />
                  <span className="font-mono">{formatTime(currentTime)}</span>
                  {result && (
                    <span className="text-muted-foreground">/ {formatTime(result.total_duration)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-6">
            <Separator />
            
            {/* Parts Overview */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <ListOrdered size={18} />
                Parts & Question Groups
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {result.parts.map((part) => (
                  <Card key={part.part_number} className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>Part {part.part_number}</span>
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer hover:bg-primary/10"
                          onClick={() => seekTo(part.start_time)}
                        >
                          {formatTime(part.start_time)} - {formatTime(part.end_time)}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {part.question_groups.map((group, idx) => (
                        <div 
                          key={idx} 
                          className="p-2 bg-background rounded border text-sm cursor-pointer hover:border-primary transition-colors"
                          onClick={() => seekTo(group.start_time)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              Q{group.start_question} - Q{group.end_question}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {formatTime(group.start_time)} - {formatTime(group.end_time)}
                            </span>
                          </div>
                          {group.description && (
                            <p className="text-muted-foreground text-xs mt-1">{group.description}</p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Transcript with Highlighting */}
            <div className="space-y-4">
              <h3 className="font-semibold">Transcript (Click to seek)</h3>
              <ScrollArea className="h-[400px] border rounded-lg p-4">
                <div className="space-y-1">
                  {result.segments.map((segment, idx) => (
                    <span
                      key={idx}
                      className={`inline cursor-pointer px-1 py-0.5 rounded transition-colors ${
                        isSegmentActive(segment) 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => seekTo(segment.start_time)}
                    >
                      {segment.text}{' '}
                    </span>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Raw JSON Output */}
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                View Raw JSON Response
              </summary>
              <pre className="mt-2 p-4 bg-muted rounded-lg overflow-auto text-xs max-h-[300px]">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
