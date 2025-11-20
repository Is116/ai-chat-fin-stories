import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Edit2, Trash2, Save, X, Power, PowerOff, AlertCircle, Check } from 'lucide-react';

const PromptManager = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'backend_fallback',
    content: '',
    description: '',
    is_active: 1
  });

  const promptTypes = [
    { value: 'backend_fallback', label: 'Backend - Fallback Mode' },
    { value: 'backend_persona', label: 'Backend - Persona Mode' },
    { value: 'frontend', label: 'Frontend API' },
    { value: 'book_processor', label: 'Book Processor' },
    { value: 'character_extractor', label: 'Character Extractor' },
    { value: 'persona_generator', label: 'Persona Generator' }
  ];

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      setNeedsMigration(false);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3001/api/admin/prompts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.needsMigration) {
          setNeedsMigration(true);
          setError(data.error);
        } else {
          throw new Error(data.error || 'Failed to fetch prompts');
        }
        return;
      }

      setPrompts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      type: 'backend_fallback',
      content: '',
      description: '',
      is_active: 1
    });
    setIsCreating(true);
    setIsEditing(false);
    setSelectedPrompt(null);
  };

  const handleEdit = (prompt) => {
    setFormData({
      name: prompt.name,
      type: prompt.type,
      content: prompt.content,
      description: prompt.description || '',
      is_active: prompt.is_active
    });
    setSelectedPrompt(prompt);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = isCreating 
        ? 'http://localhost:3001/api/admin/prompts'
        : `http://localhost:3001/api/admin/prompts/${selectedPrompt.id}`;
      
      const method = isCreating ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save prompt');
      }

      setSuccessMessage(isCreating ? 'Prompt created successfully!' : 'Prompt updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      await fetchPrompts();
      handleCancel();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (promptId) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3001/api/admin/prompts/${promptId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete prompt');

      setSuccessMessage('Prompt deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      await fetchPrompts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (promptId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3001/api/admin/prompts/${promptId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to toggle prompt status');

      await fetchPrompts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setSelectedPrompt(null);
    setFormData({
      name: '',
      type: 'backend_fallback',
      content: '',
      description: '',
      is_active: 1
    });
  };

  const filteredPrompts = filterType === 'all' 
    ? prompts 
    : prompts.filter(p => p.type === filterType);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Show migration needed message
  if (needsMigration) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-purple-600" />
              Prompt Manager
            </h2>
            <p className="text-gray-600 mt-1">Manage AI prompts and instructions</p>
          </div>
        </div>

        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-orange-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Migration Required</h3>
          <p className="text-gray-700 mb-6">
            The prompts table hasn't been created yet. Please run the migration to set up the database.
          </p>
          
          <div className="bg-white rounded-lg p-6 text-left max-w-2xl mx-auto mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Run these commands in your terminal:</p>
            <div className="space-y-2">
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                node server/migrate-add-prompts.js
              </div>
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                node server/seed-prompts.js
              </div>
            </div>
          </div>

          <button
            onClick={fetchPrompts}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry After Migration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            Prompt Manager
          </h2>
          <p className="text-gray-600 mt-1">Manage AI prompts and instructions</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          New Prompt
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setFilterType('all')}
          className={`px-5 py-2.5 rounded-lg transition-colors font-medium ${
            filterType === 'all'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Types
        </button>
        {promptTypes.map(type => (
          <button
            key={type.value}
            onClick={() => setFilterType(type.value)}
            className={`px-5 py-2.5 rounded-lg transition-colors font-medium ${
              filterType === type.value
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(isCreating || isEditing) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                {isCreating ? 'Create New Prompt' : 'Edit Prompt'}
              </h3>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="e.g., fallback_personality_instructions"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  {promptTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Brief description of what this prompt does"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={16}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm transition-all"
                  placeholder="Enter the prompt content..."
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active === 1}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked ? 1 : 0})}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">
                  Active (prompt will be used by AI services)
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleSave}
                  disabled={!formData.name || !formData.content}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  Save Prompt
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prompts List */}
      <div className="grid gap-6">
        {filteredPrompts.map(prompt => (
          <div
            key={prompt.id}
            className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 ${
              prompt.is_active ? 'border-green-500' : 'border-gray-300'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{prompt.name}</h3>
                  {prompt.is_active ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                      <Power className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full flex items-center gap-1">
                      <PowerOff className="w-3 h-3" />
                      Inactive
                    </span>
                  )}
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span className="font-semibold text-purple-600">{promptTypes.find(t => t.value === prompt.type)?.label}</span>
                  {prompt.description && <span>• {prompt.description}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(prompt.id)}
                  className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title={prompt.is_active ? 'Deactivate' : 'Activate'}
                >
                  {prompt.is_active ? <PowerOff className="w-5 h-5" /> : <Power className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => handleEdit(prompt)}
                  className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(prompt.id)}
                  className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                {prompt.content}
              </pre>
            </div>

            <div className="text-xs text-gray-500 mt-3 flex items-center gap-2">
              <span>Last updated: {new Date(prompt.updated_at).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredPrompts.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Sparkles className="w-20 h-20 mx-auto mb-4 opacity-20" />
          <p className="text-xl font-semibold">No prompts found</p>
          <p className="text-sm mt-2">Create your first prompt to get started</p>
        </div>
      )}
    </div>
  );
};

export default PromptManager;
