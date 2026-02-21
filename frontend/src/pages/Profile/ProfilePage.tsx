import React, { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import { PageTitle, SubtleText, SectionTitle } from "../../components/ui/Typography";
import Section from "../../components/ui/Section";
import LevelProgressCard from "../../components/gamification/LevelProgressCard";
import StreakMilestone from "../../components/gamification/StreakMilestone";
import AchievementsGrid from "../../components/gamification/AchievementsGrid";
import { levelProgress, streak, achievements } from "../../data/mockGamification";
import PageTransition from "../../components/ui/PageTransition";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import apiClient from "../../services/apiClient";
import profileService from "../../services/profileService";
import useUIStore from "../../store/uiStore";
import useUserStore from "../../store/userStore";

const ProfilePage: React.FC = () => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [bio, setBio] = useState<string | undefined>(undefined);
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState<string | undefined>(undefined);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // The backend returns current user when PATCH /user/profile is called even with no changes.
      const res = await apiClient.patch('/user/profile', {});
      const u = res.user;
      setName(u.name ?? '');
      setEmail(u.email ?? '');
      setUsername(u.username ?? '');
      setBio(u.bio ?? '');
      setPhone(u.phone ?? '');
      setLocation(u.location ?? '');
    } catch (err) {
      // ignore for now
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      if (username !== undefined) payload.username = username;
      if (bio !== undefined) payload.bio = bio;
      if (phone !== undefined) payload.phone = phone;
      if (location !== undefined) payload.location = location;

      const res = await profileService.updateProfile(payload);
      const u = res.user;
      const xpGained = res.xpGained ?? 0;
      if (xpGained > 0) {
        useUIStore.getState().showToast(`+${xpGained} XP — Profile updated`, { type: 'success', duration: 3000 });
      }
      // Apply gamification updates to local store
      useUserStore.getState().applyProfileUpdate(u as any);
      setUsername(u.username ?? '');
      setBio(u.bio ?? '');
      setPhone(u.phone ?? '');
      setLocation(u.location ?? '');
      setEditMode(false);
    } catch (err: any) {
      // TODO: show error toast
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageTransition className="max-w-5xl mx-auto px-8 py-12">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <PageTitle className="text-2xl">Your Profile</PageTitle>
            <SubtleText>Account, preferences, and your progress</SubtleText>
          </div>

          <div className="flex items-center gap-3">
            {!editMode && (
              <Button variant="ghost" onClick={() => setEditMode(true)} disabled={loading}>
                Edit
              </Button>
            )}
            {editMode && (
              <>
                <Button variant="ghost" onClick={() => { setEditMode(false); loadProfile(); }} disabled={saving}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={save} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 lg:col-span-4">
          <Section title="Summary">
            <Card>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-slate-700">Name</div>
                  <div className="text-slate-700">{name || '—'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-700">Email</div>
                  <div className="text-slate-600 text-sm">{email || '—'}</div>
                </div>
              </div>
            </Card>
          </Section>
        </aside>

        <main className="col-span-12 lg:col-span-8">
          <Section title="Profile">
            <Card>
              <div className="space-y-4">
                <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={!editMode} />
                <Input label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} disabled={!editMode} />
                <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!editMode} />
                <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} disabled={!editMode} />
              </div>
            </Card>
          </Section>
        </main>
      </div>
    </PageTransition>
  );
};

export default ProfilePage;
