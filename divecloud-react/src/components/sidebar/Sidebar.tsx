import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

interface SidebarProps {
  open: boolean;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactElement;
}

const homeIcon = (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path
      d="M3 8.5L11 2l8 6.5V19a1 1 0 01-1 1H4a1 1 0 01-1-1V8.5z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M8 20v-7h6v7"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const meetsIcon = (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect
      x="3"
      y="3"
      width="16"
      height="16"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path d="M3 8h16" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M7 3v5M15 3v5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="8" cy="13" r="1" fill="currentColor" />
    <circle cx="11" cy="13" r="1" fill="currentColor" />
    <circle cx="14" cy="13" r="1" fill="currentColor" />
  </svg>
);

const profileIcon = (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M3 20c0-4.4 3.6-8 8-8s8 3.6 8 8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const teamIcon = (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="16" cy="7" r="3" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M1 19c0-3.3 2.7-6 6-6s6 2.7 6 6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M13 19c0-3.3 2.7-6 6-6s6 2.7 6 6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export default function Sidebar({ open }: SidebarProps): React.ReactElement {
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  const visibleItems: NavItem[] = [
    { to: '/', label: 'Home', icon: homeIcon },
    { to: '/meets', label: 'Meets', icon: meetsIcon },
  ];

  if (!authLoading && isAuthenticated && user) {
    if (user.role === 'coach' && user.team_id) {
      visibleItems.push({
        to: `/team/${user.team_id}`,
        label: 'Team',
        icon: teamIcon,
      });
    } else if (user.role === 'athlete') {
      visibleItems.push({
        to: '/profile',
        label: 'Profile',
        icon: profileIcon,
      });
    }
  }

  return (
    <nav className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <ul className="sidebar-nav">
        {visibleItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }): string =>
                `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
              }
              end={item.to === '/'}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
