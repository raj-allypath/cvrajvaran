'use client';

import React, { useState } from 'react';

export default function DownloadButton() {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/pdf');
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Raj_Varan_CV.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error(error);
            alert('Failed to generate PDF');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            id="dl-btn"
            onClick={handleDownload}
            disabled={loading}
            className="no-print"
            style={{
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'wait' : 'pointer'
            }}
        >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 10v6m0 0l-3-3m3 3l3-3M6 20h12a2 2 0 002-2V8l-6-6H6a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
            </svg>
            {loading ? 'Generating PDF...' : 'Download PDF'}
        </button>
    );
}
