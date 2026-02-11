import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle', timeout: 30000 });
    
    const title = await page.title();
    console.log('Page title:', title);
    
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.log('Console errors:', errors);
    } else {
      console.log('No console errors detected');
    }
    
    console.log('Browser test completed successfully');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
