import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

interface TermsAndConditionsProps {
  onAccept: () => void;
  onReject: () => void;
}

export function TermsAndConditions({ onAccept, onReject }: TermsAndConditionsProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Terms & Conditions</CardTitle>
          <CardDescription>
            Please read and accept our terms before continuing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ScrollArea className="h-64 rounded-md border p-4">
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Not Affiliated with Cambridge</h3>
                  <p>
                    IELTS AI is an independent practice platform and is not affiliated with, endorsed by, 
                    or connected to Cambridge Assessment English, the British Council, IDP Education, 
                    or any other official IELTS testing organization.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Service Charges</h3>
                  <p>
                    We do not charge for Cambridge or official IELTS materials. Our subscription fees 
                    cover platform maintenance, database costs, server infrastructure, AI evaluation 
                    services, and ongoing development to provide you with the best practice experience.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Our Focus</h3>
                  <p>
                    Our primary goal is to provide an accessible and effective IELTS practice platform 
                    while respecting intellectual property rights. We use AI-powered evaluations and 
                    community-contributed practice materials to help you prepare for your IELTS exam.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Practice Materials</h3>
                  <p>
                    Practice tests and materials available on this platform are for educational purposes 
                    only. They are designed to help you familiarize yourself with the IELTS exam format 
                    and improve your English language skills.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Data Privacy</h3>
                  <p>
                    Your personal data and practice records are securely stored and will never be shared 
                    with third parties without your consent. API keys you provide are encrypted and 
                    stored securely.
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and agree to the terms and conditions
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onReject}
            >
              Decline
            </Button>
            <Button
              className="flex-1"
              onClick={onAccept}
              disabled={!accepted}
            >
              Accept & Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
