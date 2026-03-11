import * as React from "react";
import { useState } from "react";
import "./RankingCard.css";

interface RankingEntry {
  id: number;
  name: string;
  rank: number;
  type: "country" | "national" | "regional";
  abbr: string;
  accentColor: string;
}

const rankingsData: RankingEntry[] = [
  {
    id: 1,
    name: "United States",
    rank: 7,
    type: "country",
    abbr: "US",
    accentColor: "#c0392b",
  },
  {
    id: 2,
    name: "USA Diving",
    rank: 4,
    type: "national",
    abbr: "USA",
    accentColor: "#1a3a6b",
  },
  {
    id: 3,
    name: "South Texas Diving",
    rank: 2,
    type: "regional",
    abbr: "STX",
    accentColor: "#0e6e45",
  },
];

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

interface RankingCardProps {
  season?: string;
  title?: string;
  entries?: RankingEntry[];
  onSeeAll?: () => void;
}

const RankingCard: React.FC<RankingCardProps> = ({
  season = "2025-2026",
  title = "Rankings",
  entries = rankingsData,
  onSeeAll,
}) => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="rc-card">
      {/* Header */}
      <div className="rc-header">
        <span className="rc-title">{title}</span>
        <button className="rc-see-all" onClick={onSeeAll}>
          See all
        </button>
      </div>

      {/* Horizontal rule */}
      <div className="rc-divider" />

      {/* Season label */}
      <div className="rc-season">SEASON {season}</div>

      {/* Ranking rows */}
      <ul className="rc-list">
        {entries.map((entry, i) => (
          <li
            key={entry.id}
            className={`rc-item${hoveredId === entry.id ? " rc-item--hovered" : ""}`}
            style={{ animationDelay: `${i * 70}ms` }}
            onMouseEnter={() => setHoveredId(entry.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div
              className="rc-badge"
              style={{ backgroundColor: entry.accentColor }}
            >
              <span className="rc-badge-abbr">{entry.abbr}</span>
            </div>
            <span className="rc-name">{entry.name}</span>
            <span className="rc-rank">
              {ordinal(entry.rank)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RankingCard;