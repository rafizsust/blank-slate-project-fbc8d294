import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Play, Volume2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

export default function GenerateListeningPOC() {
  const [topic, setTopic] = useState("university library registration");
  const [scenarioType, setScenarioType] = useState("conversation");
  const [isLoading, setIsLoading] = useState(false);
  const [dialogue, setDialogue] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Convert PCM to WAV for browser playback
  const pcmToWav = (pcmData: Uint8Array, sampleRate: number = 24000): Blob => {
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = pcmData.length;
    const bufferSize = 44 + dataSize;
    
    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);
    
    // Copy PCM data
    const wavData = new Uint8Array(buffer);
    wavData.set(pcmData, 44);
    
    return new Blob([buffer], { type: 'audio/wav' });
  };

  const handleGenerate = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to generate audio",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setDialogue("");
    setAudioUrl(null);

    try {
      console.log("Calling generate-listening-audio with:", { topic, scenarioType });
      
      const { data, error: fnError } = await supabase.functions.invoke('generate-listening-audio', {
        body: { topic, scenarioType }
      });

      if (fnError) {
        throw fnError;
      }

      console.log("Response:", data);

      if (data.error) {
        setError(data.error);
        toast({
          title: "Generation issue",
          description: data.error,
          variant: "destructive"
        });
      }

      if (data.dialogue) {
        setDialogue(data.dialogue);
      }

      if (data.audioBase64) {
        // Convert base64 PCM to WAV blob
        const pcmBytes = Uint8Array.from(atob(data.audioBase64), c => c.charCodeAt(0));
        const wavBlob = pcmToWav(pcmBytes, data.sampleRate || 24000);
        const url = URL.createObjectURL(wavBlob);
        setAudioUrl(url);
        
        toast({
          title: "Success!",
          description: "Dialogue and audio generated successfully",
        });
      } else if (data.dialogue) {
        toast({
          title: "Dialogue Generated",
          description: "Audio generation was not available, but dialogue was created",
        });
      }

    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Failed to generate");
      toast({
        title: "Error",
        description: err.message || "Failed to generate listening content",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-6 w-6" />
            Gemini TTS Proof of Concept
          </CardTitle>
          <CardDescription>
            Generate IELTS Listening dialogues with AI-powered text-to-speech using Gemini 2.5 TTS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!user && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-sm text-destructive">
                Please <Link to="/auth" className="underline font-medium">log in</Link> and add your Gemini API key in Settings to use this feature.
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., booking a hotel room"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scenario">Scenario Type</Label>
              <Select value={scenarioType} onValueChange={setScenarioType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conversation">Casual Conversation</SelectItem>
                  <SelectItem value="lecture">Lecture/Presentation</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="tour">Guided Tour</SelectItem>
                  <SelectItem value="phone_call">Phone Call/Booking</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !topic.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating with Gemini...
              </>
            ) : (
              <>
                <Volume2 className="mr-2 h-4 w-4" />
                Generate Dialogue & Audio
              </>
            )}
          </Button>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {dialogue && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Generated Dialogue</Label>
                <Textarea 
                  value={dialogue} 
                  readOnly 
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>

              {audioUrl && (
                <div className="space-y-2">
                  <Label>Generated Audio</Label>
                  <div className="flex gap-2">
                    <audio controls src={audioUrl} className="flex-1" />
                    <Button onClick={playAudio} variant="outline" size="icon">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>How it works:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Gemini 2.0 Flash generates an IELTS-style dialogue script</li>
              <li>Gemini 2.5 Flash TTS converts the script to multi-speaker audio</li>
              <li>PCM audio is converted to WAV for browser playback</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
