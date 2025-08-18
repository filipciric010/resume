import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useResume } from '@/store/useResume';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface SkillForm {
  name: string;
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
}

export const SkillsEditor: React.FC = () => {
  const { data, addSkill, updateSkill, removeSkill } = useResume();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const { register, handleSubmit, reset, setValue, watch } = useForm<SkillForm>();
  const watchedLevel = watch('level');

  const skills = data.skills || [];

  const handleSave = (formData: SkillForm) => {
    if (editingId) {
      updateSkill(editingId, formData);
      setEditingId(null);
    } else {
      addSkill(formData);
      setIsAdding(false);
    }
    reset();
  };

  const handleEdit = (skill: typeof skills[0]) => {
    setEditingId(skill.id);
    setValue('name', skill.name);
    setValue('level', skill.level || 'intermediate');
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    reset();
  };

  const handleDelete = (id: string) => {
    removeSkill(id);
  };

  const renderForm = () => (
    <Card className="p-4 border-2 border-dashed border-primary/20">
      <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
        <div>
          <Label htmlFor="name">Skill Name *</Label>
          <Input
            id="name"
            {...register('name', { required: true })}
            placeholder="JavaScript, React, Project Management, etc."
          />
        </div>

        <div>
          <Label htmlFor="level">Proficiency Level</Label>
          <Select value={watchedLevel} onValueChange={(value) => setValue('level', value as SkillForm['level'])}>
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button type="submit" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
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
        <h2 className="text-xl font-semibold">Skills</h2>
        <Button 
          onClick={() => setIsAdding(true)} 
          size="sm"
          disabled={isAdding || editingId !== null}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {isAdding && renderForm()}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <div key={skill.id}>
            {editingId === skill.id ? (
              renderForm()
            ) : (
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{skill.name}</h3>
                    {skill.level && (
                      <p className="text-sm text-muted-foreground capitalize">
                        {skill.level}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(skill)}
                      disabled={editingId !== null || isAdding}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(skill.id)}
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
    </div>
  );
};
