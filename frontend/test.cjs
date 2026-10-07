const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });
  
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Plan a Trip')) await btn.click();
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  const startBtns = await page.$$('button');
  for (const btn of startBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Start Planning')) {
      await btn.click();
      console.log('Clicked Start Planning');
    }
  }
  
  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
})();
