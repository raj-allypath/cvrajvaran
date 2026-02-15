const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const filePath = path.resolve(__dirname, 'index.html');
    const outputPath = path.resolve(__dirname, 'Raj_Varan_CV.pdf');

    console.log('🚀 Launching browser...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Load the CV HTML
    console.log('📄 Loading CV...');
    await page.goto(`file:///${filePath.replace(/\\/g, '/')}`, {
        waitUntil: 'networkidle0',
        timeout: 30000,
    });

    // Hide the download button before printing
    await page.evaluate(() => {
        const btn = document.getElementById('dl-btn');
        if (btn) btn.style.display = 'none';
    });

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');

    // Generate PDF — true A4, print background colors
    console.log('🖨️  Generating PDF...');
    await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();
    console.log(`✅ PDF saved to: ${outputPath}`);
})();
