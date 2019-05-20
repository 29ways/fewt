import {Command, flags} from '@oclif/command'
import cli from 'cli-ux'
const Listr = require('listr')
const EventEmitter = require('events');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

import ResourceExtracter from './resource-extracter'
import Summariser, {Rule} from './summariser'
import Tracker from './tracker'

interface LighthouseRule {
  key: string
  match(resource: any): any
}

class Fewt extends Command {
  static description = 'Downloads volume of front-end weight for a given URL'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
    url: flags.string({
      char: 'u',
      multiple: true
    }),
    csv: flags.boolean(),
    bytes: flags.boolean({char: 'b'})
  }

  static args = []

  static rules: Rule[] = [
    {
      key: 'html',
      match: resource => resource.response.mimeType === 'text/html'
    },
    {
      key: 'css',
      match: resource => resource.response.mimeType === 'text/css'
    },
    {
      key: 'js',
      match: resource => resource.response.mimeType.match(/javascript$/) !== null
    },
    {
      key: 'img',
      match: resource => resource.response.mimeType.match(/^image/) !== null
    },
    {
      key: 'fonts',
      match: resource => resource.response.mimeType.match(/font/) !== null
    },
    {
      key: 'all',
      match: resource => resource.completed
    }
  ]

  static lighthouseMetrics: LighthouseRule[] = [
    {
      key: 'performance',
      match: results => results.categories.performance.score
    },
    {
      key: 'accessibility',
      match: results => results.categories.accessibility.score
    },
    {
      key: 'best-practices',
      match: results => results.categories['best-practices'].score
    },
    {
      key: 'seo',
      match: results => results.categories.seo.score
    },
    {
      key: 'first-contentful-paint-score',
      match: results => results.audits['first-contentful-paint'].score
    },
    {
      key: 'first-contentful-paint-value',
      match: results => results.audits['first-contentful-paint'].numericValue
    },
    {
      key: 'first-meaningful-paint-score',
      match: results => results.audits['first-meaningful-paint'].score
    },
    {
      key: 'first-meaningful-paint-value',
      match: results => results.audits['first-meaningful-paint'].numericValue
    },
    {
      key: 'speed-index-score',
      match: results => results.audits['speed-index'].score
    },
    {
      key: 'speed-index-value',
      match: results => results.audits['speed-index'].numericValue
    },
    {
      key: 'time-to-first-byte-score',
      match: results => results.audits['time-to-first-byte'].score
    },
    {
      key: 'time-to-first-byte-value',
      match: results => results.audits['time-to-first-byte'].numericValue
    },
    {
      key: 'first-cpu-idle-score',
      match: results => results.audits['first-cpu-idle'].score
    },
    {
      key: 'first-cpu-idle-value',
      match: results => results.audits['first-cpu-idle'].numericValue
    },
    {
      key: 'interactive-score',
      match: results => results.audits.interactive.score
    },
    {
      key: 'interactive-value',
      match: results => results.audits.interactive.numericValue
    }
  ]

  async run() {
    const {flags} = this.parse(Fewt)

    const results: any = []

    const tasks = []

    const divider: number = (flags.bytes) ? 1 : 1024

    for (const [index, url] of flags.url.entries()) {
      tasks.push({
        title: url,
        task: async () => {
          const tracker = new Tracker(url)
          await tracker.trace()

          const extracter = new ResourceExtracter(tracker.traceAsJson())
          const summary = new Summariser(Fewt.rules).run(extracter.resources())

          const tableData: { [key: string]: any } = {
            url
          }

          Fewt.rules.forEach(rule => {
            tableData[rule.key] = (summary[rule.key].totalEncodedDataLength / divider).toFixed(2)
            tableData[`num ${rule.key}`] = summary[rule.key].resources.length
          })

          await launchChromeAndRunLighthouse(url)
            .then((results: any) => {
              Fewt.lighthouseMetrics.forEach(metric => {
                tableData[metric.key] = metric.match(results)
              })
            })

          results[index] = tableData
        }
      })
    }

    new EventEmitter().setMaxListeners(tasks.length)
    await new Listr(tasks, {concurrent: false}).run()

    const columns: { [key: string]: any} = {url: {}}
    Fewt.rules.forEach(rule => {
      columns[rule.key] = {}
      columns[`num ${rule.key}`] = {}
    })

    Fewt.lighthouseMetrics.forEach(metric => {
      columns[metric.key] = {}
    })

    cli.table(results, columns, {csv: flags.csv})
  }
}

async function launchChromeAndRunLighthouse(url: string, opts = {port: null}, config = null) {
  const chromeFlags = ['--headless']
  return chromeLauncher.launch({chromeFlags}).then((chrome: any) => {
    opts.port = chrome.port
    return lighthouse(url, opts, config).then((results: any) => {
      // use results.lhr for the JS-consumeable output
      // https://github.com/GoogleChrome/lighthouse/blob/master/types/lhr.d.ts
      // use results.report for the HTML/JSON/CSV output as a string
      // use results.artifacts for the trace/screenshots/other specific case you need (rarer)
      return chrome.kill().then(() => results.lhr)
    })
  })
}

export = Fewt
