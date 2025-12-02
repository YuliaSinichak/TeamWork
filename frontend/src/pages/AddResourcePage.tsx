import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

interface Tag {
  id: number;
  name: string;
}

const AddResourcePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.get('/library/tags/');
        setTags(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTags();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (file) {
      formData.append('file', file);
    }
    selectedTags.forEach(tagId => formData.append('tags', String(tagId)));

    try {
      await api.post('/library/resources/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/my-resources');
    } catch (error: any) {
      const errorMsg = error.response?.data;
      if (typeof errorMsg === 'object') {
        const messages = Object.values(errorMsg).flat();
        setError(messages.join(', '));
      } else {
        setError(errorMsg || 'Failed to add resource. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleTagChange = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <div className="page-container" style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <h1 className="page-title">Add New Resource</h1>
      <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
        Share your educational resources with the community
      </p>

      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{
            padding: '1rem',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Title *</label>
          <input 
            type="text" 
            className="input"
            placeholder="Enter resource title" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea 
            className="textarea"
            placeholder="Describe your resource..." 
            value={description} 
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">File</label>
          <div className="file-input-wrapper">
            <input 
              type="file" 
              id="file-input"
              onChange={e => setFile(e.target.files ? e.target.files[0] : null)} 
            />
            <label 
              htmlFor="file-input" 
              className={`file-input-label ${file ? 'has-file' : ''}`}
            >
              {file ? file.name : 'Click to upload or drag and drop'}
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Tags</label>
          <div className="checkbox-group">
            {tags.map(tag => (
              <div key={tag.id} className="checkbox-item">
                <input 
                  type="checkbox" 
                  id={`tag-${tag.id}`}
                  checked={selectedTags.includes(tag.id)} 
                  onChange={() => handleTagChange(tag.id)} 
                />
                <label htmlFor={`tag-${tag.id}`} style={{ cursor: 'pointer' }}>
                  {tag.name}
                </label>
              </div>
            ))}
          </div>
          {tags.length === 0 && (
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
              No tags available
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ flex: 1 }}
          >
            {loading ? 'Adding...' : 'Add Resource'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/my-resources')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddResourcePage;
