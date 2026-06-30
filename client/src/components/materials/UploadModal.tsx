import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, CheckCircle } from 'lucide-react';
import { materialsApi } from '../../api/materials.api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import toast from 'react-hot-toast';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId?: string;
  onUploadComplete?: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const MAX_SIZE = 200 * 1024 * 1024; // 200 MB

export function UploadModal({ isOpen, onClose, groupId, onUploadComplete }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) {
      const f = accepted[0];
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_SIZE,
    multiple: false,
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors[0];
      toast.error(err?.message || 'File rejected');
    },
  });

  const handleUpload = async () => {
    if (!file) { toast.error('Select a file first'); return; }
    if (!title.trim()) { toast.error('Title is required'); return; }

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim());
    if (groupId) formData.append('group_id', groupId);

    try {
      // Simulate progress since axios onUploadProgress doesn't always work with interceptors
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 15, 90));
      }, 200);

      await materialsApi.upload(formData);

      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        toast.success('Material uploaded!');
        setFile(null);
        setTitle('');
        setProgress(0);
        onClose();
        onUploadComplete?.();
      }, 500);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setFile(null);
    setTitle('');
    setProgress(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Study Material" size="md">
      <div className="space-y-5">
        {/* Dropzone */}
        {!file ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragActive ? 'border-primary-500 bg-primary-500/5' : 'border-[var(--border)] hover:border-primary-500/50'
            }`}
          >
            <input {...getInputProps()} id="file-dropzone" />
            <Upload
              size={32}
              className={`mx-auto mb-3 transition-colors ${isDragActive ? 'text-primary-400' : ''}`}
              style={isDragActive ? undefined : { color: 'var(--text-muted)' }}
            />
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {isDragActive ? 'Drop your file here…' : 'Drag & drop a file, or click to browse'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Max size: 200 MB
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-3)', color: 'var(--color-secondary-400)' }}>
              <File size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{file.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatSize(file.size)}</p>
            </div>
            {!uploading && (
              <button
                onClick={() => setFile(null)}
                className="p-1.5 rounded-lg hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Title */}
        <Input
          id="upload-title"
          label="Material Title"
          placeholder="Give your material a descriptive title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={uploading}
        />

        {/* Progress bar */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span>{progress < 100 ? 'Uploading…' : 'Complete!'}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            {progress >= 100 && (
              <div className="flex items-center gap-2 text-sm font-medium animate-fade-in" style={{ color: 'var(--color-success)' }}>
                <CheckCircle size={16} /> Upload complete
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose} disabled={uploading}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            isLoading={uploading}
            leftIcon={<Upload size={16} />}
            disabled={!file || !title.trim()}
          >
            Upload
          </Button>
        </div>
      </div>
    </Modal>
  );
}
