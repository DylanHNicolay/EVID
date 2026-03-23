import React, { useEffect, useState } from 'react';
import './Progression.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

interface ProgressionDataPoint {
  date: string;
  score: number;
}

interface ProgressionProps {
  athleteId: number;
}

function formatDate(raw: string): string {
  const iso = raw.includes('T') ? raw.split('T')[0] : raw;
  const [y, m] = iso.split('-');
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${months[parseInt(m, 10) - 1]} ${y}`;
}

const Progression: React.FC<ProgressionProps> = ({
  athleteId,
}): React.ReactElement => {
  const [data, setData] = useState<ProgressionDataPoint[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/athletes/${athleteId}/progression`)
      .then((r) => r.json())
      .then((rows: { date: string; score: string }[]) =>
        setData(rows.map((r) => ({ date: r.date, score: Number(r.score) })))
      )
      .catch(console.error);
  }, [athleteId]);

  const padding = 40;
  const chartWidth = 500;
  const chartHeight = 300;
  const width = chartWidth + 2 * padding;
  const height = chartHeight + 2 * padding;

  if (data.length === 0) {
    return (
      <div className="event-progression">No progression data available</div>
    );
  }

  const scores = data.map((d) => d.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const scoreRange = maxScore - minScore || 1;

  const scaleX = (index: number): number =>
    padding + (index / (data.length - 1 || 1)) * chartWidth;

  const scaleY = (score: number): number =>
    height - padding - ((score - minScore) / scoreRange) * chartHeight;

  const pathD = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(d.score)}`)
    .join(' ');

  return (
    <div className="event-progression">
      <h3 className="event-progression-title">Progression</h3>
      <div className="event-progression-divider" />
      <svg
        className="event-progression-chart"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`grid-${i}`}
            x1={padding}
            y1={padding + (i / 4) * chartHeight}
            x2={width - padding}
            y2={padding + (i / 4) * chartHeight}
            className="event-progression-grid"
          />
        ))}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          className="event-progression-axis"
        />
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          className="event-progression-axis"
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <text
            key={`y-label-${i}`}
            x={padding - 10}
            y={height - padding - (i / 4) * chartHeight + 5}
            className="event-progression-label"
            textAnchor="end"
          >
            {Math.round(minScore + (i / 4) * scoreRange)}
          </text>
        ))}
        {data.map((d, i) => (
          <text
            key={`x-label-${i}`}
            x={scaleX(i)}
            y={height - padding + 20}
            className="event-progression-label"
            textAnchor="middle"
          >
            {formatDate(d.date)}
          </text>
        ))}
        <path d={pathD} className="event-progression-line" fill="none" />
        {data.map((d, i) => (
          <circle
            key={`dot-${i}`}
            cx={scaleX(i)}
            cy={scaleY(d.score)}
            r="5"
            className="event-progression-dot"
          />
        ))}
      </svg>
    </div>
  );
};

export default Progression;
