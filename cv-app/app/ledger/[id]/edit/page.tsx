'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Experience, Achievement, QuotaRecord } from '@/types/supabase';
import AdminHeader from '@/components/ui/AdminHeader';
import DeleteModal from '@/components/ui/DeleteModal';
import FAB from '@/components/ui/FAB';

interface AchievementFormData {
  id?: string;
  description: string;
  metric_value: string;
  metric_type: string;
}

interface QuotaFormData {
  id?: string;
  period_label: string;
  attainment_percentage: string;
  pipeline_generated: string;
  quota_target: string;
  notes: string;
}

const VERTICALS = [
  'Enterprise Software',
  'Cloud Services',
  'SaaS',
  'Cybersecurity',
  'Data Analytics',
  'AI/ML',
  'Software Collaboration',
  'Infrastructure',
  'Other',
];

export default function EditEntryPage() {
  const router = useRouter();
  const params = useParams();
  const experienceId = params.id as string;
  const isNew = experienceId === 'new';

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: '',
    role_title: '',
    vertical: '',
    start_date: '',
    end_date: '',
    summary: '',
    display_order: 0,
    location: '',
    avg_deal_size: '',
    sales_cycle: '',
    seat_range: '',
    decision_makers: '',
  });

  const [achievements, setAchievements] = useState<AchievementFormData[]>([
    { description: '', metric_value: '', metric_type: '' },
  ]);

  const [quotaRecords, setQuotaRecords] = useState<QuotaFormData[]>([
    { period_label: '', attainment_percentage: '', pipeline_generated: '', quota_target: '', notes: '' },
  ]);

  useEffect(() => {
    if (!isNew) {
      fetchExperience();
    }
  }, [experienceId]);

  async function fetchExperience() {
    try {
      setFetching(true);
      const { data, error } = await supabase
        .from('experiences')
        .select(`
          *,
          achievements (*),
          quota_records (*)
        `)
        .eq('id', experienceId)
        .single();

      if (error) throw error;

      if (data) {
        const experience = data as Experience & { achievements: Achievement[]; quota_records: QuotaRecord[] };
        setFormData({
          company_name: experience.company_name || '',
          role_title: experience.role_title || '',
          vertical: experience.vertical || '',
          start_date: experience.start_date || '',
          end_date: experience.end_date || '',
          summary: experience.summary || '',
          display_order: experience.display_order || 0,
          location: experience.location || '',
          avg_deal_size: experience.avg_deal_size || '',
          sales_cycle: experience.sales_cycle || '',
          seat_range: experience.seat_range || '',
          decision_makers: experience.decision_makers || '',
        });

        if (experience.achievements && experience.achievements.length > 0) {
          setAchievements(
            experience.achievements
              .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
              .map((ach) => ({
                id: ach.id,
                description: ach.description || '',
                metric_value: ach.metric_value || '',
                metric_type: ach.metric_type || '',
              }))
          );
        }

        if (experience.quota_records && experience.quota_records.length > 0) {
          setQuotaRecords(
            experience.quota_records.map((qr) => ({
              id: qr.id,
              period_label: qr.period_label || '',
              attainment_percentage: qr.attainment_percentage?.toString() || '',
              pipeline_generated: qr.pipeline_generated?.toString() || '',
              quota_target: qr.quota_target?.toString() || '',
              notes: qr.notes || '',
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error fetching experience:', error);
      alert('Error loading experience data');
    } finally {
      setFetching(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAchievementChange = (index: number, field: keyof AchievementFormData, value: string) => {
    setAchievements((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleQuotaChange = (index: number, field: keyof QuotaFormData, value: string) => {
    setQuotaRecords((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addAchievement = () => {
    setAchievements((prev) => [...prev, { description: '', metric_value: '', metric_type: '' }]);
  };

  const removeAchievement = (index: number) => {
    if (achievements.length > 1) {
      setAchievements((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const addQuotaRecord = () => {
    setQuotaRecords((prev) => [...prev, { period_label: '', attainment_percentage: '', pipeline_generated: '', quota_target: '', notes: '' }]);
  };

  const removeQuotaRecord = (index: number) => {
    if (quotaRecords.length > 1) {
      setQuotaRecords((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let expId = experienceId;

      if (isNew) {
        const { data: newExp, error: expError } = await supabase
          .from('experiences')
          .insert({
            user_id: user.id,
            company_name: formData.company_name,
            role_title: formData.role_title,
            vertical: formData.vertical || null,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            summary: formData.summary || null,
            display_order: formData.display_order || 0,
            location: formData.location || null,
            avg_deal_size: formData.avg_deal_size || null,
            sales_cycle: formData.sales_cycle || null,
            seat_range: formData.seat_range || null,
            decision_makers: formData.decision_makers || null,
          })
          .select()
          .single();

        if (expError) throw expError;
        if (!newExp) throw new Error('Failed to create experience');
        expId = newExp.id;
      } else {
        const { error: expError } = await supabase
          .from('experiences')
          .update({
            company_name: formData.company_name,
            role_title: formData.role_title,
            vertical: formData.vertical || null,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            summary: formData.summary || null,
            display_order: formData.display_order || 0,
            location: formData.location || null,
            avg_deal_size: formData.avg_deal_size || null,
            sales_cycle: formData.sales_cycle || null,
            seat_range: formData.seat_range || null,
            decision_makers: formData.decision_makers || null,
          })
          .eq('id', experienceId);

        if (expError) throw expError;
      }

      if (!isNew) {
        const { error: deleteAchError } = await supabase
          .from('achievements')
          .delete()
          .eq('experience_id', experienceId);
        if (deleteAchError) throw deleteAchError;

        const validAchievements = achievements.filter((a) => a.description.trim());
        if (validAchievements.length > 0) {
          const achievementsToInsert = validAchievements.map((ach, idx) => ({
            experience_id: expId,
            description: ach.description,
            metric_value: ach.metric_value || null,
            metric_type: ach.metric_type || null,
            display_order: idx + 1,
          }));

          const { error: achError } = await supabase
            .from('achievements')
            .insert(achievementsToInsert);

          if (achError) throw achError;
        }

        const { error: deleteQrError } = await supabase
          .from('quota_records')
          .delete()
          .eq('experience_id', experienceId);
        if (deleteQrError) throw deleteQrError;

        const validQuotaRecords = quotaRecords.filter((qr) => qr.period_label.trim());
        if (validQuotaRecords.length > 0) {
          const quotaToInsert = validQuotaRecords.map((qr) => ({
            experience_id: expId,
            period_label: qr.period_label,
            attainment_percentage: qr.attainment_percentage ? parseFloat(qr.attainment_percentage) : null,
            pipeline_generated: qr.pipeline_generated ? parseFloat(qr.pipeline_generated) : null,
            quota_target: qr.quota_target ? parseFloat(qr.quota_target) : null,
            notes: qr.notes || null,
          }));

          const { error: qrError } = await supabase
            .from('quota_records')
            .insert(quotaToInsert);

          if (qrError) throw qrError;
        }
      }

      router.push('/ledger');
    } catch (error) {
      console.error(error);
      alert('Error saving entry');
    } finally {
      setSaving(false);
    }
  };

  async function handleDelete() {
    if (isNew) return;
    
    try {
      setSaving(true);
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', experienceId);

      if (error) throw error;
      router.push('/ledger');
    } catch (error) {
      console.error('Error deleting experience:', error);
      alert('Failed to delete entry');
    } finally {
      setSaving(false);
      setDeleteModalOpen(false);
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f6f6f8' }}>
        <div className="text-slate-500">Loading experience...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: '#f6f6f8' }}>
      <AdminHeader title="Executives" showSearch={false} />
      <FAB />

      <main className="max-w-[640px] mx-auto px-6 py-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link href="/ledger" className="hover:text-slate-700">Ledger</Link>
          <span className="text-slate-300">›</span>
          <span>Experiences</span>
          <span className="text-slate-300">›</span>
          <span className="text-slate-700">{isNew ? 'New Entry' : `Edit ${formData.company_name}`}</span>
        </div>

        <h1 className="text-[30px] font-black mb-1" style={{ color: '#192b57' }}>
          {isNew ? 'New Experience' : 'Edit Experience'}
        </h1>
        {!isNew && (
          <p className="text-sm text-slate-500 mb-6">
            System ID: <span className="font-mono">EXP-{experienceId.slice(0, 8)}</span>
          </p>
        )}

        <Link href="/ledger" className="inline-flex items-center gap-1 text-sm font-bold mb-6 hover:opacity-80" style={{ color: '#192b57' }}>
          ← Back to Ledger
        </Link>

        <form onSubmit={handleSubmit}>
          <div className="admin-card mb-6">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100" style={{ backgroundColor: '#fcfcfd' }}>
              <span className="material-symbols-outlined text-[18px]" style={{ color: '#192b57' }}>visibility</span>
              <h2 className="text-base font-bold" style={{ color: '#192b57' }}>CV-Visible Details</h2>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name *</label>
                  <input
                    type="text"
                    name="company_name"
                    required
                    value={formData.company_name}
                    onChange={handleChange}
                    className="admin-input h-11"
                    placeholder="e.g., Salesforce"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Role Title *</label>
                  <input
                    type="text"
                    name="role_title"
                    required
                    value={formData.role_title}
                    onChange={handleChange}
                    className="admin-input h-11"
                    placeholder="e.g., Senior Account Executive"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Vertical</label>
                <select
                  name="vertical"
                  value={formData.vertical}
                  onChange={handleChange}
                  className="admin-input h-11"
                >
                  <option value="">Select vertical...</option>
                  {VERTICALS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                {!formData.vertical && (
                  <div className="mt-2 p-2 rounded text-[10px] font-bold uppercase flex items-center gap-1" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    Null Warning: Vertical is required for AI categorization.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">calendar_month</span>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      className="admin-input h-11 pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">calendar_month</span>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      className="admin-input h-11 pl-10"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Leave empty for current role</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Summary</label>
                <textarea
                  name="summary"
                  rows={3}
                  value={formData.summary}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="Brief description of your role..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Display Order</label>
                <input
                  type="number"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleChange}
                  className="admin-input h-11 w-32"
                  min="0"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-700">Professional Achievements</h3>
                <button
                  type="button"
                  onClick={addAchievement}
                  className="text-sm font-medium px-3 py-1.5 rounded transition-colors hover:bg-[#192b57]/5"
                  style={{ color: '#192b57' }}
                >
                  + Add New
                </button>
              </div>

              <div className="space-y-3">
                {achievements.map((ach, index) => (
                  <div key={index} className="p-3 rounded-lg border" style={{ backgroundColor: '#f5f6fa', borderColor: '#d3d8e3' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-500">Achievement #{index + 1}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] ${ach.description.length > 120 ? 'text-red-500' : 'text-green-600'}`}>
                          {ach.description.length} / 120 {ach.description.length > 120 && '(Exceeds suggested limit)'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAchievement(index)}
                          className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={ach.description}
                      onChange={(e) => handleAchievementChange(index, 'description', e.target.value)}
                      className="admin-input text-sm"
                      rows={2}
                      placeholder="Describe your achievement..."
                    />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <input
                        type="text"
                        value={ach.metric_value}
                        onChange={(e) => handleAchievementChange(index, 'metric_value', e.target.value)}
                        className="admin-input h-9 text-sm"
                        placeholder="Metric value (e.g., 145%)"
                      />
                      <input
                        type="text"
                        value={ach.metric_type}
                        onChange={(e) => handleAchievementChange(index, 'metric_type', e.target.value)}
                        className="admin-input h-9 text-sm"
                        placeholder="Metric type"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative flex items-center py-4">
            <div className="absolute inset-0 border-t border-dashed border-slate-300"></div>
            <span className="relative px-3 bg-[#f6f6f8] text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mx-auto">
              Internal / Ledger Only
            </span>
          </div>

          <div className="admin-card mb-6" style={{ backgroundColor: '#f0f2f7', borderColor: '#cbd5e1' }}>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Avg Deal Size
                    <span className="ml-2 badge-internal">Internal</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="text"
                      name="avg_deal_size"
                      value={formData.avg_deal_size}
                      onChange={handleChange}
                      className="admin-input h-11 pl-7"
                      placeholder="e.g., 150,000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Sales Cycle
                    <span className="ml-2 badge-internal">Internal</span>
                  </label>
                  <input
                    type="text"
                    name="sales_cycle"
                    value={formData.sales_cycle}
                    onChange={handleChange}
                    className="admin-input h-11"
                    placeholder="e.g., 6-9 months"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Seat Range
                    <span className="ml-2 badge-internal">Internal</span>
                  </label>
                  <input
                    type="text"
                    name="seat_range"
                    value={formData.seat_range}
                    onChange={handleChange}
                    className="admin-input h-11"
                    placeholder="e.g., 50-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Decision Makers
                    <span className="ml-2 badge-internal">Internal</span>
                  </label>
                  <input
                    type="text"
                    name="decision_makers"
                    value={formData.decision_makers}
                    onChange={handleChange}
                    className="admin-input h-11"
                    placeholder="e.g., CIO, VP Sales"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Location (Internal)</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="admin-input h-11"
                  placeholder="e.g., Sydney, Australia"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-700">Quota Records</h3>
                  <span className="badge-internal">Internal</span>
                </div>
                <span className="text-xs text-slate-400 italic">Use format: FY23 Q1</span>
              </div>

              <div className="space-y-3">
                {quotaRecords.map((qr, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={qr.period_label}
                      onChange={(e) => handleQuotaChange(index, 'period_label', e.target.value)}
                      className="admin-input h-10 text-sm flex-1"
                      placeholder="Period (e.g., 2025 Q3)"
                    />
                    <input
                      type="text"
                      value={qr.attainment_percentage}
                      onChange={(e) => handleQuotaChange(index, 'attainment_percentage', e.target.value)}
                      className="admin-input h-10 text-sm flex-1"
                      placeholder="Attainment %"
                    />
                    <input
                      type="text"
                      value={qr.pipeline_generated}
                      onChange={(e) => handleQuotaChange(index, 'pipeline_generated', e.target.value)}
                      className="admin-input h-10 text-sm flex-1"
                      placeholder="Pipeline $"
                    />
                    <button
                      type="button"
                      onClick={() => removeQuotaRecord(index)}
                      className="p-2 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addQuotaRecord}
                className="w-full mt-3 py-2 border border-dashed border-slate-300 rounded text-xs font-bold text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-colors"
              >
                + Add Quota Record
              </button>
            </div>
          </div>

          <div className="p-4 rounded-lg border" style={{ backgroundColor: 'rgba(25, 43, 87, 0.05)', borderColor: 'rgba(25, 43, 87, 0.1)' }}>
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px]" style={{ color: '#192b57' }}>info</span>
              <p className="text-xs" style={{ color: '#192b57' }}>
                Changes to CV-visible fields will trigger an automatic profile rebuild. Internal metrics are dashboard-only and will not appear on the public CV.
              </p>
            </div>
          </div>
        </form>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 px-6 py-4 z-30">
        <div className="max-w-[640px] mx-auto flex justify-between items-center">
          {!isNew && (
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-white transition-all"
              style={{ backgroundColor: '#EF4444', boxShadow: '0 10px 25px rgba(239, 68, 68, 0.2)' }}
            >
              <span className="material-symbols-outlined text-[20px]">delete_forever</span>
              Delete Experience
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <Link
              href="/ledger"
              className="px-4 py-2.5 rounded-lg font-medium text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Discard
            </Link>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-white transition-all"
              style={{ backgroundColor: '#192b57', boxShadow: '0 10px 25px rgba(25, 43, 87, 0.2)' }}
            >
              <span className="material-symbols-outlined text-[20px]">save</span>
              {saving ? 'Saving...' : 'Save Experience'}
            </button>
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        companyName={formData.company_name}
        vertical={formData.vertical || null}
        achievementCount={achievements.filter(a => a.description).length}
        quotaRecordCount={quotaRecords.filter(q => q.period_label).length}
        isDeleting={saving}
      />
    </div>
  );
}
