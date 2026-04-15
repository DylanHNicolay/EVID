import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './team-home-tab.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

interface TeamInfo {
  id: number;
  name: string;
  abbreviation: string | null;
  school: string | null;
  division: string | null;
  conference: string | null;
  location: string | null;
  accent_color: string | null;
}

interface TeamStats {
  roster_count: number;
  meet_count: number;
  coach_count: number;
}

interface RecentMeet {
  id: number;
  name: string;
  meet_date: string;
  location: string | null;
  status: string;
}

interface Coach {
  id: number;
  name: string;
  title: string;
  photo_url: string | null;
}

interface TeamHomeTabProps {
  team: TeamInfo;
}

function formatDate(raw: string): string {
  const iso = raw.includes('T') ? raw.split('T')[0] : raw;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TeamHomeTab({
  team,
}: TeamHomeTabProps): React.ReactElement {
  const navigate = useNavigate();
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [recentMeets, setRecentMeets] = useState<RecentMeet[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/teams/${team.id}/stats`)
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);

    fetch(`${API_URL}/api/teams/${team.id}/meets`)
      .then((r) => r.json())
      .then((rows: RecentMeet[]) => setRecentMeets(rows.slice(0, 5)))
      .catch(console.error);

    fetch(`${API_URL}/api/teams/${team.id}/coaches`)
      .then((r) => r.json())
      .then(setCoaches)
      .catch(console.error);
  }, [team.id]);

  const accent = team.accent_color || '#4a90d9';

  return (
    <div className="team-home">
      <div className="team-home-main">
        {/* Info card */}
        <div className="th-card th-info-card">
          <h3 className="th-card-title">Team Info</h3>
          <div className="th-info-grid">
            {team.school && (
              <div className="th-info-item">
                <span className="th-info-label">School</span>
                <span className="th-info-value">{team.school}</span>
              </div>
            )}
            {team.location && (
              <div className="th-info-item">
                <span className="th-info-label">Location</span>
                <span className="th-info-value">{team.location}</span>
              </div>
            )}
            {team.division && (
              <div className="th-info-item">
                <span className="th-info-label">Division</span>
                <span className="th-info-value">{team.division}</span>
              </div>
            )}
            {team.conference && (
              <div className="th-info-item">
                <span className="th-info-label">Conference</span>
                <span className="th-info-value">{team.conference}</span>
              </div>
            )}
            {team.abbreviation && (
              <div className="th-info-item">
                <span className="th-info-label">Abbreviation</span>
                <span className="th-info-value">{team.abbreviation}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="th-stats-row">
            <div className="th-stat" style={{ borderTopColor: accent }}>
              <span className="th-stat-value">{stats.roster_count}</span>
              <span className="th-stat-label">Athletes</span>
            </div>
            <div className="th-stat" style={{ borderTopColor: accent }}>
              <span className="th-stat-value">{stats.meet_count}</span>
              <span className="th-stat-label">Meets</span>
            </div>
            <div className="th-stat" style={{ borderTopColor: accent }}>
              <span className="th-stat-value">{stats.coach_count}</span>
              <span className="th-stat-label">Coaches</span>
            </div>
          </div>
        )}

        {/* Recent meets */}
        <div className="th-card">
          <h3 className="th-card-title">Recent Meets</h3>
          {recentMeets.length === 0 ? (
            <p className="th-empty">No meets on record.</p>
          ) : (
            <ul className="th-meet-list">
              {recentMeets.map((m) => (
                <li
                  key={m.id}
                  className="th-meet-item"
                  onClick={() => navigate(`/meet/${m.id}`)}
                >
                  <div className="th-meet-info">
                    <span className="th-meet-name">{m.name}</span>
                    <span className="th-meet-meta">
                      {formatDate(m.meet_date)}
                      {m.location ? ` · ${m.location}` : ''}
                    </span>
                  </div>
                  <span
                    className={`th-meet-status th-meet-status--${m.status}`}
                  >
                    {m.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="team-home-sidebar">
        <div className="th-card">
          <h3 className="th-card-title">Coaching Staff</h3>
          {coaches.length === 0 ? (
            <p className="th-empty">No coaches listed.</p>
          ) : (
            <div className="th-coach-list">
              {coaches.map((c) => (
                <div key={c.id} className="th-coach">
                  <div className="th-coach-photo">
                    {c.photo_url ? (
                      <img src={c.photo_url} alt={c.name} />
                    ) : (
                      <div className="th-coach-photo-placeholder" />
                    )}
                  </div>
                  <div className="th-coach-info">
                    <span className="th-coach-name">{c.name}</span>
                    <span className="th-coach-title">{c.title}</span>
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
