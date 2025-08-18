
import React, { useState, useEffect } from 'react';
import { TopBar } from '@/components/TopBar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Target, FileText, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/auth/AuthPage';
import { useResume } from '@/store/useResume';
import { useATS } from '@/store/useATS';
import { SAMPLE_RESUME, SAMPLE_JD } from '@/demo/sample';
import { evaluate, type AtsResult, type AtsIssue } from '@/lib/ats';
import { ScoreBadge } from '@/components/ats/ScoreBadge';
import { BreakdownBars } from '@/components/ats/BreakdownBars';
import { KeywordChips } from '@/components/ats/KeywordChips';
import { IssuesTable } from '@/components/ats/IssuesTable';
import { toast } from 'sonner';
import { aiService, type AtsNewResult } from '@/lib/ai';

const ATS = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { data, setProfile, addExperience, addEducation, addSkill, updateExperience, updateBullet } = useResume();
  const { jobDescription, setJobDescription } = useATS();
  const [atsResult, setAtsResult] = useState<AtsResult | AtsNewResult | null>(null);
  const isNewResult = (val: AtsResult | AtsNewResult | null): val is AtsNewResult => {
    return !!val && (val as AtsNewResult).matchScore !== undefined;
  };

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Redirect non-authenticated users
  useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
    }
  }, [user]);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  // AI-powered fix helpers
  const applyAIBulletFix = async (issue: AtsIssue) => {
    if (!aiService.isAvailable()) {
  toast.error('AI service not available. Configure server OPENAI_API_KEY.');
      return false;
    }

    try {
      // Parse the path to get experience and bullet indices
      const pathMatch = issue.path.match(/experience\[(\d+)\]\.bullets\[(\d+)\]/);
      if (!pathMatch) return false;

      const expIndex = parseInt(pathMatch[1]);
      const bulletIndex = parseInt(pathMatch[2]);
      
      if (!data.experience?.[expIndex]?.bullets?.[bulletIndex]) return false;

      const experience = data.experience[expIndex];
      const bullet = experience.bullets[bulletIndex];
      const currentText = bullet.text;

      let prompt = '';
      if (issue.id.includes('bullet-too-short')) {
        prompt = `Expand this bullet point to be more detailed and impactful: "${currentText}". Make it 8-24 words, start with an action verb, and include specific achievements or metrics if possible.`;
      } else if (issue.id.includes('weak-start')) {
        prompt = `Rewrite this bullet point to start with a strong action verb: "${currentText}". Keep the core meaning but make it more impactful and ATS-friendly.`;
      } else if (issue.id.includes('bullet-too-long')) {
        prompt = `Make this bullet point more concise while keeping its impact: "${currentText}". Aim for 8-24 words maximum.`;
      }

      if (!prompt) return false;

      const result = await aiService.rewriteBullet({
        bullet: currentText,
        jobText: jobDescription || `Role: ${experience.role} at ${experience.company}. ${prompt}`
      });

      updateBullet(experience.id, bullet.id, result.text);
      toast.success('AI improved your bullet point!');
      return true;
    } catch (error) {
      console.error('AI bullet fix error:', error);
      toast.error('Failed to apply AI fix. Please try manually.');
      return false;
    }
  };

  const applyAIDateFix = async (issue: AtsIssue) => {
    try {
      // Parse the path to get experience index
      const pathMatch = issue.path.match(/experience\[(\d+)\]\.start/);
      if (!pathMatch) return false;

      const expIndex = parseInt(pathMatch[1]);
      if (!data.experience?.[expIndex]) return false;

      const experience = data.experience[expIndex];
      
      // Add a reasonable start date (2 years ago for current role, or appropriate timeline)
      const currentYear = new Date().getFullYear();
      const startYear = experience.end ? parseInt(experience.end) - 2 : currentYear - 2;
      
      updateExperience(experience.id, { 
        start: startYear.toString() 
      });
      
      toast.success('Added estimated start date - please verify and adjust if needed');
      return true;
    } catch (error) {
      console.error('Date fix error:', error);
      return false;
    }
  };

  const applyAIKeywordFix = async (issue: AtsIssue) => {
    if (!aiService.isAvailable()) {
      return false;
    }

    try {
      // Extract missing keywords from the suggestion
      const suggestion = issue.suggestion;
      const keywordMatch = suggestion.match(/keywords.*?:\s*([^.]+)/i);
      if (!keywordMatch) return false;

      const missingKeywords = keywordMatch[1].split(/,\s*/).map(k => k.trim()).slice(0, 5);
      
      // First, add some keywords as skills
      missingKeywords.slice(0, 3).forEach(keyword => {
        const cleanKeyword = keyword.replace(/[^\w\s]/g, '').trim();
        if (cleanKeyword && cleanKeyword.length > 2) {
          addSkill({ name: cleanKeyword });
        }
      });

      // Then, use AI to enhance existing bullet points with remaining keywords
      if (data.experience && data.experience.length > 0) {
        const experienceToEnhance = data.experience[0]; // Enhance the most recent experience
        const bulletsToEnhance = experienceToEnhance.bullets?.slice(0, 2) || []; // Enhance first 2 bullets
        
        for (const bullet of bulletsToEnhance) {
          try {
            const enhancementPrompt = `Enhance this resume bullet point to naturally incorporate these relevant keywords: ${missingKeywords.join(', ')}. Original bullet: "${bullet.text}". Keep it professional, truthful, and natural. Only add keywords that make sense for the role and responsibilities.`;
            
            const result = await aiService.rewriteBullet({
              bullet: bullet.text,
              jobText: enhancementPrompt
            });

            updateBullet(experienceToEnhance.id, bullet.id, result.text);
          } catch (error) {
            console.error('Error enhancing bullet:', error);
          }
        }
      }

      toast.success('AI enhanced your resume with missing keywords!');
      return true;
    } catch (error) {
      console.error('AI keyword fix error:', error);
      toast.error('Failed to apply keyword fix. Added some keywords as skills instead.');
      return false;
    }
  };

  // Helpers to validate issues against current data
  const hasValue = (v: unknown): boolean => {
    if (v === undefined || v === null) return false;
    if (typeof v === 'string') return v.trim() !== '';
    if (typeof v === 'number' || typeof v === 'boolean') return true;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'object') return true;
    return false;
  };

  const getByPath = (obj: unknown, path: string): unknown => {
    // Supports dotted paths with optional [index], e.g., experience[0].bullets[1].text
    try {
      const tokens = path.split('.');
      let current: unknown = obj;
      for (const token of tokens) {
        const m = token.match(/^(\w+)(\[(\d+)\])?$/);
        if (!m) return undefined;
        const key = m[1];
        const idx = m[3] !== undefined ? parseInt(m[3], 10) : undefined;

        if (typeof current !== 'object' || current === null) return undefined;
        const container = current as Record<string, unknown>;
        let next: unknown = container[key];

        if (idx !== undefined) {
          if (!Array.isArray(next)) return undefined;
          next = (next as unknown[])[idx];
        }
        current = next;
      }
      return current;
    } catch {
      return undefined;
    }
  };

  const issueStillApplies = (issue: AtsIssue): boolean => {
    // Common missing fields
    if (issue.id === 'missing-email') return !hasValue(data.profile?.email);
    if (issue.id === 'missing-phone') return !hasValue(data.profile?.phone);
    if (issue.id === 'missing-location') return !hasValue(data.profile?.location);
    if (issue.id === 'missing-experience') return (data.experience?.length || 0) === 0;
    if (issue.id === 'missing-education') return (data.education?.length || 0) === 0;
    if (issue.id === 'missing-skills') return (data.skills?.length || 0) === 0;

    // Path-based check (e.g., experience[0].start or bullets[1])
    if (issue.path) {
      const value = getByPath(data, issue.path);
      // If property is a string/primitive, missing if empty; if object/array, missing if empty length
      if (Array.isArray(value)) return value.length === 0;
      if (typeof value === 'string') return !hasValue(value);
      if (value === undefined || value === null) return true;
      return false;
    }
    // For keyword/relevance issues, keep
    if (issue.id.includes('keyword') || issue.id.includes('relevance')) return true;
    // For bullet quality issues, keep
    if (issue.id.includes('bullet')) return true;
    return true;
  };

  const filterResultForCurrentData = (result: AtsResult | AtsNewResult): AtsResult | AtsNewResult => {
    if (isNewResult(result)) return result; // no filtering for string issues
    return {
      ...result,
      issues: result.issues.filter(issueStillApplies),
    };
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;
    setIsAnalyzing(true);
    try {
      if (aiService.isAvailable()) {
        const result = await aiService.analyzeResume(data, jobDescription);
        setAtsResult(filterResultForCurrentData(result));
      } else {
        const result = evaluate(data, jobDescription);
        setAtsResult(filterResultForCurrentData(result));
      }
    } catch (e) {
      console.error('AI analysis failed, falling back:', e);
      const result = evaluate(data, jobDescription);
      setAtsResult(filterResultForCurrentData(result));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyFix = async (issue: AtsIssue) => {
    console.log('Applying fix for:', issue);
    
    try {
      switch (issue.id) {
        case 'missing-email': {
          if (hasValue(data.profile?.email)) {
            toast.info('Email already set. Skipping.');
            break;
          }
          setProfile({ email: 'your.email@example.com' });
          toast.success('Added placeholder email - please update with your real email');
          break;
        }
          
        case 'missing-phone': {
          if (hasValue(data.profile?.phone)) {
            toast.info('Phone number already set. Skipping.');
            break;
          }
          setProfile({ phone: '+1 (555) 123-4567' });
          toast.success('Added placeholder phone - please update with your real phone number');
          break;
        }
          
        case 'missing-location': {
          if (hasValue(data.profile?.location)) {
            toast.info('Location already set. Skipping.');
            break;
          }
          setProfile({ location: 'City, State' });
          toast.success('Added placeholder location - please update with your city and state');
          break;
        }
          
        case 'missing-experience': {
          if ((data.experience?.length || 0) > 0) {
            toast.info('Experience already present. Skipping.');
            break;
          }
          addExperience({
            role: 'Your Job Title',
            company: 'Company Name',
            start: new Date().getFullYear() - 2 + '',
            end: new Date().getFullYear() + '',
            bullets: [
              { id: crypto.randomUUID(), text: 'Achieved significant results through key responsibilities and initiatives' },
              { id: crypto.randomUUID(), text: 'Collaborated with cross-functional teams to deliver impactful solutions' },
              { id: crypto.randomUUID(), text: 'Improved processes and systems to increase efficiency by measurable amounts' }
            ]
          });
          toast.success('Added sample work experience - please customize with your actual experience');
          break;
        }
          
        case 'missing-education': {
          if ((data.education?.length || 0) > 0) {
            toast.info('Education already present. Skipping.');
            break;
          }
          addEducation({
            school: 'University Name',
            degree: 'Bachelor of Science in Your Field',
            start: new Date().getFullYear() - 4 + '',
            end: new Date().getFullYear() + ''
          });
          toast.success('Added sample education - please update with your actual education');
          break;
        }
          
        case 'missing-skills': {
          const sampleSkills = ['Problem Solving', 'Communication', 'Teamwork', 'Leadership', 'Project Management'];
          sampleSkills.forEach(skillName => {
            const exists = (data.skills || []).some(s => s.name.toLowerCase() === skillName.toLowerCase());
            if (!exists) addSkill({ name: skillName });
          });
          toast.success('Added sample skills - please customize with your actual skills');
          break;
        }
        
        case 'low-keyword-match': {
          if (!aiService.isAvailable()) {
            // Extract keywords from suggestion and add as skills
            const suggestion = issue.suggestion;
            const keywordMatch = suggestion.match(/keywords.*?:\s*([^.]+)/i);
            if (keywordMatch) {
              const keywords = keywordMatch[1].split(/,\s*/).slice(0, 5); // Take first 5 keywords
              keywords.forEach(keyword => {
                const cleanKeyword = keyword.trim().replace(/[^\w\s]/g, '');
                if (cleanKeyword && cleanKeyword.length > 2) {
                  addSkill({ name: cleanKeyword });
                }
              });
              toast.success('Added missing keywords as skills - please review and customize');
              if (jobDescription) {
                setTimeout(() => handleAnalyze(), 500);
              }
              return;
            }
          } else {
            // Use AI to intelligently incorporate keywords
            toast.loading('AI is incorporating missing keywords...', { id: 'keyword-fix' });
            const success = await applyAIKeywordFix(issue);
            toast.dismiss('keyword-fix');
            
            if (success && jobDescription) {
              setTimeout(() => handleAnalyze(), 1000);
            }
            return;
          }
          break;
        }
          
        default: {
          // Try AI-powered fixes for keyword relevance issues  
          if (issue.id.includes('keyword') || issue.id.includes('relevance')) {
            if (!aiService.isAvailable()) {
              // Extract keywords from suggestion and add as skills
              const suggestion = issue.suggestion;
              const keywordMatch = suggestion.match(/keywords.*?:\s*([^.]+)/i);
              if (keywordMatch) {
                const keywords = keywordMatch[1].split(/,\s*/).slice(0, 5);
                keywords.forEach(keyword => {
                  const cleanKeyword = keyword.trim().replace(/[^\w\s]/g, '');
                  if (cleanKeyword && cleanKeyword.length > 2) {
                    addSkill({ name: cleanKeyword });
                  }
                });
                toast.success('Added missing keywords as skills - please review and customize');
                if (jobDescription) {
                  setTimeout(() => handleAnalyze(), 500);
                }
                return;
              }
            } else {
              toast.loading('AI is incorporating missing keywords...', { id: 'keyword-fix' });
              const success = await applyAIKeywordFix(issue);
              toast.dismiss('keyword-fix');
              
              if (success && jobDescription) {
                setTimeout(() => handleAnalyze(), 1000);
              }
              return;
            }
          }
          
          // Try AI-powered fixes for bullet point issues
          if (issue.id.includes('bullet-too-short') || issue.id.includes('weak-start') || issue.id.includes('bullet-too-long')) {
            toast.loading('AI is improving your bullet point...', { id: 'ai-fix' });
            const success = await applyAIBulletFix(issue);
            toast.dismiss('ai-fix');
            
            if (success && jobDescription) {
              setTimeout(() => handleAnalyze(), 1000);
            }
            return;
          }
          
          // Try AI-powered fixes for missing dates
          if (issue.id.includes('missing-start-date')) {
            const success = await applyAIDateFix(issue);
            if (success && jobDescription) {
              setTimeout(() => handleAnalyze(), 500);
            }
            return;
          }
          
          // Fallback messages for other issues
          if (issue.id.includes('missing-end-date')) {
            toast.info('Please add the end date for this position in the Resume Editor');
          } else if (issue.id.includes('no-metrics')) {
            toast.info('Consider adding specific numbers or percentages to quantify your achievements');
          } else if (issue.id.includes('weak-phrase')) {
            toast.info('Try replacing weak phrases with specific action verbs and achievements');
          } else {
            toast.info('Please manually address this issue in the Resume Editor');
          }
          break;
        }
      }
      
      // Re-run analysis after applying fix
    if (jobDescription && ['missing-email', 'missing-phone', 'missing-location', 'missing-experience', 'missing-education', 'missing-skills'].includes(issue.id)) {
        setTimeout(() => {
      handleAnalyze();
        }, 500);
      }
      
    } catch (error) {
      console.error('Error applying fix:', error);
      toast.error('Failed to apply fix. Please try manually in the Resume Editor.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-8 h-8 text-primary" />
            ATS Resume Scanner
          </h1>
          <p className="text-lg text-muted-foreground">
            Paste a job description below to get an ATS compatibility score and optimization suggestions.
          </p>
          {import.meta.env.VITE_DEMO === 'true' && (
            <div className="mt-3 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  // Keep current resume content; only set a sample JD here
                  setJobDescription(SAMPLE_JD);
                }}
              >
                Load Sample JD
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Description Input */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Job Description
              </h2>
              <Textarea
                placeholder="Paste the job description here to analyze how well your resume matches..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={10}
                className="mb-4"
              />
              <Button 
                onClick={handleAnalyze}
                disabled={!jobDescription.trim() || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Resume Match'}
              </Button>
            </Card>

            {/* Results */}
            {atsResult && !isNewResult(atsResult) && (
              <>
                {/* Score Breakdown */}
                <Card className="p-6">
                  <BreakdownBars breakdown={atsResult.breakdown} />
                </Card>

                {/* Missing Keywords */}
                {atsResult.missingKeywords.length > 0 && (
                  <Card className="p-6">
                    <KeywordChips 
                      keywords={atsResult.missingKeywords}
                      title="Missing Keywords"
                      variant="destructive"
                    />
                  </Card>
                )}

                {/* Issues Table */}
                <Card className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Issues</h3>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        for (const issue of atsResult.issues) {
                          await handleApplyFix(issue);
                        }
                        if (jobDescription) setTimeout(() => handleAnalyze(), 500);
                      }}
                    >
                      Apply All
                    </Button>
                  </div>
                  <IssuesTable 
                    issues={atsResult.issues}
                    onApplyFix={handleApplyFix}
                  />
                </Card>
              </>
            )}

            {atsResult && isNewResult(atsResult) && (
              <>
                {/* Skills overview */}
                {atsResult.missingSkills.length > 0 && (
                  <Card className="p-6">
                    <KeywordChips
                      keywords={atsResult.missingSkills}
                      title="Missing Skills"
                      variant="destructive"
                    />
                  </Card>
                )}
                {atsResult.matchedSkills.length > 0 && (
                  <Card className="p-6">
                    <KeywordChips
                      keywords={atsResult.matchedSkills}
                      title="Matched Skills"
                      variant="default"
                    />
                  </Card>
                )}
                {/* Alignments and feedback */}
                <Card className="p-6 space-y-2">
                  <h3 className="font-semibold">Alignment</h3>
                  <p className="text-sm"><strong>Experience:</strong> {atsResult.experienceAlignment}</p>
                  <p className="text-sm"><strong>Education:</strong> {atsResult.educationAlignment}</p>
                </Card>
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">Summary Feedback</h3>
                  <p className="text-sm text-muted-foreground">{atsResult.summaryFeedback}</p>
                </Card>
                {/* Issues and recommendations */}
                {atsResult.issues.length > 0 && (
                  <Card className="p-6">
                    <h3 className="font-semibold mb-2">Issues</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {atsResult.issues.map((it, idx) => (
                        <li key={idx}>{it}</li>
                      ))}
                    </ul>
                  </Card>
                )}
                {atsResult.recommendations.length > 0 && (
                  <Card className="p-6">
                    <h3 className="font-semibold mb-2">Recommendations</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {atsResult.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Score Panel */}
          <div className="space-y-6">
            {atsResult && !isNewResult(atsResult) && (
              <Card className="p-6 text-center">
                <h2 className="text-xl font-semibold mb-6">ATS Match Score</h2>
                <ScoreBadge score={atsResult.total} maxScore={100} size="lg" />
                <div className="mt-4 text-sm text-muted-foreground">
                  {atsResult.total >= 85 && "Excellent! Your resume is highly ATS-compatible."}
                  {atsResult.total >= 70 && atsResult.total < 85 && "Good match! A few improvements could boost your score."}
                  {atsResult.total < 70 && "Needs work. Follow the suggestions to improve ATS compatibility."}
                </div>
              </Card>
            )}
            {atsResult && isNewResult(atsResult) && (
              <Card className="p-6 text-center">
                <h2 className="text-xl font-semibold mb-6">ATS Match Score</h2>
                <ScoreBadge score={atsResult.matchScore} maxScore={100} size="lg" />
                <div className="mt-4 text-sm text-muted-foreground">
                  {atsResult.matchScore >= 85 && "Excellent! Your resume is highly ATS-compatible."}
                  {atsResult.matchScore >= 70 && atsResult.matchScore < 85 && "Good match! A few improvements could boost your score."}
                  {atsResult.matchScore < 70 && "Needs work. Follow the suggestions to improve ATS compatibility."}
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Quick Tips
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>• Use standard section headers (Experience, Education, Skills)</p>
                <p>• Include relevant keywords from the job posting</p>
                <p>• Start bullet points with action verbs</p>
                <p>• Include quantified achievements and metrics</p>
                <p>• Keep bullet points between 8-24 words</p>
                <p>• Use consistent tense (past for previous roles, present for current)</p>
              </div>
            </Card>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/editor')}
            >
              Edit Resume
            </Button>
          </div>
        </div>
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

export default ATS;
