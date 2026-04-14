import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import './ProfileMediaTab.css';

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
}

interface MeetOption {
  meet_id: number;
  meet_name: string;
  meet_date: string;
  event: string;
  score: number | null;
  rank: number | null;
}

interface ProfileMediaTabProps {
  type: 'photo' | 'video';
  userId: number;
  athleteId: number;
  onCancel: () => void;
}

export default function ProfileMediaTab({
  type,
  athleteId,
}: ProfileMediaTabProps): React.ReactElement {
  const { token } = useAuth();
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [title, setTitle] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [meets, setMeets] = useState<MeetOption[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState('');

  const fetchMediaList = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const endpoint =
        type === 'photo'
          ? `/api/athletes/${athleteId}/media/photos`
          : `/api/athletes/${athleteId}/media/videos`;

      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMediaList(data);
      }
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  }, [type, athleteId, token]);

  useEffect(() => {
    fetchMediaList();
  }, [fetchMediaList]);

  useEffect(() => {
    const fetchMeets = async (): Promise<void> => {
      try {
        const response = await fetch(
          `${API_URL}/api/athletes/${athleteId}/meets`
        );
        if (response.ok) {
          const data = await response.json();
          setMeets(data);
        }
      } catch (err) {
        console.error('Error fetching meets:', err);
      }
    };
    fetchMeets();
  }, [athleteId]);

  const handleUpload = async (): Promise<void> => {
    if (!mediaUrl.trim()) {
      setError('Please enter a URL');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint =
        type === 'photo'
          ? `/api/athletes/${athleteId}/media/photos`
          : `/api/athletes/${athleteId}/media/videos`;

      const body: Record<string, string | number | null> = {
        title: title.trim(),
        meet_entry_id: selectedEntryId ? parseInt(selectedEntryId, 10) : null,
      };

      if (type === 'photo') {
        body.url = mediaUrl.trim();
      } else {
        body.video_url = mediaUrl.trim();
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(`${type === 'photo' ? 'Photo' : 'Video'} link saved!`);
      setTitle('');
      setMediaUrl('');
      setSelectedEntryId('');
      await fetchMediaList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId: number): Promise<void> => {
    if (!window.confirm('Delete this item?')) return;

    try {
      const endpoint =
        type === 'photo'
          ? `/api/athletes/${athleteId}/media/photos/${mediaId}`
          : `/api/athletes/${athleteId}/media/videos/${mediaId}`;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Delete failed');

      setSuccess('Item deleted');
      await fetchMediaList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const formatDate = (raw: string): string => {
    const iso = raw.includes('T') ? raw.split('T')[0] : raw;
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="profile-media-container">
      <div className="profile-media-card">
        {/* Add Link Section */}
        <div className="profile-media-upload">
          <h3 className="profile-media-title">
            Add {type === 'photo' ? 'Photo' : 'Video'} Link
          </h3>

          {error && <div className="profile-media-error">{error}</div>}
          {success && <div className="profile-media-success">{success}</div>}

          <div className="profile-media-form">
            <div className="profile-media-group">
              <label htmlFor={`${type}-title`} className="profile-media-label">
                Title
              </label>
              <input
                id={`${type}-title`}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Enter ${type} title`}
                className="profile-media-input"
              />
            </div>

            <div className="profile-media-group">
              <label htmlFor={`${type}-url`} className="profile-media-label">
                {type === 'photo' ? 'Photo' : 'Video'} URL
              </label>
              <input
                id={`${type}-url`}
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder={`https://example.com/${type === 'photo' ? 'image.jpg' : 'video.mp4'}`}
                className="profile-media-input"
              />
            </div>

            <div className="profile-media-group">
              <label htmlFor={`${type}-meet`} className="profile-media-label">
                Link to Meet / Score{' '}
                <span className="profile-media-optional">(optional)</span>
              </label>
              <select
                id={`${type}-meet`}
                value={selectedEntryId}
                onChange={(e) => setSelectedEntryId(e.target.value)}
                className="profile-media-input"
              >
                <option value="">No linked score</option>
                {meets.map((m) => (
                  <option
                    key={`${m.meet_id}-${m.event}`}
                    value={String(m.meet_id)}
                  >
                    {m.meet_name} - {m.event}
                    {m.score ? ` (${Number(m.score).toFixed(1)})` : ''}
                    {' · '}
                    {formatDate(m.meet_date)}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading || !mediaUrl.trim()}
              className="profile-media-upload-btn"
            >
              {uploading
                ? 'Saving...'
                : `Add ${type === 'photo' ? 'Photo' : 'Video'} Link`}
            </button>
          </div>
        </div>

        {/* Media List */}
        <div className="profile-media-gallery">
          <h3 className="profile-media-title">
            Your {type === 'photo' ? 'Photos' : 'Videos'}
          </h3>

          {loading ? (
            <p className="profile-media-loading">Loading...</p>
          ) : mediaList.length === 0 ? (
            <p className="profile-media-empty">No {type}s added yet</p>
          ) : (
            <div className="profile-media-grid">
              {mediaList.map((item) => (
                <div key={item.id} className="profile-media-item">
                  {type === 'photo' ? (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="profile-media-thumbnail"
                    />
                  ) : (
                    <video className="profile-media-thumbnail" controls>
                      <source
                        src={item.video_url || item.url}
                        type="video/mp4"
                      />
                    </video>
                  )}
                  <div className="profile-media-item-info">
                    <h4>{item.title}</h4>
                    {item.meet_name && (
                      <p className="profile-media-meet-link">
                        {item.event_height} at {item.meet_name}
                        {item.total_score
                          ? ` · ${Number(item.total_score).toFixed(1)} pts`
                          : ''}
                      </p>
                    )}
                    <p>{new Date(item.created_at).toLocaleDateString()}</p>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="profile-media-delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
