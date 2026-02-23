import React, { useState } from 'react';
import './ProfileCard.css';
import ProfileTabs from './ProfileTabs';

interface ProfileCardProps {
  firstName: string;
  lastName: string;
  location: string;
  team: string;
  bannerUrl?: string;
  avatarUrl?: string;
}

const ProfileCard = ({
  firstName,
  lastName,
  location,
  team,
  bannerUrl,
  avatarUrl,
}: ProfileCardProps): React.ReactElement => {
  const [activeTab, setActiveTab] = useState('Home');
  const initials = `${firstName[0]}${lastName[0]}`;

  return (
    <div className="profile-card">
      {/* Banner */}
      <div
        className="profile-banner"
        style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : {}}
      />

      {/* Avatar */}
      <div className="profile-avatar-wrapper">
        <div className="profile-avatar-initials">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${firstName} ${lastName}`}
              className="profile-avatar-img"
            />
          ) : (
            initials
          )}
        </div>
      </div>

      {/* Info */}
      <div className="profile-info">
        <h2 className="profile-name">
          {firstName} {lastName}
        </h2>
        <p className="profile-meta">
          {location} · <span className="profile-team">{team}</span>
        </p>
      </div>

      {/* Tabs */}
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default ProfileCard;
