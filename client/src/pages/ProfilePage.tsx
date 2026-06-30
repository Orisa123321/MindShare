import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Edit2, Save, X, Users, FileText } from 'lucide-react';
import { usersApi } from '../api/users.api';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { GroupCard } from '../components/dashboard/GroupCard';
import { MaterialCard } from '../components/dashboard/MaterialCard';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { User, StudyGroup, StudyMaterial } from '../types';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, updateUser } = useAuth();
  const profileId = id || currentUser?.id;
  const isOwnProfile = currentUser?.id === profileId;

  const [profile, setProfile] = useState<User | null>(null);
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'groups' | 'materials'>('groups');

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profileId) return;
    const load = async () => {
      setLoading(true);
      try {
        const [u, gRes, mRes] = await Promise.all([
          usersApi.getProfile(profileId),
          usersApi.getUserGroups(profileId, { limit: 12 }),
          usersApi.getUserMaterials(profileId, { limit: 12 }),
        ]);
        setProfile(u);
        setGroups(gRes.data);
        setMaterials(mRes.data);
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profileId]);

  const startEdit = () => {
    if (!profile) return;
    setEditUsername(profile.username);
    setEditBio(profile.bio || '');
    setEditing(true);
  };

  const handleSave = async () => {
    if (!profileId || !editUsername.trim()) return;
    setSaving(true);
    try {
      const updated = await usersApi.updateProfile(profileId, {
        username: editUsername.trim(),
        bio: editBio.trim() || undefined,
      });
      setProfile(updated);
      if (isOwnProfile) updateUser(updated);
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return <EmptyState icon={<Users size={28} />} title="User not found" description="This profile does not exist." />;

  const tabs = [
    { key: 'groups' as const, label: 'Groups', icon: Users, count: groups.length },
    { key: 'materials' as const, label: 'Materials', icon: FileText, count: materials.length },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile header */}
      <div className="card-flat animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar username={profile.username} size="xl" />

          <div className="flex-1 text-center sm:text-left">
            {editing ? (
              <div className="space-y-3 max-w-sm">
                <Input
                  id="edit-username"
                  label="Username"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Bio</label>
                  <textarea
                    id="edit-bio"
                    rows={3}
                    className="w-full rounded-xl px-4 py-3 text-sm border outline-none resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    placeholder="Tell us about yourself…"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="primary" leftIcon={<Save size={14} />} onClick={handleSave} isLoading={saving}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" leftIcon={<X size={14} />} onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text)' }}>{profile.username}</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{profile.email}</p>
                {profile.bio ? (
                  <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{profile.bio}</p>
                ) : (
                  <p className="text-sm mt-2 italic" style={{ color: 'var(--text-muted)' }}>No bio yet</p>
                )}
                <div className="flex items-center gap-1 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <Calendar size={13} />
                  Member since {new Date(profile.createdAt).toLocaleDateString()}
                </div>
              </>
            )}
          </div>

          {isOwnProfile && !editing && (
            <Button size="sm" variant="ghost" leftIcon={<Edit2 size={14} />} onClick={startEdit}>
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b" style={{ borderColor: 'var(--border)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            id={`profile-tab-${tab.key}`}
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

      {/* Tab content */}
      {activeTab === 'groups' && (
        groups.length === 0 ? (
          <EmptyState icon={<Users size={28} />} title="No groups" description={isOwnProfile ? "You haven't joined any groups yet." : 'This user hasn\'t joined any groups yet.'} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g) => <GroupCard key={g.id} group={g} />)}
          </div>
        )
      )}

      {activeTab === 'materials' && (
        materials.length === 0 ? (
          <EmptyState icon={<FileText size={28} />} title="No materials" description={isOwnProfile ? "You haven't uploaded any materials yet." : 'This user hasn\'t uploaded any materials yet.'} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((m) => <MaterialCard key={m.id} material={m} />)}
          </div>
        )
      )}
    </div>
  );
}
