import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

interface Tag {
  id: number;
  name: string;
}

const AddResourcePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.get('/library/tags/');
        setTags(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTags();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (file) {
      formData.append('file', file);
    }
    selectedTags.forEach(tagId => formData.append('tags', String(tagId)));

    try {
      await api.post('/library/resources/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/my-resources');
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleTagChange = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Resource</h2>
      <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <input type="file" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
      <div>
        <h3>Tags</h3>
        {tags.map(tag => (
          <label key={tag.id}>
            <input 
              type="checkbox" 
              checked={selectedTags.includes(tag.id)} 
              onChange={() => handleTagChange(tag.id)} 
            />
            {tag.name}
          </label>
        ))}
      </div>
      <button type="submit">Add Resource</button>
    </form>
  );
};

export default AddResourcePage;
