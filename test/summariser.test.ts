import {expect} from '@oclif/test'

import {Resource} from '../src/resource-extracter'
import Summariser, {Rule} from '../src/summariser'

describe('Summariser', () => {
  describe('results()', () => {
    describe('when given a set of resources and rules', () => {
      let rules: Rule[] = [
        {
          key: 'html',
          match: resource => resource.response.mimeType === 'text/html'
        },
        {
          key: 'css',
          match: resource => resource.response.mimeType === 'text/css'
        }
      ]

      let resources: Resource[] = [
        {
          requestId: '1',
          url: 'https://example.com',
          completed: true,
          receivedResponse: true,
          response: {
            mimeType: 'text/html',
            statusCode: 200
          },
          result: {
            encodedDataLength: 10,
            decodedBodyLength: 50
          }
        },
        {
          requestId: '2',
          url: 'https://example.com/styles1.css',
          completed: true,
          receivedResponse: true,
          response: {
            mimeType: 'text/css',
            statusCode: 200
          },
          result: {
            encodedDataLength: 20,
            decodedBodyLength: 60
          }
        },
        {
          requestId: '3',
          url: 'https://example.com/styles2.css',
          completed: true,
          receivedResponse: true,
          response: {
            mimeType: 'text/css',
            statusCode: 200
          },
          result: {
            encodedDataLength: 30,
            decodedBodyLength: 70
          }
        }
      ]

      it('should summarise the values based on the rules', () => {
        let results = new Summariser(rules).run(resources)

        expect(results.html.resources.length).to.equal(1)
        expect(results.html.resources[0].url).to.equal('https://example.com')
        expect(results.html.totalEncodedDataLength).to.equal(10)
        expect(results.html.totalDecodedBodyLength).to.equal(50)

        expect(results.css.resources.length).to.equal(2)
        expect(results.css.resources[0].url).to.equal('https://example.com/styles1.css')
        expect(results.css.resources[1].url).to.equal('https://example.com/styles2.css')
        expect(results.css.totalEncodedDataLength).to.equal(50)
        expect(results.css.totalDecodedBodyLength).to.equal(130)
      })
    })
  })
})
