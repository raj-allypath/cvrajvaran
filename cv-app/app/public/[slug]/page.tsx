'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Experience, Profile } from '@/types/supabase';
import CVRenderer from '@/components/CVRenderer';
import { notFound } from 'next/navigation';

export default function PublicProfilePage({ params }: { params: { slug: string } }) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'cv' | 'metrics'>('cv');

    // In a real app we'd fetch based on slug from public_profiles table
    // For now, we'll just show the main profile if slug matches 'raj-varan'
    // or return 404.

    useEffect(() => {
        if (params.slug !== 'raj-varan') {
            // In real app, check DB. For V1 demo, strict slug.
        }
        fetchData();
    }, [params.slug]);

    async function fetchData() {
        try {
            setLoading(true);
            const { data: profiles } = await supabase.from('profiles').select('*').limit(1);
            if (profiles && profiles.length > 0) {
                setProfile(profiles[0]);
            }
        } catch (error) {
            console.error('Error fetching public profile:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
    if (!profile && !loading) return notFound();

    return (
        <main className="min-h-screen bg-gray-100 font-sans text-gray-900">
            {/* Public Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-navy-900 rounded-full flex items-center justify-center text-white font-bold">
                            {profile?.full_name?.charAt(0) || 'R'}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-non text-gray-900">{profile?.full_name}</h1>
                            <p className="text-xs text-gray-500">{profile?.headline}</p>
                        </div>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('cv')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'cv' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            CV
                        </button>
                        <button
                            onClick={() => setActiveTab('metrics')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'metrics' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Quota & Metrics
                        </button>
                    </div>

                    <a
                        href={`mailto:${profile?.email}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                    >
                        Contact Me
                    </a>
                </div>
            </div>

            <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {activeTab === 'cv' ? (
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                        {/* Reuse CV Component but wrapped for public view */}
                        <div className="transform scale-[0.9] origin-top-left w-[110%] h-[110%]">
                            <CVRenderer />
                        </div>
                    </div>
                ) : (
                    <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-8">
                        <h2 className="text-2xl font-bold mb-6">Verified Performance History</h2>
                        {/* We can re-use the Quota Page components here or iframe it */}
                        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <p>Detailed performance analytics view loading...</p>
                            <p className="text-sm mt-2">(This would render the Quota Dashboard content)</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="max-w-5xl mx-auto text-center py-8 text-gray-400 text-xs">
                <p>&copy; {new Date().getFullYear()} {profile?.full_name}. Powered by Career Knowledge Base.</p>
            </div>
        </main>
    );
}
