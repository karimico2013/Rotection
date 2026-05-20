import { useState, useEffect } from 'react';

interface UserAvatarProps {
  robloxId?: string;
  userId?: string;
  photoURL?: string;
  displayName?: string;
  className?: string;
}

export default function UserAvatar({ robloxId, userId, photoURL, displayName, className = "" }: UserAvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fallbackUrl = photoURL || `https://api.dicebear.com/9.x/lorelei/svg?beardProbability=0&earringsProbability=25&frecklesProbability=15&hair=variant10,variant11,variant12,variant13,variant14,variant15,variant16,variant17,variant18,variant19,variant20,variant21,variant22,variant23,variant24,variant26,variant29,variant30,variant31,variant32,variant33,variant35,variant36,variant37,variant38,variant40,variant41,variant42,variant43,variant45,variant46,variant48,variant09,variant07,variant44&seed=${userId || displayName || 'default'}`;

  useEffect(() => {
    if (!robloxId) {
      setImageUrl(null);
      return;
    }

    const fetchRobloxAvatar = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/roblox/thumbnails/user-avatar?userId=${robloxId}`);
        const data = await response.json();
        if (data?.data?.[0]?.imageUrl) {
          setImageUrl(data.data[0].imageUrl);
        } else {
          setImageUrl(null);
        }
      } catch (error) {
        console.error('Failed to fetch Roblox avatar via proxy:', error);
        setImageUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRobloxAvatar();
  }, [robloxId]);

  return (
    <img 
      src={imageUrl || fallbackUrl} 
      className={`${className} ${loading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}
      alt={displayName || 'User profile'}
      referrerPolicy="no-referrer"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        if (target.src !== fallbackUrl) {
          target.src = fallbackUrl;
        }
      }}
    />
  );
}
