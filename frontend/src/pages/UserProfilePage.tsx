import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  user_type: string;
  is_approved?: boolean;
  date_joined?: string;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  status: string;
  views_count?: number;
  downloads_count?: number;
  created_at?: string;
  tags?: Array<{ id: number; name: string }>;
}

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileResponse, resourcesResponse] = await Promise.all([
          api.get(`/users/users/${id}/`),
          api.get(`/library/resources/user_resources/?user_id=${id}`)
        ]);
        setProfile(profileResponse.data);
        setResources(resourcesResponse.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h3>User not found</h3>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const approvedResources = resources.filter(r => r.status === 'approved');
  const totalViews = approvedResources.reduce((sum, r) => sum + (r.views_count || 0), 0);
  const totalDownloads = approvedResources.reduce((sum, r) => sum + (r.downloads_count || 0), 0);

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>
        ← Back
      </button>

      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">{profile.username}</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
          <span className={`badge ${profile.is_approved ? 'badge-approved' : 'badge-pending'}`}>
            {profile.user_type.charAt(0).toUpperCase() + profile.user_type.slice(1)}
          </span>
          {profile.is_approved !== undefined && (
            <span className={`badge ${profile.is_approved ? 'badge-approved' : 'badge-pending'}`}>
              {profile.is_approved ? 'Approved' : 'Pending'}
            </span>
          )}
          {profile.date_joined && (
            <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
              Joined: {new Date(profile.date_joined).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
            {approvedResources.length}
          </div>
          <div style={{ color: 'var(--gray-600)', fontWeight: 500 }}>Published Resources</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--success)', marginBottom: '0.5rem' }}>
            {totalViews}
          </div>
          <div style={{ color: 'var(--gray-600)', fontWeight: 500 }}>Total Views</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--info)', marginBottom: '0.5rem' }}>
            {totalDownloads}
          </div>
          <div style={{ color: 'var(--gray-600)', fontWeight: 500 }}>Total Downloads</div>
        </div>
      </div>

      <div>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--gray-900)' }}>
          Published Resources ({approvedResources.length})
        </h2>
        {approvedResources.length === 0 ? (
          <div className="empty-state">
            <h3>No published resources</h3>
            <p>This user hasn't published any resources yet</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {approvedResources.map((resource) => (
              <div key={resource.id} className="card">
                <Link to={`/resource/${resource.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h2 className="card-title" style={{ cursor: 'pointer', color: 'var(--primary)' }}>
                    {resource.title}
                  </h2>
                </Link>
                <p className="card-description">{resource.description}</p>
                
                {resource.tags && resource.tags.length > 0 && (
                  <div className="tag-list">
                    {resource.tags.map(tag => (
                      <span key={tag.id} className="tag">{tag.name}</span>
                    ))}
                  </div>
                )}

                <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {resource.views_count !== undefined && (
                    <span>Views: {resource.views_count}</span>
                  )}
                  {resource.downloads_count !== undefined && (
                    <span>Downloads: {resource.downloads_count}</span>
                  )}
                  {resource.created_at && (
                    <span>Created: {new Date(resource.created_at).toLocaleDateString()}</span>
                  )}
                </div>

                <div className="card-actions" style={{ marginTop: '1rem' }}>
                  <Link to={`/resource/${resource.id}`} className="btn btn-primary btn-sm">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;

