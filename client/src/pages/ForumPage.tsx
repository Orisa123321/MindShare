import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageSquare } from 'lucide-react';
import { forumApi } from '../api/forum.api';
import { QuestionCard } from '../components/dashboard/QuestionCard';
import { Button } from '../components/ui/Button';
import { SearchBar } from '../components/ui/SearchBar';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonList } from '../components/ui/LoadingSpinner';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import type { ForumQuestion } from '../types';
import toast from 'react-hot-toast';

export function ForumPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<ForumQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAsk, setShowAsk] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [asking, setAsking] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await forumApi.getQuestions({ search: search || undefined, page, limit: 10 });
      setQuestions(res.data);
      setTotalPages(res.pagination.pages);
    } catch {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, [search, page]);

  const handleAsk = async () => {
    if (!newTitle.trim() || !newContent.trim()) { toast.error('Title and content are required'); return; }
    setAsking(true);
    try {
      const q = await forumApi.createQuestion({ title: newTitle.trim(), content: newContent.trim() });
      toast.success('Question posted!');
      setShowAsk(false);
      setNewTitle('');
      setNewContent('');
      navigate(`/forum/${q.id}`);
    } catch {
      toast.error('Failed to post question');
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <MessageSquare size={28} className="text-primary-400" />
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text)' }}>Forum</h1>
            <div className="w-12 h-1 rounded-full bg-gradient-to-r from-primary-500 to-secondary-400 mt-1" />
          </div>
        </div>
        <Button
          id="ask-question-btn"
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => setShowAsk(true)}
        >
          Ask Question
        </Button>
      </div>

      <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search questions…" />

      {loading ? (
        <SkeletonList count={5} />
      ) : questions.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={28} />}
          title="No questions yet"
          description={search ? 'Try a different search term.' : 'Be the first to ask a question!'}
          actionLabel="Ask Question"
          onAction={() => setShowAsk(true)}
        />
      ) : (
        <div className="space-y-3">
          {questions.map((q) => <QuestionCard key={q.id} question={q} />)}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Ask Question Modal */}
      <Modal isOpen={showAsk} onClose={() => setShowAsk(false)} title="Ask a Question" size="lg">
        <div className="space-y-4">
          <Input
            id="question-title"
            label="Title"
            placeholder="What's your question about?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Details</label>
            <textarea
              id="question-content"
              rows={5}
              className="w-full rounded-xl px-4 py-3 text-sm border outline-none resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
              placeholder="Provide context, share what you've tried so far…"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowAsk(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAsk} isLoading={asking}>Post Question</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
