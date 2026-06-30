import { useState } from 'react';
import { FileText, Image, Film, FileArchive, Download, Sparkles } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import toast from 'react-hot-toast';
import type { StudyMaterial } from '../../types';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <Image size={20} />;
  if (mimeType.startsWith('video/')) return <Film size={20} />;
  if (mimeType.includes('zip') || mimeType.includes('rar')) return <FileArchive size={20} />;
  return <FileText size={20} />;
}

interface MaterialCardProps {
  material: StudyMaterial;
}

export function MaterialCard({ material }: MaterialCardProps) {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleSummarize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSummarizing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/materials/${material.id}/summarize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setSummary(data.data.summary);
        toast.success('Summary generated successfully');
      } else {
        toast.error(data.message || 'Failed to generate summary');
      }
    } catch (error) {
      toast.error('An error occurred while generating summary');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div id={`material-card-${material.id}`} className="card group flex flex-col transition-all">
      <div className="flex items-start gap-3">
        {/* File icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--surface-2)', color: 'var(--color-secondary-400)' }}
        >
          {getFileIcon(material.mimeType)}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="font-bold text-sm truncate group-hover:text-primary-400 transition-colors"
            style={{ color: 'var(--text)' }}
          >
            {material.title}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {formatFileSize(material.fileSize)} · {timeAgo(material.createdAt)}
          </p>
        </div>

        <div className="flex gap-2">
          {/* Summarize button (visible on hover) */}
          <button
            title="Summarize with AI"
            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary-500/10"
            style={{ color: 'var(--color-primary-400)' }}
            onClick={handleSummarize}
            disabled={isSummarizing}
          >
            {isSummarizing ? (
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
          </button>

          {/* Download button (visible on hover) */}
          <a
            href={material.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary-500/10"
            style={{ color: 'var(--color-primary-400)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={16} />
          </a>
        </div>
      </div>

      {/* AI Summary Display */}
      {summary && (
        <div className="mt-3 p-3 rounded-lg text-sm" style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>
          <div className="flex items-center gap-1.5 mb-1" style={{ color: 'var(--color-primary-400)' }}>
            <Sparkles size={14} />
            <span className="font-semibold text-xs">AI Summary</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {summary}
          </p>
        </div>
      )}

      {/* Uploader */}
      {material.uploadedBy && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <Avatar username={material.uploadedBy.username} size="sm" />
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {material.uploadedBy.username}
          </span>
        </div>
      )}
    </div>
  );
}
