'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function NewEntryLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}
