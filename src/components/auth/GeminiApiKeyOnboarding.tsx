import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  KeyRound, 
  Shield, 
  Sparkles, 
  Brain, 
  Languages, 
  BookOpen, 
  Loader2,
  CheckCircle2,
  ExternalLink,
  Monitor,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface GeminiApiKeyOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

const AI_FEATURES = [
  {
    icon: Brain,
    title: 'AI Feedback & Scoring',
    description: 'Get detailed band scores and personalized feedback on Speaking and Writing tests'
  },
  {
    icon: Sparkles,
    title: 'Answer Explanations',
    description: 'Understand why answers are correct or incorrect with AI-powered explanations'
  },
  {
    icon: Languages,
    title: 'Translation',
    description: 'Translate words and passages to your preferred language instantly'
  },
  {
    icon: BookOpen,
    title: 'Auto Flashcard Generation',
    description: 'Automatically generate meanings and translations for vocabulary flashcards'
  }
];

export function GeminiApiKeyOnboarding({ onComplete, onSkip }: GeminiApiKeyOnboardingProps) {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveApiKey = async () => {
    if (!user || !apiKey.trim()) {
      toast.error('Please enter a valid Gemini API key');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.functions.invoke('set-user-gemini-api-key', {
        body: {
          secretName: 'GEMINI_API_KEY',
          secretValue: apiKey.trim(),
        },
      });

      if (error) throw error;

      toast.success('Gemini API key saved successfully!');
      onComplete();
    } catch (error: any) {
      console.error('Error saving API key:', error);
      toast.error(`Failed to save API key: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Setup AI Features</CardTitle>
          <CardDescription>
            Add your Gemini API key to unlock powerful AI-powered features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AI_FEATURES.map((feature) => (
              <div 
                key={feature.title}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <Shield className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div className="text-sm">
              <h4 className="font-semibold text-green-700 dark:text-green-400">Your API Key is Secure</h4>
              <p className="text-green-600 dark:text-green-500">
                Your API key is encrypted using industry-standard encryption before storage. 
                It is never exposed to the client-side and is only used server-side for AI processing.
              </p>
            </div>
          </div>

          {/* Instructions Tabs */}
          <Tabs defaultValue="pc" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pc" className="gap-2">
                <Monitor size={16} />
                PC Instructions
              </TabsTrigger>
              <TabsTrigger value="mobile" className="gap-2">
                <Smartphone size={16} />
                Mobile Instructions
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pc" className="space-y-3 mt-4">
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Go to <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Google AI Studio <ExternalLink size={12} /></a></li>
                <li>Sign in with your Google account</li>
                <li>Click "Create API Key" button</li>
                <li>Select a project or create a new one</li>
                <li>Copy the generated API key</li>
                <li>Paste it in the field below</li>
              </ol>
            </TabsContent>
            <TabsContent value="mobile" className="space-y-3 mt-4">
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Open your mobile browser and go to <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Google AI Studio <ExternalLink size={12} /></a></li>
                <li>If prompted, switch to desktop site mode</li>
                <li>Sign in with your Google account</li>
                <li>Tap "Create API Key" button</li>
                <li>Select a project or create a new one</li>
                <li>Long-press to copy the generated API key</li>
                <li>Paste it in the field below</li>
              </ol>
            </TabsContent>
          </Tabs>

          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="gemini-api-key" className="flex items-center gap-2">
              <KeyRound size={16} />
              Gemini API Key
            </Label>
            <Input
              id="gemini-api-key"
              type="password"
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle size={12} />
              You can always add or change this later in Settings
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onSkip}
              disabled={saving}
            >
              Skip for Now
            </Button>
            <Button
              className="flex-1"
              onClick={handleSaveApiKey}
              disabled={saving || !apiKey.trim()}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} className="mr-2" />
                  Save & Continue
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
