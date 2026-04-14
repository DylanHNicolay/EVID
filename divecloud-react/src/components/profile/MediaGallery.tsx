import React, { useEffect, useState } from 'react';
import './MediaGallery.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

interface MediaItem {
  id: number;
  title: string;
  url?: string;
  video_url?: string;
  meet_name?: string;
  event_height?: string;
  total_score?: number;
  created_at: string;
  type: 'photo' | 'video';
}

interface MediaGalleryProps {
  athleteId: number;
}

export default function MediaGallery({
  athleteId,
}: MediaGalleryProps): React.ReactElement | null {
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    const fetchMedia = async (): Promise<void> => {
      try {
        const [photosRes, videosRes] = await Promise.all([
          fetch(`${API_URL}/api/athletes/${athleteId}/media/photos`),
          fetch(`${API_URL}/api/athletes/${athleteId}/media/videos`),
        ]);

        const photos: MediaItem[] = photosRes.ok
          ? (await photosRes.json()).map((p: MediaItem) => ({ ...p, type: 'photo' as const }))
          : [];
        const videos: MediaItem[] = videosRes.ok
          ? (await videosRes.json()).map((v: MediaItem) => ({ ...v, type: 'video' as const }))
          : [];

        const combined = [...photos, ...videos].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setItems(combined);
      } catch (err) {
        console.error('Error fetching media gallery:', err);
      }
    };

    fetchMedia();
  }, [athleteId]);

  if (items.length === 0) return null;

  return (
    <div className="media-gallery">
      <h3 className="media-gallery-title">Photos & Videos</h3>
      <div className="media-gallery-grid">
        {items.map((item) => (
          <div key={`${item.type}-${item.id}`} className="media-gallery-card">
            {item.type === 'photo' ? (
              <img
                src={item.url}
                alt={item.title}
                className="media-gallery-thumb"
              />
            ) : (
              <video className="media-gallery-thumb" controls>
                <source src={item.video_url || item.url} type="video/mp4" />
              </video>
            )}
            <div className="media-gallery-info">
              <span className="media-gallery-item-title">{item.title}</span>
              {item.meet_name && (
                <span className="media-gallery-context">
                  {item.event_height} at {item.meet_name}
                  {item.total_score
                    ? ` · ${Number(item.total_score).toFixed(1)} pts`
                    : ''}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
