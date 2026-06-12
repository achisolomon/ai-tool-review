import { chromium, devices } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'] });
await ctx.route('**googlesyndication**', r => r.abort());
await ctx.route('**doubleclick**', r => r.abort());
const page = await ctx.newPage();
await page.goto('http://localhost:4000/', { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(2000);
await page.screenshot({ path: '/tmp/wild-mobile-pw.png', timeout: 8000 });
await browser.close();
console.log('shot ok');
