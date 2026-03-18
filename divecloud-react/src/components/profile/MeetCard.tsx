import React from 'react';
import './MeetCard.css';

interface MeetCardProps {
  id: string;
  name: string;
  event?: string;
  dives?: number;
  score?: number;
  place?: string;
  avatarUrl?: string;
  onClick: (meetId: string) => void;
}

export default function MeetCard({
  id,
  name,
  event,
  dives,
  score,
  place,
  avatarUrl,
  onClick,
}: MeetCardProps): React.ReactElement {
  return (
    <div className="meet-card" onClick={() => onClick(id)}>
      <div className="meet-avatar">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} />
        ) : (
          <div className="avatar-placeholder" />
        )}
      </div>
      <div className="meet-content">
        <h3 className="meet-name">{name}</h3>
        <div className="meet-details">
          {event && (
            <div className="detail-row">
              <span className="detail-label">Event</span>
              <span className="detail-value">
                {event}
                {dives && ` (${dives} dives)`}
              </span>
            </div>
          )}
          {score !== undefined && (
            <div className="detail-row">
              <span className="detail-label">Score</span>
              <span className="detail-value">{score}</span>
            </div>
          )}
          {place && (
            <div className="detail-row">
              <span className="detail-label">Place</span>
              <span className="detail-value">{place}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
