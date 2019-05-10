import {Resource} from './resource-extracter'

export interface Rule {
  key: string
  match(resource: Resource): boolean
}

interface Result {
  resources: Resource[]
  totalEncodedDataLength: number
  totalDecodedBodyLength: number
}

class Summariser {
  rules: Rule[]

  constructor(rules: Rule[]) {
    this.rules = rules
  }

  run(resources: Resource[]) {
    let results: { [key: string]: Result } = {}

    for (let rule of this.rules) {
      results[rule.key] = {resources: [], totalEncodedDataLength: 0, totalDecodedBodyLength: 0}
    }

    resources.forEach(res => {
      for (let rule of this.rules) {
        if (res.completed && rule.match(res)) {
          results[rule.key].resources.push(res)
          results[rule.key].totalEncodedDataLength += res.result.encodedDataLength
          results[rule.key].totalDecodedBodyLength += res.result.decodedBodyLength
        }
      }
    })

    return results
  }
}

export default Summariser
