'use client';

import CVRenderer from '@/components/CVRenderer';
import DownloadButton from '@/components/DownloadButton';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center py-10 relative">

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
        {user ? (
          <>
            <Link
              href="/profile"
              className="bg-white text-gray-700 px-4 py-3 rounded-full shadow-lg font-medium hover:bg-gray-50 transition border border-gray-200 flex items-center gap-2"
            >
              <span>👤 Profile</span>
            </Link>
            <Link
              href="/ledger"
              className="bg-white text-gray-700 px-4 py-3 rounded-full shadow-lg font-medium hover:bg-gray-50 transition border border-gray-200 flex items-center gap-2"
            >
              <span>📚 Career Ledger</span>
            </Link>
            <Link
              href="/quota"
              className="bg-white text-gray-700 px-4 py-3 rounded-full shadow-lg font-medium hover:bg-gray-50 transition border border-gray-200 flex items-center gap-2"
            >
              <span>📈 Quota Analytics</span>
            </Link>
            <button
              onClick={logout}
              className="bg-white text-red-600 px-4 py-3 rounded-full shadow-lg font-medium hover:bg-red-50 transition border border-gray-200 flex items-center gap-2"
            >
              <span>🚪 Logout</span>
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="bg-gray-900 text-white px-4 py-3 rounded-full shadow-lg font-medium hover:bg-gray-800 transition flex items-center gap-2"
          >
            <span>🔒 Admin Login</span>
          </Link>
        )}
        <Link
          href="/public/raj-varan"
          className="bg-white text-gray-700 px-4 py-3 rounded-full shadow-lg font-medium hover:bg-gray-50 transition border border-gray-200 flex items-center gap-2"
        >
          <span>🔗 Public Profile</span>
        </Link>
        <DownloadButton />
      </div>

      <CVRenderer />
    </main>
  );
}
