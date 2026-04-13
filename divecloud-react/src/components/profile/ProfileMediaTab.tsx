import React, { useState, useEffect, useCallback } from 'react';
import './ProfileMediaTab.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

interface MediaItem {
  id: number;
  title: string;
  url?: string;
  video_url?: string;
  created_at: string;
}

interface ProfileMediaTabProps {
  type: 'photo' | 'video';
  userId: number;
  athleteId: number;
  onCancel: () => void;
}

export default function ProfileMediaTab({
  type,
  userId,
  athleteId,
}: ProfileMediaTabProps): React.ReactElement {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Memoize fetchMediaList so it's stable across renders
  const fetchMediaList = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const endpoint =
        type === 'photo'
          ? `/api/athletes/${athleteId}/media/photos`
          : `/api/athletes/${athleteId}/media/videos`;

      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
  }, [type, athleteId]);

  // Fetch media on component mount or when type/athleteId changes
  useEffect(() => {
    fetchMediaList();
  }, [fetchMediaList]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file type
      const isValidType =
        type === 'photo'
          ? file.type.startsWith('image/')
          : file.type.startsWith('video/');

      if (!isValidType) {
        setError(`Please select a valid ${type} file`);
        return;
      }

      // Validate file size (max 100MB for video, 10MB for photo)
      const maxSize = type === 'photo' ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) {
      setError('Please select a file');
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
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title);

      const token = localStorage.getItem('token');
      const endpoint =
        type === 'photo'
          ? `/api/athletes/${athleteId}/media/photos`
          : `/api/athletes/${athleteId}/media/videos`;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(
        `${type === 'photo' ? 'Photo' : 'Video'} uploaded successfully!`
      );
      setTitle('');
      setSelectedFile(null);

      // Reset file input
      const fileInput = document.getElementById(
        `${type}-input`
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Refresh media list
      await fetchMediaList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId: number): Promise<void> => {
    if (!window.confirm('Delete this item?')) return;

    try {
      const token = localStorage.getItem('token');
      const endpoint =
        type === 'photo'
          ? `/api/athletes/${athleteId}/media/photos/${mediaId}`
          : `/api/athletes/${athleteId}/media/videos/${mediaId}`;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Delete failed');

      setSuccess('Item deleted successfully');
      await fetchMediaList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div className="profile-media-container">
      <div className="profile-media-card">
        {/* Upload Section */}
        <div className="profile-media-upload">
          <h3 className="profile-media-title">
            Upload {type === 'photo' ? 'Photo' : 'Video'}
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
              <label htmlFor={`${type}-input`} className="profile-media-label">
                Select {type === 'photo' ? 'Photo' : 'Video'} File
              </label>
              <div className="profile-media-file-input">
                <input
                  id={`${type}-input`}
                  type="file"
                  onChange={handleFileSelect}
                  accept={type === 'photo' ? 'image/*' : 'video/*'}
                  className="profile-media-file"
                />
                <label
                  htmlFor={`${type}-input`}
                  className="profile-media-file-label"
                >
                  {selectedFile ? selectedFile.name : `Choose ${type} file`}
                </label>
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="profile-media-upload-btn"
            >
              {uploading
                ? `Uploading...`
                : `Upload ${type === 'photo' ? 'Photo' : 'Video'}`}
            </button>
          </div>
        </div>

        {/* Media Gallery */}
        <div className="profile-media-gallery">
          <h3 className="profile-media-title">
            Your {type === 'photo' ? 'Photos' : 'Videos'}
          </h3>

          {loading ? (
            <p className="profile-media-loading">Loading...</p>
          ) : mediaList.length === 0 ? (
            <p className="profile-media-empty">No {type}s uploaded yet</p>
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
