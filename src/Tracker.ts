const hash = require('object-hash')
const fs = require('fs')
const puppeteer = require('puppeteer')

class Tracker {
  url: string

  private readonly urlHash: string

  constructor(url: string) {
    this.url = url
    this.urlHash = hash(this.url)
  }

  get filePath() {
    return `./tmp/trace-${this.urlHash}.json`
  }

  async trace() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.tracing.start({path: this.filePath})

    await page.goto(this.url)

    await page.tracing.stop()
    await browser.close()
  }

  traceAsJson() {
    return JSON.parse(fs.readFileSync(this.filePath))
  }
}

export default Tracker
