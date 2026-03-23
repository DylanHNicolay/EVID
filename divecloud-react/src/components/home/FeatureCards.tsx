import React from 'react';
import './FeatureCards.css';

interface Feature {
  id: number;
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    id: 1,
    icon: 'diving',
    title: 'Divers',
    description:
      'Divecloud lets you take control of your diving by harnessing the power of data to help you reach your goals.',
  },
  {
    id: 2,
    icon: 'coaches',
    title: 'Coaches',
    description:
      "Divecloud is the all-in-one team manager that brings your team's data together. With Divecloud you will save time and money, eliminate mistakes and engage their fans.",
  },
  {
    id: 3,
    icon: 'recruiters',
    title: 'College Recruiters',
    description:
      'Each year over 9,000 recruits from all 50 states and 150 countries begin their college search on Divecloud.',
  },
  {
    id: 4,
    icon: 'meet',
    title: 'Meet Directors',
    description:
      "Divecloud's Meet Manager provides all the functionality you've come to expect from meet management software but without the complexity.",
  },
  {
    id: 5,
    icon: 'associations',
    title: 'Associations',
    description:
      'Divecloud makes it easy for associations to manage results, rankings, and run better meets. Save time, reduce errors, and deliver a seamless experience for your teams and fans.',
  },
];

const iconPaths: Record<string, React.ReactElement> = {
  diving: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path
        d="M8 24c4-3 8-3 12 0M6 20c5.3-4 14.7-4 20 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="10" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  coaches: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="12" cy="10" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="22" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4 26c0-4.4 3.6-8 8-8s8 3.6 8 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 18c3.3 0 6 2.7 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  recruiters: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path
        d="M6 26V8a2 2 0 012-2h16a2 2 0 012 2v18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 12h12M10 17h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M13 26v-5h6v5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  meet: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect
        x="4"
        y="6"
        width="24"
        height="20"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M4 12h24" stroke="currentColor" strokeWidth="2" />
      <circle cx="11" cy="18" r="1.5" fill="currentColor" />
      <circle cx="16" cy="18" r="1.5" fill="currentColor" />
      <circle cx="21" cy="18" r="1.5" fill="currentColor" />
      <circle cx="11" cy="23" r="1.5" fill="currentColor" />
      <circle cx="16" cy="23" r="1.5" fill="currentColor" />
    </svg>
  ),
  associations: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect
        x="6"
        y="8"
        width="20"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M6 13h20" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 5v6M20 5v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
};

export default function FeatureCards(): React.ReactElement {
  return (
    <div className="features-card">
      <div className="features-grid">
        {features.map((feature) => (
          <div key={feature.id} className="feature-item">
            <div className="feature-icon">{iconPaths[feature.icon]}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
            <span className="feature-learn-more">Learn more &rsaquo;</span>
          </div>
        ))}
      </div>
    </div>
  );
}
