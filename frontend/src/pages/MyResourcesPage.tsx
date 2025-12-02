import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

interface Resource {
  id: number;
  title: string;
  description: string;
  status: string;
  tags?: Array<{ id: number; name: string }>;
  file?: string;
  created_at?: string;
}

const MyResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await api.get('/library/resources/my/');
        setResources(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    try {
      await api.delete(`/library/resources/${id}/`);
      setResources(resources.filter((resource) => resource.id !== id));
    } catch (error) {
      console.error(error);
      alert('Failed to delete resource');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'badge-pending',
      approved: 'badge-approved',
      rejected: 'badge-rejected',
    };
    return badges[status] || 'badge-pending';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="page-container">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
        <h1 className="page-title" style={{ margin: 0 }}>
          My Resources
        </h1>
        <Link to="/add-resource" className="btn btn-primary">
          Add New Resource
        </Link>
      </div>

      {loading ? (
        <div className="loading">Loading your resources...</div>
      ) : resources.length === 0 ? (
        <div className="empty-state">
          <h3>No resources yet</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Start sharing your educational resources with the community
          </p>
          <Link to="/add-resource" className="btn btn-primary">
            Add Your First Resource
          </Link>
        </div>
      ) : (
        <div className="grid grid-2">
          {resources.map((resource) => (
            <div key={resource.id} className="card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem',
                }}>
                <h2 className="card-title" style={{ margin: 0, flex: 1 }}>
                  {resource.title}
                </h2>
                <span className={`badge ${getStatusBadge(resource.status)}`}>
                  {resource.status}
                </span>
              </div>
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

              {resource.created_at && (
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                  Created: {formatDate(resource.created_at)}
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
                <button onClick={() => handleDelete(resource.id)} className="btn btn-danger btn-sm">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyResourcesPage;
