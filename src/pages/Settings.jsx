import { useEffect, useMemo, useState } from 'react';
import { Bell, Check, Database, Moon, Palette, RotateCcw, Save, Sun, UserRound } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { validateEmail, validatePhone, validateRequired } from '../utils/validation';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Toggle from '../components/ui/Toggle';
import FormField from '../components/ui/FormField';
import Avatar from '../components/ui/Avatar';
import { ConfirmDialog } from '../components/ui/Modal';

const PROFILE_FIELDS = [
  { name: 'fullName', label: 'Full name', type: 'text', autoComplete: 'name', required: true },
  { name: 'email', label: 'Email address', type: 'email', autoComplete: 'email', required: true },
  { name: 'jobTitle', label: 'Job title', type: 'text', autoComplete: 'organization-title', required: true },
  { name: 'company', label: 'Company', type: 'text', autoComplete: 'organization', required: true },
  {
    name: 'phone',
    label: 'Phone number',
    type: 'tel',
    autoComplete: 'tel',
    hint: 'Optional - used for critical alert SMS (demo).',
  },
];

const NOTIFICATION_OPTIONS = [
  {
    key: 'inApp',
    label: 'In-app notifications',
    description: 'Show new alerts and scan results in the notification bell.',
  },
  {
    key: 'email',
    label: 'Email alerts',
    description: 'Send a summary email when new high or critical alerts appear (demo).',
  },
  {
    key: 'criticalOnly',
    label: 'Critical alerts only',
    description: 'Only show in-app notifications for critical events.',
    requiresInApp: true,
  },
  {
    key: 'scanComplete',
    label: 'Scan completion',
    description: 'Notify me in-app when a vulnerability scan finishes.',
    requiresInApp: true,
  },
  {
    key: 'weeklyReport',
    label: 'Weekly security report',
    description: 'Receive the weekly analytics report every Monday (demo).',
  },
];

const THEME_MODES = [
  { value: 'dark', label: 'Dark', icon: Moon, preview: 'bg-[#0b1120]' },
  { value: 'light', label: 'Light', icon: Sun, preview: 'bg-[#eef2f8]' },
];

const ACCENTS = [
  { value: 'blue', label: 'Blue', color: '#3b82f6' },
  { value: 'violet', label: 'Violet', color: '#8b5cf6' },
  { value: 'cyan', label: 'Cyan', color: '#06b6d4' },
];

/** Validate all profile fields -> { fieldName: 'error message' } (empty when valid). */
function validateProfile(profile) {
  const errors = {
    fullName: validateRequired(profile.fullName, 'Full name', 2),
    email: validateEmail(profile.email),
    jobTitle: validateRequired(profile.jobTitle, 'Job title', 2),
    company: validateRequired(profile.company, 'Company', 2),
    phone: validatePhone(profile.phone),
  };
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
}

