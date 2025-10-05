"use client";

import React, { useEffect, useState } from 'react';
import UserAvatar from './UserAvatar';
import { api } from '@/lib/api';

interface CurrentUserAvatarProps {
  userId: string;
  sessionName: string;
  sessionImageUrl: string | null;
  className?: string;
}

const CurrentUserAvatar: React.FC<CurrentUserAvatarProps> = ({ 
  userId, 
  sessionName, 
  sessionImageUrl,
  className 
}) => {
  const [userImageUrl, setUserImageUrl] = useState<string | null>(sessionImageUrl);
  const [userName, setUserName] = useState<string>(sessionName);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch the latest user data when component mounts
  useEffect(() => {
    const fetchLatestUserData = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const response = await api.users.getById(userId);
        
        if (response.success && response.data) {
          // Only update if the image has actually changed
          if (response.data.image !== sessionImageUrl) {
            setUserImageUrl(response.data.image);
          }
          setUserName(response.data.name);
        }
      } catch (error) {
        console.error("Failed to fetch latest user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestUserData();
  }, [userId, sessionImageUrl]);

  return (
    <UserAvatar
      id={userId}
      name={userName}
      imageUrl={userImageUrl}
      className={className}
    />
  );
};

export default CurrentUserAvatar;