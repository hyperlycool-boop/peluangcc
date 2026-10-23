import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:3000',{waitUntil:'networkidle'});
await page.setViewportSize({width:1440,height:1000});
const links=page.locator('.material-item .module');assert.equal(await links.count(),5);
for(let i=0;i<5;i++){await links.nth(i).hover();assert.equal(await page.locator('.material-item.is-active').count(),1);await page.waitForTimeout(500);assert(await page.locator('.material-item.is-active .material-preview').evaluate(e=>e.getBoundingClientRect().height)>100);}
await page.screenshot({path:'docs/screenshots/homepage-hover-1440.png',fullPage:true});
const urls=await links.evaluateAll(es=>es.map(e=>e.getAttribute('href')));
for(const url of urls){await page.goto('http://127.0.0.1:3000'+url,{waitUntil:'networkidle'});assert.equal(await page.locator('h1').count(),1);await page.locator('summary').click();assert(await page.locator('details').getAttribute('open')!==null);}
for(const width of [360,768,1440]){await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:3000',{waitUntil:'networkidle'});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:`docs/screenshots/homepage-${width}.png`,fullPage:true});}
await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.module').first().focus();assert.equal(await page.locator('.material-item.is-active').count(),1);
assert.deepEqual(errors,[]);await browser.close();console.log('PASS: 5 hover previews, 5 lesson routes + answers, keyboard focus, 360/768/1440, no overflow or JS errors');
