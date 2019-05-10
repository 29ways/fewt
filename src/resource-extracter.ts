export interface Resource {
  url: string
  requestId: string
  response: Response
  result: Result
  receivedResponse: boolean
  completed: boolean
}

interface Response {
  statusCode: number
  mimeType: string
}

interface Result {
  encodedDataLength: number
  decodedBodyLength: number
}

class ResourceExtracter {
  trace: any

  constructor(trace: any) {
    this.trace = trace
  }

  resources() {
    let _resources: Resource[] = []

    this.trace.traceEvents.forEach((event: any) => {
      if (event.name === 'ResourceSendRequest') {
        _resources[event.args.data.requestId] = event.args.data
        _resources[event.args.data.requestId].receivedResponse = false
        _resources[event.args.data.requestId].completed = false
      }

      if (event.name === 'ResourceReceiveResponse') {
        _resources[event.args.data.requestId].response = event.args.data
        _resources[event.args.data.requestId].receivedResponse = true
      }

      if (event.name === 'ResourceFinish') {
        _resources[event.args.data.requestId].result = event.args.data
        _resources[event.args.data.requestId].completed = true
      }
    })

    return(Object.values(_resources))
  }
}

export default ResourceExtracter
