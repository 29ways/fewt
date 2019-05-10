const puppeteer = require('puppeteer');

class Tracker {
  url: string;

  constructor(url: string) {
    this.url = url
  }

  async trace() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.tracing.start({ path: './trace.json' });

    await page.goto(this.url);

    await page.tracing.stop();
    await browser.close();
  }
}

export default Tracker