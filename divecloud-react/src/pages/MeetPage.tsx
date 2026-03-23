import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import MeetPageCard from '../components/meets/MeetPageCard';
import MeetTeamsScore from '../components/meets/MeetTeamsScore';
import MeetResultsTable from '../components/meets/MeetResultsTable';
import './MeetPage.css';

interface MeetResult {
  id: number;
  name: string;
  team: string;
  event: string;
  score: number;
  points: number;
  gender: 'Men' | 'Women';
}

interface TeamScore {
  name: string;
  score: number;
  logoUrl?: string;
}

interface MeetData {
  name: string;
  status: 'Upcoming' | 'Completed';
  date: string;
  location: string;
  logoUrl?: string;
  homeTeam: { men: TeamScore; women: TeamScore };
  awayTeam: { men: TeamScore; women: TeamScore };
  results: MeetResult[];
}

const sampleMeets: Record<string, MeetData> = {
  '1': {
    name: '2025 Ithaca @ RPI',
    status: 'Completed',
    date: 'Nov 1, 2025',
    location: 'Troy, NY',
    homeTeam: {
      men: { name: 'Ithaca', score: 163 },
      women: { name: 'Ithaca', score: 172 },
    },
    awayTeam: {
      men: { name: 'Rensselaer', score: 120 },
      women: { name: 'Rensselaer', score: 108 },
    },
    results: [
      {
        id: 1,
        name: 'Jake Morrison',
        team: 'Ithaca',
        event: '1M',
        score: 267.45,
        points: 16,
        gender: 'Men',
      },
      {
        id: 2,
        name: 'Ryan Chen',
        team: 'Rensselaer',
        event: '1M',
        score: 251.3,
        points: 13,
        gender: 'Men',
      },
      {
        id: 3,
        name: 'Tyler Brooks',
        team: 'Ithaca',
        event: '1M',
        score: 234.15,
        points: 11,
        gender: 'Men',
      },
      {
        id: 4,
        name: 'Sam Nguyen',
        team: 'Rensselaer',
        event: '1M',
        score: 218.9,
        points: 9,
        gender: 'Men',
      },
      {
        id: 5,
        name: 'Jake Morrison',
        team: 'Ithaca',
        event: '3M',
        score: 285.6,
        points: 16,
        gender: 'Men',
      },
      {
        id: 6,
        name: 'Tyler Brooks',
        team: 'Ithaca',
        event: '3M',
        score: 271.25,
        points: 13,
        gender: 'Men',
      },
      {
        id: 7,
        name: 'Ryan Chen',
        team: 'Rensselaer',
        event: '3M',
        score: 258.8,
        points: 11,
        gender: 'Men',
      },
      {
        id: 8,
        name: 'Marcus Hill',
        team: 'Rensselaer',
        event: '3M',
        score: 242.1,
        points: 9,
        gender: 'Men',
      },
      {
        id: 9,
        name: 'Emily Zhang',
        team: 'Ithaca',
        event: '1M',
        score: 278.35,
        points: 16,
        gender: 'Women',
      },
      {
        id: 10,
        name: 'Sophia Kim',
        team: 'Rensselaer',
        event: '1M',
        score: 259.4,
        points: 13,
        gender: 'Women',
      },
      {
        id: 11,
        name: 'Ava Torres',
        team: 'Ithaca',
        event: '1M',
        score: 243.2,
        points: 11,
        gender: 'Women',
      },
      {
        id: 12,
        name: 'Mia Johnson',
        team: 'Rensselaer',
        event: '1M',
        score: 230.75,
        points: 9,
        gender: 'Women',
      },
      {
        id: 13,
        name: 'Emily Zhang',
        team: 'Ithaca',
        event: '3M',
        score: 296.1,
        points: 16,
        gender: 'Women',
      },
      {
        id: 14,
        name: 'Ava Torres',
        team: 'Ithaca',
        event: '3M',
        score: 280.55,
        points: 13,
        gender: 'Women',
      },
      {
        id: 15,
        name: 'Sophia Kim',
        team: 'Rensselaer',
        event: '3M',
        score: 265.9,
        points: 11,
        gender: 'Women',
      },
      {
        id: 16,
        name: 'Lily Park',
        team: 'Rensselaer',
        event: '3M',
        score: 248.3,
        points: 9,
        gender: 'Women',
      },
    ],
  },
  '2': {
    name: 'NC State vs. Virginia',
    status: 'Completed',
    date: 'Jan 23, 2026',
    location: 'Raleigh, NC',
    homeTeam: {
      men: { name: 'NC State', score: 185 },
      women: { name: 'NC State', score: 178 },
    },
    awayTeam: {
      men: { name: 'Virginia', score: 152 },
      women: { name: 'Virginia', score: 160 },
    },
    results: [
      {
        id: 1,
        name: 'David Park',
        team: 'NC State',
        event: '1M',
        score: 312.5,
        points: 16,
        gender: 'Men',
      },
      {
        id: 2,
        name: 'James White',
        team: 'Virginia',
        event: '1M',
        score: 298.75,
        points: 13,
        gender: 'Men',
      },
      {
        id: 3,
        name: 'Connor Lewis',
        team: 'NC State',
        event: '1M',
        score: 284.2,
        points: 11,
        gender: 'Men',
      },
      {
        id: 4,
        name: 'Ben Carter',
        team: 'Virginia',
        event: '1M',
        score: 271.6,
        points: 9,
        gender: 'Men',
      },
      {
        id: 5,
        name: 'David Park',
        team: 'NC State',
        event: '3M',
        score: 328.4,
        points: 16,
        gender: 'Men',
      },
      {
        id: 6,
        name: 'James White',
        team: 'Virginia',
        event: '3M',
        score: 310.85,
        points: 13,
        gender: 'Men',
      },
      {
        id: 7,
        name: 'Connor Lewis',
        team: 'NC State',
        event: '3M',
        score: 295.3,
        points: 11,
        gender: 'Men',
      },
      {
        id: 8,
        name: 'Ben Carter',
        team: 'Virginia',
        event: '3M',
        score: 278.9,
        points: 9,
        gender: 'Men',
      },
      {
        id: 9,
        name: 'Hannah Reed',
        team: 'NC State',
        event: '1M',
        score: 290.15,
        points: 16,
        gender: 'Women',
      },
      {
        id: 10,
        name: 'Claire Davis',
        team: 'Virginia',
        event: '1M',
        score: 275.8,
        points: 13,
        gender: 'Women',
      },
      {
        id: 11,
        name: 'Olivia Grant',
        team: 'NC State',
        event: '1M',
        score: 261.45,
        points: 11,
        gender: 'Women',
      },
      {
        id: 12,
        name: 'Emma Wilson',
        team: 'Virginia',
        event: '1M',
        score: 248.3,
        points: 9,
        gender: 'Women',
      },
      {
        id: 13,
        name: 'Hannah Reed',
        team: 'NC State',
        event: '3M',
        score: 305.7,
        points: 16,
        gender: 'Women',
      },
      {
        id: 14,
        name: 'Claire Davis',
        team: 'Virginia',
        event: '3M',
        score: 289.25,
        points: 13,
        gender: 'Women',
      },
      {
        id: 15,
        name: 'Olivia Grant',
        team: 'NC State',
        event: '3M',
        score: 274.6,
        points: 11,
        gender: 'Women',
      },
      {
        id: 16,
        name: 'Emma Wilson',
        team: 'Virginia',
        event: '3M',
        score: 258.4,
        points: 9,
        gender: 'Women',
      },
    ],
  },
};

