'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function LedgerLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}
