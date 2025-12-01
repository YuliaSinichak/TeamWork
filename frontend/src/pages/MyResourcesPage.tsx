import React, { useEffect, useState } from 'react';
import api from '../api';

interface Resource {
  id: number;
  title: string;
  description: string;
  status: string;
}

const MyResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await api.get('/library/resources/my/');
        setResources(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchResources();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/library/resources/${id}/`);
      setResources(resources.filter(resource => resource.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>My Resources</h1>
      <ul>
        {resources.map((resource) => (
          <li key={resource.id}>
            <h2>{resource.title} ({resource.status})</h2>
            <p>{resource.description}</p>
            <button onClick={() => handleDelete(resource.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyResourcesPage;
