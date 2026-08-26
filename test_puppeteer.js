const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE EXCEPTION:', error.message);
  });

  await page.goto(`file:///Users/panaoonchuayboonsong/Desktop/lablink-hackathon/index.html`, { waitUntil: 'networkidle0' });
  
  // Click the AI nav
  await page.evaluate(() => {
    document.getElementById('nav-ai').click();
  });
  
  // Try sending a message
  await page.evaluate(() => {
    const input = document.querySelector('.chat-input');
    if(input) {
      input.value = "Hello";
      document.querySelector('.chat-send').click();
    } else {
      console.log('PAGE ERROR: chat-input not found');
    }
  });

  await new Promise(r => setTimeout(r, 1000));
  
  await browser.close();
})();
