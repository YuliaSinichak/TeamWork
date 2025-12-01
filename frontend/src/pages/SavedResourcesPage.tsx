import React, { useEffect, useState } from 'react';
import api from '../api';

interface Resource {
  id: number;
  title: string;
  description: string;
}

const SavedResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const fetchSavedResources = async () => {
      try {
        const response = await api.get('/library/resources/saved/');
        setResources(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSavedResources();
  }, []);
  
  const handleUnsave = async (id: number) => {
    try {
      await api.post(`/library/resources/${id}/save/`);
      setResources(resources.filter(resource => resource.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Saved Resources</h1>
      <ul>
        {resources.map((resource) => (
          <li key={resource.id}>
            <h2>{resource.title}</h2>
            <p>{resource.description}</p>
            <button onClick={() => handleUnsave(resource.id)}>Unsave</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SavedResourcesPage;