const fallbackMeet: MeetData = sampleMeets['1'];

export default function MeetPage(): React.ReactElement {
  const { meetId } = useParams<{ meetId: string }>();
  const [gender, setGender] = useState<'Men' | 'Women'>('Men');

  const meet = (meetId && sampleMeets[meetId]) || fallbackMeet;

  const homeTeam = gender === 'Men' ? meet.homeTeam.men : meet.homeTeam.women;
  const awayTeam = gender === 'Men' ? meet.awayTeam.men : meet.awayTeam.women;
  const filteredResults = meet.results.filter((r) => r.gender === gender);

  return (
    <div className="meet-page">
      <MeetPageCard
        name={meet.name}
        status={meet.status}
        date={meet.date}
        location={meet.location}
        logoUrl={meet.logoUrl}
      />

      <div className="meet-page-body">
        <div className="meet-gender-toggle">
          <button
            className={gender === 'Men' ? 'active' : ''}
            onClick={() => setGender('Men')}
          >
            Men
          </button>
          <button
            className={gender === 'Women' ? 'active' : ''}
            onClick={() => setGender('Women')}
          >
            Women
          </button>
        </div>

        <MeetTeamsScore homeTeam={homeTeam} awayTeam={awayTeam} />
        <MeetResultsTable results={filteredResults} />
      </div>
    </div>
  );
}
