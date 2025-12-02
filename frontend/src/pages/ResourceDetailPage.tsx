import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

interface Resource {
  id: number;
  title: string;
  description: string;
  file?: string;
  tags?: Array<{ id: number; name: string }>;
  owner?: string;
  status?: string;
  created_at?: string;
}

const ResourceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await api.get(`/library/resources/${id}/`);
        setResource(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const checkSaved = async () => {
      if (auth?.isAuthenticated) {
        try {
          const response = await api.get('/library/resources/saved/');
          const savedIds = response.data.map((r: Resource) => r.id);
          setSaved(savedIds.includes(Number(id)));
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchResource();
    checkSaved();
  }, [id, auth?.isAuthenticated]);

  const handleSave = async () => {
    if (!auth?.isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await api.post(`/library/resources/${id}/save/`);
      setSaved(!saved);
    } catch (error) {
      console.error(error);
    }
  };

  const getFileType = (fileUrl: string) => {
    const extension = fileUrl.split('.').pop()?.toLowerCase();
    if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension || '')) {
      return 'video';
    }
    if (['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(extension || '')) {
      return 'audio';
    }
    return 'file';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading resource...</div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h3>Resource not found</h3>
          <Link to="/" className="btn btn-primary">Back to Library</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>
        ← Back
      </button>

      <h1 className="page-title">{resource.title}</h1>

      <div style={{ marginBottom: '2rem' }}>
        <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem', lineHeight: '1.8' }}>
          {resource.description}
        </p>
      </div>

      {resource.tags && resource.tags.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--gray-700)' }}>Tags</h3>
          <div className="tag-list">
            {resource.tags.map(tag => (
              <span key={tag.id} className="tag">{tag.name}</span>
            ))}
          </div>
        </div>
      )}

      {resource.file && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--gray-700)' }}>File</h3>
          {getFileType(resource.file) === 'video' ? (
            <video controls style={{ width: '100%', maxWidth: '800px', borderRadius: '8px' }}>
              <source src={`http://localhost:8000${resource.file}`} />
              Your browser does not support the video tag.
            </video>
          ) : getFileType(resource.file) === 'audio' ? (
            <audio controls style={{ width: '100%', maxWidth: '600px' }}>
              <source src={`http://localhost:8000${resource.file}`} />
              Your browser does not support the audio tag.
            </audio>
          ) : (
            <div>
              <a
                href={`http://localhost:8000${resource.file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Download File
              </a>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
        {auth?.isAuthenticated && (
          <button
            onClick={handleSave}
            className={saved ? 'btn btn-secondary' : 'btn btn-success'}
          >
            {saved ? 'Saved' : 'Save Resource'}
          </button>
        )}
        {resource.owner && (
          <p style={{ color: 'var(--gray-500)', alignSelf: 'center' }}>
            By: {resource.owner}
          </p>
        )}
        {resource.created_at && (
          <p style={{ color: 'var(--gray-500)', alignSelf: 'center' }}>
            Created: {new Date(resource.created_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResourceDetailPage;

