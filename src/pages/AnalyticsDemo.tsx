import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Brain,
  Lightbulb,
  Video,
  FileText,
  GraduationCap,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const moduleIcons = {
  reading: BookOpen,
  listening: Headphones,
  writing: PenTool,
  speaking: Mic
};

const moduleColors = {
  reading: 'from-blue-500 to-blue-600',
  listening: 'from-purple-500 to-purple-600',
  writing: 'from-emerald-500 to-emerald-600',
  speaking: 'from-orange-500 to-orange-600'
};

const resourceIcons: Record<string, typeof Video> = {
  video: Video,
  article: FileText,
  practice: GraduationCap,
  samples: FileText,
  topics: Lightbulb
};

const demoData = {
  overallBand: 7.0,
  overallTrend: 'up' as const,
  topStrengths: [
    'Strong vocabulary recognition in academic texts',
    'Good understanding of main ideas and themes',
    'Consistent time management during tests'
  ],
  areasToImprove: [
    'Practice distinguishing "Not Given" from "False" in T/F/NG questions',
    'Focus on spelling accuracy for fill-in-the-blank answers',
    'Develop skimming techniques for faster passage navigation'
  ],
  modules: [
    {
      module: 'reading' as const,
      averageScore: 75,
      totalTests: 5,
      bandScore: 7.5,
      trend: 'up' as const,
      weakAreas: ['Matching Headings', 'True/False/Not Given'],
      strongAreas: ['Multiple Choice', 'Summary Completion'],
      commonMistakes: [
        'Confusing "Not Given" with "False" in T/F/NG questions',
        'Spending too much time on difficult paragraphs',
        'Missing keywords due to paraphrasing'
      ],
      improvements: [
        'Focus on identifying specific evidence before answering T/F/NG',
        'Practice skimming first, then scanning for answers',
        'Learn common paraphrase patterns in IELTS'
      ],
      detailedExamples: [
        {
          testName: 'Cambridge IELTS 18 - Test 1',
          mistake: 'Selected "False" when the passage didn\'t mention the topic at all',
          correction: 'Should be "Not Given" - no information about this was provided',
          technique: 'Look for explicit contradiction for False, absence for Not Given'
        }
      ],
      resources: [
        { title: 'British Council - Reading Practice Tests', url: 'https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-practice-tests/reading', type: 'practice' },
        { title: 'IELTS.org - Reading Sample Questions', url: 'https://www.ielts.org/for-test-takers/sample-test-questions', type: 'practice' },
        { title: 'E2 IELTS Reading Tips (YouTube)', url: 'https://www.youtube.com/watch?v=N2Jvhm9aSFU', type: 'video' },
      ]
    },
    {
      module: 'listening' as const,
      averageScore: 70,
      totalTests: 4,
      bandScore: 7.0,
      trend: 'stable' as const,
      weakAreas: ['Map Labelling', 'Multiple Choice'],
      strongAreas: ['Form Completion', 'Note Taking'],
      commonMistakes: [
        'Missing answers due to distraction during map questions',
        'Selecting first option heard without waiting for correction',
        'Spelling errors in form completion'
      ],
      improvements: [
        'Practice following directions (left, right, opposite) in maps',
        'Wait until speaker finishes before confirming answer',
        'Practice spelling common IELTS vocabulary'
      ],
      detailedExamples: [
        {
          testName: 'Cambridge IELTS 17 - Test 2',
          mistake: 'Selected option A immediately when speaker said "near the library"',
          correction: 'Speaker then corrected to "actually, it\'s opposite the bank"',
          technique: 'Always wait for the speaker to complete their thought before answering'
        }
      ],
      resources: [
        { title: 'British Council - Listening Practice', url: 'https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-practice-tests/listening', type: 'practice' },
        { title: 'BBC Learning English', url: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english', type: 'practice' },
      ]
    },
    {
      module: 'writing' as const,
      averageScore: 65,
      totalTests: 3,
      bandScore: 6.5,
      trend: 'up' as const,
      weakAreas: ['Task Achievement', 'Coherence and Cohesion'],
      strongAreas: ['Lexical Resource', 'Grammar Range'],
      commonMistakes: [
        'Not addressing all parts of the question',
        'Overusing simple connectors like "and", "but", "so"',
        'Paragraphs lacking clear topic sentences'
      ],
      improvements: [
        'Underline all parts of the question before writing',
        'Use a variety of linking phrases: "Furthermore", "In contrast", "Consequently"',
        'Start each paragraph with a clear main idea'
      ],
      detailedExamples: [
        {
          testName: 'Writing Task 2 - Education Topic',
          mistake: 'Only discussed advantages, ignoring "discuss both views"',
          correction: 'Need separate paragraphs for both advantages AND disadvantages',
          technique: 'Always map question requirements to paragraphs before writing'
        }
      ],
      resources: [
        { title: 'IELTS Liz - Band 9 Essay Samples', url: 'https://ieltsliz.com/ielts-writing-task-2/', type: 'samples' },
        { title: 'E2 IELTS Writing Masterclass', url: 'https://www.youtube.com/watch?v=R51E7gH_EE0', type: 'video' },
      ]
    },
    {
      module: 'speaking' as const,
      averageScore: 68,
      totalTests: 2,
      bandScore: 6.5,
      trend: 'stable' as const,
      weakAreas: ['Fluency', 'Lexical Resource'],
      strongAreas: ['Pronunciation', 'Grammar Accuracy'],
      commonMistakes: [
        'Long pauses when thinking of vocabulary',
        'Repeating the same words instead of using synonyms',
        'Speaking too fast when nervous'
      ],
      improvements: [
        'Practice thinking in English to reduce translation pauses',
        'Learn topic-specific vocabulary for common IELTS themes',
        'Record yourself and listen for pacing issues'
      ],
      detailedExamples: [
        {
          testName: 'Speaking Part 2 - Describe a Place',
          mistake: 'Used "beautiful" 5 times in the same response',
          correction: 'Could use: stunning, picturesque, breathtaking, charming, scenic',
          technique: 'Prepare vocabulary lists with 3-4 synonyms for common descriptors'
        }
      ],
      resources: [
        { title: 'IELTS Speaking Success - Topics', url: 'https://ieltsspeakingsuccess.com/ielts-speaking-part-2-topics/', type: 'topics' },
        { title: 'E2 IELTS Speaking Tips', url: 'https://www.youtube.com/watch?v=sAv0kWNIKlA', type: 'video' },
      ]
    }
  ]
};

export default function AnalyticsDemo() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reading');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      <Navbar />
      
      {/* Neural grid background */}
      <div className="fixed inset-0 neural-grid opacity-[0.02] pointer-events-none" />

      <main className="container mx-auto px-4 py-8 relative flex-1">
        {/* Demo Banner */}
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="py-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Lock className="text-primary" />
              <div>
                <span className="font-semibold">This is a demo preview.</span>
                <span className="text-muted-foreground ml-2">Sign up to get your personalized AI analytics!</span>
              </div>
            </div>
            <Button onClick={() => navigate('/auth')} className="btn-ai gap-2">
              <Sparkles size={16} />
              Sign Up Free
            </Button>
          </CardContent>
        </Card>

        {/* Overall Score */}
        <Card className="mb-6 card-ai">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center ai-glow">
                  <div className="w-28 h-28 rounded-full bg-background flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-primary">{demoData.overallBand}</span>
                    <span className="text-sm text-muted-foreground">Band Score</span>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1.5">
                  <TrendingUp size={16} />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">Sample Performance Overview</h2>
                <p className="text-muted-foreground mb-4">
                  This is what your personalized analytics could look like. Get detailed insights into your strengths and areas for improvement.
                </p>
                <div className="flex flex-wrap gap-2">
                  {demoData.topStrengths.map((strength, i) => (
                    <Badge key={i} variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                      <CheckCircle2 size={12} className="mr-1" />
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module Tabs with Full Details */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass p-1 w-full justify-start">
            {demoData.modules.map((mod) => {
              const Icon = moduleIcons[mod.module];
              return (
                <TabsTrigger 
                  key={mod.module} 
                  value={mod.module} 
                  className="gap-2 capitalize data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white"
                >
                  <Icon size={16} />
                  {mod.module}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {demoData.modules.map((mod) => {
            const Icon = moduleIcons[mod.module];
            const colorClass = moduleColors[mod.module];
            
            return (
              <TabsContent key={mod.module} value={mod.module}>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Score Overview */}
                  <Card className="card-ai">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2 capitalize">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClass}`}>
                            <Icon size={18} className="text-white" />
                          </div>
                          {mod.module} Performance
                        </span>
                        <Badge variant={mod.trend === 'up' ? 'default' : 'secondary'} className="gap-1">
                          {mod.trend === 'up' ? <TrendingUp size={12} /> : (mod.trend as string) === 'down' ? <TrendingDown size={12} /> : null}
                          {mod.trend}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold gradient-text-static">{mod.bandScore}</div>
                          <p className="text-xs text-muted-foreground">Band Score</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Average</span>
                            <span>{mod.averageScore}%</span>
                          </div>
                          <Progress value={mod.averageScore} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">{mod.totalTests} tests analyzed</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-2 text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 size={14} />
                            Strong Areas
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {mod.strongAreas.map((area, i) => (
                              <Badge key={i} variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2 text-destructive flex items-center gap-1">
                            <Target size={14} />
                            Focus Areas
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {mod.weakAreas.map((area, i) => (
                              <Badge key={i} variant="outline" className="text-xs border-destructive/30 text-destructive">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Common Mistakes & Improvements */}
                  <Card className="card-ai">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle size={18} className="text-warning" />
                        Common Patterns & Solutions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2 text-destructive">Common Mistakes</p>
                        <ul className="space-y-2 text-sm">
                          {mod.commonMistakes.map((mistake, i) => (
                            <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-destructive/5 border border-destructive/10">
                              <span className="text-destructive font-bold">×</span>
                              {mistake}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2 flex items-center gap-2 text-emerald-600">
                          <Lightbulb size={14} />
                          How to Improve
                        </p>
                        <ul className="space-y-2 text-sm">
                          {mod.improvements.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                              <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed Examples */}
                  <Card className="card-ai md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain size={18} className="text-primary" />
                        Specific Examples from Tests
                      </CardTitle>
                      <CardDescription>AI-identified patterns from your actual submissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {mod.detailedExamples.map((example, i) => (
                          <div key={i} className="p-4 rounded-xl border bg-gradient-to-br from-primary/5 to-accent/5">
                            <p className="text-xs text-muted-foreground mb-2 font-medium">{example.testName}</p>
                            <div className="space-y-3">
                              <div className="flex items-start gap-2">
                                <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded shrink-0">Mistake</span>
                                <p className="text-sm">{example.mistake}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded shrink-0">Correct</span>
                                <p className="text-sm">{example.correction}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded shrink-0">Technique</span>
                                <p className="text-sm">{example.technique}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Resources */}
                  <Card className="card-ai md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap size={18} className="text-primary" />
                        Recommended Resources
                      </CardTitle>
                      <CardDescription>Curated materials to help you improve</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mod.resources.map((resource, i) => {
                          const ResourceIcon = resourceIcons[resource.type] || FileText;
                          return (
                            <a
                              key={i}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group p-4 rounded-xl border bg-card hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 cursor-pointer block"
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClass} group-hover:ai-glow-sm transition-all`}>
                                  <ResourceIcon size={16} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                    {resource.title}
                                  </p>
                                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                    <Badge variant="secondary" className="text-xs capitalize">
                                      {resource.type}
                                    </Badge>
                                    <ExternalLink size={10} />
                                  </div>
                                </div>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* CTA Section */}
        <Card className="text-center card-ai mt-8">
          <CardContent className="py-12">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 ai-glow">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Ready to Get Your Real Analytics?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Sign up for free and take practice tests to unlock your personalized AI-powered performance analysis.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={() => navigate('/auth')} size="lg" className="btn-ai gap-2">
                <Sparkles size={18} />
                Sign Up Free
              </Button>
              <Button onClick={() => navigate('/reading/cambridge-ielts-a')} variant="outline" size="lg">
                Try Practice Tests
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
