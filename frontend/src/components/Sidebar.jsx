import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  IconHome, IconGrades, IconDoc,
  IconClearance, IconLogout, IconSchool,
} from './Icons.jsx';

const navItems = [
  { to: '/dashboard',        icon: IconHome,      label: 'Homepage' },
  { to: '/grades',           icon: IconGrades,    label: 'Grades per Semester' },
  { to: '/document-request', icon: IconDoc,       label: 'Document Requests' },
  { to: '/clearance',        icon: IconClearance, label: 'Clearance Status' },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-logo">
          <IconSchool size={20} />
        </div>
        <span className="sidebar-brand-text">University of<br />CuyoTech</span>
      </div>

      {/* Nav links */}
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              'sidebar-nav-item' + (isActive ? ' active' : '')
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          <IconLogout size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}
