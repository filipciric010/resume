
import React, { useState, useEffect } from 'react';
import { TopBar } from '@/components/TopBar';
import { AIBanner } from '@/components/AIBanner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Sparkles, Download, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/auth/AuthPage';
import { aiService } from '@/lib/ai';
import { useResume } from '@/store/useResume';

const CoverLetter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const { data: resumeData } = useResume();

  // Redirect non-authenticated users
  useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
    }
  }, [user]);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleGenerate = async () => {
    if (!companyName || !jobTitle || !jobDescription) {
      toast.error('Please fill in all fields');
      return;
    }

  // Proceed; server controls AI availability and will return error if misconfigured

    setIsGenerating(true);
    
    try {
      const result = await aiService.generateCoverLetter({
        resumeData,
        jobText: `Company: ${companyName}\nPosition: ${jobTitle}\n\n${jobDescription}`
      });

      if (result && result.content) {
        setGeneratedLetter(result.content);
        setWordCount(result.wordCount || result.content.split(' ').length);
        toast.success('Cover letter generated successfully!');
      } else {
        throw new Error('Invalid response format from AI service');
      }
    } catch (error) {
      console.error('Cover letter generation error:', error);
      
      // Check if it's a network/API error vs data processing error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Cannot read properties') || errorMessage.includes('undefined')) {
        toast.error('Please ensure your resume has basic information filled out.');
      } else {
        toast.error('Failed to generate cover letter. Using fallback content.');
      }
      
      // Fallback to demo content
      const fallbackLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. With my comprehensive background in full-stack development and proven track record of delivering scalable web applications, I am excited about the opportunity to contribute to your team's continued success.

In my current role as Senior Full Stack Developer at TechCorp Inc., I have led the development of enterprise applications serving over 100,000 users. My experience aligns perfectly with your requirements, particularly in:

• Developing robust web applications using React and Node.js
• Implementing performance optimizations that reduced page load times by 40%
• Leading cross-functional teams and mentoring junior developers
• Working with modern cloud infrastructure and CI/CD pipelines

What particularly excites me about ${companyName} is your commitment to innovation and user-centric design. I am passionate about creating solutions that not only meet technical requirements but also deliver exceptional user experiences. My experience in ${jobDescription.includes('React') ? 'React development' : 'web development'} and collaborative approach to problem-solving would make me a valuable addition to your team.

I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to ${companyName}'s continued growth. Thank you for considering my application. I look forward to hearing from you.

Sincerely,
${resumeData.profile.fullName}`;

      setGeneratedLetter(fallbackLetter);
      setWordCount(fallbackLetter.split(' ').length);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    toast.success('Cover letter copied to clipboard!');
  };

  const handleExport = () => {
    // Create and download text file
    const element = document.createElement('a');
    const file = new Blob([generatedLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `cover-letter-${companyName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Cover letter exported successfully!');
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      {/* AI Banner */}
      <div className="container mx-auto px-4 py-2 print-hide">
        <AIBanner />
      </div>
      
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            AI Cover Letter Generator
          </h1>
          <p className="text-lg text-muted-foreground">
            Generate personalized cover letters tailored to specific job opportunities.
          </p>
        </div>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate Letter</TabsTrigger>
            <TabsTrigger value="preview">Preview & Export</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Job Details</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Google"
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">Job Title *</Label>
                    <Input
                      id="position"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Senior Software Engineer"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Job Description *</h2>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  rows={8}
                />
              </Card>
            </div>

            <div className="text-center">
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !companyName || !jobTitle || !jobDescription}
                size="lg"
                className="px-8"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5 mr-2" />
                )}
                {isGenerating ? 'Generating...' : aiService.isAvailable() ? 'Generate with AI' : 'Generate Cover Letter'}
              </Button>
              {!aiService.isAvailable() && (
                <p className="text-sm text-muted-foreground mt-2">
                  Using demo mode. Configure server OPENAI_API_KEY for AI-powered generation.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {generatedLetter ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">Generated Cover Letter</h2>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {wordCount} words
                        </span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={handleCopy}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                          <Button size="sm" onClick={handleExport}>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted/50 p-6 rounded-lg">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {generatedLetter}
                      </pre>
                    </div>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Cover Letter Tips</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Keep it concise (one page max)</p>
                      <p>• Personalize for each application</p>
                      <p>• Highlight relevant achievements</p>
                      <p>• Use keywords from job posting</p>
                      <p>• End with a clear call to action</p>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Next Steps</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Review and customize the content</p>
                      <p>• Match the tone to company culture</p>
                      <p>• Proofread for errors</p>
                      <p>• Save as PDF for submission</p>
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Cover Letter Generated</h3>
                <p className="text-muted-foreground mb-4">
                  Go to the Generate tab to create your personalized cover letter.
                </p>
                <Button variant="outline" onClick={() => {
                  const generateTab = document.querySelector('[value="generate"]') as HTMLElement;
                  generateTab?.click();
                }}>
                  Start Generating
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false);
            navigate('/');
          }}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};

export default CoverLetter;
