import { Menu, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';

interface TopNavBarProps {
  onMenuToggle: () => void;
  title?: string;
}

export function TopNavBar({ onMenuToggle, title }: TopNavBarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/materials?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  return (
    <header
      className="fixed top-0 right-0 left-0 md:left-[260px] z-30 h-16 flex items-center justify-between px-4 md:px-6 border-b glass"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        <button
          id="menu-toggle"
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
          style={{ color: 'var(--text)' }}
        >
          <Menu size={20} />
        </button>
        {title && (
          <h1 className="text-lg font-bold hidden sm:block" style={{ color: 'var(--text)' }}>
            {title}
          </h1>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Search */}
        {showSearch ? (
          <form onSubmit={handleSearch} className="animate-slide-left">
            <input
              id="topnav-search-input"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => { if (!searchQuery) setShowSearch(false); }}
              placeholder="Search…"
              className="w-40 sm:w-56 px-3 py-1.5 rounded-lg text-sm border outline-none focus:border-primary-500 transition-colors"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </form>
        ) : (
          <button
            id="topnav-search-btn"
            onClick={() => setShowSearch(true)}
            className="p-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Search size={18} />
          </button>
        )}

        {/* User avatar */}
        {user && (
          <button
            id="topnav-avatar"
            onClick={() => navigate(`/profile/${user.id}`)}
            className="ml-1 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Avatar username={user.username} size="sm" />
          </button>
        )}
      </div>
    </header>
  );
}
