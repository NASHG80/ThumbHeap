import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNavbar } from '../components/AppNavbar';
import { useAuth } from '../context/AuthContext';
import {
  User, PlayCircle, Target, Users, BarChart2, Zap,
  ChevronRight, ChevronLeft, Check, Loader2, Save, ArrowLeft
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfileData {
  channel_name: string;
  channel_url: string;
  video_category: string;
  video_types: string[];
  niche_description: string;
  target_age_groups: string[];
  target_genders: string[];
  audience_regions: string[];
  channel_size: string;
  upload_frequency: string;
  avg_video_length: string;
  primary_goal: string;
  biggest_challenge: string;
  thumbnail_style: string[];
  color_preference: string;
}

const EMPTY: ProfileData = {
  channel_name: '', channel_url: '', video_category: '', video_types: [],
  niche_description: '', target_age_groups: [], target_genders: [],
  audience_regions: [], channel_size: '', upload_frequency: '',
  avg_video_length: '', primary_goal: '', biggest_challenge: '',
  thumbnail_style: [], color_preference: '',
};

// ─── Option chips helper ───────────────────────────────────────────────────────
function Chips({
  options, selected, onToggle, single = false,
}: {
  options: string[];
  selected: string | string[];
  onToggle: (v: string) => void;
  single?: boolean;
}) {
  const isActive = (v: string) =>
    single ? selected === v : (selected as string[]).includes(v);

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onToggle(opt)}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 select-none ${
            isActive(opt)
              ? 'bg-[#121214] text-white border-[#121214] shadow-sm scale-[1.03]'
              : 'bg-white text-[#52525B] border-[#E6E4DE] hover:border-[#121214] hover:text-[#121214]'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Step configs ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 'identity', label: 'Channel',  icon: PlayCircle },
  { id: 'content',  label: 'Content',  icon: Zap       },
  { id: 'audience', label: 'Audience', icon: Users     },
  { id: 'stats',    label: 'Stats',    icon: BarChart2  },
  { id: 'goals',    label: 'Goals',    icon: Target    },
  { id: 'style',    label: 'Style',    icon: User      },
];

// ─── Data constants ────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Education', 'Gaming', 'Tech & Science', 'Entertainment',
  'Vlog / Lifestyle', 'Finance & Business', 'Health & Fitness',
  'Food & Cooking', 'Travel', 'Music', 'DIY & Crafts',
  'News & Politics', 'Comedy', 'Beauty & Fashion', 'Sports',
];

const VIDEO_TYPES = [
  'Tutorials / How-to', 'Vlogs', 'Reviews', 'Shorts',
  'Listicles / Top 10', 'Documentaries', 'Podcasts', 'Live Streams',
  'Challenges', 'Reactions', 'Interviews', 'Explainers',
];

const AGE_GROUPS = ['Under 13', '13–17', '18–24', '25–34', '35–44', '45–54', '55+'];

const REGIONS = [
  'India', 'USA', 'UK', 'Canada', 'Australia',
  'Europe', 'Southeast Asia', 'Middle East', 'Latin America', 'Global',
];

const GOALS = [
  'Grow Subscribers', 'Increase Views', 'Improve CTR',
  'Monetise Channel', 'Build Brand Awareness', 'Drive Website Traffic',
  'Sell a Product/Course', 'Build a Community',
];

const CHALLENGES = [
  'Low Click-Through Rate (CTR)', 'Low Watch Time', 'Poor Thumbnail Design',
  'Inconsistent Upload Schedule', 'Algorithm Changes', 'Growing Audience',
  'Content Ideas / Burnout', 'Competing in a Crowded Niche',
];

const THUMB_STYLES = [
  'Face-forward', 'Text-heavy', 'Minimalist', 'Bold & Dramatic',
  'Before & After', 'Split-screen', 'Object-focused', 'Custom Illustration',
];

