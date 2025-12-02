import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

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
  status: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileResponse, resourcesResponse] = await Promise.all([
          api.get('/users/profile/me/'),
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

  const approvedCount = resources.filter((r) => r.status === 'approved').length;
  const pendingCount = resources.filter((r) => r.status === 'pending').length;
  const rejectedCount = resources.filter((r) => r.status === 'rejected').length;
  const totalCount = resources.length;

  return (
    <div className="page-container">
      <h1 className="page-title">My Profile</h1>

      <div style={{ maxWidth: '800px' }}>
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--gray-900)' }}>Account Information</h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--gray-500)',
                marginBottom: '0.5rem',
              }}>
              Username
            </label>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--gray-900)',
                padding: '0.75rem',
                background: 'var(--gray-50)',
                borderRadius: '8px',
              }}>
              {profile.username}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--gray-500)',
                marginBottom: '0.5rem',
              }}>
              Email
            </label>
            <div
              style={{
                fontSize: '1.125rem',
                color: 'var(--gray-700)',
                padding: '0.75rem',
                background: 'var(--gray-50)',
                borderRadius: '8px',
              }}>
              {profile.email}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--gray-500)',
                marginBottom: '0.5rem',
              }}>
              Account Type
            </label>
            <div
              style={{
                fontSize: '1.125rem',
                color: 'var(--gray-700)',
                padding: '0.75rem',
                background: 'var(--gray-50)',
                borderRadius: '8px',
                textTransform: 'capitalize',
              }}>
              {profile.user_type}
            </div>
          </div>

          {profile.is_approved !== undefined && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--gray-500)',
                  marginBottom: '0.5rem',
                }}>
                Approval Status
              </label>
              <span className={`badge ${profile.is_approved ? 'badge-approved' : 'badge-pending'}`}>
                {profile.is_approved ? 'Approved' : 'Pending Approval'}
              </span>
            </div>
          )}

          {profile.is_staff && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--gray-500)',
                  marginBottom: '0.5rem',
                }}>
                Admin Access
              </label>
              <span className="badge badge-approved">Administrator</span>
            </div>
          )}
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--gray-900)' }}>
            My Resources Statistics
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}>
            <div
              style={{
                textAlign: 'center',
                padding: '1.5rem',
                background: 'var(--gray-50)',
                borderRadius: '8px',
              }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                {totalCount}
              </div>
              <div style={{ color: 'var(--gray-600)', marginTop: '0.5rem', fontWeight: 500 }}>
                Total
              </div>
            </div>
            <div
              style={{
                textAlign: 'center',
                padding: '1.5rem',
                background: 'var(--gray-50)',
                borderRadius: '8px',
              }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--success)' }}>
                {approvedCount}
              </div>
              <div style={{ color: 'var(--gray-600)', marginTop: '0.5rem', fontWeight: 500 }}>
                Approved
              </div>
            </div>
            <div
              style={{
                textAlign: 'center',
                padding: '1.5rem',
                background: 'var(--gray-50)',
                borderRadius: '8px',
              }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--warning)' }}>
                {pendingCount}
              </div>
              <div style={{ color: 'var(--gray-600)', marginTop: '0.5rem', fontWeight: 500 }}>
                Pending
              </div>
            </div>
            <div
              style={{
                textAlign: 'center',
                padding: '1.5rem',
                background: 'var(--gray-50)',
                borderRadius: '8px',
              }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--danger)' }}>
                {rejectedCount}
              </div>
              <div style={{ color: 'var(--gray-600)', marginTop: '0.5rem', fontWeight: 500 }}>
                Rejected
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--gray-900)' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/my-resources" className="btn btn-primary">
              View My Resources
            </Link>
            <Link to="/add-resource" className="btn btn-secondary">
              Add New Resource
            </Link>
            <Link to="/saved-resources" className="btn btn-secondary">
              Saved Resources
            </Link>
            <Link to="/settings" className="btn btn-secondary">
              Settings
            </Link>
            {profile.is_staff && (
              <Link to="/admin" className="btn btn-primary" style={{ background: 'var(--accent)' }}>
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
