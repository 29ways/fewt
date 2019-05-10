import {Command, flags} from '@oclif/command'
import cli from 'cli-ux'

import ResourceExtracter from './resource-extracter'
import Summariser, {Rule} from './summariser'
import Tracker from './tracker'

class Fewt extends Command {
  static description = 'Downloads volume of front-end weight for a given URL'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
  }

  static args = [{name: 'url'}]

  async run() {
    const {args} = this.parse(Fewt)
    cli.action.start(`Analysing ${args.url}`)

    const tracker = new Tracker(args.url)
    await tracker.trace()

    const extracter = new ResourceExtracter(tracker.traceAsJson())
    let rules: Rule[] = [
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

    const summary = new Summariser(rules).run(extracter.resources())

    const tableData: { [key: string]: any } = {
      url: args.url
    }

    rules.forEach(rule => {
      tableData[rule.key] = (summary[rule.key].totalEncodedDataLength / 1024).toFixed(2)
      tableData[`${rule.key}-length`] = summary[rule.key].resources.length
    })

    const columns: { [key: string]: any} = {url: {}}
    rules.forEach(rule => {
      columns[rule.key] = {}
      columns[`${rule.key}-length`] = {}
    })

    cli.action.stop()
    cli.table([tableData], columns)
  }
}

export = Fewt
