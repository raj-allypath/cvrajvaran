'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Experience, Achievement, QuotaRecord } from '@/types/supabase';
import { useAuth } from '@/lib/auth';
import AdminHeader from '@/components/ui/AdminHeader';
import DeleteModal from '@/components/ui/DeleteModal';
import FAB from '@/components/ui/FAB';
import Link from 'next/link';

interface ExperienceWithRelations extends Experience {
  achievements?: Achievement[];
  quota_records?: QuotaRecord[];
}

export default function LedgerPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<ExperienceWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<ExperienceWithRelations | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  async function fetchEntries() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('experiences')
        .select(`
          *,
          achievements (*),
          quota_records (*)
        `)
        .order('display_order', { ascending: true });

      if (error) throw error;
      if (data) setEntries(data);
    } catch (error) {
      console.error('Error fetching ledger:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSeed() {
    setSeeding(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not authenticated');

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: currentUser.id,
          full_name: 'Raj Varan',
          headline: 'Account Executive',
          email: 'raj@example.com',
          phone: '+61 412 345 678',
          summary: 'Senior sales executive with 10+ years experience in enterprise software.',
          linkedin_url: 'https://linkedin.com/in/rajvaran',
        }, { onConflict: 'user_id' });

      if (profileError) console.error('Profile error:', profileError);

      const { error: publicProfileError } = await supabase
        .from('public_profiles')
        .upsert({
          user_id: currentUser.id,
          slug: 'default',
          is_active: true,
        }, { onConflict: 'user_id' });

      if (publicProfileError) console.error('Public profile error:', publicProfileError);

      const experiences = [
        {
          user_id: currentUser.id,
          company_name: 'Salesforce',
          role_title: 'Senior Account Executive',
          start_date: '2022-01-01',
          end_date: null,
          location: 'Sydney, Australia',
          vertical: 'Enterprise Software',
          avg_deal_size: '$150,000',
          sales_cycle: '6-9 months',
          seat_range: '50-500',
          decision_makers: 'CIO, VP Sales, CFO',
          summary: 'Leading enterprise accounts in ANZ region.',
          display_order: 1,
        },
        {
          user_id: currentUser.id,
          company_name: 'Microsoft',
          role_title: 'Account Executive',
          start_date: '2019-03-01',
          end_date: '2021-12-31',
          location: 'Melbourne, Australia',
          vertical: 'Cloud Services',
          avg_deal_size: '$80,000',
          sales_cycle: '3-6 months',
          seat_range: '20-200',
          decision_makers: 'IT Director, Procurement',
          summary: 'Azure and Office 365 sales for mid-market.',
          display_order: 2,
        },
        {
          user_id: currentUser.id,
          company_name: 'Atlassian',
          role_title: 'Business Development Representative',
          start_date: '2017-06-01',
          end_date: '2019-02-28',
          location: 'Sydney, Australia',
          vertical: 'Software Collaboration',
          avg_deal_size: '$25,000',
          sales_cycle: '2-4 months',
          seat_range: '10-50',
          decision_makers: 'Team Lead, Manager',
          summary: 'Inbound lead qualification and demo scheduling.',
          display_order: 3,
        },
      ];

      const { data: expData, error: expError } = await supabase
        .from('experiences')
        .upsert(experiences, { onConflict: 'user_id,display_order' })
        .select();

      if (expError) throw expError;

      if (expData && expData.length > 0) {
        const achievements = [
          { experience_id: expData[0].id, description: 'Achieved 145% of quota in FY2023', metric_value: '145%', metric_type: 'percentage', display_order: 1 },
          { experience_id: expData[0].id, description: 'Closed largest deal in ANZ region at $500K ACV', metric_value: '$500K', metric_type: 'currency', display_order: 2 },
          { experience_id: expData[1].id, description: 'Consistently exceeded quota by 20% YoY', metric_value: '120%', metric_type: 'percentage', display_order: 1 },
          { experience_id: expData[2].id, description: 'Generated $2M in pipeline through outbound efforts', metric_value: '$2M', metric_type: 'currency', display_order: 1 },
        ];

        await supabase.from('achievements').upsert(achievements);

        const quotaRecords = [
          { experience_id: expData[0].id, period_label: '2023 YTD', quota_target: 500000, attainment_percentage: 145, pipeline_generated: 850000, notes: 'Top performer' },
          { experience_id: expData[0].id, period_label: '2022 Q4', quota_target: 400000, attainment_percentage: 118, pipeline_generated: 520000, notes: null },
          { experience_id: expData[1].id, period_label: '2021 Q4', quota_target: 300000, attainment_percentage: 125, pipeline_generated: 420000, notes: 'President Club' },
        ];

        await supabase.from('quota_records').upsert(quotaRecords);
      }

      await fetchEntries();
      alert('Database populated!');
    } catch (error) {
      console.error(error);
      alert('Failed to seed database. Check console.');
    } finally {
      setSeeding(false);
    }
  }

  async function handleDelete() {
    if (!selectedExperience) return;
    
    setDeletingId(selectedExperience.id);
    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', selectedExperience.id);

      if (error) throw error;

      await fetchEntries();
      setDeleteModalOpen(false);
      setSelectedExperience(null);
    } catch (error) {
      console.error('Error deleting experience:', error);
      alert('Failed to delete entry. Please try again.');
    } finally {
      setDeletingId(null);
    }
  }

  const filteredEntries = useMemo(() => {
    if (!filterText) return entries;
    const search = filterText.toLowerCase();
    return entries.filter(
      (entry) =>
        entry.company_name?.toLowerCase().includes(search) ||
        entry.role_title?.toLowerCase().includes(search) ||
        entry.vertical?.toLowerCase().includes(search)
    );
  }, [entries, filterText]);

  const openDeleteModal = (experience: ExperienceWithRelations) => {
    setSelectedExperience(experience);
    setDeleteModalOpen(true);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f6fa' }}>
      <AdminHeader
        title="Ledger Admin"
        showSearch={true}
        searchPlaceholder="Filter by company, role, or vertical..."
        onSearch={setFilterText}
      />
      
      <FAB />

      <main className="max-w-[1200px] mx-auto px-8 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Career Ledger</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and audit executive professional experience records.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSeed}
              disabled={seeding || entries.length > 0}
              className="btn-secondary"
            >
              <span className="material-symbols-outlined text-[20px]">database</span>
              Populate Defaults
            </button>
            <Link href="/ledger/new" className="btn-primary">
              <span className="material-symbols-outlined text-[20px]">add</span>
              New Entry
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="admin-card p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total Entries</p>
            <p className="text-xl font-bold text-[#192b57] mt-1">{entries.length}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading ledger...</div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12 admin-card">
            <h3 className="text-lg font-medium text-slate-900">No entries yet</h3>
            <p className="text-slate-500 mt-1">Start by adding your career history.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="admin-card p-5 relative group transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-900">{entry.role_title}</h3>
                      <span className="badge-internal">
                        <span className="material-symbols-outlined text-[10px]">lock</span>
                        Internal Only
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700 mt-1">
                      <span className="material-symbols-outlined text-[16px] text-slate-500">corporate_fare</span>
                      {entry.company_name}
                      {entry.vertical && (
                        <>
                          <span className="text-slate-300">|</span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <span className="material-symbols-outlined text-[14px]">category</span>
                            {entry.vertical}
                          </span>
                        </>
                      )}
                    </div>
                    {entry.location && (
                      <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                        <span className="material-symbols-outlined text-[14px]" style={{ color: '#F59E0B' }}>location_on</span>
                        {entry.location}
                      </div>
                    )}
                    {entry.summary && (
                      <p className="mt-3 text-sm text-slate-600 italic border-l-2 border-slate-200 pl-3">
                        {entry.summary}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Achievements</p>
                      <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded text-xs font-bold bg-[#192b57]/10 text-[#192b57] border border-[#192b57]/20">
                        {entry.achievements?.length || 0}
                      </span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Link
                        href={`/ledger/${entry.id}/edit`}
                        className="p-2 rounded text-slate-400 hover:text-[#192b57] hover:bg-slate-50 transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </Link>
                      <button
                        onClick={() => openDeleteModal(entry)}
                        className="p-2 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                {entry.start_date && (
                  <p className="text-sm text-slate-500 mt-3">
                    {entry.start_date} — {entry.end_date || 'Present'}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {filteredEntries.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              Showing {filteredEntries.length} of {entries.length} experience entries
            </p>
          </div>
        )}
      </main>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        companyName={selectedExperience?.company_name || ''}
        vertical={selectedExperience?.vertical || null}
        achievementCount={selectedExperience?.achievements?.length || 0}
        quotaRecordCount={selectedExperience?.quota_records?.length || 0}
        isDeleting={!!deletingId}
      />
    </div>
  );
}
