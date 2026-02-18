'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';

type ApiKeyConfig = {
    key: string;
    label: string;
    description: string;
    placeholder: string;
    icon: string;
    prefix: string;
    docsUrl: string;
    required: boolean;
};

const API_KEY_CONFIGS: ApiKeyConfig[] = [
    {
        key: 'claude_api_key',
        label: 'Claude API Key',
        description: 'Powers the AI paste-and-parse feature for bulk CV entry. Used to extract structured experience data from raw text.',
        placeholder: 'sk-ant-api03-...',
        icon: 'psychology',
        prefix: 'sk-ant-',
        docsUrl: 'https://console.anthropic.com/settings/keys',
        required: true,
    },
    {
        key: 'openai_api_key',
        label: 'OpenAI API Key',
        description: 'Optional fallback provider for text parsing and metric extraction. Not currently used if Claude is configured.',
        placeholder: 'sk-proj-...',
        icon: 'auto_awesome',
        prefix: 'sk-',
        docsUrl: 'https://platform.openai.com/api-keys',
        required: false,
    },
    {
        key: 'google_ai_api_key',
        label: 'Google AI API Key',
        description: 'Optional provider for Gemini-powered parsing. Can be used as an alternative to Claude for structured extraction.',
        placeholder: 'AIzaSy...',
        icon: 'diamond',
        prefix: 'AIza',
        docsUrl: 'https://aistudio.google.com/app/apikey',
        required: false,
    },
];

type SavedKeys = Record<string, string>;

function maskKey(key: string): string {
    if (!key || key.length < 12) return key;
    return key.slice(0, 7) + '•'.repeat(Math.min(key.length - 11, 20)) + key.slice(-4);
}

export default function SettingsPage() {
    return (
        <ProtectedRoute>
            <SettingsContent />
        </ProtectedRoute>
    );
}

