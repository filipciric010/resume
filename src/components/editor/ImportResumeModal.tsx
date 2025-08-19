import React, { useCallback, useState } from 'react';
import { useResume } from '@/store/useResume';

type Props = { open: boolean; onClose: () => void };

export default function ImportResumeModal({ open, onClose }: Props) {
  const importSnapshot = useResume((s) => s.importSnapshot);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const API_BASE = import.meta.env.VITE_API_URL || '';

  const onFile = useCallback(async (file: File) => {
    // Reset states
    setErr(null);
    setSuccess(null);
    
    // Validate file type
    if (!['application/pdf', 'image/png', 'image/jpeg'].includes(file.type)) {
      setErr('Unsupported file type. Please upload PDF, PNG, or JPEG.');
      return;
    }
    
    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      setErr('File too large. Maximum size is 10MB.');
      return;
    }

    setBusy(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('[client] Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        apiUrl: `${API_BASE}/api/import-resume`,
      });

      const response = await fetch(`${API_BASE}/api/import-resume`, {
        method: 'POST',
        body: formData,
      });

      console.log('[client] Response received:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
      });

      // Clone the response so we can read it multiple times if needed
      const responseClone = response.clone();
      
      if (!response.ok) {
        let errorMessage = `Server error (${response.status})`;
        try {
          const errorData = await response.json();
          console.error('[client] Server error:', errorData);
          errorMessage = errorData.details || errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('[client] Failed to parse error response as JSON:', jsonError);
          try {
            const textResponse = await responseClone.text();
            console.error('[client] Raw error response:', textResponse);
            errorMessage = textResponse || errorMessage;
          } catch (textError) {
            console.error('[client] Failed to read error response as text:', textError);
          }
        }
        setErr(errorMessage);
        return;
      }

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('[client] Failed to parse success response as JSON:', jsonError);
        try {
          const textResponse = await responseClone.text();
          console.error('[client] Raw success response:', textResponse);
          setErr(`Server returned invalid response: ${textResponse}`);
        } catch (textError) {
          console.error('[client] Failed to read success response as text:', textError);
          setErr('Server returned invalid response. Please try again.');
        }
        return;
      }
      console.log('[client] Import successful:', {
        hasData: !!result.data,
        message: result.message,
      });

      if (result.success && result.data) {
        importSnapshot(result.data);
        setSuccess(result.message || 'Resume imported successfully!');
        
        // Close modal after a short delay to show success message
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErr(result.error || 'No resume data received from server');
      }

    } catch (error) {
      console.error('[client] Import error:', error);
      if (error instanceof Error) {
        setErr(`Import failed: ${error.message}`);
      } else {
        setErr('Network error. Please check your connection and try again.');
      }
    } finally {
      setBusy(false);
      setProgress(100);
    }
  }, [importSnapshot, onClose, API_BASE]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={!busy ? onClose : undefined} />
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-zinc-900 dark:text-white">
        <button 
          className="absolute right-3 top-3 rounded p-1 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={onClose}
          disabled={busy}
        >
          ✕
        </button>
        
        <h3 className="text-lg font-semibold">Import Resume</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
          Upload a PDF or image (PNG/JPEG, max 10MB). Our AI will extract and organize your resume information.
        </p>

        <label className={`mt-4 block rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          busy 
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed dark:border-white/10 dark:bg-white/5' 
            : 'border-gray-300 cursor-pointer hover:bg-gray-50 dark:border-white/20 dark:hover:bg-white/5'
        }`}>
          <input
            type="file"
            className="hidden"
            accept="application/pdf,image/png,image/jpeg"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && !busy) onFile(f);
            }}
          />
          <div className="text-sm">
            {busy ? 'Processing...' : 'Click to select file'}
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-zinc-500">
            PDF, PNG, or JPEG • Max 10MB
          </div>
        </label>

        {busy && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing resume...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-white/10">
              <div 
                className="h-full rounded-full bg-blue-500 transition-all duration-300" 
                style={{ width: `${Math.min(progress, 100)}%` }} 
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-zinc-500">
              This may take up to 30 seconds...
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
}
