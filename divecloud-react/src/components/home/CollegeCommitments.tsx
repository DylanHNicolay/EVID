import React from 'react';
import './CollegeCommitments.css';

interface Commitment {
  id: number;
  name: string;
  initials: string;
  location: string;
  avatarUrl?: string;
  quote: string;
  schoolLogoUrl: string;
  schoolName: string;
}

const mockCommitments: Commitment[] = [
  {
    id: 1,
    name: 'Jack Baumgardner',
    initials: 'JB',
    location: 'Hatboro, PA',
    avatarUrl: 'https://i.pravatar.cc/80?img=12',
    quote: 'Go Broncs!!',
    schoolLogoUrl: 'https://flagcdn.com/w40/us.png',
    schoolName: 'Rider University',
  },
  {
    id: 2,
    name: 'Pietro De Andreis',
    initials: 'PD',
    location: 'Langley, BC',
    quote:
      'I am extremely excited to announce my commitment to Grand Valley State University to continue my academic and athletic career. I would like to thank Coach Boyce for this incredible opportunity! A huge thank you to my family, friends, teammates, College Life Italia, Coach Ryan, and all the coaches who have supported and helped me achieve my goals throughout my diving career. I am thrilled for this next chapter and ready to prove myse...',
    schoolLogoUrl: 'https://flagcdn.com/w40/us.png',
    schoolName: 'Grand Valley State University',
  },
  {
    id: 3,
    name: 'Sam Harper',
    initials: 'SH',
    location: 'Plainwell, MI',
    avatarUrl: 'https://i.pravatar.cc/80?img=33',
    quote:
      "I'm excited to announce my commitment to pursue my athletic and academic career at Nova Southeastern University. First, I'd like to thank God for putting me in this position. I'd also like to thank Coach Hewitt for this opportunity. Lastly, I'd like to thank my family, friends, and coaches for their endless support throughout this process. #finsup",
    schoolLogoUrl: 'https://flagcdn.com/w40/us.png',
    schoolName: 'Nova Southeastern University',
  },
];

function Avatar({
  commitment,
}: {
  commitment: Commitment;
}): React.ReactElement {
  if (commitment.avatarUrl) {
    return (
      <img
        className="commitment-avatar"
        src={commitment.avatarUrl}
        alt={commitment.name}
      />
    );
  }
  return (
    <div className="commitment-avatar-initials">{commitment.initials}</div>
  );
}

export default function CollegeCommitments(): React.ReactElement {
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
        {mockCommitments.map((c) => (
          <div key={c.id} className="commitment-card">
            <div className="commitment-header">
              <Avatar commitment={c} />
              <div className="commitment-header-info">
                <span className="commitment-name">{c.name}</span>
                <span className="commitment-location">{c.location}</span>
              </div>
            </div>
            <p className="commitment-quote">{c.quote}</p>
            <div className="commitment-school">
              <img
                className="commitment-school-logo"
                src={c.schoolLogoUrl}
                alt=""
              />
              <span className="commitment-school-name">{c.schoolName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