function SettingsContent() {
    const { user, logout } = useAuth();
    const [keys, setKeys] = useState<SavedKeys>({});
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [inputValues, setInputValues] = useState<SavedKeys>({});
    const [saved, setSaved] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [activeProvider, setActiveProvider] = useState<string>('claude_api_key');

    // Load saved keys from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('cv_app_api_keys');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setKeys(parsed);
            } catch {
                // Ignore corrupted data
            }
        }
        const storedProvider = localStorage.getItem('cv_app_active_provider');
        if (storedProvider) {
            setActiveProvider(storedProvider);
        }
    }, []);

    function handleEdit(configKey: string) {
        setEditingKey(configKey);
        setInputValues(prev => ({ ...prev, [configKey]: keys[configKey] || '' }));
    }

    function handleSaveKey(configKey: string) {
        const value = inputValues[configKey]?.trim() || '';
        const updated = { ...keys };
        if (value) {
            updated[configKey] = value;
        } else {
            delete updated[configKey];
        }
        setKeys(updated);
        localStorage.setItem('cv_app_api_keys', JSON.stringify(updated));
        setEditingKey(null);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    }

    function handleDeleteKey(configKey: string) {
        const updated = { ...keys };
        delete updated[configKey];
        setKeys(updated);
        localStorage.setItem('cv_app_api_keys', JSON.stringify(updated));
        setDeleteConfirm(null);
        // If deleted key was active provider, reset
        if (activeProvider === configKey) {
            const firstAvailable = API_KEY_CONFIGS.find(c => updated[c.key]);
            setActiveProvider(firstAvailable?.key || 'claude_api_key');
            localStorage.setItem('cv_app_active_provider', firstAvailable?.key || 'claude_api_key');
        }
    }

    function handleSetActiveProvider(configKey: string) {
        setActiveProvider(configKey);
        localStorage.setItem('cv_app_active_provider', configKey);
    }

    const configuredCount = API_KEY_CONFIGS.filter(c => keys[c.key]).length;

    return (
        <div className="min-h-screen" style={{ background: '#f5f6fa', fontFamily: "'Inter', sans-serif" }}>
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 w-full border-b bg-white px-6 py-4" style={{ borderColor: '#e9ebf1' }}>
                <div className="max-w-[1200px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg text-white" style={{ background: '#192b57' }}>
                            <span className="material-symbols-outlined block text-xl">shield_person</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight" style={{ color: '#192b57' }}>Executive CV System</h1>
                            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#9ca3af' }}>Internal Administration</p>
                        </div>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-sm font-semibold transition-colors hover:opacity-80" style={{ color: '#5a688c' }}>Dashboard</Link>
                        <Link href="/ledger" className="text-sm font-semibold transition-colors hover:opacity-80" style={{ color: '#5a688c' }}>Ledger</Link>
                        <Link href="/profile" className="text-sm font-semibold transition-colors hover:opacity-80" style={{ color: '#5a688c' }}>Profiles</Link>
                        <Link href="/quota" className="text-sm font-semibold transition-colors hover:opacity-80" style={{ color: '#5a688c' }}>Analytics</Link>
                        <span className="text-sm font-semibold pb-1 border-b-2" style={{ color: '#192b57', borderColor: '#192b57' }}>Settings</span>
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border" style={{ background: 'rgba(25,43,87,0.1)', color: '#192b57', borderColor: 'rgba(25,43,87,0.2)' }}>
                            {user?.email?.charAt(0).toUpperCase() || 'A'}
                        </div>
                    </nav>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex flex-col items-center py-10 px-4">
                {/* Breadcrumbs */}
                <nav className="w-full max-w-[640px] mb-6 flex items-center gap-2 text-sm">
                    <Link href="/" className="hover:opacity-80" style={{ color: '#5a688c' }}>Admin</Link>
                    <span className="material-symbols-outlined text-sm" style={{ color: '#9ca3af' }}>chevron_right</span>
                    <span className="font-medium" style={{ color: '#101219' }}>Settings</span>
                </nav>

                {/* Page Header */}
                <div className="w-full max-w-[640px] mb-8">
                    <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: '#101219' }}>Settings</h2>
                    <p className="mt-1" style={{ color: '#5a688c' }}>Manage API integrations, provider configuration, and system preferences.</p>
                </div>

                {/* API Keys Status Card */}
                <div className="w-full max-w-[640px] mb-6 p-4 rounded-xl border shadow-sm flex items-center justify-between" style={{ background: '#fff', borderColor: '#e9ebf1' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(25,43,87,0.1)' }}>
                            <span className="material-symbols-outlined text-xl" style={{ color: '#192b57' }}>vpn_key</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold" style={{ color: '#101219' }}>API Provider Status</p>
                            <p className="text-xs" style={{ color: '#5a688c' }}>
                                {configuredCount} of {API_KEY_CONFIGS.length} providers configured
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {configuredCount > 0 ? (
                            <span className="px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider" style={{ background: 'rgba(39,174,96,0.1)', color: '#27AE60', border: '1px solid rgba(39,174,96,0.2)' }}>
                                Active
                            </span>
                        ) : (
                            <span className="px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider" style={{ background: '#FEF2F2', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                                No Keys
                            </span>
                        )}
                    </div>
                </div>

                {/* Success Toast */}
                {saved && (
                    <div className="w-full max-w-[640px] mb-4 p-3 rounded-lg flex items-center gap-3" style={{ background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.2)' }}>
                        <span className="material-symbols-outlined text-lg" style={{ color: '#27AE60' }}>check_circle</span>
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#27AE60' }}>API key saved successfully</p>
                    </div>
                )}

                {/* API Keys Form Container */}
                <div className="w-full max-w-[640px] bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: '#e9ebf1' }}>
                    {/* Section Header */}
                    <div className="p-8 border-b" style={{ borderColor: '#f1f3f7', background: '#fcfcfd' }}>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-xl" style={{ color: '#192b57' }}>key</span>
                            <h3 className="text-lg font-bold" style={{ color: '#192b57' }}>API Keys</h3>
                        </div>
                        <p className="text-sm" style={{ color: '#5a688c' }}>
                            Configure API provider keys for AI-powered features. Keys are stored locally in your browser — never sent to our servers.
                        </p>
                    </div>

                    {/* Key Cards */}
                    <div className="divide-y" style={{ borderColor: '#f1f3f7' }}>
                        {API_KEY_CONFIGS.map((config) => {
                            const hasKey = !!keys[config.key];
                            const isEditing = editingKey === config.key;
                            const isActive = activeProvider === config.key && hasKey;
                            const isDeleting = deleteConfirm === config.key;

                            return (
                                <div key={config.key} className="p-6 relative">
                                    {/* Delete Confirmation Overlay */}
                                    {isDeleting && (
                                        <div className="absolute inset-0 bg-white/95 z-10 flex items-center justify-center rounded-lg">
                                            <div className="text-center p-6">
                                                <span className="material-symbols-outlined text-3xl mb-3 block" style={{ color: '#EF4444' }}>warning</span>
                                                <p className="font-bold mb-1" style={{ color: '#101219' }}>Remove this API key?</p>
                                                <p className="text-xs mb-4" style={{ color: '#5a688c' }}>This will disable AI features that depend on this provider.</p>
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={() => setDeleteConfirm(null)}
                                                        className="px-4 py-2 text-sm font-semibold rounded-lg border transition-colors hover:bg-gray-50"
                                                        style={{ color: '#5a688c', borderColor: '#d3d8e3' }}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteKey(config.key)}
                                                        className="px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors"
                                                        style={{ background: '#EF4444' }}
                                                    >
                                                        Remove Key
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Key Header Row */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: hasKey ? 'rgba(25,43,87,0.1)' : '#f1f3f7' }}>
                                                <span className="material-symbols-outlined text-lg" style={{ color: hasKey ? '#192b57' : '#9ca3af' }}>{config.icon}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm font-bold" style={{ color: '#101219' }}>{config.label}</h4>
                                                    {config.required && (
                                                        <span className="text-xs font-bold px-1.5 py-0.5 rounded uppercase tracking-tight" style={{ background: 'rgba(25,43,87,0.08)', color: '#192b57', border: '1px solid rgba(25,43,87,0.15)' }}>
                                                            Primary
                                                        </span>
                                                    )}
                                                    {isActive && (
                                                        <span className="text-xs font-bold px-1.5 py-0.5 rounded uppercase tracking-tight" style={{ background: 'rgba(39,174,96,0.1)', color: '#27AE60', border: '1px solid rgba(39,174,96,0.2)' }}>
                                                            Active
                                                        </span>
                                                    )}
                                                    {hasKey && !isActive && (
                                                        <span className="text-xs font-bold px-1.5 py-0.5 rounded uppercase tracking-tight" style={{ background: '#f1f3f7', color: '#5a688c' }}>
                                                            Standby
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs mt-0.5" style={{ color: '#5a688c' }}>{config.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Key Input / Display */}
                                    {isEditing ? (
                                        <div className="mt-3 space-y-3">
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: '#5a688c' }}>vpn_key</span>
                                                <input
                                                    type="text"
                                                    value={inputValues[config.key] || ''}
                                                    onChange={(e) => setInputValues(prev => ({ ...prev, [config.key]: e.target.value }))}
                                                    placeholder={config.placeholder}
                                                    className="w-full h-11 pl-10 pr-4 rounded-lg border outline-none transition-all text-sm font-mono"
                                                    style={{ borderColor: '#192b57', background: 'rgba(25,43,87,0.02)', boxShadow: '0 0 0 2px rgba(25,43,87,0.1)' }}
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <a
                                                    href={config.docsUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs font-semibold flex items-center gap-1 transition-colors hover:opacity-80"
                                                    style={{ color: '#192b57' }}
                                                >
                                                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                                                    Get API Key
                                                </a>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setEditingKey(null)}
                                                        className="px-4 py-2 text-xs font-semibold rounded-lg border transition-colors hover:bg-gray-50"
                                                        style={{ color: '#5a688c', borderColor: '#d3d8e3' }}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveKey(config.key)}
                                                        className="px-5 py-2 text-xs font-bold text-white rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                                                        style={{ background: '#192b57' }}
                                                    >
                                                        <span className="material-symbols-outlined text-sm">save</span>
                                                        Save Key
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : hasKey ? (
                                        <div className="mt-3 flex items-center gap-2">
                                            <div className="flex-1 h-10 px-4 rounded-lg border flex items-center text-sm font-mono" style={{ borderColor: '#e9ebf1', background: '#f9fafb', color: '#5a688c' }}>
                                                {maskKey(keys[config.key])}
                                            </div>
                                            <button
                                                onClick={() => handleEdit(config.key)}
                                                className="h-10 px-3 rounded-lg border transition-colors hover:bg-gray-50 flex items-center gap-1 text-xs font-semibold"
                                                style={{ borderColor: '#d3d8e3', color: '#5a688c' }}
                                            >
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                                Edit
                                            </button>
                                            {!isActive && hasKey && (
                                                <button
                                                    onClick={() => handleSetActiveProvider(config.key)}
                                                    className="h-10 px-3 rounded-lg border transition-colors hover:bg-gray-50 flex items-center gap-1 text-xs font-semibold"
                                                    style={{ borderColor: 'rgba(25,43,87,0.2)', color: '#192b57' }}
                                                >
                                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                                    Set Active
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setDeleteConfirm(config.key)}
                                                className="h-10 px-3 rounded-lg border transition-colors flex items-center hover:bg-red-50"
                                                style={{ borderColor: 'rgba(239,68,68,0.2)', color: '#EF4444' }}
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mt-3">
                                            <button
                                                onClick={() => handleEdit(config.key)}
                                                className="w-full py-3 border-2 border-dashed rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 hover:bg-gray-50"
                                                style={{ borderColor: '#d3d8e3', color: '#5a688c' }}
                                            >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                                Add API Key
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full max-w-[640px] relative py-6 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center px-2">
                        <div className="w-full border-t-2 border-dashed" style={{ borderColor: '#d3d8e3' }}></div>
                    </div>
                    <span className="relative px-6 py-1 text-xs font-black tracking-widest uppercase rounded-full border shadow-sm" style={{ background: '#f5f6fa', color: '#5a688c', borderColor: '#e9ebf1' }}>
                        AI Parse Configuration
                    </span>
                </div>

                {/* Parse Feature Settings */}
                <div className="w-full max-w-[640px] bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: '#e9ebf1' }}>
                    <div className="p-8 border-b" style={{ borderColor: '#f1f3f7', background: '#fcfcfd' }}>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-xl" style={{ color: '#192b57' }}>auto_fix_high</span>
                            <h3 className="text-lg font-bold" style={{ color: '#192b57' }}>Paste &amp; Parse</h3>
                        </div>
                        <p className="text-sm" style={{ color: '#5a688c' }}>
                            Configure how the AI-assisted paste feature processes raw CV text into structured experience records.
                        </p>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Active Provider Display */}
                        <div className="flex items-start justify-between p-4 rounded-lg border" style={{ background: '#f9fafb', borderColor: '#e9ebf1' }}>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-bold" style={{ color: '#101219' }}>Active AI Provider</span>
                                <p className="text-xs" style={{ color: '#5a688c' }}>
                                    {keys[activeProvider]
                                        ? `Using ${API_KEY_CONFIGS.find(c => c.key === activeProvider)?.label || 'Unknown'} for text parsing`
                                        : 'No provider configured — paste feature disabled'
                                    }
                                </p>
                            </div>
                            <span className="material-symbols-outlined text-xl" style={{ color: keys[activeProvider] ? '#27AE60' : '#9ca3af' }}>
                                {keys[activeProvider] ? 'check_circle' : 'cancel'}
                            </span>
                        </div>

                        {/* Guardrails Enforcement Toggle */}
                        <div className="flex items-start justify-between p-4 rounded-lg border" style={{ background: '#f9fafb', borderColor: '#e9ebf1' }}>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-bold" style={{ color: '#101219' }}>Enforce CV Guardrails on Parse</span>
                                <p className="text-xs" style={{ color: '#5a688c' }}>
                                    Validate parsed output against cv-guardrails.md rules (3–5 bullets, 25–35 words, metric formatting).
                                </p>
                            </div>
                            <label className="inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ ['--tw-peer-checked-bg' as string]: '#192b57' }}></div>
                            </label>
                        </div>

                        {/* Auto-Extract Metrics Toggle */}
                        <div className="flex items-start justify-between p-4 rounded-lg border" style={{ background: '#f9fafb', borderColor: '#e9ebf1' }}>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-bold" style={{ color: '#101219' }}>Auto-Extract Metrics</span>
                                <p className="text-xs" style={{ color: '#5a688c' }}>
                                    Automatically detect $values, percentages, and headcounts in bullet text and populate metric_value fields.
                                </p>
                            </div>
                            <label className="inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                        </div>

                        {/* Date Normalization Toggle */}
                        <div className="flex items-start justify-between p-4 rounded-lg border" style={{ background: '#f9fafb', borderColor: '#e9ebf1' }}>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-bold" style={{ color: '#101219' }}>Normalize Dates to ISO</span>
                                <p className="text-xs" style={{ color: '#5a688c' }}>
                                    Convert parsed dates ("May 2025", "June 2024") to ISO format (2025-05-01) before database insert.
                                </p>
                            </div>
                            <label className="inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Security Info */}
                <div className="w-full max-w-[640px] mt-6 p-4 rounded-lg flex gap-3" style={{ background: 'rgba(25,43,87,0.05)', border: '1px solid rgba(25,43,87,0.1)' }}>
                    <span className="material-symbols-outlined" style={{ color: '#192b57' }}>info</span>
                    <div>
                        <p className="text-xs font-bold leading-relaxed" style={{ color: 'rgba(25,43,87,0.8)' }}>
                            Security Notice
                        </p>
                        <p className="text-xs leading-relaxed mt-1" style={{ color: 'rgba(25,43,87,0.6)' }}>
                            API keys are stored in your browser&apos;s localStorage and are never transmitted to any server other than the provider&apos;s own API endpoint during parsing requests. Keys are sent server-side only when you use the paste-and-parse feature, routed through <code className="font-mono px-1 rounded" style={{ background: 'rgba(25,43,87,0.08)' }}>/api/parse-cv</code>.
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full max-w-[640px] relative py-6 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center px-2">
                        <div className="w-full border-t-2 border-dashed" style={{ borderColor: '#d3d8e3' }}></div>
                    </div>
                    <span className="relative px-6 py-1 text-xs font-black tracking-widest uppercase rounded-full border shadow-sm" style={{ background: '#f5f6fa', color: '#5a688c', borderColor: '#e9ebf1' }}>
                        System
                    </span>
                </div>

                {/* Account Info */}
                <div className="w-full max-w-[640px] bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: '#e9ebf1' }}>
                    <div className="p-8 border-b" style={{ borderColor: '#f1f3f7', background: '#fcfcfd' }}>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-xl" style={{ color: '#192b57' }}>account_circle</span>
                            <h3 className="text-lg font-bold" style={{ color: '#192b57' }}>Account</h3>
                        </div>
                    </div>

                    <div className="p-8 space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border" style={{ background: '#f9fafb', borderColor: '#e9ebf1' }}>
                            <div>
                                <span className="text-sm font-bold" style={{ color: '#101219' }}>Signed In As</span>
                                <p className="text-xs font-mono mt-0.5" style={{ color: '#5a688c' }}>{user?.email || 'Unknown'}</p>
                            </div>
                            <button
                                onClick={() => logout()}
                                className="px-4 py-2 text-xs font-bold text-white rounded-lg transition-all flex items-center gap-1.5"
                                style={{ background: '#EF4444' }}
                            >
                                <span className="material-symbols-outlined text-sm">logout</span>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Spacer */}
                <div className="h-24"></div>
            </main>

            {/* Floating Action Bar */}
            <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 z-[100]">
                <div className="hidden md:block px-3 py-1.5 rounded-lg shadow-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #e9ebf1', color: '#192b57' }}>
                    Quick Navigation
                </div>
                <div className="flex gap-3 p-3 rounded-full shadow-2xl items-center" style={{ background: '#192b57', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Link href="/" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all" title="Dashboard">
                        <span className="material-symbols-outlined text-xl">dashboard</span>
                    </Link>
                    <Link href="/ledger" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all" title="Ledger">
                        <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                    </Link>
                    <div className="h-6 w-[1px] bg-white/20 mx-1"></div>
                    <Link href="/settings" className="w-10 h-10 rounded-full bg-white text-white flex items-center justify-center shadow-lg transition-all" title="Settings" style={{ color: '#192b57' }}>
                        <span className="material-symbols-outlined text-xl">settings</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