// ─── Sub-components ────────────────────────────────────────────────────────────
const inputCls =
  'w-full px-4 py-3 rounded-xl border border-[#E6E4DE] bg-[#FAF9F5] text-[#121214] text-sm placeholder-[#A1A1AA] focus:outline-none focus:border-[#121214] transition-colors';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-bold text-[#121214] mb-1">{label}</label>
      {hint && <p className="text-xs text-[#71717A] mb-3">{hint}</p>}
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[#71717A] font-medium shrink-0">{label}:</span>
      <span className="text-[#121214] font-semibold truncate">{value}</span>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export const CreatorProfile: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ProfileData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // ── Fetch existing profile ────────────────────────────────────────────────
  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.profile) {
          setProfile({ ...EMPTY, ...json.profile });
        }
      } catch {
        setError('Could not load your profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, [token, navigate]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const set = useCallback(<K extends keyof ProfileData>(key: K, val: ProfileData[K]) => {
    setProfile(p => ({ ...p, [key]: val }));
  }, []);

  const toggleArr = useCallback((key: keyof ProfileData, val: string) => {
    setProfile(p => {
      const arr = (p[key] as string[]) || [];
      return {
        ...p,
        [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val],
      };
    });
  }, []);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = async () => {
    await handleSave();
    navigate('/analyze');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  const StepIcon = STEPS[step].icon;
  const progressPct = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-[#FAF9F5]">
      <AppNavbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">

        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-[#71717A] hover:text-[#121214] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#7C3AED] mb-3">
            <User className="w-3.5 h-3.5" />
            Creator Profile
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#121214]">
            Tell us about your channel
          </h1>
          <p className="mt-2 text-[#52525B]">
            Iris uses this to personalise insights and benchmark thumbnails against similar creators.
          </p>
        </div>

        {/* Step progress bar */}
        <div className="flex items-center gap-1 mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone   = i < step;
            return (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => setStep(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#121214] text-white shadow-sm'
                      : isDone
                      ? 'bg-[#E6E4DE] text-[#121214]'
                      : 'bg-transparent text-[#71717A] hover:text-[#121214]'
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${
                      isDone ? 'bg-[#121214]' : 'bg-[#E6E4DE]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E6E4DE] rounded-3xl shadow-sm p-8 sm:p-10">

          {/* Step header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF9F5] border border-[#E6E4DE] flex items-center justify-center text-[#7C3AED]">
              <StepIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-[#71717A] uppercase tracking-widest">
                Step {step + 1} of {STEPS.length}
              </div>
              <div className="text-lg font-bold text-[#121214]">{STEPS[step].label}</div>
            </div>
          </div>

          {/* ── Step 0: Channel Identity ─────────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-6">
              <Field label="Channel Name" hint="Your YouTube channel name">
                <input
                  type="text"
                  placeholder="e.g. TechWithNash"
                  value={profile.channel_name}
                  onChange={e => set('channel_name', e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Channel URL" hint="Your full YouTube URL or @handle">
                <input
                  type="url"
                  placeholder="https://youtube.com/@yourhandle"
                  value={profile.channel_url}
                  onChange={e => set('channel_url', e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Channel Category" hint="Pick the one that fits best">
                <Chips
                  options={CATEGORIES}
                  selected={profile.video_category}
                  onToggle={v => set('video_category', profile.video_category === v ? '' : v)}
                  single
                />
              </Field>
            </div>
          )}

          {/* ── Step 1: Content ───────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <Field label="Video Types" hint="Select all that apply to your content">
                <Chips
                  options={VIDEO_TYPES}
                  selected={profile.video_types}
                  onToggle={v => toggleArr('video_types', v)}
                />
              </Field>
              <Field label="Niche Description" hint="Describe your content in your own words (optional)">
                <textarea
                  rows={3}
                  placeholder="e.g. I make beginner-friendly Python tutorials for college students..."
                  value={profile.niche_description}
                  onChange={e => set('niche_description', e.target.value)}
                  className={`${inputCls} resize-none`}
                />
              </Field>
            </div>
          )}

          {/* ── Step 2: Audience ──────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <Field label="Target Age Groups" hint="Who are you primarily creating for?">
                <Chips
                  options={AGE_GROUPS}
                  selected={profile.target_age_groups}
                  onToggle={v => toggleArr('target_age_groups', v)}
                />
              </Field>
              <Field label="Target Gender" hint="Select all that apply">
                <Chips
                  options={['Male', 'Female', 'Non-binary', 'All Genders']}
                  selected={profile.target_genders}
                  onToggle={v => toggleArr('target_genders', v)}
                />
              </Field>
              <Field label="Primary Audience Regions">
                <Chips
                  options={REGIONS}
                  selected={profile.audience_regions}
                  onToggle={v => toggleArr('audience_regions', v)}
                />
              </Field>
            </div>
          )}

          {/* ── Step 3: Channel Stats ─────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6">
              <Field label="Subscriber Count" hint="Approximate channel size">
                <Chips
                  options={['< 1K', '1K – 10K', '10K – 100K', '100K – 1M', '1M+']}
                  selected={profile.channel_size}
                  onToggle={v => set('channel_size', profile.channel_size === v ? '' : v)}
                  single
                />
              </Field>
              <Field label="Upload Frequency" hint="How often do you post?">
                <Chips
                  options={['Daily', '3–5x / week', 'Weekly', 'Bi-weekly', 'Monthly']}
                  selected={profile.upload_frequency}
                  onToggle={v => set('upload_frequency', profile.upload_frequency === v ? '' : v)}
                  single
                />
              </Field>
              <Field label="Average Video Length">
                <Chips
                  options={['< 1 min (Shorts)', '1–5 min', '5–15 min', '15–30 min', '30+ min']}
                  selected={profile.avg_video_length}
                  onToggle={v => set('avg_video_length', profile.avg_video_length === v ? '' : v)}
                  single
                />
              </Field>
            </div>
          )}

          {/* ── Step 4: Goals ─────────────────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-6">
              <Field label="Primary Goal" hint="What's your #1 focus right now?">
                <Chips
                  options={GOALS}
                  selected={profile.primary_goal}
                  onToggle={v => set('primary_goal', profile.primary_goal === v ? '' : v)}
                  single
                />
              </Field>
              <Field label="Biggest Challenge" hint="What's the main thing holding your channel back?">
                <Chips
                  options={CHALLENGES}
                  selected={profile.biggest_challenge}
                  onToggle={v => set('biggest_challenge', profile.biggest_challenge === v ? '' : v)}
                  single
                />
              </Field>
            </div>
          )}

          {/* ── Step 5: Thumbnail Style ───────────────────────────────────── */}
          {step === 5 && (
            <div className="space-y-6">
              <Field label="Your Thumbnail Style" hint="Select all that describe your current thumbnails">
                <Chips
                  options={THUMB_STYLES}
                  selected={profile.thumbnail_style}
                  onToggle={v => toggleArr('thumbnail_style', v)}
                />
              </Field>
              <Field label="Colour Palette Preference" hint="What best describes your visual style?">
                <Chips
                  options={['Bright & Bold', 'Dark & Moody', 'Pastel & Soft', 'Minimal & Clean', 'Neon & High-contrast']}
                  selected={profile.color_preference}
                  onToggle={v => set('color_preference', profile.color_preference === v ? '' : v)}
                  single
                />
              </Field>

              {/* Summary card */}
              <div className="mt-4 p-5 rounded-2xl bg-[#FAF9F5] border border-[#E6E4DE]">
                <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#71717A] mb-4">
                  Profile Summary
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
                  {profile.channel_name    && <SummaryRow label="Channel"   value={profile.channel_name} />}
                  {profile.video_category  && <SummaryRow label="Category"  value={profile.video_category} />}
                  {profile.channel_size    && <SummaryRow label="Size"      value={profile.channel_size} />}
                  {profile.upload_frequency && <SummaryRow label="Uploads"  value={profile.upload_frequency} />}
                  {profile.avg_video_length && <SummaryRow label="Length"   value={profile.avg_video_length} />}
                  {profile.primary_goal    && <SummaryRow label="Goal"      value={profile.primary_goal} />}
                  {profile.biggest_challenge && <SummaryRow label="Challenge" value={profile.biggest_challenge} />}
                  {profile.color_preference  && <SummaryRow label="Palette"   value={profile.color_preference} />}
                </div>
                {profile.target_age_groups.length > 0 && (
                  <div className="mt-3 text-sm">
                    <span className="text-[#71717A] font-medium">Ages: </span>
                    <span className="text-[#121214] font-semibold">{profile.target_age_groups.join(', ')}</span>
                  </div>
                )}
                {profile.audience_regions.length > 0 && (
                  <div className="mt-1.5 text-sm">
                    <span className="text-[#71717A] font-medium">Regions: </span>
                    <span className="text-[#121214] font-semibold">{profile.audience_regions.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#E6E4DE]">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#52525B] border border-[#E6E4DE] hover:border-[#121214] hover:text-[#121214] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  saved
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'text-[#52525B] border-[#E6E4DE] hover:border-[#121214] hover:text-[#121214]'
                } disabled:opacity-60`}
              >
                {saving
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : saved
                  ? <Check className="w-4 h-4" />
                  : <Save className="w-4 h-4" />
                }
                {saved ? 'Saved!' : 'Save'}
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#121214] text-white hover:bg-[#3F3F47] transition-all shadow-sm"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-all shadow-sm disabled:opacity-60"
                >
                  {saving
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                    : <><Check className="w-4 h-4" /> Save & Go to Analyze</>
                  }
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom progress bar */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-[#E6E4DE] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7C3AED] rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-mono text-[#71717A]">{progressPct}% complete</span>
        </div>
      </main>
    </div>
  );
};
