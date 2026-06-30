import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import type { ForumQuestion } from '../../types';

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

interface QuestionCardProps {
  question: ForumQuestion;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const navigate = useNavigate();

  return (
    <div
      id={`question-card-${question.id}`}
      className="card cursor-pointer group"
      onClick={() => navigate(`/forum/${question.id}`)}
    >
      <h3
        className="font-bold text-sm mb-1.5 line-clamp-2 group-hover:text-primary-400 transition-colors"
        style={{ color: 'var(--text)' }}
      >
        {question.title}
      </h3>
      <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-muted)' }}>
        {question.content}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {question.author && (
            <>
              <Avatar username={question.author.username} size="sm" />
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {question.author.username}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1">
            <MessageSquare size={13} />
            {question._count?.answers ?? 0}
          </span>
          <span>{timeAgo(question.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
