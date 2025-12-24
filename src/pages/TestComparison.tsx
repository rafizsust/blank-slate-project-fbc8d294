import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink } from 'lucide-react';

// Official IELTS demo URLs for comparison
const OFFICIAL_DEMO_URLS = {
  'cambridge12': 'https://www.ieltstestsimulation.com/wb-cnt/resources/listening/tests/1/',
  'ieltszone': 'https://ieltszone.org/practice-tests/listening-tests/ielts-cam-1-listening-test-4-online-practice/',
};

export default function TestComparison() {
  const [searchParams] = useSearchParams();
  const testId = searchParams.get('testId') || 'c12a1b2c-3d4e-5f60-7890-abc0ef123456';
  const [officialUrl, setOfficialUrl] = useState(OFFICIAL_DEMO_URLS.cambridge12);

  const ourTestUrl = `/listening/test/${testId}`;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Test Comparison View</h1>
        
        <div className="mb-4 flex flex-wrap gap-4 items-center">
          <span className="text-sm text-muted-foreground">Compare with:</span>
          {Object.entries(OFFICIAL_DEMO_URLS).map(([key, url]) => (
            <Button
              key={key}
              variant={officialUrl === url ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOfficialUrl(url)}
            >
              {key}
            </Button>
          ))}
          <div className="flex-1 min-w-[300px]">
            <Input
              placeholder="Enter custom URL to compare..."
              value={officialUrl}
              onChange={(e) => setOfficialUrl(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Our Test View */}
          <Card className="overflow-hidden">
            <div className="bg-primary text-primary-foreground p-3 flex items-center justify-between">
              <h2 className="font-semibold">Our App</h2>
              <Button variant="ghost" size="sm" asChild>
                <a href={ourTestUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open
                </a>
              </Button>
            </div>
            <div className="h-[600px]">
              <iframe
                src={ourTestUrl}
                className="w-full h-full border-0"
                title="Our Test"
              />
            </div>
          </Card>

          {/* Official Demo View */}
          <Card className="overflow-hidden">
            <div className="bg-secondary text-secondary-foreground p-3 flex items-center justify-between">
              <h2 className="font-semibold">Official IELTS Demo</h2>
              <Button variant="ghost" size="sm" asChild>
                <a href={officialUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open
                </a>
              </Button>
            </div>
            <div className="h-[600px]">
              <iframe
                src={officialUrl}
                className="w-full h-full border-0"
                title="Official Demo"
                sandbox="allow-same-origin allow-scripts allow-forms"
              />
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Comparison Notes:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Cambridge IELTS 12 Listening Test 1 has been inserted with all 40 questions</li>
            <li>• Question types: Fill in Blank, Multiple Choice, Choose Two, Matching Letters</li>
            <li>• Test URL: /listening/test/{testId}</li>
            <li>• Note: Some external sites may block iframe embedding</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
