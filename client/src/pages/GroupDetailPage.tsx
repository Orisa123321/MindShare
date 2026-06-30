import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, FileText, Calendar, LogIn, LogOut, Trash2, Edit2, Crown, Send, MessageSquare } from 'lucide-react';
import { groupsApi } from '../api/groups.api';
import { chatApi } from '../api/chat.api';
import { getSocket } from '../config/socket';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { MaterialCard } from '../components/dashboard/MaterialCard';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { UploadModal } from '../components/materials/UploadModal';
import type { StudyGroup, GroupMember, StudyMaterial } from '../types';
import toast from 'react-hot-toast';

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'materials' | 'members' | 'chat'>('materials');
  const [showUpload, setShowUpload] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isOwner = user?.id === group?.createdById;
  const isMember = members.some((m) => m.userId === user?.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [g, mem, mat] = await Promise.all([
        groupsApi.getById(id),
        groupsApi.getMembers(id),
        groupsApi.getMaterials(id),
      ]);
      setGroup(g);
      setMembers(mem);
      setMaterials(mat.data);
    } catch {
      toast.error('Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'chat' && id && isMember) {
      const loadMessages = async () => {
        try {
          const msgs = await chatApi.getGroupMessages(id);
          setMessages(msgs);
        } catch {
          toast.error('Failed to load chat history');
        }
      };
      loadMessages();

      const socket = getSocket();
      socket.emit('join_group', id);

      const handleNewMessage = (msg: any) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      };

      socket.on('new_message', handleNewMessage);

      return () => {
        socket.emit('leave_group', id);
        socket.off('new_message', handleNewMessage);
      };
    }
  }, [activeTab, id, isMember]);

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !id || !user) return;
    const socket = getSocket();
    socket.emit('send_message', {
      groupId: id,
      userId: user.id,
      content: messageText.trim(),
    });
    setMessageText('');
  };

  const handleJoin = async () => {
    if (!id) return;
    try {
      await groupsApi.join(id);
      toast.success('Joined group!');
      fetchData();
    } catch {
      toast.error('Failed to join group');
    }
  };

  const handleLeave = async () => {
    if (!id) return;
    try {
      await groupsApi.leave(id);
      toast.success('Left group');
      fetchData();
    } catch {
      toast.error('Failed to leave group');
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Delete this group? This cannot be undone.')) return;
    try {
      await groupsApi.delete(id);
      toast.success('Group deleted');
      navigate('/groups');
    } catch {
      toast.error('Failed to delete group');
    }
  };

  const handleEdit = async () => {
    if (!id || !editTitle.trim()) return;
    setSaving(true);
    try {
      const updated = await groupsApi.update(id, { title: editTitle.trim(), description: editDesc.trim() || undefined });
      setGroup(updated);
      setShowEdit(false);
      toast.success('Group updated');
    } catch {
      toast.error('Failed to update group');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!group) return <EmptyState icon={<Users size={28} />} title="Group not found" description="This group may have been deleted." />;

  const tabs = [
    { key: 'materials' as const, label: 'Materials', icon: FileText, count: materials.length },
    { key: 'members' as const, label: 'Members', icon: Users, count: members.length },
    { key: 'chat' as const, label: 'Group Chat', icon: MessageSquare, count: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Group Header */}
      <div className="card-flat">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text)' }}>{group.title}</h1>
            {group.description && (
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{group.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1"><Users size={14} /> {members.length} members</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(group.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isOwner ? (
              <>
                <Button size="sm" variant="ghost" leftIcon={<Edit2 size={14} />}
                  onClick={() => { setEditTitle(group.title); setEditDesc(group.description || ''); setShowEdit(true); }}
                >Edit</Button>
                <Button size="sm" variant="danger" leftIcon={<Trash2 size={14} />} onClick={handleDelete}>Delete</Button>
              </>
            ) : isMember ? (
              <Button size="sm" variant="ghost" leftIcon={<LogOut size={14} />} onClick={handleLeave}>Leave</Button>
            ) : (
              <Button size="sm" variant="primary" leftIcon={<LogIn size={14} />} onClick={handleJoin}>Join Group</Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b" style={{ borderColor: 'var(--border)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer ${
              activeTab === tab.key
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent hover:border-[var(--border)]'
            }`}
            style={activeTab !== tab.key ? { color: 'var(--text-muted)' } : undefined}
          >
            <tab.icon size={16} />
            {tab.label}
            <span className="px-1.5 py-0.5 rounded-md text-xs font-bold" style={{ background: 'var(--surface-2)' }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'materials' && (
        <div>
          {isMember && (
            <div className="mb-4 flex justify-end">
              <Button size="sm" variant="secondary" onClick={() => setShowUpload(true)}>Upload Material</Button>
            </div>
          )}
          {materials.length === 0 ? (
            <EmptyState icon={<FileText size={28} />} title="No materials yet" description="Upload study materials for this group." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((m) => <MaterialCard key={m.id} material={m} />)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {members.map((m) => (
            <div
              key={m.userId}
              className="card-flat flex flex-col items-center text-center py-5 cursor-pointer hover:border-primary-500/30 transition-colors"
              onClick={() => navigate(`/profile/${m.userId}`)}
            >
              <Avatar username={m.user?.username || 'U'} size="lg" />
              <p className="text-sm font-semibold mt-2" style={{ color: 'var(--text)' }}>
                {m.user?.username}
              </p>
              {m.role === 'OWNER' && (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-400 mt-1">
                  <Crown size={12} /> Owner
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="card-flat flex flex-col h-[500px]">
          {!isMember ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={<MessageSquare size={28} />}
                title="Join group to chat"
                description="Only members of this group can view and send messages."
                actionLabel="Join Group"
                onAction={handleJoin}
              />
            </div>
          ) : (
            <>
              {/* Message List */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    No messages yet. Send a message to start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSelf = msg.userId === user?.id;
                    return (
                      <div key={msg.id} className={`flex items-start gap-2.5 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                        {!isSelf && (
                          <Avatar username={msg.user?.username || 'U'} size="sm" />
                        )}
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                          isSelf 
                            ? 'bg-primary-500/10 text-[var(--text)] rounded-tr-none' 
                            : 'bg-surface-2 text-[var(--text)] rounded-tl-none border'
                        }`}
                        style={!isSelf ? { borderColor: 'var(--border)' } : undefined}>
                          {!isSelf && (
                            <p className="text-[10px] font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                              {msg.user?.username}
                            </p>
                          )}
                          <p className="leading-relaxed break-words">{msg.content}</p>
                          <span className="block text-[9px] mt-1 text-right" style={{ color: 'var(--text-muted)' }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="flex gap-2 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl px-4 py-3 text-sm border outline-none focus:border-primary-500 transition-all"
                  style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <Button variant="primary" type="submit" disabled={!messageText.trim()} leftIcon={<Send size={14} />}>
                  Send
                </Button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        groupId={id}
        onUploadComplete={fetchData}
      />

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Group">
        <div className="space-y-4">
          <Input label="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-sm border outline-none resize-none focus:border-primary-500 transition-all"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleEdit} isLoading={saving}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
