import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { materialsApi } from '../api/materials.api';
import { MaterialCard } from '../components/dashboard/MaterialCard';
import { Button } from '../components/ui/Button';
import { SearchBar } from '../components/ui/SearchBar';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonList } from '../components/ui/LoadingSpinner';
import { UploadModal } from '../components/materials/UploadModal';
import type { StudyMaterial } from '../types';
import toast from 'react-hot-toast';

export function MaterialsPage() {
  const [searchParams] = useSearchParams();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUpload, setShowUpload] = useState(false);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await materialsApi.getAll({ search: search || undefined, page, limit: 12 });
      setMaterials(res.data);
      setTotalPages(res.pagination.pages);
    } catch {
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMaterials(); }, [search, page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text)' }}>Study Materials</h1>
          <div className="w-12 h-1 rounded-full bg-gradient-to-r from-secondary-400 to-primary-500 mt-1" />
        </div>
        <Button
          id="upload-material-btn"
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => setShowUpload(true)}
        >
          Upload
        </Button>
      </div>

      <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search materials…" />

      {loading ? (
        <SkeletonList count={8} />
      ) : materials.length === 0 ? (
        <EmptyState
          icon={<FileText size={28} />}
          title="No materials found"
          description={search ? 'Try a different search term.' : 'Upload your first study material!'}
          actionLabel="Upload Material"
          onAction={() => setShowUpload(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {materials.map((m) => <MaterialCard key={m.id} material={m} />)}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <UploadModal isOpen={showUpload} onClose={() => setShowUpload(false)} onUploadComplete={fetchMaterials} />
    </div>
  );
}
