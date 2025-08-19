import React, { useCallback, useState } from 'react';
import { useResume } from '@/store/useResume';
import { ResumeData } from '@/store/useResume';

type Props = { open: boolean; onClose: () => void };

export default function ImportJsonModal({ open, onClose }: Props) {
  const importSnapshot = useResume((s) => s.importSnapshot);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState('');

  const handleFileUpload = useCallback(async (file: File) => {
    // Reset states
    setErr(null);
    setSuccess(null);
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.json')) {
      setErr('Please select a valid JSON file.');
      return;
    }
    
    // Validate file size (5MB limit for JSON)
    if (file.size > 5 * 1024 * 1024) {
      setErr('File too large. Maximum size is 5MB.');
      return;
    }

    setBusy(true);

    try {
      const text = await file.text();
      setJsonText(text);
      setBusy(false);
    } catch (error) {
      console.error('[json-import] File read error:', error);
      setErr('Failed to read the file. Please try again.');
      setBusy(false);
    }
  }, []);

  const handleJsonImport = useCallback(async () => {
    if (!jsonText.trim()) {
      setErr('Please paste JSON data or select a file.');
      return;
    }

    setErr(null);
    setSuccess(null);
    setBusy(true);

    try {
      // Parse the JSON
      let parsed: any;
      try {
        parsed = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('[json-import] Parse error:', parseError);
        setErr('Invalid JSON format. Please check your data and try again.');
        return;
      }

      // Basic validation - check if it looks like resume data
      if (!parsed || typeof parsed !== 'object') {
        setErr('Invalid resume data format. Expected a JSON object.');
        return;
      }

      // Validate required structure (flexible validation)
      const hasValidStructure = 
        parsed.profile || 
        parsed.experience || 
        parsed.education || 
        parsed.skills ||
        parsed.personalInfo; // Support old format too

      if (!hasValidStructure) {
        setErr('This doesn\'t appear to be valid resume data. Missing expected sections.');
        return;
      }

      // Transform old format to new format if needed
      let resumeData: ResumeData;
      
      if (parsed.personalInfo) {
        // Old format transformation
        resumeData = {
          profile: {
            fullName: parsed.personalInfo?.name || parsed.personalInfo?.fullName || '',
            email: parsed.personalInfo?.email || '',
            phone: parsed.personalInfo?.phone || '',
            location: parsed.personalInfo?.location || '',
            headline: parsed.personalInfo?.headline || '',
            summary: parsed.personalInfo?.summary || '',
            links: parsed.personalInfo?.links || [],
          },
          experience: (parsed.experience || []).map((exp: any, index: number) => ({
            id: exp.id || `exp-${index}`,
            role: exp.role || exp.position || '',
            company: exp.company || '',
            start: exp.start || exp.startDate || '',
            end: exp.end || exp.endDate || '',
            bullets: (exp.bullets || exp.responsibilities || []).map((bullet: any, bIndex: number) => ({
              id: typeof bullet === 'object' ? bullet.id || `bullet-${index}-${bIndex}` : `bullet-${index}-${bIndex}`,
              text: typeof bullet === 'object' ? bullet.text || bullet.description || '' : bullet || '',
            })),
          })),
          education: (parsed.education || []).map((edu: any, index: number) => ({
            id: edu.id || `edu-${index}`,
            school: edu.school || edu.institution || '',
            degree: edu.degree || '',
            start: edu.start || edu.startDate || '',
            end: edu.end || edu.endDate || '',
          })),
          skills: (parsed.skills || []).map((skill: any, index: number) => ({
            id: skill.id || `skill-${index}`,
            name: typeof skill === 'object' ? skill.name || '' : skill || '',
            level: typeof skill === 'object' ? skill.level : undefined,
          })),
          projects: (parsed.projects || []).map((proj: any, index: number) => ({
            id: proj.id || `proj-${index}`,
            name: proj.name || '',
            description: proj.description || '',
            technologies: proj.technologies || proj.tech || [],
            url: proj.url || proj.link || '',
          })),
          certifications: parsed.certifications || [],
          templateKey: parsed.templateKey || parsed.currentTemplate || 'modern',
        };
      } else {
        // New format - use as-is with some cleanup
        resumeData = {
          profile: {
            fullName: parsed.profile?.fullName || '',
            email: parsed.profile?.email || '',
            phone: parsed.profile?.phone || '',
            location: parsed.profile?.location || '',
            headline: parsed.profile?.headline || '',
            summary: parsed.profile?.summary || '',
            links: parsed.profile?.links || [],
          },
          experience: (parsed.experience || []).map((exp: any, index: number) => ({
            id: exp.id || `exp-${index}`,
            role: exp.role || '',
            company: exp.company || '',
            start: exp.start || '',
            end: exp.end || '',
            bullets: (exp.bullets || []).map((bullet: any, bIndex: number) => ({
              id: typeof bullet === 'object' ? bullet.id || `bullet-${index}-${bIndex}` : `bullet-${index}-${bIndex}`,
              text: typeof bullet === 'object' ? bullet.text || '' : bullet || '',
            })),
          })),
          education: (parsed.education || []).map((edu: any, index: number) => ({
            id: edu.id || `edu-${index}`,
            school: edu.school || '',
            degree: edu.degree || '',
            start: edu.start || '',
            end: edu.end || '',
          })),
          skills: (parsed.skills || []).map((skill: any, index: number) => ({
            id: skill.id || `skill-${index}`,
            name: typeof skill === 'object' ? skill.name || '' : skill || '',
            level: typeof skill === 'object' ? skill.level : undefined,
          })),
          projects: (parsed.projects || []).map((proj: any, index: number) => ({
            id: proj.id || `proj-${index}`,
            name: proj.name || '',
            description: proj.description || '',
            technologies: proj.technologies || [],
            url: proj.url || '',
          })),
          certifications: parsed.certifications || [],
          templateKey: parsed.templateKey || 'modern',
        };
      }

      console.log('[json-import] Import successful:', resumeData);
      
      importSnapshot(resumeData);
      setSuccess('Resume data imported successfully!');
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('[json-import] Import error:', error);
      if (error instanceof Error) {
        setErr(`Import failed: ${error.message}`);
      } else {
        setErr('Failed to import resume data. Please check the format and try again.');
      }
    } finally {
      setBusy(false);
    }
  }, [jsonText, importSnapshot, onClose]);

  const handleReset = () => {
    setJsonText('');
    setErr(null);
    setSuccess(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={!busy ? onClose : undefined} />
      <div className="relative w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-zinc-900 dark:text-white max-h-[90vh] overflow-y-auto">
        <button 
          className="absolute right-3 top-3 rounded p-1 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={onClose}
          disabled={busy}
        >
          ✕
        </button>
        
        <h3 className="text-lg font-semibold">Import JSON Resume</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
          Import resume data from a JSON file or paste JSON directly. Supports both old and new resume formats.
        </p>

        <div className="mt-4 space-y-4">
          {/* File Upload Option */}
          <div>
            <label className={`block rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
              busy 
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed dark:border-white/10 dark:bg-white/5' 
                : 'border-gray-300 cursor-pointer hover:bg-gray-50 dark:border-white/20 dark:hover:bg-white/5'
            }`}>
              <input
                type="file"
                className="hidden"
                accept=".json"
                disabled={busy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && !busy) handleFileUpload(f);
                }}
              />
              <div className="text-sm">
                {busy ? 'Loading...' : 'Click to select JSON file'}
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-zinc-500">
                JSON files only • Max 5MB
              </div>
            </label>
          </div>

          {/* OR Divider */}
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-300 dark:border-white/20"></div>
            <div className="px-3 text-sm text-gray-500 dark:text-zinc-500">OR</div>
            <div className="flex-1 border-t border-gray-300 dark:border-white/20"></div>
          </div>

          {/* Text Area Option */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Paste JSON Data:
            </label>
            <textarea
              className="w-full h-48 p-3 border border-gray-300 rounded-lg resize-none font-mono text-sm dark:border-white/20 dark:bg-zinc-800 dark:text-white"
              placeholder='Paste your JSON resume data here, e.g.:
{
  "profile": {
    "fullName": "John Doe",
    "email": "john@example.com"
  },
  "experience": [...],
  "education": [...],
  "skills": [...]
}'
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              disabled={busy}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleJsonImport}
              disabled={busy || !jsonText.trim()}
            >
              {busy ? 'Importing...' : 'Import Resume'}
            </button>
            <button
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-white/20 dark:hover:bg-white/5 disabled:opacity-50"
              onClick={handleReset}
              disabled={busy}
            >
              Clear
            </button>
          </div>
        </div>

        {success && (
          <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
            ✓ {success}
          </div>
        )}

        {err && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            ⚠ {err}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg dark:bg-zinc-800/50">
          <h4 className="text-sm font-medium mb-1">Supported Formats:</h4>
          <ul className="text-xs text-gray-600 dark:text-zinc-400 space-y-1">
            <li>• Current resume format (with profile, experience, education, skills)</li>
            <li>• Legacy format (with personalInfo structure)</li>
            <li>• Exported JSON from this resume builder</li>
            <li>• Custom JSON with similar structure</li>
          </ul>
        </div>
      </div>
    </div>
  );
}



