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
  owner_id?: number;
  status?: string;
  created_at?: string;
  average_rating?: number;
  rating_count?: number;
  user_rating?: number;
}

interface Comment {
  id: number;
  user: string;
  user_id: number;
  text: string;
  created_at: string;
}

const ResourceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [resource, setResource] = useState<Resource | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await api.get(`/library/resources/${id}/`);
        setResource(response.data);
        if (response.data.user_rating) {
          setRating(response.data.user_rating);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await api.get(`/library/resources/${id}/comments/`);
        setComments(response.data);
      } catch (error) {
        console.error(error);
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

    const fetchUserInfo = async () => {
      if (auth?.isAuthenticated) {
        try {
          const response = await api.get('/users/users/me/');
          setCurrentUserId(response.data.id);
          setIsStaff(response.data.is_staff || false);
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchResource();
    fetchComments();
    checkSaved();
    fetchUserInfo();
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

  const handleRating = async (value: number) => {
    if (!auth?.isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await api.post(`/library/resources/${id}/ratings/`, { rating: value });
      setRating(value);
      const response = await api.get(`/library/resources/${id}/`);
      setResource(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    try {
      const response = await api.post(`/library/resources/${id}/comments/`, { text: commentText });
      setComments([response.data, ...comments]);
      setCommentText('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await api.delete(`/library/resources/${id}/delete_comment/`, {
        data: { comment_id: commentId },
      });
      setComments(comments.filter((c) => c.id !== commentId));
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
          <Link to="/" className="btn btn-primary">
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-secondary"
        style={{ marginBottom: '1.5rem' }}>
        ← Back
      </button>

      <h1 className="page-title">{resource.title}</h1>

      <div style={{ marginBottom: '2rem' }}>
        <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem', lineHeight: '1.8' }}>
          {resource.description}
        </p>
      </div>

      {resource.average_rating !== undefined && resource.average_rating > 0 && (
        <div
          style={{
            marginBottom: '2rem',
            padding: '1rem',
            background: 'var(--gray-50)',
            borderRadius: '12px',
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                {resource.average_rating.toFixed(1)}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                {resource.rating_count || 0}{' '}
                {(resource.rating_count || 0) === 1 ? 'rating' : 'ratings'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{
                    fontSize: '1.5rem',
                    color: star <= Math.round(resource.average_rating || 0) ? '#fbbf24' : '#d1d5db',
                  }}>
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {auth?.isAuthenticated && (
        <div
          style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            background: 'white',
            borderRadius: '12px',
            boxShadow: 'var(--shadow)',
          }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--gray-900)' }}>Rate this resource</h3>
          <div
            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
            onMouseLeave={() => setHoveredRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '2rem',
                  padding: 0,
                  color: star <= (hoveredRating || rating) ? '#fbbf24' : '#d1d5db',
                  transition: 'color 0.2s',
                }}>
                ★
              </button>
            ))}
            {rating > 0 && (
              <span style={{ marginLeft: '0.5rem', color: 'var(--gray-600)' }}>
                Your rating: {rating}/5
              </span>
            )}
          </div>
        </div>
      )}

      {resource.tags && resource.tags.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--gray-700)' }}>Tags</h3>
          <div className="tag-list">
            {resource.tags.map((tag) => (
              <span key={tag.id} className="tag">
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {resource.file && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--gray-700)' }}>File</h3>
          {getFileType(resource.file) === 'video' ? (
            <video
              controls
              style={{ width: '100%', maxWidth: '800px', borderRadius: '8px' }}
              onPlay={async () => {
                try {
                  await api.post(`/library/resources/${resource.id}/download/`);
                } catch (error) {
                  console.error(error);
                }
              }}>
              <source src={`http://localhost:8000${resource.file}`} />
              Your browser does not support the video tag.
            </video>
          ) : getFileType(resource.file) === 'audio' ? (
            <audio
              controls
              style={{ width: '100%', maxWidth: '600px' }}
              onPlay={async () => {
                try {
                  await api.post(`/library/resources/${resource.id}/download/`);
                } catch (error) {
                  console.error(error);
                }
              }}>
              <source src={`http://localhost:8000${resource.file}`} />
              Your browser does not support the audio tag.
            </audio>
          ) : (
            <div>
              <a
                href={`http://localhost:8000/api/library/resources/${resource.id}/download/`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={async () => {
                  try {
                    await api.post(`/library/resources/${resource.id}/download/`);
                  } catch (error) {
                    console.error(error);
                  }
                }}
                className="btn btn-primary">
                Download File
              </a>
            </div>
          )}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          marginTop: '2rem',
          alignItems: 'center',
        }}>
        {auth?.isAuthenticated && (
          <button onClick={handleSave} className={saved ? 'btn btn-secondary' : 'btn btn-success'}>
            {saved ? 'Saved' : 'Save Resource'}
          </button>
        )}
        {resource.owner && resource.owner_id && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--gray-500)' }}>By:</span>
            <Link
              to={`/user/${resource.owner_id}`}
              style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
              {resource.owner}
            </Link>
          </div>
        )}
        {resource.created_at && (
          <p style={{ color: 'var(--gray-500)', margin: 0 }}>
            Created: {new Date(resource.created_at).toLocaleDateString()}
          </p>
        )}
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--gray-900)' }}>
          Comments ({comments.length})
        </h2>

        {auth?.isAuthenticated ? (
          <form onSubmit={handleCommentSubmit} style={{ marginBottom: '2rem' }}>
            <textarea
              className="textarea"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
              style={{ width: '100%', marginBottom: '1rem' }}
            />
            <button type="submit" className="btn btn-primary">
              Post Comment
            </button>
          </form>
        ) : (
          <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>
            <Link to="/login" style={{ color: 'var(--primary)' }}>
              Login
            </Link>{' '}
            to post a comment
          </p>
        )}

        {comments.length === 0 ? (
          <div className="empty-state">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  padding: '1.5rem',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow)',
                  border: '1px solid var(--gray-200)',
                }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem',
                  }}>
                  <div>
                    <Link
                      to={`/user/${comment.user_id}`}
                      style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                      {comment.user}
                    </Link>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--gray-500)',
                        margin: '0.25rem 0 0 0',
                      }}>
                      {new Date(comment.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {auth?.isAuthenticated && (comment.user_id === currentUserId || isStaff) && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="btn btn-sm btn-danger">
                      Delete
                    </button>
                  )}
                </div>
                <p
                  style={{
                    color: 'var(--gray-700)',
                    lineHeight: '1.6',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                  }}>
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceDetailPage;
