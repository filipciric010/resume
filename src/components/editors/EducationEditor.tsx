
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useResume, type Education } from '@/store/useResume';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

export const EducationEditor: React.FC = () => {
  const { data, addEducation, updateEducation, removeEducation } = useResume();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const { register, handleSubmit, reset } = useForm<Education>();

  const handleSave = (data: Education) => {
    if (editingId) {
      updateEducation(editingId, data);
      setEditingId(null);
    } else {
      addEducation(data);
      setIsAdding(false);
    }
    reset();
  };

  const handleEdit = (education: Education) => {
    setEditingId(education.id);
    reset(education);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    reset();
  };

  const handleDelete = (id: string) => {
    removeEducation(id);
  };

  const renderForm = () => (
    <Card className="p-4 border-2 border-dashed border-primary/20">
      <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
        <div>
          <Label htmlFor="school">School/Institution *</Label>
          <Input
            id="school"
            {...register('school', { required: true })}
            placeholder="University of California, Berkeley"
          />
        </div>

        <div>
          <Label htmlFor="degree">Degree *</Label>
          <Input
            id="degree"
            {...register('degree', { required: true })}
            placeholder="Bachelor of Science in Computer Science"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start">Start Date *</Label>
            <Input
              id="start"
              type="month"
              {...register('start', { required: true })}
            />
          </div>
          <div>
            <Label htmlFor="end">End Date</Label>
            <Input
              id="end"
              type="month"
              {...register('end')}
              placeholder="Leave blank if current"
            />
          </div>
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
        <h2 className="text-xl font-semibold">Education</h2>
        <Button 
          onClick={() => setIsAdding(true)} 
          size="sm"
          disabled={isAdding || editingId !== null}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Education
        </Button>
      </div>

      {isAdding && renderForm()}

      <div className="space-y-4">
        {data.education.map((edu) => (
          <div key={edu.id}>
            {editingId === edu.id ? (
              renderForm()
            ) : (
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{edu.degree}</h3>
                    <p className="text-primary font-medium">{edu.school}</p>
                    <p className="text-sm text-muted-foreground">
                      {edu.start} - {edu.end || 'Present'}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(edu)}
                      disabled={editingId !== null || isAdding}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(edu.id)}
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
