'use client';

import { useEffect, useRef } from 'react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  companyName: string;
  vertical: string | null;
  achievementCount: number;
  quotaRecordCount: number;
  isDeleting?: boolean;
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  companyName,
  vertical,
  achievementCount,
  quotaRecordCount,
  isDeleting = false,
}: DeleteModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="alertdialog"
      aria-labelledby="delete-title"
      aria-describedby="delete-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-[450px] bg-white shadow-2xl rounded-sm border border-gray-200 animate-in fade-in zoom-in-95"
        style={{
          animationDuration: '200ms',
          animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="p-6 pb-2 flex justify-between items-start">
          <h2
            id="delete-title"
            className="text-base font-bold"
            style={{ color: '#1c0d0d' }}
          >
            Delete {companyName}
            {vertical ? ` — ${vertical}` : ''}?
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="px-6 py-2">
          <p id="delete-desc" className="text-sm text-gray-600">
            This will also remove {achievementCount} achievement{achievementCount !== 1 ? 's' : ''} and {quotaRecordCount} quota record{quotaRecordCount !== 1 ? 's' : ''}. This action is irreversible.
          </p>
        </div>

        <div className="mx-6 my-4 p-3 rounded-sm" style={{ borderLeft: '4px solid #f14141', backgroundColor: 'rgba(241, 65, 65, 0.05)' }}>
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px]" style={{ color: '#f14141' }}>
              warning
            </span>
            <p className="text-xs font-medium" style={{ color: '#f14141' }}>
              Warning: Associated data for this experience will be purged from the production cluster.
            </p>
          </div>
        </div>

        <div className="px-6 py-5 rounded-b-sm bg-gray-50/50 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              ref={cancelButtonRef}
              onClick={onClose}
              disabled={isDeleting}
              className="min-w-[84px] h-9 px-4 rounded-sm font-medium text-sm bg-[#E9EBF1] text-gray-700 hover:bg-[#dfe2e9] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="min-w-[84px] h-9 px-4 rounded-sm font-medium text-sm text-white bg-[#EF4444] hover:bg-[#d93a3a] transition-colors disabled:opacity-50 shadow-sm"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
