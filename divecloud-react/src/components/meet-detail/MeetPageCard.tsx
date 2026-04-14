import React from 'react';
import './MeetPageCard.css';

interface MeetPageCardProps {
  meetId: number;
  name: string;
  status: 'Upcoming' | 'Completed';
  date: string;
  location: string;
  logoUrl?: string;
}

const MeetPageCard = ({
  meetId,
  name,
  status,
  date,
  location,
  logoUrl,
}: MeetPageCardProps): React.ReactElement => {
  return (
    <div className="meet-page-card">
      <div className="meet-page-avatar">
        {logoUrl ? (
          <img src={logoUrl} alt={name} className="meet-page-avatar-img" />
        ) : (
          <div className="meet-page-avatar-placeholder" />
        )}
      </div>
      <div className="meet-page-info">
        <h2 className="meet-page-name">{name}</h2>
        <p className="meet-page-meta">
          <span
            className={`meet-page-status ${status === 'Completed' ? 'completed' : 'upcoming'}`}
          >
            {status}
          </span>
          <span className="meet-page-date">{date}</span>
          <span className="meet-page-location">{location}</span>
          <span className="meet-page-id">Meet ID: {meetId}</span>
        </p>
      </div>
    </div>
  );
};

export default MeetPageCard;
