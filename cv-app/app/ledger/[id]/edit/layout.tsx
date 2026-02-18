'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function EditEntryLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}
