import {expect} from '@oclif/test'
const fs = require('fs')

import ResourceExtractor from '../src/resource-extracter'

describe('ResourceExtractor', () => {
  describe('resources()', () => {
    describe('when given a trace', () => {
      let trace = JSON.parse(fs.readFileSync('test/fixtures/trace.json'))

      it('should gather the urls and data', () => {
        let resources = new ResourceExtractor(trace).resources()
        let resource = resources[0]

        expect(resource.url).to.equal('https://example.com/some.css')
        expect(resource.response.statusCode).to.equal(200)
        expect(resource.result.decodedBodyLength).to.equal(191488)
      })
    })
  })
})
