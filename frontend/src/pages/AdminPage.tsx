import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  email: string;
  user_type: string;
  is_approved: boolean;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  owner: string;
  status: string;
  created_at?: string;
  tags?: Array<{ id: number; name: string }>;
}

const AdminPage: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [pendingResources, setPendingResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'resources'>('users');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, resourcesResponse] = await Promise.all([
          api.get('/users/users/pending/'),
          api.get('/library/resources/pending/')
        ]);
        setPendingUsers(usersResponse.data);
        setPendingResources(resourcesResponse.data);
      } catch (error: any) {
        if (error.response?.status === 403) {
          navigate('/');
        }
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleApproveUser = async (userId: number) => {
    try {
      await api.post(`/users/users/${userId}/approve/`);
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
    } catch (error) {
      console.error(error);
      alert('Failed to approve user');
    }
  };

  const handleRejectUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to reject this user?')) {
      return;
    }
    try {
      await api.post(`/users/users/${userId}/reject/`);
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
    } catch (error) {
      console.error(error);
      alert('Failed to reject user');
    }
  };

  const handleApproveResource = async (resourceId: number) => {
    try {
      await api.post(`/library/resources/${resourceId}/approve/`);
      setPendingResources(pendingResources.filter(r => r.id !== resourceId));
    } catch (error) {
      console.error(error);
      alert('Failed to approve resource');
    }
  };

  const handleRejectResource = async (resourceId: number) => {
    if (!window.confirm('Are you sure you want to reject this resource?')) {
      return;
    }
    try {
      await api.post(`/library/resources/${resourceId}/reject/`);
      setPendingResources(pendingResources.filter(r => r.id !== resourceId));
    } catch (error) {
      console.error(error);
      alert('Failed to reject resource');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Admin Panel</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--gray-200)' }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: activeTab === 'users' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'users' ? 'var(--white)' : 'var(--gray-700)',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'users' ? '3px solid var(--primary)' : '3px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Pending Users ({pendingUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: activeTab === 'resources' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'resources' ? 'var(--white)' : 'var(--gray-700)',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'resources' ? '3px solid var(--primary)' : '3px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Pending Resources ({pendingResources.length})
        </button>
      </div>

      {activeTab === 'users' && (
        <div>
          {pendingUsers.length === 0 ? (
            <div className="empty-state">
              <h3>No pending users</h3>
              <p>All teacher accounts have been reviewed</p>
            </div>
          ) : (
            <div className="grid grid-2">
              {pendingUsers.map(user => (
                <div key={user.id} className="card">
                  <h2 className="card-title">{user.username}</h2>
                  <p className="card-description" style={{ marginBottom: '0.5rem' }}>
                    {user.email}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '1rem', textTransform: 'capitalize' }}>
                    Type: {user.user_type}
                  </p>
                  <div className="card-actions">
                    <button
                      onClick={() => handleApproveUser(user.id)}
                      className="btn btn-success btn-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectUser(user.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'resources' && (
        <div>
          {pendingResources.length === 0 ? (
            <div className="empty-state">
              <h3>No pending resources</h3>
              <p>All resources have been reviewed</p>
            </div>
          ) : (
            <div className="grid grid-2">
              {pendingResources.map(resource => (
                <div key={resource.id} className="card">
                  <h2 className="card-title">{resource.title}</h2>
                  <p className="card-description">{resource.description}</p>
                  
                  {resource.tags && resource.tags.length > 0 && (
                    <div className="tag-list">
                      {resource.tags.map(tag => (
                        <span key={tag.id} className="tag">{tag.name}</span>
                      ))}
                    </div>
                  )}

                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                    By: {resource.owner}
                    {resource.created_at && ` • ${new Date(resource.created_at).toLocaleDateString()}`}
                  </p>

                  <div className="card-actions" style={{ marginTop: '1rem' }}>
                    <button
                      onClick={() => handleApproveResource(resource.id)}
                      className="btn btn-success btn-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectResource(resource.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;

