import React from 'react';
import './ProfileCard.css';
import ProfileTabs from './ProfileTabs';

interface ProfileCardProps {
  firstName: string;
  lastName: string;
  location: string;
  team: string;
  bannerUrl?: string;
  avatarUrl?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
}

const ProfileCard = ({
  firstName,
  lastName,
  location,
  team,
  bannerUrl,
  avatarUrl,
  activeTab,
  onTabChange,
  isOwnProfile,
  onEditProfile,
}: ProfileCardProps): React.ReactElement => {
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 className="profile-name">
            {firstName} {lastName}
          </h2>
          {isOwnProfile && (
            <button className="profile-edit-btn" onClick={onEditProfile}>
              Manage
            </button>
          )}
        </div>
        <p className="profile-meta">
          {location} · <span className="profile-team">{team}</span>
        </p>
      </div>

      {/* Tabs */}
      <ProfileTabs activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default ProfileCard;
