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
import apiClient from "../../services/apiClient";
import { getStoreItems } from "../../services/storeService";
import type { User } from "../../types/user";
import { canUseFeature } from "../../utils/featureAccess";
// ── Theme ──────────────────────────────────────────────────────────────────
import ThemeSwitcher from "../../components/ui/ThemeSwitcher";

type FontStyle = "Inter" | "Poppins" | "Roboto";

const FONT_STYLE_OPTIONS: FontStyle[] = ["Inter", "Poppins", "Roboto"];

function applyGlobalTypography(font: FontStyle, color: string): void {
  const root = document.documentElement;
  root.style.setProperty("--app-font", `'${font}', sans-serif`);
  root.style.setProperty("--text-color", color);
}

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
  const [customUser, setCustomUser] = useState<User | null>(null);
  const [fontColor, setFontColor] = useState<string>("#0f172a");
  const [fontStyle, setFontStyle] = useState<FontStyle>("Inter");
  const [savingFontColor, setSavingFontColor] = useState(false);
  const [savingFontStyle, setSavingFontStyle] = useState(false);

  const canUseFontColors = canUseFeature("font-colors", customUser);
  const canUseFontStyle = canUseFeature("font-style", customUser);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [u, storeData, prefsData] = await Promise.all([
        profileService.getProfile(),
        getStoreItems(),
        apiClient.get<{ preferences?: { fontColor?: string; fontStyle?: FontStyle } }>("/user/preferences"),
      ]);

      const inventory = storeData.ownedItemKeys ?? [];
      const preferences = prefsData.preferences ?? {};

      setCustomUser({
        ...u,
        inventory,
        preferences: {
          ...u.preferences,
          ...preferences,
        },
      });

      const nextFontColor = preferences.fontColor ?? "#ffffff";
      const nextFontStyle = preferences.fontStyle ?? "Inter";

      setFontColor(nextFontColor);
      setFontStyle(nextFontStyle);
      applyGlobalTypography(nextFontStyle, nextFontColor);

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

  const savePreference = async (payload: { fontColor?: string; fontStyle?: FontStyle }) => {
    const res = await apiClient.patch<{ preferences?: { fontColor?: string; fontStyle?: FontStyle } }>(
      "/user/preferences",
      payload
    );

    const nextPrefs = res.preferences ?? {};
    setCustomUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          ...nextPrefs,
        },
      };
    });
  };

  const handleFontColorChange = async (value: string) => {
    setFontColor(value);
    applyGlobalTypography(fontStyle, value);
    if (!canUseFontColors) return;

    setSavingFontColor(true);
    try {
      await savePreference({ fontColor: value });
    } catch (err: any) {
      const message = err?.message || "Failed to save font color";
      useUIStore.getState().showToast(message, { type: "error", duration: 2500 });
    } finally {
      setSavingFontColor(false);
    }
  };

  const handleFontStyleChange = async (value: FontStyle) => {
    setFontStyle(value);
    applyGlobalTypography(value, fontColor);
    if (!canUseFontStyle) return;

    setSavingFontStyle(true);
    try {
      await savePreference({ fontStyle: value });
    } catch (err: any) {
      const message = err?.message || "Failed to save font style";
      useUIStore.getState().showToast(message, { type: "error", duration: 2500 });
    } finally {
      setSavingFontStyle(false);
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
              <ThemeSwitcher />
            </Card>
          </Section>

          <Section title="Customization">
            <div className="space-y-3">
              <Card>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-[var(--theme-text-primary)]">Font Color</div>
                  {!canUseFontColors ? (
                    <div className="rounded-2xl border border-dashed border-[var(--theme-card-ring)] px-3 py-3 text-sm text-[var(--theme-text-subtle)]">
                      Unlock color customization in Store
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={fontColor}
                        onChange={(e) => handleFontColorChange(e.target.value)}
                        className="h-10 w-14 rounded-xl border border-[var(--theme-card-ring)] bg-transparent p-1"
                      />
                      <span className="text-sm text-[var(--theme-text-secondary)]">
                        {savingFontColor ? "Saving..." : fontColor}
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-[var(--theme-text-primary)]">Font Style</div>
                  {!canUseFontStyle ? (
                    <div className="rounded-2xl border border-dashed border-[var(--theme-card-ring)] px-3 py-3 text-sm text-[var(--theme-text-subtle)]">
                      Unlock font customization in Store
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <select
                        value={fontStyle}
                        onChange={(e) => handleFontStyleChange(e.target.value as FontStyle)}
                        className="rounded-2xl border border-[var(--theme-card-ring)] bg-[var(--theme-card-bg)] px-3 py-2 text-sm text-[var(--theme-text-primary)]"
                      >
                        {FONT_STYLE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <span className="text-sm text-[var(--theme-text-secondary)]">
                        {savingFontStyle ? "Saving..." : "Saved"}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
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