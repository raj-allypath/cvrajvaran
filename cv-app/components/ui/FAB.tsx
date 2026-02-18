'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';

interface MenuItem {
  label: string;
  icon: string;
  action?: () => void;
  href?: string;
  danger?: boolean;
}

export default function FAB() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const menuItems: MenuItem[] = user
    ? [
        { label: 'Career Ledger', icon: 'menu_book', href: '/ledger' },
        { label: 'Quota Analytics', icon: 'analytics', href: '/quota' },
        { label: 'Profile', icon: 'account_circle', href: '/profile' },
        { label: 'Public Profile', icon: 'link', href: '/public/default' },
        { label: 'Download PDF', icon: 'picture_as_pdf', action: () => window.open('/api/pdf', '_blank') },
        { label: 'Logout', icon: 'logout', action: handleLogout, danger: true },
      ]
    : [
        { label: 'Admin Login', icon: 'lock', href: '/login' },
        { label: 'Public Profile', icon: 'link', href: '/public/default' },
        { label: 'Download PDF', icon: 'picture_as_pdf', action: () => window.open('/api/pdf', '_blank') },
      ];

  const handleItemClick = (item: MenuItem) => {
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(19, 23, 31, 0.6)' }}
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        ref={fabRef}
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
      >
        {isOpen && (
          <div className="flex flex-col gap-2 items-end">
            {menuItems.map((item, index) => (
              <button
                key={item.label}
                onClick={() => handleItemClick(item)}
                className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationDuration: '200ms',
                  animationFillMode: 'both',
                }}
              >
                <span
                  className="px-4 py-2 rounded-full text-white text-sm font-bold shadow-xl backdrop-blur-md border border-white/10"
                  style={{
                    backgroundColor: item.danger
                      ? '#991b1b'
                      : 'rgba(25, 43, 87, 0.9)',
                    borderColor: item.danger ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {item.label}
                </span>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-2xl border border-white/20 transform transition-transform hover:scale-110"
                  style={{
                    backgroundColor: item.danger ? '#991b1b' : '#192b57',
                  }}
                >
                  <span className="material-symbols-outlined text-white text-[20px]">
                    {item.icon}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/20 transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ backgroundColor: isOpen ? '#1f356d' : '#192b57' }}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          <span className="material-symbols-outlined text-white text-[24px] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
            {isOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>
    </>
  );
}
