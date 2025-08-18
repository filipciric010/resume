
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { useResume, type Experience } from '@/store/useResume';
import { Plus, Edit, Trash2, Save, X, Sparkles, RefreshCw } from 'lucide-react';
import { BulletSuggestionsDialog } from '@/components/BulletSuggestionsDialog';
import { BulletRewriteDialog } from '@/components/BulletRewriteDialog';
import { aiService } from '@/lib/ai';

export const ExperienceEditor: React.FC = () => {
  const { data, addExperience, updateExperience, removeExperience, addBullet: addBulletToStore, updateBullet, removeBullet } = useResume();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showBulletSuggestions, setShowBulletSuggestions] = useState(false);
  const [showBulletRewrite, setShowBulletRewrite] = useState(false);
  const [currentExperienceId, setCurrentExperienceId] = useState<string | null>(null);
  const [bulletToRewrite, setBulletToRewrite] = useState<string>('');
  const [bulletToRewriteIndex, setBulletToRewriteIndex] = useState<number>(-1);
  const [bulletInputs, setBulletInputs] = useState<string[]>([]);
  
  const { register, handleSubmit, reset, watch, setValue, getValues, formState: { errors } } = useForm<Experience>();

  // Simple id generator for bullets
  const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  const handleSave = (formData: Experience) => {
    const cleanedBullets = bulletInputs
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (editingId) {
      // Update core fields first
      const { role, company, start, end } = formData;
      updateExperience(editingId, { role, company, start, end });

      // Sync bullets (update/add/remove)
      const exp = data.experience.find((e) => e.id === editingId);
      const existing = exp?.bullets || [];

      // Update or add
      cleanedBullets.forEach((text, idx) => {
        const existingBullet = existing[idx];
        if (existingBullet) {
          if (existingBullet.text !== text) {
            updateBullet(editingId, existingBullet.id, text);
          }
        } else {
          addBulletToStore(editingId, { text });
        }
      });
      // Remove extras
      for (let i = cleanedBullets.length; i < existing.length; i++) {
        removeBullet(editingId, existing[i].id);
      }

      setEditingId(null);
    } else {
  const payload: Omit<Experience, 'id'> = {
        role: formData.role,
        company: formData.company,
        start: formData.start,
        end: formData.end,
        bullets: cleanedBullets.map((text) => ({ id: genId(), text })),
      };
  addExperience(payload);
      setIsAdding(false);
    }

    reset();
    setBulletInputs([]);
  };

  const handleEdit = (experience: Experience) => {
    setEditingId(experience.id);
    reset(experience);
  setBulletInputs((experience.bullets || []).map((b) => b.text));
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    reset();
  setBulletInputs([]);
  };

  const handleDelete = (id: string) => {
    removeExperience(id);
  };

  const handleShowBulletSuggestions = (experienceId: string) => {
    setCurrentExperienceId(experienceId);
    setShowBulletSuggestions(true);
  };

    const addBullet = (bulletText: string) => {
    if (!currentExperienceId) return;
    
    addBulletToStore(currentExperienceId, { text: bulletText });
  };

  const handleShowBulletRewrite = (experienceId: string, bulletText: string, bulletIndex: number) => {
    setCurrentExperienceId(experienceId);
    setBulletToRewrite(bulletText);
    setBulletToRewriteIndex(bulletIndex);
    setShowBulletRewrite(true);
  };

  const handleReplaceBullet = (newText: string) => {
    if (currentExperienceId && bulletToRewriteIndex >= 0) {
      const experience = data.experience.find(exp => exp.id === currentExperienceId);
      if (experience && experience.bullets[bulletToRewriteIndex]) {
        const bulletId = experience.bullets[bulletToRewriteIndex].id;
        updateBullet(currentExperienceId, bulletId, newText);
      }
    }
    setShowBulletRewrite(false);
  };

  const handleInsertBullet = (bulletText: string) => {
    addBullet(bulletText);
    setShowBulletSuggestions(false);
  };

  const renderForm = () => (
    <Card className="p-4 border-2 border-dashed border-primary/20">
      <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="role">Position *</Label>
            <Input
              id="role"
              {...register('role', { required: true })}
              placeholder="e.g. Senior Software Engineer"
            />
            {errors.role && <span className="text-red-500 text-sm">Position is required</span>}
          </div>
          <div>
            <Label htmlFor="company">Company *</Label>
            <Input
              id="company"
              {...register('company', { required: true })}
              placeholder="e.g. Tech Corp Inc."
            />
            {errors.company && <span className="text-red-500 text-sm">Company is required</span>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start">Start Date *</Label>
            <Input
              id="start"
              type="date"
              {...register('start', { required: true })}
            />
            {errors.start && <span className="text-red-500 text-sm">Start date is required</span>}
          </div>
          <div>
            <Label htmlFor="end">End Date</Label>
            <Input
              id="end"
              type="date"
              {...register('end')}
              disabled={watch('end') === undefined}
              placeholder={watch('end') === undefined ? "Current position" : ""}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="current"
            checked={watch('end') === undefined}
            onCheckedChange={(checked) => {
              if (checked) {
                setValue('end', undefined);
              } else {
                setValue('end', '');
              }
            }}
          />
          <Label htmlFor="current">I currently work here</Label>
        </div>

        {/* Key Achievements editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Key Achievements</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setBulletInputs((prev) => [...prev, ''])}
            >
              Add Achievement
            </Button>
          </div>
          {bulletInputs.length === 0 && (
            <p className="text-xs text-muted-foreground">Add 2–5 concise, quantified bullet points.</p>
          )}
          <div className="space-y-2">
            {bulletInputs.map((val, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <Input
                  value={val}
                  onChange={(e) => {
                    const v = e.target.value;
                    setBulletInputs((prev) => prev.map((p, i) => (i === idx ? v : p)));
                  }}
                  placeholder="e.g., Increased conversion by 18% by optimizing checkout flow"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setBulletInputs((prev) => prev.filter((_, i) => i !== idx))}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button type="submit" disabled={!watch('role') || !watch('company') || !watch('start')}>
            <Save className="w-4 h-4 mr-2" />
            {editingId ? 'Update' : 'Add'} Experience
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Work Experience</h2>
        <Button 
          onClick={() => setIsAdding(true)} 
          size="sm"
          disabled={isAdding || editingId !== null}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Experience
        </Button>
      </div>

      {isAdding && renderForm()}

      <div className="space-y-4">
        {data.experience.map((exp) => (
          <div key={exp.id}>
            {editingId === exp.id ? (
              renderForm()
            ) : (
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{exp.role}</h3>
                    <p className="text-primary font-medium">{exp.company}</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {exp.start} - {!exp.end ? 'Present' : exp.end}
                    </p>
                    {(exp.bullets && exp.bullets.length > 0) && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Key Achievements:</span>
                          {aiService.isAvailable() && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShowBulletSuggestions(exp.id)}
                              disabled={editingId !== null || isAdding}
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              Improve with AI
                            </Button>
                          )}
                        </div>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {exp.bullets.map((bullet, index) => {
                            const text = bullet.text;
                            
                            return (
                              <li key={bullet.id} className="flex items-start group">
                                <span className="mr-2">•</span>
                                <span className="flex-1">{text}</span>
                                {aiService.isAvailable() && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                                    onClick={() => handleShowBulletRewrite(exp.id, text, index)}
                                    disabled={editingId !== null || isAdding}
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                  </Button>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(exp)}
                      disabled={editingId !== null || isAdding}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(exp.id)}
                      disabled={editingId !== null || isAdding}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        ))}
      </div>

      {/* AI Dialogs */}
      <BulletSuggestionsDialog
        open={showBulletSuggestions}
        onOpenChange={setShowBulletSuggestions}
        role={currentExperienceId ? data.experience.find(exp => exp.id === currentExperienceId)?.role || '' : ''}
        onInsertBullet={handleInsertBullet}
        existingBullets={currentExperienceId ? data.experience.find(exp => exp.id === currentExperienceId)?.bullets?.map(b => b.text) || [] : []}
      />

      <BulletRewriteDialog
        open={showBulletRewrite}
        onOpenChange={setShowBulletRewrite}
        originalBullet={bulletToRewrite}
        onReplaceBullet={handleReplaceBullet}
      />
    </div>
  );
};
