'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Experience, QuotaRecord } from '@/types/supabase';
import AdminHeader from '@/components/ui/AdminHeader';
import FAB from '@/components/ui/FAB';

interface ExperienceWithQuota extends Experience {
  quota_records?: QuotaRecord[];
}

type ViewMode = 'cards' | 'table';

export default function QuotaPage() {
  const [experiences, setExperiences] = useState<ExperienceWithQuota[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('experiences')
        .select(`
          *,
          quota_records (*)
        `)
        .order('start_date', { ascending: false });

      if (error) throw error;
      if (data) setExperiences(data);
    } catch (error) {
      console.error('Error fetching quota data:', error);
    } finally {
      setLoading(false);
    }
  }

  const relevantExperiences = experiences.filter(
    (exp) => exp.quota_records && exp.quota_records.length > 0
  );

  const getStatusBadge = (attainment: number | null) => {
    if (!attainment) return null;
    if (attainment >= 100) {
      return { label: 'On Track', bg: '#22c55e', text: 'white' };
    }
    if (attainment >= 80) {
      return { label: 'Stable', bg: '#3b82f6', text: 'white' };
    }
    return { label: 'Under', bg: '#F59E0B', text: 'black' };
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '$0';
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f6fa' }}>
      <AdminHeader title="Quota" showSearch={false} />
      <FAB />

      <main className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Quota Analytics Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time sales performance tracking and quota attainment metrics.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
              className="btn-secondary"
            >
              <span className="material-symbols-outlined text-[20px]">
                {viewMode === 'cards' ? 'table_chart' : 'grid_view'}
              </span>
              {viewMode === 'cards' ? 'Table View' : 'Card View'}
            </button>
            <button className="btn-primary">
              <span className="material-symbols-outlined text-[20px]">download</span>
              Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading metrics...</div>
        ) : relevantExperiences.length === 0 ? (
          <div className="text-center py-12 admin-card">
            <h3 className="text-lg font-medium text-slate-900">No quota records yet</h3>
            <p className="text-slate-500 mt-1">Add quota records to your experiences to see analytics.</p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="space-y-8">
            {relevantExperiences.map((exp) => (
              <div key={exp.id} className="admin-card overflow-hidden">
                <div className="flex items-center gap-4 px-6 py-4 bg-slate-50/50 border-b border-slate-200">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f1f5f9' }}>
                    <span className="material-symbols-outlined text-[24px] text-slate-600">corporate_fare</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{exp.company_name}</h3>
                    <p className="text-sm text-slate-500">{exp.role_title}</p>
                  </div>
                  <div className="ml-auto text-sm text-slate-400 font-mono">
                    {exp.start_date?.substring(0, 4)} — {exp.end_date?.substring(0, 4) || 'Present'}
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {exp.quota_records
                      ?.sort((a, b) => (b.period_label || '').localeCompare(a.period_label || ''))
                      .map((record) => {
                        const status = getStatusBadge(record.attainment_percentage);
                        return (
                          <div key={record.id} className="admin-card p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {record.period_label}
                              </span>
                              {status && (
                                <span
                                  className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                  style={{ backgroundColor: status.bg, color: status.text }}
                                >
                                  {status.label}
                                </span>
                              )}
                            </div>

                            <div className="text-2xl font-bold text-slate-900 mb-1">
                              {record.attainment_percentage || 0}%
                            </div>
                            <div className="text-xs text-slate-500 mb-3">Attainment</div>

                            <div className="text-sm">
                              <span className="text-slate-500">Pipeline:</span>{' '}
                              <span className="font-mono font-semibold text-slate-700">
                                {formatCurrency(record.pipeline_generated)}
                              </span>
                            </div>

                            <div className="mt-3 pt-3 border-t border-dashed border-red-200" style={{ backgroundColor: '#fef2f2' }}>
                              <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-red-600 mb-1">
                                <span className="material-symbols-outlined text-[12px]">lock</span>
                                INTERNAL ONLY
                              </div>
                              <div className="text-xs text-slate-400">Target</div>
                              <div className="text-sm font-mono font-bold text-slate-700">
                                {formatCurrency(record.quota_target)}
                              </div>
                            </div>

                            {record.notes && (
                              <div className="mt-3 pt-3 border-t border-slate-100">
                                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Internal Notes</div>
                                <p className="text-xs text-slate-600 italic">{record.notes}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'rgba(248, 250, 252, 0.5)' }}>
                  <th className="text-left px-6 py-3 text-xs font-bold uppercase text-slate-400">Period</th>
                  <th className="text-center px-6 py-3 text-xs font-bold uppercase text-slate-400">Attainment</th>
                  <th className="text-left px-6 py-3 text-xs font-bold uppercase text-slate-400">Pipeline</th>
                  <th className="text-left px-6 py-3 text-xs font-bold uppercase text-red-500">Target (Internal)</th>
                  <th className="text-left px-6 py-3 text-xs font-bold uppercase text-slate-400">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {relevantExperiences.map((exp) =>
                  exp.quota_records
                    ?.sort((a, b) => (b.period_label || '').localeCompare(a.period_label || ''))
                    .map((record) => {
                      const status = getStatusBadge(record.attainment_percentage);
                      return (
                        <tr key={record.id}>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-slate-900">{record.period_label}</div>
                            <div className="text-xs text-slate-500">{exp.company_name}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-center gap-2">
                              <span className="text-lg font-bold text-[#192b57]">{record.attainment_percentage || 0}%</span>
                              {status && (
                                <span
                                  className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                  style={{ backgroundColor: status.bg, color: status.text }}
                                >
                                  {status.label}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-slate-700">
                            {formatCurrency(record.pipeline_generated)}
                          </td>
                          <td className="px-6 py-4" style={{ backgroundColor: 'rgba(254, 242, 242, 0.3)' }}>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 mb-1">
                              <span className="material-symbols-outlined text-[12px]">lock</span>
                              SECURE FIELD
                            </div>
                            <span className="text-sm font-mono font-bold text-slate-700">
                              {formatCurrency(record.quota_target)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {record.notes || '—'}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
