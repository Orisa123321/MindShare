import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, Trash2, MessageSquare, Bot, Send } from 'lucide-react';
import { forumApi } from '../api/forum.api';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { ForumQuestion, ForumAnswer } from '../types';
import toast from 'react-hot-toast';
import { getSocket } from '../config/socket';

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

export function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<ForumQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);

  const fetchQuestion = async () => {
    if (!id) return;
    try {
      const q = await forumApi.getQuestionById(id);
      setQuestion(q);
    } catch {
      toast.error('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
    
    if (id) {
      const socket = getSocket();
      socket.emit('join_question', id);
      
      const handleNewAnswer = (answer: ForumAnswer) => {
        // Append the new answer if it doesn't already exist
        setQuestion((prev) => {
          if (!prev) return prev;
          const exists = prev.answers?.some((a) => a.id === answer.id);
          if (exists) return prev;
          
          return {
            ...prev,
            answers: [...(prev.answers || []), answer]
          };
        });
      };
      
      socket.on('new_answer', handleNewAnswer);
      
      return () => {
        socket.emit('leave_question', id);
        socket.off('new_answer', handleNewAnswer);
      };
    }
  }, [id]);

  const handleDeleteQuestion = async () => {
    if (!id || !confirm('Delete this question? This cannot be undone.')) return;
    try {
      await forumApi.deleteQuestion(id);
      toast.success('Question deleted');
      navigate('/forum');
    } catch {
      toast.error('Failed to delete question');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!id || !answerText.trim()) return;
    setSubmitting(true);
    try {
      await forumApi.createAnswer(id, { content: answerText.trim() });
      setAnswerText('');
      toast.success('Answer posted!');
      fetchQuestion();
    } catch {
      toast.error('Failed to post answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateAIAnswer = async () => {
    if (!id) return;
    setGeneratingAI(true);
    try {
      await forumApi.generateAIAnswer(id);
      toast.success('AI Answer generated!');
      fetchQuestion();
    } catch {
      toast.error('Failed to generate AI answer');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleVote = async (answerId: string, value: 1 | -1) => {
    setVotingId(answerId);
    try {
      await forumApi.vote(answerId, value);
      fetchQuestion();
    } catch {
      toast.error('Failed to vote');
    } finally {
      setVotingId(null);
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm('Delete this answer?')) return;
    try {
      await forumApi.deleteAnswer(answerId);
      toast.success('Answer deleted');
      fetchQuestion();
    } catch {
      toast.error('Failed to delete answer');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!question) {
    return (
      <EmptyState
        icon={<MessageSquare size={28} />}
        title="Question not found"
        description="This question may have been deleted."
        actionLabel="Back to Forum"
        onAction={() => navigate('/forum')}
      />
    );
  }

  const answers = question.answers || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Question */}
      <article className="card-flat animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-extrabold leading-tight" style={{ color: 'var(--text)' }}>
            {question.title}
          </h1>
          {user?.id === question.userId && (
            <Button
              size="sm"
              variant="danger"
              leftIcon={<Trash2 size={14} />}
              onClick={handleDeleteQuestion}
            >
              Delete
            </Button>
          )}
        </div>

        {/* Author + time */}
        <div className="flex items-center gap-2 mt-4 mb-5">
          {question.author && (
            <>
              <Avatar username={question.author.username} size="sm" />
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {question.author.username}
              </span>
            </>
          )}
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            · {timeAgo(question.createdAt)}
          </span>
        </div>

        {/* Content */}
        <div
          className="text-sm leading-relaxed whitespace-pre-wrap"
          style={{ color: 'var(--text-secondary)' }}
        >
          {question.content}
        </div>
      </article>

      {/* Answers header */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      {/* Answers list */}
      {answers.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={24} />}
          title="No answers yet"
          description="Be the first to share your knowledge!"
        />
      ) : (
        <div className="space-y-4">
          {answers.map((answer: ForumAnswer) => (
            <div key={answer.id} className="card-flat animate-slide-up flex gap-3">
              {/* Vote column */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <button
                  id={`upvote-${answer.id}`}
                  onClick={() => handleVote(answer.id, 1)}
                  disabled={votingId === answer.id}
                  className={`p-1 rounded-lg transition-all duration-200 cursor-pointer hover:bg-primary-500/10 ${
                    answer.userVote === 1 ? 'text-primary-400' : ''
                  }`}
                  style={answer.userVote !== 1 ? { color: 'var(--text-muted)' } : undefined}
                >
                  <ChevronUp size={20} />
                </button>
                <span
                  className="text-sm font-bold min-w-[20px] text-center"
                  style={{ color: 'var(--text)' }}
                >
                  {answer.voteScore ?? 0}
                </span>
                <button
                  id={`downvote-${answer.id}`}
                  onClick={() => handleVote(answer.id, -1)}
                  disabled={votingId === answer.id}
                  className={`p-1 rounded-lg transition-all duration-200 cursor-pointer hover:bg-red-500/10 ${
                    answer.userVote === -1 ? 'text-red-400' : ''
                  }`}
                  style={answer.userVote !== -1 ? { color: 'var(--text-muted)' } : undefined}
                >
                  <ChevronDown size={20} />
                </button>
              </div>

              {/* Answer body */}
              <div className="flex-1 min-w-0">
                {/* Author row */}
                <div className="flex items-center gap-2 mb-2">
                  {answer.author && (
                    <>
                      <Avatar username={answer.author.username} size="sm" />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {answer.author.username}
                      </span>
                    </>
                  )}
                  {answer.isAiGenerated && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 text-xs font-bold">
                      <Bot size={12} /> AI
                    </span>
                  )}
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    · {timeAgo(answer.createdAt)}
                  </span>
                  {user?.id === answer.userId && (
                    <button
                      onClick={() => handleDeleteAnswer(answer.id)}
                      className="ml-auto p-1 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {answer.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post answer form */}
      <div className="card-flat">
        <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text)' }}>Your Answer</h3>
        <textarea
          id="answer-input"
          rows={4}
          className="w-full rounded-xl px-4 py-3 text-sm border outline-none resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
          placeholder="Share your knowledge…"
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
        />
        <div className="flex justify-end mt-3">
          <Button
            id="submit-answer-btn"
            variant="primary"
            onClick={handleSubmitAnswer}
            isLoading={submitting}
            disabled={!answerText.trim() || generatingAI}
            leftIcon={<Send size={14} />}
          >
            Post Answer
          </Button>
        </div>
        <div className="flex justify-end mt-3 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
          <Button
            id="generate-ai-answer-btn"
            variant="secondary"
            onClick={handleGenerateAIAnswer}
            isLoading={generatingAI}
            disabled={submitting}
            leftIcon={<Bot size={14} />}
          >
            Generate AI Answer
          </Button>
        </div>
      </div>
    </div>
  );
}
