'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminHeaderProps {
  title?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
}

export default function AdminHeader({
  title = 'Ledger Admin',
  showSearch = true,
  searchPlaceholder = 'Filter by company, role, or vertical...',
  onSearch,
}: AdminHeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Ledger', href: '/ledger', active: pathname.startsWith('/ledger') },
    { label: 'Analytics', href: '/quota', active: pathname.startsWith('/quota') },
    { label: 'Settings', href: '/settings', active: false },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <Link href="/ledger" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#192b57]" style={{ fontSize: '24px' }}>
                dashboard
              </span>
              <span className="text-lg font-bold text-[#192b57]">{title}</span>
            </Link>

            <nav className="flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    item.active
                      ? 'text-[#192b57] underline underline-offset-4'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {showSearch && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  onChange={(e) => onSearch?.(e.target.value)}
                  className="w-64 h-9 pl-10 pr-4 bg-slate-100 border-0 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#192b57]/20 transition-all"
                />
              </div>
            )}

            <div className="w-8 h-8 rounded-full bg-[#192b57]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#192b57] text-[18px]">
                person
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
