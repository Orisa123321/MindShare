import { useNavigate } from 'react-router-dom';
import { Users, Calendar } from 'lucide-react';
import type { StudyGroup } from '../../types';

interface GroupCardProps {
  group: StudyGroup;
}

export function GroupCard({ group }: GroupCardProps) {
  const navigate = useNavigate();

  return (
    <div
      id={`group-card-${group.id}`}
      className="card cursor-pointer group relative overflow-hidden"
      onClick={() => navigate(`/groups/${group.id}`)}
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-400 to-primary-600 rounded-l-2xl opacity-60 group-hover:opacity-100 transition-opacity" />

      <div className="pl-3">
        <h3
          className="font-bold text-sm mb-1 line-clamp-2 group-hover:text-primary-400 transition-colors"
          style={{ color: 'var(--text)' }}
        >
          {group.title}
        </h3>
        {group.description && (
          <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-muted)' }}>
            {group.description}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1">
            <Users size={13} />
            {group._count?.members ?? 0} members
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={13} />
            {new Date(group.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
