import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

interface Resource {
  id: number;
  title: string;
  description: string;
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
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedTag) params.append('tags__name', selectedTag);
        
        const response = await api.get('/library/resources/', { params });
        setResources(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchResources();
  }, [searchTerm, selectedTag]);

  const handleSave = async (id: number) => {
    try {
      await api.post(`/library/resources/${id}/save/`);
      // Optionally, give user feedback
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Welcome to the Library!</h1>
      
      <div>
        <input 
          type="text" 
          placeholder="Search..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
        />
        <select value={selectedTag} onChange={e => setSelectedTag(e.target.value)}>
          <option value="">All Tags</option>
          {tags.map(tag => (
            <option key={tag.id} value={tag.name}>{tag.name}</option>
          ))}
        </select>
      </div>

      <ul>
        {resources.map((resource) => (
          <li key={resource.id}>
            <h2>{resource.title}</h2>
            <p>{resource.description}</p>
            {auth?.isAuthenticated && <button onClick={() => handleSave(resource.id)}>Save</button>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;
