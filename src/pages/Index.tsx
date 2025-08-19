
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/auth/AuthPage';
import { TopBar } from '@/components/TopBar';
import { toast } from '@/components/ui/sonner';
import { 
  ArrowRight, 
  Sparkles, 
  Target, 
  FileText, 
  Zap, 
  Check,
  
} from 'lucide-react';
import CoverLetterSection from '@/components/CoverLetterSection';
import PricingSection from '@/components/sections/PricingSection';
import ATSCheckSection from '@/components/ATSCheckSection';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleProtectedNavigation = (path: string) => {
    // In demo mode, allow direct navigation without authentication
    if (import.meta.env.VITE_DEMO === 'true') {
      navigate(path);
      return;
    }
    
    if (user) {
      navigate(path);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    toast.success('Signed in');
    navigate('/editor');
  };

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Suggestions",
      description: "Get intelligent recommendations to improve your resume content and formatting"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "ATS Optimization",
      description: "Ensure your resume passes Applicant Tracking Systems with our built-in scanner"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Professional Templates",
      description: "Choose from ATS-friendly templates designed by hiring experts"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Real-time Preview",
      description: "See changes instantly as you edit with our live preview feature"
    }
  ];

  const benefits = [
    "✓ Beat 95% of ATS systems",
    "✓ 3x more interviews",
    "✓ Professional design",
    "✓ AI optimization",
    "✓ Export to PDF instantly",
    "✓ Mobile responsive"
  ];

  // Vanta background setup
  type VantaInstance = { destroy: () => void };
  type VantaAPI = { NET?: (opts: Record<string, unknown>) => VantaInstance };
  const vantaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let vantaInstance: VantaInstance | undefined;
    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(s);
      });

    const init = async () => {
      if (typeof window === 'undefined') return;
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.net.min.js');
  const VANTA = (window as unknown as { VANTA?: VantaAPI }).VANTA;
        if (VANTA?.NET && vantaRef.current) {
          const isMobile = window.matchMedia('(max-width: 768px)').matches;
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches || document.documentElement.classList.contains('dark');

          // Subtle lines in light mode, richer in dark; lower density on mobile
          const lineColor = isDark ? 0xa43fff : 0xC4B5FD; // violet-300 for light mode
          const points = isMobile ? 7 : 12;
          const maxDistance = isMobile ? 14 : 22;
          const spacing = isMobile ? 18 : 16;

          // Slight opacity reduction in light mode for a softer look
          try { if (vantaRef.current) vantaRef.current.style.opacity = isDark ? '0.85' : '0.5'; } catch (e) {
            console.warn('Vanta opacity apply error:', e);
          }

          vantaInstance = VANTA.NET({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: !isMobile, // reduce jitter on small screens
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: lineColor,
            backgroundColor: 0x09090b,
            backgroundAlpha: 0.0,
            points,
            maxDistance,
            spacing
          });
        }
      } catch (e) {
        console.warn('Vanta background failed to load:', e);
      }
    };
    init();

    return () => {
      try { vantaInstance?.destroy?.(); } catch (e) {
        console.warn('Vanta cleanup error:', e);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen">
  {/* Content */}
  <div className="relative z-10 bg-gradient-to-br from-background/60 via-background/60 to-resume-secondary/20">
  {/* Global TopBar for consistent nav + mobile drawer */}
  <TopBar />

  {/* Hero Section */}
  <section className="relative overflow-hidden container mx-auto px-4 py-20 text-center">
  {/* Vanta background layer (hero only) - keep far behind */}
  <div ref={vantaRef} className="absolute inset-0 -z-20 pointer-events-none" />
        {/* Fade-out overlays over the Vanta background (all sides) */}
  <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 sm:h-40 md:h-48 bg-gradient-to-b from-transparent to-background" />
  <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 sm:h-32 md:h-40 bg-gradient-to-t from-transparent to-background" />
  <div className="pointer-events-none absolute left-0 top-0 bottom-0 -z-10 w-10 sm:w-14 md:w-20 bg-gradient-to-r from-background to-transparent" />
  <div className="pointer-events-none absolute right-0 top-0 bottom-0 -z-10 w-10 sm:w-14 md:w-20 bg-gradient-to-l from-background to-transparent" />
  <div className="relative z-10 max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Removed marketing claim badge */}
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-resume-accent to-primary bg-clip-text text-transparent">
            Build Your Dream Resume with AI
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Create ATS-friendly resumes that get noticed. Our AI analyzes job descriptions 
            and optimizes your resume for maximum impact.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 group"
              onClick={() => handleProtectedNavigation('/editor')}
            >
              {user ? 'Open Resume Editor' : 'Start Building Free'}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => navigate('/templates')}
            >
              View Templates
            </Button>
          </div>

          {/* Removed users/ATS/rating stats strip */}
        </div>
      </section>

  {/* Features Grid */}
  <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose Our AI Resume Builder?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced features designed to help you land your dream job faster
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 resume-shadow hover:resume-shadow-lg transition-all duration-300 animate-slide-up">
              <div className="text-primary mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

  {/* ATS Check Section */}
  <ATSCheckSection />

  {/* Cover Letter Section */}
  <CoverLetterSection />

  {/* Benefits Section */}
  <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="gradient-card p-12 resume-shadow-lg">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Get Results That Matter
                </h2>
                <p className="text-lg text-muted-foreground">
                  Our AI-powered platform helps you create resumes that not only look professional 
                  but actually get you hired.
                </p>
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 text-lg">
                      <div className="w-6 h-6 rounded-full bg-resume-success/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-resume-success" />
                      </div>
                      {benefit}
                    </div>
                  ))}
                </div>
                <Button 
                  size="lg" 
                  className="mt-8"
                  onClick={() => handleProtectedNavigation('/editor')}
                >
                  {user ? 'Continue Building' : 'Start Your Success Story'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
              <div className="relative">
                <div className="aspect-[3/4] bg-white rounded-2xl resume-shadow-lg p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="w-full h-full bg-gradient-to-br from-primary/5 to-resume-accent/5 rounded-xl flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-primary rounded-full mx-auto flex items-center justify-center">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-800">Your Perfect Resume</h3>
                      <p className="text-gray-600">Professional • ATS-Optimized • AI-Enhanced</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

  {/* Pricing Section */}
  <PricingSection />

  {/* CTA Section */}
  <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of professionals who've accelerated their careers with our AI resume builder.
          </p>
          <Button 
            size="lg" 
            className="text-xl px-12 py-8 bg-primary hover:bg-primary/90"
            onClick={() => handleProtectedNavigation('/editor')}
          >
            {user ? 'Open My Resume Editor' : 'Create My Resume Now - It\'s Free!'}
          </Button>
          <p className="text-sm text-muted-foreground">
            No credit card required • Export to PDF • ATS-optimized
          </p>
        </div>
      </section>

  {/* Footer */}
  <footer className="border-t bg-muted/50 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                  AI
                </div>
                <span className="font-bold text-lg">Resume Builder</span>
              </div>
              <p className="text-muted-foreground">
                Build professional resumes with AI assistance that get you hired faster.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Features</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>AI Resume Builder</p>
                <p>ATS Optimization</p>
                <p>Cover Letter Generator</p>
                <p>Professional Templates</p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Tools</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Resume Editor</p>
                <p>ATS Scanner</p>
                <p>Template Gallery</p>
                <p>Share Resume</p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Support</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Help Center</p>
                <p>Contact Us</p>
                <p>Privacy Policy</p>
                <p>Terms of Service</p>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 AI Resume Builder. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
      </div>
    </div>
  );
};

export default Index;
