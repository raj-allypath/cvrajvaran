'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/ledger');
    }
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/ledger');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f5f6fa' }}>
      <div className="w-full max-w-[440px]">
        <div className="bg-white rounded-sm shadow-sm border border-[#dfe6e9] p-10" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold" style={{ color: '#192b57' }}>
              Admin Login
            </h1>
            <p className="text-sm mt-1 opacity-60" style={{ color: '#192b57' }}>
              Executive CV Management System
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 p-3 rounded-sm bg-red-50 border border-red-100">
              <span className="material-symbols-outlined text-[18px]" style={{ color: '#ef4444' }}>
                error
              </span>
              <span className="text-sm font-medium" style={{ color: '#ef4444' }}>
                Invalid login credentials
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: '#192b57' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="e.g., admin@executive-cv.com"
                className="w-full h-12 px-4 rounded-sm border border-[#dfe6e9] bg-white focus:outline-none focus:ring-1 focus:ring-[#192b57] transition-all text-base"
                style={{ color: '#192b57' }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: '#192b57' }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 rounded-sm border border-[#dfe6e9] bg-white focus:outline-none focus:ring-1 focus:ring-[#192b57] transition-all text-base"
                  style={{ color: '#192b57' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#192b57] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-sm font-bold text-base text-white tracking-wide transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{ backgroundColor: '#192b57' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#dfe6e9]">
            <Link
              href="/public/default"
              className="group flex items-center gap-1 text-sm font-medium opacity-60 hover:opacity-100 transition-all"
              style={{ color: '#192b57' }}
            >
              <span className="transition-transform group-hover:-translate-x-0.5">←</span>
              Back to Public CV
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-40" style={{ color: '#192b57' }}>
            Secure Administrator Portal
          </p>
        </div>
      </div>
    </main>
  );
}
