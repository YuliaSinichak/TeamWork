import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import './ProfilePage.css';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  user_type: string;
  is_approved?: boolean;
  is_staff?: boolean;
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

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileResponse, resourcesResponse] = await Promise.all([
          api.get('/users/users/me/'),
          api.get('/library/resources/my/'),
        ]);
        setProfile(profileResponse.data);
        setResources(resourcesResponse.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    auth?.logout();
    navigate('/login');
  };

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
          <h3>Failed to load profile</h3>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const approvedCount = resources.filter((r) => r.status === 'approved').length;
  const pendingCount = resources.filter((r) => r.status === 'pending').length;
  const rejectedCount = resources.filter((r) => r.status === 'rejected').length;
  const totalCount = resources.length;

  const recentResources = resources
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const totalViews = resources
    .filter((r) => r.status === 'approved')
    .reduce((sum, r) => sum + (r.views_count || 0), 0);
  const totalDownloads = resources
    .filter((r) => r.status === 'approved')
    .reduce((sum, r) => sum + (r.downloads_count || 0), 0);

  return (
    <div className="page-container">
      <div className="profile-header">
        <div className="profile-avatar">{getInitials(profile.username)}</div>
        <div className="profile-info">
          <h1 className="profile-name">{profile.username}</h1>
          <p className="profile-email">{profile.email}</p>
          <div className="profile-badges">
            <span
              className={`profile-badge ${
                profile.user_type === 'teacher' ? 'badge-teacher' : 'badge-student'
              }`}>
              {profile.user_type === 'teacher' ? 'Teacher' : 'Student'}
            </span>
            {profile.is_approved !== undefined && (
              <span
                className={`profile-badge ${
                  profile.is_approved ? 'badge-approved' : 'badge-pending'
                }`}>
                {profile.is_approved ? 'Approved' : 'Pending'}
              </span>
            )}
            {profile.is_staff && <span className="profile-badge badge-admin">Administrator</span>}
          </div>
        </div>
      </div>

      <div className="profile-stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-value">{totalCount}</div>
          <div className="stat-label">Total Resources</div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-value">{approvedCount}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-value">{totalViews}</div>
          <div className="stat-label">Total Views</div>
        </div>
        <div className="stat-card stat-secondary">
          <div className="stat-value">{totalDownloads}</div>
          <div className="stat-label">Downloads</div>
        </div>
        {rejectedCount > 0 && (
          <div className="stat-card stat-danger">
            <div className="stat-value">{rejectedCount}</div>
            <div className="stat-label">Rejected</div>
          </div>
        )}
      </div>

      <div className="profile-content-grid">
        <div className="profile-section">
          <h2 className="section-title">Account Details</h2>
          <div className="info-card">
            <div className="info-item">
              <span className="info-label">Username</span>
              <span className="info-value">{profile.username}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{profile.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Account Type</span>
              <span className="info-value" style={{ textTransform: 'capitalize' }}>
                {profile.user_type}
              </span>
            </div>
            {profile.date_joined && (
              <div className="info-item">
                <span className="info-label">Member Since</span>
                <span className="info-value">
                  {new Date(profile.date_joined).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/my-resources" className="action-card action-primary">
              <div className="action-text">My Resources</div>
            </Link>
            <Link to="/add-resource" className="action-card action-success">
              <div className="action-text">Add Resource</div>
            </Link>
            <Link to="/saved-resources" className="action-card action-info">
              <div className="action-text">Saved</div>
            </Link>
            {profile.is_staff && (
              <Link to="/admin" className="action-card action-admin">
                <div className="action-text">Admin Panel</div>
              </Link>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-danger"
            style={{ width: '100%', marginTop: '1rem' }}>
            Logout
          </button>
        </div>
      </div>

      {recentResources.length > 0 && (
        <div className="profile-section">
          <h2 className="section-title">Recent Resources</h2>
          <div className="resources-list">
            {recentResources.map((resource) => (
              <div key={resource.id} className="resource-item">
                <div className="resource-content">
                  <h3 className="resource-title">{resource.title}</h3>
                  {resource.description && (
                    <p className="resource-description">{resource.description}</p>
                  )}
                  <div className="resource-meta">
                    {resource.created_at && (
                      <span className="resource-date">
                        {new Date(resource.created_at).toLocaleDateString()}
                      </span>
                    )}
                    {resource.views_count !== undefined && (
                      <span className="resource-stat">Views: {resource.views_count}</span>
                    )}
                    {resource.downloads_count !== undefined && (
                      <span className="resource-stat">Downloads: {resource.downloads_count}</span>
                    )}
                  </div>
                </div>
                <div className="resource-status">
                  <span
                    className={`badge ${
                      resource.status === 'approved'
                        ? 'badge-approved'
                        : resource.status === 'pending'
                        ? 'badge-pending'
                        : 'badge-rejected'
                    }`}>
                    {resource.status}
                  </span>
                  <Link
                    to={`/resource/${resource.id}`}
                    className="btn btn-sm btn-primary"
                    style={{ marginTop: '0.5rem' }}>
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
