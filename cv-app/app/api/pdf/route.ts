import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const dynamic = 'force-dynamic'; // static by default, unless reading request

export async function GET(request: NextRequest) {
    try {
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host');
        const baseUrl = `${protocol}://${host}`;

        // Local vs Production logic
        let executablePath = await chromium.executablePath();
        if (!executablePath) {
            // Local development (windows/mac)
            // You must have a local chrome/chromium installed or use standard puppeteer
            // For this setup we rely on the fact that the user installed puppeteer which downloads chromium
            // But puppeteer-core doesn't. 
            // So locally we need a path. 
            // A common trick is to use a local chrome installation.
            // Or we can install 'puppeteer' as a dev dependency and use its path.
            // For now, let's assume standard Chrome is at a standard location or we use a tough logic.
            // Better: use 'puppeteer' for local and 'puppeteer-core' for prod.
            // But to simplify, we can try to find a local path.

            const os = process.platform;
            if (os === 'win32') {
                executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
            } else if (os === 'darwin') {
                executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
            } else {
                executablePath = '/usr/bin/google-chrome';
            }
        }

        const browser = await puppeteer.launch({
            args: chromium.args,
            executablePath,
            headless: true,
        });

        const page = await browser.newPage();

        // In production we want to visit the tailored URL. 
        // Here we just visit the home page which renders the CV.
        // We add ?print=true to maybe hide buttons if we had logic for that.
        await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle0' });

        // Hide download button manually via CSS injection just in case
        await page.addStyleTag({ content: '#dl-btn { display: none !important; }' });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
        });

        await browser.close();

        return new NextResponse(Buffer.from(pdf), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="Raj_Varan_CV.pdf"',
            },
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}
