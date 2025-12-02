import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

interface Resource {
  id: number;
  title: string;
  description: string;
  tags?: Tag[];
  file?: string;
  owner?: string;
}

interface Tag {
  id: number;
  name: string;
}

const HomePage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const auth = useContext(AuthContext);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.get('/library/tags/');
        setTags(response.data);
      } catch (error) {
        console.error('Failed to fetch tags', error);
      }
    };
    fetchTags();
  }, []);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedTag) params.append('tags__name', selectedTag);
        
        const response = await api.get('/library/resources/', { params });
        setResources(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [searchTerm, selectedTag]);

  useEffect(() => {
    const fetchSavedResources = async () => {
      if (auth?.isAuthenticated) {
        try {
          const response = await api.get('/library/resources/saved/');
          const saved = new Set(response.data.map((r: Resource) => r.id));
          setSavedIds(saved);
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchSavedResources();
  }, [auth?.isAuthenticated]);

  const handleSave = async (id: number) => {
    try {
      await api.post(`/library/resources/${id}/save/`);
      setSavedIds(prev => new Set([...prev, id]));
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnsave = async (id: number) => {
    try {
      await api.post(`/library/resources/${id}/save/`);
      setSavedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Welcome to LibraryHub</h1>
      <p style={{ color: 'var(--gray-600)', marginBottom: '2rem', fontSize: '1.125rem' }}>
        Discover and explore educational resources shared by our community
      </p>
      
      <div className="search-bar">
        <input 
          type="text" 
          className="input search-input"
          placeholder="Search resources..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
        />
        <select 
          className="select filter-select"
          value={selectedTag} 
          onChange={e => setSelectedTag(e.target.value)}
        >
          <option value="">All Tags</option>
          {tags.map(tag => (
            <option key={tag.id} value={tag.name}>{tag.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading resources...</div>
      ) : resources.length === 0 ? (
        <div className="empty-state">
          <h3>No resources found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {resources.map((resource) => (
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
              <div className="card-actions">
                <Link to={`/resource/${resource.id}`} className="btn btn-primary btn-sm">
                  View Details
                </Link>
                {auth?.isAuthenticated && (
                  savedIds.has(resource.id) ? (
                    <button 
                      onClick={() => handleUnsave(resource.id)} 
                      className="btn btn-secondary btn-sm"
                    >
                      Saved
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleSave(resource.id)} 
                      className="btn btn-success btn-sm"
                    >
                      Save
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
