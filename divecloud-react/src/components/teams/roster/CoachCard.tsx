import React from 'react';
import './CoachCard.css';

interface CoachCardProps {
  name: string;
  title: string;
  photoUrl?: string;
}

const CoachCard = ({
  name,
  title,
  photoUrl,
}: CoachCardProps): React.ReactElement => {
  return (
    <div className="coach-card">
      <div className="coach-photo-wrapper">
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="coach-photo" />
        ) : (
          <div className="coach-photo-placeholder" />
        )}
      </div>
      <h3 className="coach-name">{name}</h3>
      <p className="coach-title">{title}</p>
    </div>
  );
};

export default CoachCard;
