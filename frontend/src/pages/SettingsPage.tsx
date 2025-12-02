import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  user_type: string;
  is_approved?: boolean;
  is_staff?: boolean;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  status: string;
  created_at?: string;
}

const SettingsPage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileResponse, resourcesResponse] = await Promise.all([
          api.get('/users/profile/me/'),
          api.get('/library/resources/my/')
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

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'badge-pending',
      approved: 'badge-approved',
      rejected: 'badge-rejected',
    };
    return badges[status] || 'badge-pending';
  };

  const handleLogout = () => {
    auth?.logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading settings...</div>
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

  const pendingResources = resources.filter(r => r.status === 'pending');
  const approvedResources = resources.filter(r => r.status === 'approved');
  const rejectedResources = resources.filter(r => r.status === 'rejected');

  return (
    <div className="page-container">
      <h1 className="page-title">Settings</h1>

      <div style={{ maxWidth: '800px' }}>
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--gray-900)' }}>Account Information</h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Username</label>
            <div style={{
              padding: '0.75rem',
              background: 'var(--gray-50)',
              borderRadius: '8px',
              fontSize: '1.125rem',
              color: 'var(--gray-900)'
            }}>
              {profile.username}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Email</label>
            <div style={{
              padding: '0.75rem',
              background: 'var(--gray-50)',
              borderRadius: '8px',
              fontSize: '1.125rem',
              color: 'var(--gray-900)'
            }}>
              {profile.email}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Account Type</label>
            <div style={{
              padding: '0.75rem',
              background: 'var(--gray-50)',
              borderRadius: '8px',
              fontSize: '1.125rem',
              color: 'var(--gray-900)',
              textTransform: 'capitalize'
            }}>
              {profile.user_type}
            </div>
          </div>

          {profile.is_approved !== undefined && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Approval Status</label>
              <div>
                <span className={`badge ${profile.is_approved ? 'badge-approved' : 'badge-pending'}`}>
                  {profile.is_approved ? 'Approved' : 'Pending Approval'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--gray-900)' }}>Resource Status</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
                {pendingResources.length}
              </div>
              <div style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>Pending</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                {approvedResources.length}
              </div>
              <div style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>Approved</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger)' }}>
                {rejectedResources.length}
              </div>
              <div style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>Rejected</div>
            </div>
          </div>

          {pendingResources.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--gray-700)' }}>Pending Resources</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pendingResources.map(resource => (
                  <div key={resource.id} style={{
                    padding: '1rem',
                    background: 'var(--gray-50)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{resource.title}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                        {resource.created_at && new Date(resource.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`badge ${getStatusBadge(resource.status)}`}>
                      {resource.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--gray-900)' }}>Account Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/profile" className="btn btn-secondary">
              View Profile
            </Link>
            <Link to="/my-resources" className="btn btn-secondary">
              My Resources
            </Link>
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

