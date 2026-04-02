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
import PhoneInput from "../../components/profile/PhoneInput";
import LocationInput from "../../components/profile/LocationInput";
import profileService from "../../services/profileService";
import useUIStore from "../../store/uiStore";
import useUserStore from "../../store/userStore";
import type { User } from "../../types/user";
// ── Theme ──────────────────────────────────────────────────────────────────
import ThemeSwitcher from "../../components/ui/ThemeSwitcher";

const ProfilePage: React.FC = () => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [bio, setBio] = useState<string | undefined>(undefined);

  // Phone section state (requested shape)
  const [country, setCountry] = useState("IN");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [fullNumber, setFullNumber] = useState("");

  const [location, setLocation] = useState<string | undefined>(undefined);
  const [profileUser, setProfileUser] = useState<User | null>(null);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const u = await profileService.getProfile();
      setProfileUser(u);
      setName(u.name ?? "");
      setEmail(u.email ?? "");
      setUsername(u.username ?? "");
      setBio(u.bio ?? "");

      setCountry(u.country ?? "IN");
      setCountryCode(u.countryCode ?? "+91");
      setPhone(u.phoneNumber ?? u.phone ?? "");
      setFullNumber(u.fullNumber ?? "");
      setError("");

      setLocation(u.location ?? "");
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
    if (error) return;

    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      if (username !== undefined) payload.username = username;
      if (bio !== undefined) payload.bio = bio;
      payload.country = country;
      payload.countryCode = countryCode;
      payload.phoneNumber = phone;
      payload.fullNumber = fullNumber || `${countryCode}${phone}`;
      // Keep legacy field until backend consumers are fully migrated.
      payload.phone = phone;
      if (location !== undefined) payload.location = location;

      const res = await profileService.updateProfile(payload);
      const u = res.user;
      setProfileUser(u);
      const xpGained = res.xpGained ?? 0;
      if (xpGained > 0) {
        useUIStore.getState().showToast(`+${xpGained} XP — Profile updated`, { type: "success", duration: 3000 });
      }
      // Apply gamification updates to local store
      useUserStore.getState().applyProfileUpdate(u as any);
      setUsername(u.username ?? "");
      setBio(u.bio ?? "");
      setCountry(u.country ?? country);
      setCountryCode(u.countryCode ?? countryCode);
      setPhone(u.phoneNumber ?? u.phone ?? phone);
      setFullNumber(u.fullNumber ?? fullNumber);
      setLocation(u.location ?? "");
      setEditMode(false);
    } catch (err: any) {
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
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
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

          {/* ── Theme Switcher ────────────────────────────────────────────── */}
          <Section title="Appearance">
            <Card>
              <ThemeSwitcher user={profileUser} />
            </Card>
          </Section>
        </aside>

        <main className="col-span-12 lg:col-span-8">
          <Section title="Profile">
            <Card className="overflow-visible">
              <div className="space-y-4">
                <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={!editMode} />
                <Input label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} disabled={!editMode} />
                <PhoneInput
                  label="Phone"
                  value={phone}
                  country={country}
                  countryCode={countryCode}
                  onChange={(params) => {
                    setCountry(params.country);
                    setCountryCode(params.countryCode);
                    setPhone(params.phoneNumber);
                    setFullNumber(params.fullNumber);
                  }}
                  onValidationChange={(isValid, message) => {
                    setError(isValid ? "" : message || "Invalid phone number for selected country");
                  }}
                  disabled={!editMode}
                  error={error}
                />
                <LocationInput value={location} onChange={(e) => setLocation(e.target.value)} disabled={!editMode} />
              </div>
            </Card>
          </Section>
        </main>
      </div>
    </PageTransition>
  );
};

export default ProfilePage;