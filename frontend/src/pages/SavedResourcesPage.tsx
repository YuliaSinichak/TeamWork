import React, { useEffect, useState } from 'react';
import api from '../api';

interface Resource {
  id: number;
  title: string;
  description: string;
  tags?: Array<{ id: number; name: string }>;
  file?: string;
  owner?: string;
}

const SavedResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedResources = async () => {
      try {
        const response = await api.get('/library/resources/saved/');
        setResources(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedResources();
  }, []);

  const handleUnsave = async (id: number) => {
    try {
      await api.post(`/library/resources/${id}/save/`);
      setResources(resources.filter((resource) => resource.id !== id));
    } catch (error) {
      console.error(error);
      alert('Failed to unsave resource');
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Saved Resources</h1>
      <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
        Your collection of saved educational resources
      </p>

      {loading ? (
        <div className="loading">Loading saved resources...</div>
      ) : resources.length === 0 ? (
        <div className="empty-state">
          <h3>No saved resources</h3>
          <p>Start saving resources from the home page to see them here</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {resources.map((resource) => (
            <div key={resource.id} className="card">
              <h2 className="card-title">{resource.title}</h2>
              <p className="card-description">{resource.description}</p>

              {resource.tags && resource.tags.length > 0 && (
                <div className="tag-list">
                  {resource.tags.map((tag) => (
                    <span key={tag.id} className="tag">
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {resource.owner && (
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                  By: {resource.owner}
                </p>
              )}

              <div className="card-actions" style={{ marginTop: '1rem' }}>
                {resource.file && (
                  <a
                    href={`http://localhost:8000${resource.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm">
                    Download
                  </a>
                )}
                <button
                  onClick={() => handleUnsave(resource.id)}
                  className="btn btn-secondary btn-sm">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedResourcesPage;