export default function Settings() {
  const { settings, updateSettings, resetDemoData } = useApp();
  const toast = useToast();

  // Edits are made on a draft copy and only applied when the user clicks "Save settings".
  const [draft, setDraft] = useState(settings);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // If settings change elsewhere (e.g. quick theme switch in the profile menu), refresh the draft.
  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const errors = useMemo(() => validateProfile(draft.profile), [draft.profile]);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(settings);
  const showError = (field) => (touched[field] || submitted ? errors[field] : '');

  const updateSection = (section, key, value) =>
    setDraft((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted profile fields');
      document.getElementById(`profile-${Object.keys(errors)[0]}`)?.focus();
      return;
    }
    setSaving(true);
    // Simulated network latency for a realistic save interaction
    window.setTimeout(() => {
      const cleaned = {
        ...draft,
        profile: Object.fromEntries(Object.entries(draft.profile).map(([key, value]) => [key, value.trim()])),
      };
      updateSettings(cleaned);
      setSaving(false);
      setSubmitted(false);
      setTouched({});
      toast.success('Settings saved');
    }, 600);
  };

  const discardChanges = () => {
    setDraft(settings);
    setTouched({});
    setSubmitted(false);
    toast.info('Changes discarded');
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="pb-24">
      <PageHeader
        title="Settings"
        description="Manage your profile, choose which notifications you receive and personalise the look of the dashboard."
        actions={
          <Button type="submit" icon={Save} loading={saving} disabled={!isDirty}>
            Save settings
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-3">
        {/* ---------- Profile ---------- */}
        <Card
          title="Profile Information"
          subtitle="Shown in the sidebar, top bar and reports"
          icon={UserRound}
          className="xl:col-span-2"
        >
          <div className="mb-6 flex items-center gap-4 rounded-xl border border-line bg-elevated p-4">
            <Avatar name={draft.profile.fullName} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-ink">{draft.profile.fullName || 'Your name'}</p>
              <p className="truncate text-sm text-muted">
                {draft.profile.jobTitle || 'Job title'} · {draft.profile.company || 'Company'}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {PROFILE_FIELDS.map((field) => {
              const id = `profile-${field.name}`;
              const error = showError(field.name);
              return (
                <FormField
                  key={field.name}
                  id={id}
                  label={field.label}
                  required={field.required}
                  error={error}
                  hint={field.hint}
                >
                  <input
                    id={id}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    value={draft.profile[field.name]}
                    onChange={(event) => updateSection('profile', field.name, event.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, [field.name]: true }))}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className={`input-base ${error ? 'border-critical focus:border-critical focus:ring-critical/15' : ''}`}
                  />
                </FormField>
              );
            })}
          </div>
        </Card>

        {/* ---------- Notifications ---------- */}
        <Card title="Notification Preferences" subtitle="Choose how SecureGuard keeps you informed" icon={Bell}>
          <div className="divide-y divide-line">
            {NOTIFICATION_OPTIONS.map((option) => (
              <Toggle
                key={option.key}
                id={`notify-${option.key}`}
                label={option.label}
                description={option.description}
                checked={draft.notifications[option.key]}
                disabled={option.requiresInApp && !draft.notifications.inApp}
                onChange={(value) => updateSection('notifications', option.key, value)}
              />
            ))}
          </div>
        </Card>

        {/* ---------- Theme ---------- */}
        <Card
          title="Theme Preferences"
          subtitle="Applied across the whole dashboard"
          icon={Palette}
          className="xl:col-span-2"
        >
          <p className="mb-2.5 text-[13px] font-medium text-ink">Appearance</p>
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Appearance">
            {THEME_MODES.map(({ value, label, icon: Icon, preview }) => {
              const active = draft.theme.mode === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => updateSection('theme', 'mode', value)}
                  className={`rounded-xl border p-3 text-left transition ${
                    active ? 'border-primary ring-4 ring-primary-soft' : 'border-line hover:border-line-strong'
                  }`}
                >
                  {/* mini dashboard preview */}
                  <div className={`flex h-20 gap-2 rounded-lg p-2 ${preview}`}>
                    <div className={`w-1/4 rounded-md ${value === 'dark' ? 'bg-white/8' : 'bg-white'}`} />
                    <div className="flex flex-1 flex-col gap-2">
                      <div className={`h-3 rounded ${value === 'dark' ? 'bg-white/10' : 'bg-white'}`} />
                      <div className="flex flex-1 gap-2">
                        <div className={`flex-1 rounded-md ${value === 'dark' ? 'bg-white/6' : 'bg-white'}`} />
                        <div className="flex-1 rounded-md bg-primary/50" />
                      </div>
                    </div>
                  </div>
                  <span className="mt-3 flex items-center justify-between text-sm font-medium text-ink">
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted" /> {label}
                    </span>
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-6 mb-2.5 text-[13px] font-medium text-ink">Accent colour</p>
          <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Accent colour">
            {ACCENTS.map((accent) => {
              const active = draft.theme.accent === accent.value;
              return (
                <button
                  key={accent.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => updateSection('theme', 'accent', accent.value)}
                  className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
                    active ? 'border-line-strong bg-elevated-hover text-ink' : 'border-line text-muted hover:text-ink'
                  }`}
                >
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full"
                    style={{ background: accent.color }}
                  >
                    {active && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </span>
                  {accent.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 border-t border-line pt-2">
            <Toggle
              id="theme-animations"
              label="Interface animations"
              description="Turn off to reduce motion (fade-ins, hover lifts and chart transitions)."
              checked={draft.theme.animations}
              onChange={(value) => updateSection('theme', 'animations', value)}
            />
          </div>
        </Card>

        {/* ---------- Demo data ---------- */}
        <Card title="Demo Data" subtitle="Everything is stored in this browser's LocalStorage" icon={Database}>
          <p className="text-sm leading-relaxed text-muted">
            Alerts, scan history, notifications, activity and settings persist between visits. Reset to restore the
            original sample data - useful before presenting the project.
          </p>
          <Button variant="danger" icon={RotateCcw} className="mt-5 w-full" onClick={() => setConfirmReset(true)}>
            Reset demo data
          </Button>
        </Card>
      </div>

      {/* Sticky unsaved-changes bar */}
      {isDirty && (
        <div className="animate-fade-up fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-2xl flex-col items-center justify-between gap-3 rounded-2xl border border-line-strong bg-surface-solid px-5 py-3.5 shadow-2xl shadow-black/40 sm:flex-row lg:left-[calc(18rem+2rem)]">
          <p className="text-sm text-ink">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-medium" />
            You have unsaved changes
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={discardChanges} disabled={saving}>
              Discard
            </Button>
            <Button type="submit" size="sm" icon={Save} loading={saving}>
              Save settings
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmReset}
        title="Reset demo data?"
        message="This restores the original sample alerts, notifications, activity, scan history and settings. Your changes will be lost."
        confirmLabel="Reset data"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDemoData();
          setConfirmReset(false);
          setTouched({});
          setSubmitted(false);
          toast.success('Demo data has been reset');
        }}
      />
    </form>
  );
}
