import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  email: string;
  user_type: string;
  is_approved: boolean;
  is_staff?: boolean;
  is_blocked?: boolean;
  block_reason?: string;
  date_joined?: string;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  owner: string;
  owner_id?: number;
  status: string;
  views_count?: number;
  downloads_count?: number;
  is_hidden?: boolean;
  is_problematic?: boolean;
  created_at?: string;
  tags?: Array<{ id: number; name: string }>;
}

interface UserStats {
  total_users: number;
  students: number;
  teachers: number;
  approved_teachers: number;
  pending_teachers: number;
  staff_users: number;
  blocked_users?: number;
}

interface ResourceStats {
  total_resources: number;
  approved: number;
  pending: number;
  rejected: number;
  hidden?: number;
  problematic?: number;
  total_views?: number;
  total_downloads?: number;
  top_tags: Array<{ tags__name: string; count: number }>;
}

const AdminPage: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [pendingResources, setPendingResources] = useState<Resource[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [resourceStats, setResourceStats] = useState<ResourceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'resources' | 'analytics'>(
    'dashboard',
  );
  const [resourceStatusFilter, setResourceStatusFilter] = useState<string>('all');
  const [resourceHiddenFilter, setResourceHiddenFilter] = useState<string>('all');
  const [resourceProblematicFilter, setResourceProblematicFilter] = useState<string>('all');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'resources') {
      fetchAllResources();
    }
  }, [activeTab, resourceStatusFilter, resourceHiddenFilter, resourceProblematicFilter]);

  const fetchData = async () => {
    try {
      const [usersResponse, resourcesResponse, statsResponse, resourceStatsResponse] =
        await Promise.all([
          api.get('/users/users/pending/'),
          api.get('/library/resources/pending/'),
          api.get('/users/users/stats/'),
          api.get('/library/resources/stats/'),
        ]);
      setPendingUsers(usersResponse.data);
      setPendingResources(resourcesResponse.data);
      setUserStats(statsResponse.data);
      setResourceStats(resourceStatsResponse.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        navigate('/');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await api.get('/users/users/all/');
      setAllUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAllResources = async () => {
    try {
      const params: any = {};
      if (resourceStatusFilter !== 'all') params.status = resourceStatusFilter;
      if (resourceHiddenFilter !== 'all') params.hidden = resourceHiddenFilter;
      if (resourceProblematicFilter !== 'all') params.problematic = resourceProblematicFilter;
      const response = await api.get('/library/resources/all/', { params });
      setAllResources(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchAllUsers();
    }
  }, [activeTab]);

  const handleApproveUser = async (userId: number) => {
    try {
      await api.post(`/users/users/${userId}/approve/`);
      setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
      await fetchData();
      if (activeTab === 'users') {
        await fetchAllUsers();
      }
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
      setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
      await fetchData();
      if (activeTab === 'users') {
        await fetchAllUsers();
      }
    } catch (error) {
      console.error(error);
      alert('Failed to reject user');
    }
  };

  const handleBlockUser = async () => {
    if (!selectedUserId || !blockReason.trim()) {
      alert('Please provide a reason for blocking');
      return;
    }
    try {
      await api.post(`/users/users/${selectedUserId}/block/`, { reason: blockReason });
      setShowBlockModal(false);
      setBlockReason('');
      setSelectedUserId(null);
      await fetchAllUsers();
      await fetchData();
    } catch (error) {
      console.error(error);
      alert('Failed to block user');
    }
  };

  const handleUnblockUser = async (userId: number) => {
    try {
      await api.post(`/users/users/${userId}/unblock/`);
      await fetchAllUsers();
      await fetchData();
    } catch (error) {
      console.error(error);
      alert('Failed to unblock user');
    }
  };

  const handleToggleStaff = async (userId: number) => {
    try {
      await api.post(`/users/users/${userId}/toggle_staff/`);
      await fetchAllUsers();
      await fetchData();
    } catch (error) {
      console.error(error);
      alert('Failed to change staff status');
    }
  };

  const handleApproveResource = async (resourceId: number) => {
    try {
      await api.post(`/library/resources/${resourceId}/approve/`);
      setPendingResources(pendingResources.filter((r) => r.id !== resourceId));
      await fetchData();
      if (activeTab === 'resources') {
        await fetchAllResources();
      }
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
      setPendingResources(pendingResources.filter((r) => r.id !== resourceId));
      await fetchData();
      if (activeTab === 'resources') {
        await fetchAllResources();
      }
    } catch (error) {
      console.error(error);
      alert('Failed to reject resource');
    }
  };

  const handleHideResource = async (resourceId: number) => {
    try {
      await api.post(`/library/resources/${resourceId}/hide/`);
      await fetchAllResources();
      await fetchData();
    } catch (error) {
      console.error(error);
      alert('Failed to hide resource');
    }
  };

  const handleUnhideResource = async (resourceId: number) => {
    try {
      await api.post(`/library/resources/${resourceId}/unhide/`);
      await fetchAllResources();
      await fetchData();
    } catch (error) {
      console.error(error);
      alert('Failed to unhide resource');
    }
  };

  const handleMarkProblematic = async (resourceId: number) => {
    try {
      await api.post(`/library/resources/${resourceId}/mark_problematic/`);
      await fetchAllResources();
      await fetchData();
    } catch (error) {
      console.error(error);
      alert('Failed to mark resource as problematic');
    }
  };

  const handleUnmarkProblematic = async (resourceId: number) => {
    try {
      await api.post(`/library/resources/${resourceId}/unmark_problematic/`);
      await fetchAllResources();
      await fetchData();
    } catch (error) {
      console.error(error);
      alert('Failed to unmark resource');
    }
  };

  const handleDeleteResource = async (resourceId: number) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this resource? This action cannot be undone.',
      )
    ) {
      return;
    }
    try {
      await api.post(`/library/resources/${resourceId}/delete/`);
      await fetchAllResources();
      await fetchData();
    } catch (error) {
      console.error(error);
      alert('Failed to delete resource');
    }
  };

  const filteredUsers = allUsers.filter((user) => {
    const searchLower = userSearchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

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

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '2px solid var(--gray-200)',
          flexWrap: 'wrap',
        }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: activeTab === 'dashboard' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'dashboard' ? 'var(--white)' : 'var(--gray-700)',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom:
              activeTab === 'dashboard' ? '3px solid var(--primary)' : '3px solid transparent',
            transition: 'all 0.2s',
          }}>
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: activeTab === 'users' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'users' ? 'var(--white)' : 'var(--gray-700)',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom:
              activeTab === 'users' ? '3px solid var(--primary)' : '3px solid transparent',
            transition: 'all 0.2s',
          }}>
          Users ({pendingUsers.length} pending)
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
            borderBottom:
              activeTab === 'resources' ? '3px solid var(--primary)' : '3px solid transparent',
            transition: 'all 0.2s',
          }}>
          Resources ({pendingResources.length} pending)
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: activeTab === 'analytics' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'analytics' ? 'var(--white)' : 'var(--gray-700)',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom:
              activeTab === 'analytics' ? '3px solid var(--primary)' : '3px solid transparent',
            transition: 'all 0.2s',
          }}>
          Analytics
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div>
          <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  marginBottom: '0.5rem',
                }}>
                {userStats?.total_users || 0}
              </div>
              <div style={{ color: 'var(--gray-600)', fontWeight: 500 }}>Total Users</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: 700,
                  color: 'var(--success)',
                  marginBottom: '0.5rem',
                }}>
                {resourceStats?.total_resources || 0}
              </div>
              <div style={{ color: 'var(--gray-600)', fontWeight: 500 }}>Total Resources</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: 700,
                  color: 'var(--warning)',
                  marginBottom: '0.5rem',
                }}>
                {pendingUsers.length + pendingResources.length}
              </div>
              <div style={{ color: 'var(--gray-600)', fontWeight: 500 }}>Pending Actions</div>
            </div>
          </div>

          <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
            <div className="card">
              <h2 style={{ marginBottom: '1rem', color: 'var(--gray-900)' }}>User Statistics</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Students:</span>
                  <strong>{userStats?.students || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Teachers:</span>
                  <strong>{userStats?.teachers || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Approved Teachers:</span>
                  <strong style={{ color: 'var(--success)' }}>
                    {userStats?.approved_teachers || 0}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Pending Teachers:</span>
                  <strong style={{ color: 'var(--warning)' }}>
                    {userStats?.pending_teachers || 0}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Staff Users:</span>
                  <strong style={{ color: 'var(--primary)' }}>{userStats?.staff_users || 0}</strong>
                </div>
                {userStats?.blocked_users !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Blocked Users:</span>
                    <strong style={{ color: 'var(--danger)' }}>{userStats.blocked_users}</strong>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <h2 style={{ marginBottom: '1rem', color: 'var(--gray-900)' }}>
                Resource Statistics
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Approved:</span>
                  <strong style={{ color: 'var(--success)' }}>
                    {resourceStats?.approved || 0}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Pending:</span>
                  <strong style={{ color: 'var(--warning)' }}>{resourceStats?.pending || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Rejected:</span>
                  <strong style={{ color: 'var(--danger)' }}>{resourceStats?.rejected || 0}</strong>
                </div>
                {resourceStats?.hidden !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Hidden:</span>
                    <strong style={{ color: 'var(--gray-500)' }}>{resourceStats.hidden}</strong>
                  </div>
                )}
                {resourceStats?.problematic !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Problematic:</span>
                    <strong style={{ color: 'var(--danger)' }}>{resourceStats.problematic}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {pendingUsers.length > 0 && (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h2 style={{ marginBottom: '1rem', color: 'var(--gray-900)' }}>
                Pending Users ({pendingUsers.length})
              </h2>
              <button onClick={() => setActiveTab('users')} className="btn btn-primary btn-sm">
                Review All Users
              </button>
            </div>
          )}

          {pendingResources.length > 0 && (
            <div className="card">
              <h2 style={{ marginBottom: '1rem', color: 'var(--gray-900)' }}>
                Pending Resources ({pendingResources.length})
              </h2>
              <button onClick={() => setActiveTab('resources')} className="btn btn-primary btn-sm">
                Review All Resources
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <div
            style={{
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}>
            <input
              type="text"
              className="input"
              placeholder="Search users by username or email..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              style={{ flex: 1, minWidth: '200px' }}
            />
            <button onClick={fetchAllUsers} className="btn btn-secondary">
              Refresh
            </button>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--gray-900)' }}>Pending Approval</h2>
            {pendingUsers.length === 0 ? (
              <div className="empty-state">
                <h3>No pending users</h3>
                <p>All teacher accounts have been reviewed</p>
              </div>
            ) : (
              <div className="grid grid-2">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="card">
                    <h2 className="card-title">{user.username}</h2>
                    <p className="card-description" style={{ marginBottom: '0.5rem' }}>
                      {user.email}
                    </p>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--gray-500)',
                        marginBottom: '1rem',
                        textTransform: 'capitalize',
                      }}>
                      Type: {user.user_type}
                    </p>
                    <div className="card-actions">
                      <button
                        onClick={() => handleApproveUser(user.id)}
                        className="btn btn-success btn-sm">
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectUser(user.id)}
                        className="btn btn-danger btn-sm">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 style={{ marginBottom: '1rem', color: 'var(--gray-900)' }}>
              All Users ({filteredUsers.length})
            </h2>
            {filteredUsers.length === 0 ? (
              <div className="empty-state">
                <h3>No users found</h3>
              </div>
            ) : (
              <div className="card">
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                          Username
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                          Email
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                          Type
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                          Status
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                          <td style={{ padding: '0.75rem' }}>
                            <Link
                              to={`/user/${user.id}`}
                              style={{
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                fontWeight: 500,
                              }}>
                              {user.username}
                            </Link>
                          </td>
                          <td style={{ padding: '0.75rem' }}>{user.email}</td>
                          <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>
                            {user.user_type}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <div
                              style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <span
                                className={`badge ${
                                  user.is_approved ? 'badge-approved' : 'badge-pending'
                                }`}>
                                {user.is_approved ? 'Approved' : 'Pending'}
                              </span>
                              {user.is_staff && (
                                <span
                                  className="badge badge-approved"
                                  style={{ fontSize: '0.75rem' }}>
                                  Staff
                                </span>
                              )}
                              {user.is_blocked && (
                                <span
                                  className="badge badge-rejected"
                                  style={{ fontSize: '0.75rem' }}>
                                  Blocked
                                </span>
                              )}
                            </div>
                            {user.is_blocked && user.block_reason && (
                              <div
                                style={{
                                  fontSize: '0.75rem',
                                  color: 'var(--gray-500)',
                                  marginTop: '0.25rem',
                                }}>
                                Reason: {user.block_reason}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {!user.is_approved && user.user_type === 'teacher' && (
                                <>
                                  <button
                                    onClick={() => handleApproveUser(user.id)}
                                    className="btn btn-success btn-sm">
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectUser(user.id)}
                                    className="btn btn-danger btn-sm">
                                    Reject
                                  </button>
                                </>
                              )}
                              {user.is_blocked ? (
                                <button
                                  onClick={() => handleUnblockUser(user.id)}
                                  className="btn btn-success btn-sm">
                                  Unblock
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedUserId(user.id);
                                    setShowBlockModal(true);
                                  }}
                                  className="btn btn-danger btn-sm">
                                  Block
                                </button>
                              )}
                              <button
                                onClick={() => handleToggleStaff(user.id)}
                                className="btn btn-secondary btn-sm">
                                {user.is_staff ? 'Remove Staff' : 'Make Staff'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div>
          <div
            style={{
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}>
            <select
              className="select"
              value={resourceStatusFilter}
              onChange={(e) => setResourceStatusFilter(e.target.value)}
              style={{ minWidth: '150px' }}>
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              className="select"
              value={resourceHiddenFilter}
              onChange={(e) => setResourceHiddenFilter(e.target.value)}
              style={{ minWidth: '150px' }}>
              <option value="all">All Visibility</option>
              <option value="false">Visible</option>
              <option value="true">Hidden</option>
            </select>
            <select
              className="select"
              value={resourceProblematicFilter}
              onChange={(e) => setResourceProblematicFilter(e.target.value)}
              style={{ minWidth: '150px' }}>
              <option value="all">All Resources</option>
              <option value="false">Normal</option>
              <option value="true">Problematic</option>
            </select>
            <button onClick={fetchAllResources} className="btn btn-secondary">
              Refresh
            </button>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--gray-900)' }}>Pending Approval</h2>
            {pendingResources.length === 0 ? (
              <div className="empty-state">
                <h3>No pending resources</h3>
                <p>All resources have been reviewed</p>
              </div>
            ) : (
              <div className="grid grid-2">
                {pendingResources.map((resource) => (
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

                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--gray-500)',
                        marginTop: '0.5rem',
                      }}>
                      By:{' '}
                      {resource.owner_id ? (
                        <Link
                          to={`/user/${resource.owner_id}`}
                          style={{
                            color: 'var(--primary)',
                            textDecoration: 'none',
                            fontWeight: 500,
                          }}>
                          {resource.owner}
                        </Link>
                      ) : (
                        resource.owner
                      )}
                      {resource.created_at &&
                        ` • ${new Date(resource.created_at).toLocaleDateString()}`}
                    </p>

                    <div className="card-actions" style={{ marginTop: '1rem' }}>
                      <button
                        onClick={() => handleApproveResource(resource.id)}
                        className="btn btn-success btn-sm">
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectResource(resource.id)}
                        className="btn btn-danger btn-sm">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 style={{ marginBottom: '1rem', color: 'var(--gray-900)' }}>
              All Resources ({allResources.length})
            </h2>
            {allResources.length === 0 ? (
              <div className="empty-state">
                <h3>No resources found</h3>
              </div>
            ) : (
              <div className="grid grid-2">
                {allResources.map((resource) => (
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
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                          alignItems: 'flex-end',
                        }}>
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
                        {resource.is_hidden && (
                          <span
                            className="badge"
                            style={{ background: '#6b7280', color: 'white', fontSize: '0.75rem' }}>
                            Hidden
                          </span>
                        )}
                        {resource.is_problematic && (
                          <span className="badge badge-rejected" style={{ fontSize: '0.75rem' }}>
                            Problematic
                          </span>
                        )}
                      </div>
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

                    <div
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--gray-500)',
                        marginTop: '0.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                      }}>
                      <div>
                        By:{' '}
                        {resource.owner_id ? (
                          <Link
                            to={`/user/${resource.owner_id}`}
                            style={{
                              color: 'var(--primary)',
                              textDecoration: 'none',
                              fontWeight: 500,
                            }}>
                            {resource.owner}
                          </Link>
                        ) : (
                          resource.owner
                        )}
                      </div>
                      {resource.created_at && (
                        <div>Created: {new Date(resource.created_at).toLocaleDateString()}</div>
                      )}
                      {resource.views_count !== undefined && (
                        <div>Views: {resource.views_count}</div>
                      )}
                      {resource.downloads_count !== undefined && (
                        <div>Downloads: {resource.downloads_count}</div>
                      )}
                    </div>

                    <div className="card-actions" style={{ marginTop: '1rem', flexWrap: 'wrap' }}>
                      {resource.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveResource(resource.id)}
                            className="btn btn-success btn-sm">
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectResource(resource.id)}
                            className="btn btn-danger btn-sm">
                            Reject
                          </button>
                        </>
                      )}
                      {resource.is_hidden ? (
                        <button
                          onClick={() => handleUnhideResource(resource.id)}
                          className="btn btn-success btn-sm">
                          Unhide
                        </button>
                      ) : (
                        <button
                          onClick={() => handleHideResource(resource.id)}
                          className="btn btn-secondary btn-sm">
                          Hide
                        </button>
                      )}
                      {resource.is_problematic ? (
                        <button
                          onClick={() => handleUnmarkProblematic(resource.id)}
                          className="btn btn-success btn-sm">
                          Unmark
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkProblematic(resource.id)}
                          className="btn btn-warning btn-sm"
                          style={{ background: 'var(--warning)', color: 'white' }}>
                          Mark Problematic
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteResource(resource.id)}
                        className="btn btn-danger btn-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div>
          <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
            <div className="card">
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--gray-900)' }}>User Analytics</h2>
              {userStats && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'var(--gray-50)',
                      borderRadius: '8px',
                    }}>
                    <span>Total Users:</span>
                    <strong>{userStats.total_users}</strong>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'var(--gray-50)',
                      borderRadius: '8px',
                    }}>
                    <span>Students:</span>
                    <strong>{userStats.students}</strong>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'var(--gray-50)',
                      borderRadius: '8px',
                    }}>
                    <span>Teachers:</span>
                    <strong>{userStats.teachers}</strong>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'var(--gray-50)',
                      borderRadius: '8px',
                    }}>
                    <span>Approved Teachers:</span>
                    <strong style={{ color: 'var(--success)' }}>
                      {userStats.approved_teachers}
                    </strong>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'var(--gray-50)',
                      borderRadius: '8px',
                    }}>
                    <span>Pending Teachers:</span>
                    <strong style={{ color: 'var(--warning)' }}>
                      {userStats.pending_teachers}
                    </strong>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'var(--gray-50)',
                      borderRadius: '8px',
                    }}>
                    <span>Staff Users:</span>
                    <strong style={{ color: 'var(--primary)' }}>{userStats.staff_users}</strong>
                  </div>
                  {userStats.blocked_users !== undefined && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        background: 'var(--gray-50)',
                        borderRadius: '8px',
                      }}>
                      <span>Blocked Users:</span>
                      <strong style={{ color: 'var(--danger)' }}>{userStats.blocked_users}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="card">
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--gray-900)' }}>
                Resource Analytics
              </h2>
              {resourceStats && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'var(--gray-50)',
                      borderRadius: '8px',
                    }}>
                    <span>Total Resources:</span>
                    <strong>{resourceStats.total_resources}</strong>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'var(--gray-50)',
                      borderRadius: '8px',
                    }}>
                    <span>Approved:</span>
                    <strong style={{ color: 'var(--success)' }}>{resourceStats.approved}</strong>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'var(--gray-50)',
                      borderRadius: '8px',
                    }}>
                    <span>Pending:</span>
                    <strong style={{ color: 'var(--warning)' }}>{resourceStats.pending}</strong>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'var(--gray-50)',
                      borderRadius: '8px',
                    }}>
                    <span>Rejected:</span>
                    <strong style={{ color: 'var(--danger)' }}>{resourceStats.rejected}</strong>
                  </div>
                  {resourceStats.hidden !== undefined && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        background: 'var(--gray-50)',
                        borderRadius: '8px',
                      }}>
                      <span>Hidden:</span>
                      <strong style={{ color: 'var(--gray-500)' }}>{resourceStats.hidden}</strong>
                    </div>
                  )}
                  {resourceStats.problematic !== undefined && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        background: 'var(--gray-50)',
                        borderRadius: '8px',
                      }}>
                      <span>Problematic:</span>
                      <strong style={{ color: 'var(--danger)' }}>
                        {resourceStats.problematic}
                      </strong>
                    </div>
                  )}
                  {resourceStats.total_views !== undefined && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        background: 'var(--gray-50)',
                        borderRadius: '8px',
                      }}>
                      <span>Total Views:</span>
                      <strong style={{ color: 'var(--primary)' }}>
                        {resourceStats.total_views}
                      </strong>
                    </div>
                  )}
                  {resourceStats.total_downloads !== undefined && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        background: 'var(--gray-50)',
                        borderRadius: '8px',
                      }}>
                      <span>Total Downloads:</span>
                      <strong style={{ color: 'var(--primary)' }}>
                        {resourceStats.total_downloads}
                      </strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {resourceStats && resourceStats.top_tags && resourceStats.top_tags.length > 0 && (
            <div className="card">
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--gray-900)' }}>Top Tags</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {resourceStats.top_tags.map((tag, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'var(--gray-50)',
                      borderRadius: '8px',
                    }}>
                    <span style={{ fontWeight: 600 }}>{tag.tags__name || 'Untagged'}:</span>
                    <span style={{ marginLeft: '0.5rem', color: 'var(--primary)' }}>
                      {tag.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showBlockModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
          <div
            className="card"
            style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ marginBottom: '1rem' }}>Block User</h2>
            <div className="form-group">
              <label className="form-label">Reason for blocking *</label>
              <textarea
                className="textarea"
                placeholder="Enter the reason for blocking this user..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={4}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={handleBlockUser} className="btn btn-danger" style={{ flex: 1 }}>
                Block User
              </button>
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockReason('');
                  setSelectedUserId(null);
                }}
                className="btn btn-secondary"
                style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
