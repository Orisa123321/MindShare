import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, MessageSquare, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../api/users.api';
import { forumApi } from '../api/forum.api';
import { GroupCard } from '../components/dashboard/GroupCard';
import { MaterialCard } from '../components/dashboard/MaterialCard';
import { QuestionCard } from '../components/dashboard/QuestionCard';
import { AnalyticsDashboard } from '../components/dashboard/AnalyticsDashboard';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonList } from '../components/ui/LoadingSpinner';
import type { StudyGroup, StudyMaterial, ForumQuestion } from '../types';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [questions, setQuestions] = useState<ForumQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [gRes, mRes, qRes] = await Promise.allSettled([
          usersApi.getUserGroups(user.id, { limit: 6 }),
          usersApi.getUserMaterials(user.id, { limit: 6 }),
          forumApi.getQuestions({ limit: 5 }),
        ]);
        if (gRes.status === 'fulfilled') setGroups(gRes.value.data);
        if (mRes.status === 'fulfilled') setMaterials(mRes.value.data);
        if (qRes.status === 'fulfilled') setQuestions(qRes.value.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--text)' }}>
          Welcome back, {user?.username} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Here's what's happening across your study world.
        </p>
      </div>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard />

      {/* My Study Groups */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>My Study Groups</h2>
          <button
            id="view-all-groups"
            onClick={() => navigate('/groups')}
            className="flex items-center gap-1 text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors cursor-pointer"
          >
            View All <ArrowRight size={14} />
          </button>
        </div>
        {loading ? (
          <SkeletonList count={3} />
        ) : groups.length === 0 ? (
          <EmptyState
            icon={<Users size={28} />}
            title="No groups yet"
            description="Join a study group to collaborate with fellow students."
            actionLabel="Browse Groups"
            onAction={() => navigate('/groups')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g) => <GroupCard key={g.id} group={g} />)}
          </div>
        )}
      </section>

      {/* Recent Materials */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Recent Materials</h2>
          <button
            id="view-all-materials"
            onClick={() => navigate('/materials')}
            className="flex items-center gap-1 text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors cursor-pointer"
          >
            View All <ArrowRight size={14} />
          </button>
        </div>
        {loading ? (
          <SkeletonList count={3} />
        ) : materials.length === 0 ? (
          <EmptyState
            icon={<FileText size={28} />}
            title="No materials uploaded"
            description="Upload study materials to share with your groups."
            actionLabel="Upload Material"
            onAction={() => navigate('/materials')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((m) => <MaterialCard key={m.id} material={m} />)}
          </div>
        )}
      </section>

      {/* Recent Forum Questions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Recent Questions</h2>
          <button
            id="view-all-questions"
            onClick={() => navigate('/forum')}
            className="flex items-center gap-1 text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors cursor-pointer"
          >
            View All <ArrowRight size={14} />
          </button>
        </div>
        {loading ? (
          <SkeletonList count={3} />
        ) : questions.length === 0 ? (
          <EmptyState
            icon={<MessageSquare size={28} />}
            title="No questions yet"
            description="Be the first to ask a question in the forum."
            actionLabel="Ask a Question"
            onAction={() => navigate('/forum')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {questions.map((q) => <QuestionCard key={q.id} question={q} />)}
          </div>
        )}
      </section>
    </div>
  );
}
