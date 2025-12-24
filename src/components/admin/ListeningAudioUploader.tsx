import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, Loader2, Music } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ListeningAudioUploaderProps {
  testId: string;
  currentAudioUrl: string | null;
  onUploadSuccess: (url: string) => void;
  onRemoveSuccess: () => void;
}

export function ListeningAudioUploader({
  testId,
  currentAudioUrl,
  onUploadSuccess,
  onRemoveSuccess,
}: ListeningAudioUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.startsWith('audio/')) {
        toast.error('Please upload an audio file.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file || !testId) {
      toast.error('No file selected or test ID missing.');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // If there's an existing audio, remove it first
      if (currentAudioUrl) {
        const existingFilePath = currentAudioUrl.split('/').pop();
        if (existingFilePath) {
          const { error: removeError } = await supabase.storage
            .from('listening-audios')
            .remove([existingFilePath]);
          if (removeError) {
            console.warn('Failed to remove old audio file:', removeError.message);
            // Don't block upload, just warn
          }
        }
      }

      const filePath = `${testId}/${file.name}`;
      const { error } = await supabase.storage
        .from('listening-audios')
        .upload(filePath, file, 
          {
            cacheControl: '3600',
            upsert: true,
            onUploadProgress: (event: { loaded: number; total?: number }) => {
              if (event.total) {
                setProgress(Math.round((event.loaded / event.total) * 100));
              }
            },
          } as any // Cast to any to allow onUploadProgress
        );

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('listening-audios')
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) throw new Error('Failed to get public URL.');

      onUploadSuccess(publicUrlData.publicUrl);
      toast.success('Audio uploaded successfully!');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading audio:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemoveAudio = async () => {
    if (!currentAudioUrl) return;

    if (!confirm('Are you sure you want to remove this audio file?')) return;

    try {
      const filePath = currentAudioUrl.split('/').pop();
      if (!filePath) throw new Error('Invalid audio URL.');

      const { error } = await supabase.storage
        .from('listening-audios')
        .remove([`${testId}/${filePath}`]); // Ensure correct path for removal

      if (error) throw error;

      onRemoveSuccess();
      toast.success('Audio file removed successfully!');
    } catch (error: any) {
      console.error('Error removing audio:', error);
      toast.error(`Removal failed: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="audio-upload">Upload Audio File (MP3, WAV, etc.)</Label>
      {currentAudioUrl ? (
        <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/30">
          <Music size={20} className="text-primary" />
          <span className="flex-1 text-sm truncate">
            {currentAudioUrl.split('/').pop()}
          </span>
          <Button variant="destructive" size="sm" onClick={handleRemoveAudio}>
            Remove
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Input
            id="audio-upload"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={uploading}
          />
          {file && (
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Uploading ({progress}%)
                </>
              ) : (
                <>
                  <UploadCloud size={18} className="mr-2" />
                  Upload Audio
                </>
              )}
            </Button>
          )}
          {uploading && <Progress value={progress} className="w-full" />}
        </div>
      )}
    </div>
  );
}