'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile, PublicProfile } from '@/types/supabase';
import { useAuth } from '@/lib/auth';
import AdminHeader from '@/components/ui/AdminHeader';
import FAB from '@/components/ui/FAB';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [slugWarning, setSlugWarning] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    headline: '',
    summary: '',
    phone: '',
    email: '',
    linkedin_url: '',
    slug: '',
    is_active: true,
  });

  const [originalSlug, setOriginalSlug] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  async function fetchData() {
    try {
      setLoading(true);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      
      if (profileData) {
        setProfile(profileData);
        setFormData((prev) => ({
          ...prev,
          full_name: profileData.full_name || '',
          headline: profileData.headline || '',
          summary: profileData.summary || '',
          phone: profileData.phone || '',
          email: profileData.email || '',
          linkedin_url: profileData.linkedin_url || '',
        }));
      }

      const { data: publicProfileData, error: publicProfileError } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (publicProfileError && publicProfileError.code !== 'PGRST116') throw publicProfileError;

      if (publicProfileData) {
        setPublicProfile(publicProfileData);
        setFormData((prev) => ({
          ...prev,
          slug: publicProfileData.slug || '',
          is_active: publicProfileData.is_active ?? true,
        }));
        setOriginalSlug(publicProfileData.slug || '');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: formData.full_name || null,
          headline: formData.headline || null,
          summary: formData.summary || null,
          phone: formData.phone || null,
          email: formData.email || null,
          linkedin_url: formData.linkedin_url || null,
        }, { onConflict: 'user_id' });

      if (profileError) throw profileError;

      const { error: publicProfileError } = await supabase
        .from('public_profiles')
        .upsert({
          user_id: user.id,
          slug: formData.slug || 'default',
          is_active: formData.is_active,
        }, { onConflict: 'user_id' });

      if (publicProfileError) throw publicProfileError;

      setOriginalSlug(formData.slug);
      setSlugWarning(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'slug' && value !== originalSlug) {
      setSlugWarning(true);
    }
    if (name === 'slug' && value === originalSlug) {
      setSlugWarning(false);
    }
  }

  function handleToggle(name: string, checked: boolean) {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f5f6fa' }}>
        <AdminHeader title="Profile" showSearch={false} />
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-500">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: '#f5f6fa' }}>
      <AdminHeader title="Profile" showSearch={false} />
      <FAB />

      <main className="max-w-[640px] mx-auto px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <span>Admin</span>
          <span className="text-slate-300">›</span>
          <span className="text-slate-700">Profile Management</span>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-card mb-6">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100" style={{ backgroundColor: '#fcfcfd' }}>
              <span className="material-symbols-outlined text-[18px]" style={{ color: '#192b57' }}>visibility</span>
              <h2 className="text-base font-bold" style={{ color: '#192b57' }}>CV-Visible Details</h2>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="headline" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Headline
                </label>
                <input
                  type="text"
                  id="headline"
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="Senior Software Engineer"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Public Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="john.doe@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="summary" className="block text-sm font-medium text-slate-700">
                    Executive Summary
                  </label>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">
                    {formData.summary.length} / 500 characters
                  </span>
                </div>
                <textarea
                  id="summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  rows={4}
                  className="admin-input resize-none"
                  placeholder="Brief summary about yourself..."
                  maxLength={500}
                />
              </div>
            </div>
          </div>

          <div className="relative flex items-center py-4">
            <div className="absolute inset-0 border-t border-dashed border-slate-300"></div>
            <span className="relative px-3 bg-[#f5f6fa] text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mx-auto">
              Internal / Ledger Only
            </span>
          </div>

          <div className="admin-card mb-6" style={{ backgroundColor: '#f8f8fa' }}>
            <div className="p-5">
              <label htmlFor="linkedin_url" className="block text-sm font-medium text-slate-700 mb-1.5">
                LinkedIn URL
                <span className="ml-2 badge-internal">Internal</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">link</span>
                <input
                  type="url"
                  id="linkedin_url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  className="admin-input pl-10"
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                This field is stored but not currently rendered on the public CV.
              </p>
            </div>
          </div>

          <div className="admin-card mb-6">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100" style={{ backgroundColor: '#fcfcfd' }}>
              <span className="material-symbols-outlined text-[18px]" style={{ color: '#192b57' }}>settings_input_component</span>
              <h2 className="text-base font-bold" style={{ color: '#192b57' }}>Public Profile Settings</h2>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Profile Slug
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg bg-slate-100 text-slate-500 text-sm border border-r-0 border-slate-300">
                    profiles.exec-system.com/
                  </span>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="admin-input rounded-l-none flex-1"
                    placeholder="your-name"
                  />
                </div>

                {slugWarning && (
                  <div className="mt-3 p-3 rounded border" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[18px]" style={{ color: '#F59E0B' }}>warning</span>
                      <p className="text-xs text-red-600 font-medium">
                        Warning: Changing the slug will break all existing shared links.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="is_active" className="block text-sm font-medium text-slate-700">
                    Profile Visibility
                    <span className="ml-2 badge-internal">Internal</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleToggle('is_active', !formData.is_active)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_active ? 'bg-[#192b57]' : 'bg-slate-300'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2 italic">
                  This setting is currently not enforced by the frontend.
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 px-6 py-4 z-30">
        <div className="max-w-[640px] mx-auto flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                full_name: profile?.full_name || '',
                headline: profile?.headline || '',
                summary: profile?.summary || '',
                phone: profile?.phone || '',
                email: profile?.email || '',
                linkedin_url: profile?.linkedin_url || '',
                slug: publicProfile?.slug || '',
                is_active: publicProfile?.is_active ?? true,
              }));
              setSlugWarning(false);
            }}
            className="px-4 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Discard Changes
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-white transition-all"
            style={{ backgroundColor: '#192b57', boxShadow: '0 10px 25px rgba(25, 43, 87, 0.2)' }}
          >
            <span className="material-symbols-outlined text-[20px]">save</span>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
