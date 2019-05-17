const hash = require('object-hash')
const fs = require('fs')
const puppeteer = require('puppeteer')
const tmp = require('tmp')

class Tracker {
  url: string
  tmpFile: any

  constructor(url: string) {
    this.url = url
    this.tmpFile = tmp.fileSync()
  }

  get filePath() {
    return this.tmpFile.name
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
