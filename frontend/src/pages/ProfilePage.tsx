import React, { useEffect, useState } from 'react';
import api from '../api';

interface UserProfile {
  username: string;
  email: string;
  user_type: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile/me/'); // Assuming 'me' endpoint
        setProfile(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfile();
  }, []);

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>My Profile</h1>
      <p><strong>Username:</strong> {profile.username}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Type:</strong> {profile.user_type}</p>
    </div>
  );
};

export default ProfilePage;
