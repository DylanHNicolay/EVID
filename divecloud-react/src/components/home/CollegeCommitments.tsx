import React, { useEffect, useState } from 'react';
import './CollegeCommitments.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface Commitment {
  id: number;
  first_name: string;
  last_name: string;
  hometown: string | null;
  avatar_url: string | null;
  school_name: string;
  school_logo_url: string | null;
  commitment_date: string | null;
  quote: string | null;
}

function getInitials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function Avatar({
  commitment,
}: {
  commitment: Commitment;
}): React.ReactElement {
  if (commitment.avatar_url) {
    return (
      <img
        className="commitment-avatar"
        src={commitment.avatar_url}
        alt={`${commitment.first_name} ${commitment.last_name}`}
      />
    );
  }
  return (
    <div className="commitment-avatar-initials">
      {getInitials(commitment.first_name, commitment.last_name)}
    </div>
  );
}

export default function CollegeCommitments(): React.ReactElement {
  const [commitments, setCommitments] = useState<Commitment[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/home/commitments`)
      .then((r) => r.json())
      .then(setCommitments)
      .catch(console.error);
  }, []);

  return (
    <div className="commitments-section">
      <h2 className="commitments-title">College commitments</h2>
      <p className="commitments-subtitle">
        See why 80% of college freshmen trust Divecloud to start their college
        journey.
      </p>
      <a href="/" className="commitments-learn-more">
        Learn more
      </a>

      <div className="commitments-grid">
        {commitments.map((c) => (
          <div key={c.id} className="commitment-card">
            <div className="commitment-header">
              <Avatar commitment={c} />
              <div className="commitment-header-info">
                <span className="commitment-name">
                  {c.first_name} {c.last_name}
                </span>
                <span className="commitment-location">{c.hometown || ''}</span>
              </div>
            </div>
            <p className="commitment-quote">{c.quote || ''}</p>
            <div className="commitment-school">
              <img
                className="commitment-school-logo"
                src={c.school_logo_url || 'https://flagcdn.com/w40/us.png'}
                alt=""
              />
              <span className="commitment-school-name">{c.school_name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
