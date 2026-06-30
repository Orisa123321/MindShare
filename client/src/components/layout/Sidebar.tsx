import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  User,
  LogOut,
  Sun,
  Moon,
  BookOpen,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/groups', label: 'Study Groups', icon: Users },
  { to: '/materials', label: 'Materials', icon: FileText },
  { to: '/forum', label: 'Forum', icon: MessageSquare },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
          style={{ animation: 'fade-in 0.2s ease-out' }}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[260px] flex flex-col border-r
          transition-transform duration-300 ease-out
          md:translate-x-0 md:z-30
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-5 h-16 shrink-0">
          <NavLink to="/dashboard" className="flex items-center gap-2.5 group" onClick={onClose}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center shadow-lg group-hover:shadow-[var(--shadow-glow)] transition-shadow">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="text-lg font-extrabold gradient-text tracking-tight">StudyShare</span>
          </NavLink>
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            onClick={onClose}
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-400 font-semibold'
                    : 'hover:bg-[var(--surface-2)] hover:translate-x-0.5'
                }`
              }
              style={({ isActive }) => (isActive ? undefined : { color: 'var(--text-secondary)' })}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} className={isActive ? 'text-primary-400' : ''} />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400 shadow-[0_0_6px_rgba(108,92,231,0.6)]" />
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* Profile link */}
          {user && (
            <NavLink
              to={`/profile/${user.id}`}
              id="nav-profile"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-400 font-semibold'
                    : 'hover:bg-[var(--surface-2)] hover:translate-x-0.5'
                }`
              }
              style={({ isActive }) => (isActive ? undefined : { color: 'var(--text-secondary)' })}
            >
              {({ isActive }) => (
                <>
                  <User size={18} className={isActive ? 'text-primary-400' : ''} />
                  <span>Profile</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400 shadow-[0_0_6px_rgba(108,92,231,0.6)]" />
                  )}
                </>
              )}
            </NavLink>
          )}
        </nav>

        {/* Bottom controls */}
        <div className="px-3 py-4 space-y-1 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-[var(--surface-2)] cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
