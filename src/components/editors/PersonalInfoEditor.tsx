
import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useResume } from '@/store/useResume';
import type { ResumeData } from '@/store/useResume';
import { aiService } from '@/lib/ai';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const PersonalInfoEditor: React.FC = () => {
  const { data, setProfile } = useResume();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [rewriting, setRewriting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [form, setForm] = useState(() => ({
    fullName: data.profile.fullName || '',
    email: data.profile.email || '',
    phone: data.profile.phone || '',
    location: data.profile.location || '',
    headline: data.profile.headline || '',
    links: [...(data.profile.links || [])],
    summary: data.profile.summary || '',
  }));
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Sync local form when store profile changes (e.g., load/reset)
  useEffect(() => {
    setForm({
      fullName: data.profile.fullName || '',
      email: data.profile.email || '',
      phone: data.profile.phone || '',
      location: data.profile.location || '',
      headline: data.profile.headline || '',
      links: [...(data.profile.links || [])],
      summary: data.profile.summary || '',
    });
  }, [data.profile]);

  // Debounced update function to prevent infinite loops
  const debouncedUpdate = useCallback((updates: Partial<ResumeData['profile']>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setProfile(updates);
    }, 300);
  }, [setProfile]);

  // Handle input changes
  const handleInputChange = useCallback((field: string, value: string) => {
    if (field === 'website' || field === 'linkedin' || field === 'github') {
      const idx = field === 'website' ? 0 : field === 'linkedin' ? 1 : 2;
      const links = [...(form.links || [])];
      links[idx] = value;
      setForm((f) => ({ ...f, links }));
      debouncedUpdate({ links });
      return;
    }
    if (field === 'email') {
      const email = value.trim();
      const valid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      setEmailError(valid ? null : 'Enter a valid email');
      setForm((f) => ({ ...f, email }));
      debouncedUpdate({ email });
      return;
    }
    setForm((f) => ({ ...f, [field]: value }));
  debouncedUpdate({ [field]: value } as Partial<ResumeData['profile']>);
  }, [debouncedUpdate, form.links]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="you@email.com"
              aria-invalid={!!emailError}
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-600">{emailError}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="San Francisco, CA"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={form.links?.[0] || ''}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://yoursite.com"
            />
          </div>
          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={form.links?.[1] || ''}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
              placeholder="linkedin.com/in/johndoe"
            />
          </div>
          <div>
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              value={form.links?.[2] || ''}
              onChange={(e) => handleInputChange('github', e.target.value)}
              placeholder="github.com/johndoe"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="summary">Professional Summary *</Label>
          <Textarea
            id="summary"
            value={form.summary}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            placeholder="Write a compelling summary of your professional background and key strengths..."
            rows={4}
          />
          <div className="mt-2 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={rewriting || !(form.summary || '').trim() || !aiService.isAvailable()}
              onClick={async () => {
                const current = (form.summary || '').trim();
                if (!current) return;
                if (!aiService.isAvailable()) {
                  toast.error('AI not available. Add your API key.');
                  return;
                }
                try {
                  setRewriting(true);
                  const role = data.experience?.[0]?.role || data.profile.headline || undefined;
                  const skills = (data.skills || []).map(s => s.name).slice(0, 10);
                  const res = await aiService.rewriteSummary({ summary: current, role, skills });
                  if (res?.text) {
                    setForm((f) => ({ ...f, summary: res.text }));
                    setProfile({ summary: res.text });
                    toast.success('Summary rewritten');
                  } else {
                    toast.error('Failed to rewrite summary');
                  }
                } catch (e) {
                  const msg = e instanceof Error ? e.message : 'AI rewrite failed';
                  console.error(e);
                  toast.error(`AI rewrite failed${msg ? `: ${msg}` : ''}`);
                } finally {
                  setRewriting(false);
                }
              }}
            >
              {rewriting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {rewriting ? 'Rewriting...' : 'Rewrite with AI'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
