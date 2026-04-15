import React, { useEffect, useState, useRef } from 'react';
import './Progression.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

interface RawDataPoint {
  date: string;
  score: string;
  meet_name: string;
  height: string;
  dives_required: number;
  event_name: string;
  final_rank: number | null;
}

interface ProgressionDataPoint {
  date: string;
  score: number;
  meetName: string;
  height: string;
  divesRequired: number;
  eventName: string;
  rank: number | null;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  point: ProgressionDataPoint | null;
}

interface ProgressionProps {
  athleteId: number;
}

function formatDateShort(raw: string): string {
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

function formatDateFull(raw: string): string {
  const iso = raw.includes('T') ? raw.split('T')[0] : raw;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const Progression: React.FC<ProgressionProps> = ({
  athleteId,
}): React.ReactElement => {
  const [data, setData] = useState<ProgressionDataPoint[]>([]);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    point: null,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/athletes/${athleteId}/progression`)
      .then((r) => r.json())
      .then((rows: RawDataPoint[]) =>
        setData(
          rows.map((r) => ({
            date: r.date,
            score: Number(r.score),
            meetName: r.meet_name,
            height: r.height,
            divesRequired: r.dives_required,
            eventName: r.event_name,
            rank: r.final_rank,
          }))
        )
      )
      .catch(console.error);
  }, [athleteId]);

  const padding = 48;
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
  const yPad = scoreRange * 0.05;
  const yMin = minScore - yPad;
  const yMax = maxScore + yPad;
  const yRange = yMax - yMin;

  const scaleX = (index: number): number =>
    padding + (index / (data.length - 1 || 1)) * chartWidth;

  const scaleY = (score: number): number =>
    height - padding - ((score - yMin) / yRange) * chartHeight;

  const pathD = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(d.score)}`)
    .join(' ');

  const maxXLabels = 8;
  const xLabelStep =
    data.length <= maxXLabels ? 1 : Math.ceil(data.length / maxXLabels);

  const handleDotEnter = (
    e: React.MouseEvent<SVGCircleElement>,
    point: ProgressionDataPoint
  ): void => {
    if (!wrapperRef.current) return;
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const circleRect = e.currentTarget.getBoundingClientRect();
    const pixelX = circleRect.left + circleRect.width / 2 - wrapperRect.left;
    const pixelY = circleRect.top + circleRect.height / 2 - wrapperRect.top;
    setTooltip({ visible: true, x: pixelX, y: pixelY, point });
  };

  const handleDotLeave = (): void => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div className="event-progression" ref={containerRef}>
      <h3 className="event-progression-title">Progression</h3>
      <div className="event-progression-divider" />
      <div className="event-progression-chart-wrapper" ref={wrapperRef}>
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
              {Math.round(yMin + (i / 4) * yRange)}
            </text>
          ))}
          {data.map((d, i) =>
            i % xLabelStep === 0 || i === data.length - 1 ? (
              <text
                key={`x-label-${i}`}
                x={scaleX(i)}
                y={height - padding + 20}
                className="event-progression-label"
                textAnchor="middle"
              >
                {formatDateShort(d.date)}
              </text>
            ) : null
          )}
          <path d={pathD} className="event-progression-line" fill="none" />
          {data.map((d, i) => (
            <circle
              key={`dot-${i}`}
              cx={scaleX(i)}
              cy={scaleY(d.score)}
              r="5"
              className="event-progression-dot"
              onMouseEnter={(e): void => handleDotEnter(e, d)}
              onMouseLeave={handleDotLeave}
            />
          ))}
        </svg>
        {tooltip.visible && tooltip.point && (
          <div
            className="progression-tooltip"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div className="progression-tooltip-score">
              {tooltip.point.score.toFixed(2)}
            </div>
            <div className="progression-tooltip-event">
              {tooltip.point.height} — {tooltip.point.divesRequired} dive
            </div>
            <div className="progression-tooltip-meet">
              {tooltip.point.meetName}
            </div>
            <div className="progression-tooltip-date">
              {formatDateFull(tooltip.point.date)}
            </div>
            {tooltip.point.rank != null && (
              <div className="progression-tooltip-rank">
                {ordinal(tooltip.point.rank)} place
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Progression;
