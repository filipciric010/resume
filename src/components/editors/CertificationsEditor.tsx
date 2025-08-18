
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useResume } from '@/store/useResume';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface CertificationForm {
  certification: string;
}

export const CertificationsEditor: React.FC = () => {
  const { data, addCertification, updateCertification, removeCertification } = useResume();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const { register, handleSubmit, reset, setValue } = useForm<CertificationForm>();

  const certifications = data.certifications || [];

  const handleSave = (formData: CertificationForm) => {
    if (editingIndex !== null) {
      updateCertification(editingIndex, formData.certification);
      setEditingIndex(null);
    } else {
      addCertification(formData.certification);
      setIsAdding(false);
    }
    reset();
  };

  const handleEdit = (index: number, certification: string) => {
    setEditingIndex(index);
    setValue('certification', certification);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setIsAdding(false);
    reset();
  };

  const handleDelete = (index: number) => {
    removeCertification(index);
  };

  const renderForm = () => (
    <Card className="p-4 border-2 border-dashed border-primary/20">
      <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
        <div>
          <Label htmlFor="certification">Certification *</Label>
          <Input
            id="certification"
            {...register('certification', { required: true })}
            placeholder="AWS Solutions Architect, CompTIA Security+, etc."
          />
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
        <h2 className="text-xl font-semibold">Certifications</h2>
        <Button 
          onClick={() => setIsAdding(true)} 
          size="sm"
          disabled={isAdding || editingIndex !== null}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Certification
        </Button>
      </div>

      {isAdding && renderForm()}

      <div className="space-y-4">
        {certifications.map((certification, index) => (
          <div key={index}>
            {editingIndex === index ? (
              renderForm()
            ) : (
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm">{certification}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(index, certification)}
                      disabled={editingIndex !== null || isAdding}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(index)}
                      disabled={editingIndex !== null || isAdding}
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
