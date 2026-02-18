'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Experience, Profile } from '@/types/supabase';

export default function CVRenderer() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCVData();
    }, []);

    async function fetchCVData() {
        try {
            setLoading(true);

            const { data: profiles } = await supabase.from('profiles').select('*').limit(1);
            if (profiles && profiles.length > 0) {
                setProfile(profiles[0]);
            }

            const { data: exps, error } = await supabase
                .from('experiences')
                .select(`
          *,
          achievements (*),
          quota_records (*)
        `)
                .order('display_order', { ascending: true });

            if (error) throw error;
            if (exps) setExperiences(exps);

        } catch (error) {
            console.error('Error fetching CV data:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="text-center p-12">Loading CV...</div>;
    }

    const p = profile || {
        full_name: 'Raj Varan',
        headline: 'Account Executive',
        email: 'rvaran1066@gmail.com',
        phone: '+61 435 444 143',
        summary: 'Senior Account Executive...'
    };

    return (
        <div id="cv">
            {/* PAGE 1 */}
            <div className="page">
                <div className="header">
                    <div className="header-left">
                        <h1>{p.full_name}</h1>
                        <div className="subtitle">{p.headline}</div>
                    </div>
                    <div className="contact">
                        <a href={`mailto:${p.email}`}>{p.email}</a><br />
                        {p.phone}
                    </div>
                </div>

                <div className="body-grid">
                    {/* ROW 1 — About Me */}
                    <div className="s pt-first pb-row">
                        <div className="side-label">Key Metrics</div>
                    </div>
                    <div className="m pt-first pb-row">
                        <div className="sec-label">About Me</div>
                        <hr className="sec-rule" />
                        <div className="bl" style={{ fontSize: '9.5px', lineHeight: '1.5' }}>
                            {p.summary}
                        </div>
                    </div>

                    {/* DYNAMIC EXPERIENCE ROWS */}
                    {experiences.map((exp, index) => (
                        <React.Fragment key={exp.id}>
                            <div className="s pt-section pb-row">
                                {/* Quota Cards for this Experience */}
                                {exp.quota_records && exp.quota_records.length > 0 && (
                                    exp.quota_records
                                        .sort((a, b) => (b.period_label || '').localeCompare(a.period_label || ''))
                                        .map(q => (
                                            <div key={q.id} className="qcard">
                                                <h4>{q.period_label}</h4>
                                                <ul>
                                                    {q.attainment_percentage && (
                                                        <li><span className="pct">{q.attainment_percentage}%</span> Attainment</li>
                                                    )}
                                                    {q.pipeline_generated && (
                                                        <li>Pipeline <span className="pct">${(q.pipeline_generated / 1000).toFixed(0)}K</span></li>
                                                    )}
                                                    {q.notes && <li>{q.notes}</li>}
                                                </ul>
                                            </div>
                                        ))
                                )}
                            </div>

                            <div className="m pt-section pb-row">
                                {index === 0 && (
                                    <>
                                        <div className="sec-label">Experience</div>
                                        <hr className="sec-rule" />
                                    </>
                                )}

                                <div className="company">{exp.company_name} — {exp.vertical}</div>
                                <div className="role">
                                    {exp.role_title} · {exp.start_date} – {exp.end_date || 'Present'}
                                </div>

                                {exp.summary && <div className="role" style={{ fontStyle: 'italic', marginBottom: '4px' }}>{exp.summary}</div>}

                                <ul className="bl">
                                    {exp.achievements && exp.achievements
                                        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                                        .map(ach => (
                                            <li key={ach.id}>
                                                {ach.description}
                                                {ach.metric_value && (
                                                    <span className="ml-1 font-bold text-gray-800">[{ach.metric_value}]</span>
                                                )}
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        </React.Fragment>
                    ))}

                    {/* Education (Static for now) */}
                    <div className="s pt-section pb-last">
                        <div className="side-label" style={{ marginTop: '4px' }}>Education</div>
                    </div>
                    <div className="m pt-section pb-last">
                        <div className="sec-label">Education & Training</div>
                        <hr className="sec-rule" />

                        <div className="edu-title">Monash University</div>
                        <ul className="bl">
                            <li>Bachelor of Commerce (Accounting and Finance)</li>
                            <li>Bachelor of Laws</li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}
