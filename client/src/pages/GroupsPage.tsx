import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { groupsApi } from '../api/groups.api';
import { GroupCard } from '../components/dashboard/GroupCard';
import { Button } from '../components/ui/Button';
import { SearchBar } from '../components/ui/SearchBar';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonList } from '../components/ui/LoadingSpinner';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import type { StudyGroup } from '../types';
import toast from 'react-hot-toast';

export function GroupsPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await groupsApi.getAll({ search: search || undefined, page, limit: 12 });
      setGroups(res.data);
      setTotalPages(res.pagination.pages);
    } catch {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGroups(); }, [search, page]);

  const handleCreate = async () => {
    if (!newTitle.trim()) { toast.error('Title is required'); return; }
    setCreating(true);
    try {
      const group = await groupsApi.create({ title: newTitle.trim(), description: newDesc.trim() || undefined });
      toast.success('Group created!');
      setShowCreate(false);
      setNewTitle('');
      setNewDesc('');
      navigate(`/groups/${group.id}`);
    } catch {
      toast.error('Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text)' }}>Study Groups</h1>
          <div className="w-12 h-1 rounded-full bg-gradient-to-r from-primary-500 to-secondary-400 mt-1" />
        </div>
        <Button
          id="create-group-btn"
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => setShowCreate(true)}
        >
          Create Group
        </Button>
      </div>

      {/* Search */}
      <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} />

      {/* Grid */}
      {loading ? (
        <SkeletonList count={6} />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title="No groups found"
          description={search ? 'Try a different search term.' : 'Be the first to create a study group!'}
          actionLabel="Create Group"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => <GroupCard key={g.id} group={g} />)}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Study Group">
        <div className="space-y-4">
          <Input
            id="new-group-title"
            label="Group Title"
            placeholder="e.g., Calculus II Study Group"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Description (optional)</label>
            <textarea
              id="new-group-desc"
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-sm border outline-none resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
              placeholder="What will this group study?"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} isLoading={creating}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
