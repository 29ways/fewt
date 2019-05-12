import {Command, flags} from '@oclif/command'
import cli from 'cli-ux'
const Listr = require('listr')
const EventEmitter = require('events');

import ResourceExtracter from './resource-extracter'
import Summariser, {Rule} from './summariser'
import Tracker from './tracker'

class Fewt extends Command {
  static description = 'Downloads volume of front-end weight for a given URL'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
    url: flags.string({
      char: 'u',
      multiple: true
    })
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
    }
  ]

  async run() {
    const {flags} = this.parse(Fewt)

    const results: any = []

    const tasks = []

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
            tableData[rule.key] = (summary[rule.key].totalEncodedDataLength / 1024).toFixed(2)
            tableData[`${rule.key}-length`] = summary[rule.key].resources.length
          })

          results[index] = tableData
        }
      })
    }

    new EventEmitter().setMaxListeners(tasks.length)
    await new Listr(tasks, {concurrent: true}).run()

    const columns: { [key: string]: any} = {url: {}}
    Fewt.rules.forEach(rule => {
      columns[rule.key] = {}
      columns[`${rule.key}-length`] = {}
    })

    cli.table(results, columns)
  }
}

export = Fewt
