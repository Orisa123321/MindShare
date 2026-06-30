import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilterChange?: (filter: 'all' | 'groups' | 'materials' | 'questions') => void;
  activeFilter?: string;
  placeholder?: string;
  showFilters?: boolean;
}

const filters = [
  { key: 'all', label: 'All' },
  { key: 'groups', label: 'Groups' },
  { key: 'materials', label: 'Materials' },
  { key: 'questions', label: 'Questions' },
] as const;

export function SearchBar({
  value,
  onChange,
  onFilterChange,
  activeFilter = 'all',
  placeholder = 'Search groups, materials, questions…',
  showFilters = false,
}: SearchBarProps) {
  const [local, setLocal] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = (val: string) => {
    setLocal(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(val), 300);
  };

  return (
    <div className="w-full">
      <div
        className="relative flex items-center rounded-xl border transition-all duration-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20"
        style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
      >
        <Search size={18} className="absolute left-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        <input
          id="global-search"
          type="text"
          value={local}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent pl-11 pr-10 py-3 text-sm outline-none"
          style={{ color: 'var(--text)' }}
        />
        {local && (
          <button
            onClick={() => handleChange('')}
            className="absolute right-3 p-1 rounded-md hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {showFilters && onFilterChange && (
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.key}
              id={`filter-${f.key}`}
              onClick={() => onFilterChange(f.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeFilter === f.key
                  ? 'bg-primary-500 text-white shadow-[0_0_10px_rgba(108,92,231,0.3)]'
                  : 'hover:bg-[var(--surface-2)]'
              }`}
              style={activeFilter !== f.key ? { color: 'var(--text-secondary)', background: 'var(--surface)' } : undefined}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
