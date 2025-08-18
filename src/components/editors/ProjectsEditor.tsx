
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useResume, type ResumeData } from '@/store/useResume';
import { Plus, Edit, Trash2, Save, X, ExternalLink } from 'lucide-react';

type Project = ResumeData['projects'][0];

export const ProjectsEditor: React.FC = () => {
  const { data, addProject, updateProject, removeProject } = useResume();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const { register, handleSubmit, reset } = useForm<Project>();

  const projects = data.projects || [];

  const handleSave = (formData: Project & { technologies: string }) => {
    const projectData = {
      name: formData.name,
      description: formData.description,
      technologies: formData.technologies.split(',').map(t => t.trim()).filter(t => t),
      url: formData.url
    };

    if (editingId) {
      updateProject(editingId, projectData);
      setEditingId(null);
    } else {
      addProject(projectData);
      setIsAdding(false);
    }
    reset();
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    reset({
      ...project,
      technologies: project.technologies.join(', ')
    } as Project & { technologies: string });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    reset();
  };

  const handleDelete = (id: string) => {
    removeProject(id);
  };

  const renderForm = () => (
    <Card className="p-4 border-2 border-dashed border-primary/20">
      <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
        <div>
          <Label htmlFor="name">Project Name *</Label>
          <Input
            id="name"
            {...register('name', { required: true })}
            placeholder="E-commerce Platform"
          />
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            {...register('description', { required: true })}
            placeholder="A full-stack e-commerce solution with payment integration..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="technologies">Technologies (comma-separated) *</Label>
          <Input
            id="technologies"
            {...register('technologies', { required: true })}
            placeholder="React, Node.js, MongoDB, Stripe"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="url">Live URL</Label>
            <Input
              id="url"
              {...register('url')}
              placeholder="https://myproject.com"
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
        <h2 className="text-xl font-semibold">Projects</h2>
        <Button 
          onClick={() => setIsAdding(true)} 
          size="sm"
          disabled={isAdding || editingId !== null}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      {isAdding && renderForm()}

      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id}>
            {editingId === project.id ? (
              renderForm()
            ) : (
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                    <p className="text-sm text-gray-700 mb-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {project.technologies.map((tech, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      {project.url && (
                        <a 
                          href={project.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(project)}
                      disabled={editingId !== null || isAdding}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(project.id)}
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
