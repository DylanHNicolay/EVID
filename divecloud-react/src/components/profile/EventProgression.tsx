import React from 'react';
import './EventProgression.css';

interface ProgressionDataPoint {
  date: string;
  score: number;
}

interface EventProgressionProps {
  data?: ProgressionDataPoint[];
  title?: string;
}

const mockData: ProgressionDataPoint[] = [
  { date: '2018', score: 450 },
  { date: '2019', score: 600 },
  { date: '2020', score: 650 },
  { date: '2021', score: 750 },
  { date: '2022', score: 800 },
  { date: '2023', score: 850 },
  { date: '2024', score: 920 },
  { date: '2025', score: 950 },
];

const EventProgression: React.FC<EventProgressionProps> = ({
  data = mockData,
  title = 'Progression',
}): React.ReactElement => {
  // Calculate chart dimensions
  const padding = 40;
  const chartWidth = 500;
  const chartHeight = 300;
  const width = chartWidth + 2 * padding;
  const height = chartHeight + 2 * padding;

  if (!data || data.length === 0) {
    return <div className="event-progression">No data available</div>;
  }

  // Find min and max scores
  const scores = data.map((d) => d.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const scoreRange = maxScore - minScore || 1;

  // Scale functions
  const scaleX = (index: number): number => {
    return padding + (index / (data.length - 1)) * chartWidth;
  };

  const scaleY = (score: number): number => {
    return height - padding - ((score - minScore) / scoreRange) * chartHeight;
  };

  // Generate line path
  const pathD = data
    .map((d, i) => {
      const x = scaleX(i);
      const y = scaleY(d.score);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="event-progression">
      <h3 className="event-progression-title">{title}</h3>
      <div className="event-progression-divider" />
      <svg
        className="event-progression-chart"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
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

        {/* Y-axis */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          className="event-progression-axis"
        />

        {/* X-axis */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          className="event-progression-axis"
        />

        {/* Y-axis labels */}
        {[0, 1, 2, 3, 4].map((i) => {
          const value = Math.round(minScore + (i / 4) * scoreRange);
          return (
            <text
              key={`y-label-${i}`}
              x={padding - 10}
              y={height - padding - (i / 4) * chartHeight + 5}
              className="event-progression-label"
              textAnchor="end"
            >
              {value}
            </text>
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={`x-label-${i}`}
            x={scaleX(i)}
            y={height - padding + 20}
            className="event-progression-label"
            textAnchor="middle"
          >
            {d.date}
          </text>
        ))}

        {/* Line */}
        <path d={pathD} className="event-progression-line" fill="none" />

        {/* Dots */}
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

export default EventProgression;
