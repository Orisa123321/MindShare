import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const tabs = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/groups', label: 'Groups', icon: Users },
  { to: '/materials', label: 'Materials', icon: FileText },
  { to: '/forum', label: 'Forum', icon: MessageSquare },
];

export function MobileBottomNav() {
  const { user } = useAuth();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden glass border-t"
      style={{ borderColor: 'var(--border)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            id={`mobile-nav-${tab.label.toLowerCase()}`}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all duration-200 ${
                isActive ? 'text-primary-400 scale-105' : ''
              }`
            }
            style={({ isActive }) => (isActive ? undefined : { color: 'var(--text-muted)' })}
          >
            {({ isActive }) => (
              <>
                <tab.icon size={20} />
                <span className="text-[10px] font-semibold">{tab.label}</span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-primary-400 shadow-[0_0_4px_rgba(108,92,231,0.6)]" />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Profile tab */}
        {user && (
          <NavLink
            to={`/profile/${user.id}`}
            id="mobile-nav-profile"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all duration-200 ${
                isActive ? 'text-primary-400 scale-105' : ''
              }`
            }
            style={({ isActive }) => (isActive ? undefined : { color: 'var(--text-muted)' })}
          >
            {({ isActive }) => (
              <>
                <User size={20} />
                <span className="text-[10px] font-semibold">Profile</span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-primary-400 shadow-[0_0_4px_rgba(108,92,231,0.6)]" />
                )}
              </>
            )}
          </NavLink>
        )}
      </div>
    </nav>
  );
}
