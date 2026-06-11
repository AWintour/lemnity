import { MangoService } from './mango.service'
import { mangoSign } from './mango-protocol'

const config = {
  apiKey: 'key',
  apiSalt: 'salt',
  fromNumber: '+74950000000',
  lineNumber: '+74951234567'
}

function okResponse(bodyObj: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(bodyObj) }
}

describe('MangoService.initCall', () => {
  it('posts a signed callback command and treats result 1000 as success', async () => {
    const fetchMock = jest.fn().mockResolvedValue(okResponse({ result: 1000 }))
    const res = await new MangoService().initCall(
      config,
      { commandId: 'c1', toNumber: '+79990001122' },
      { fetchImpl: fetchMock as unknown as typeof fetch, endpoint: 'https://mango.test/callback' }
    )

    expect(res).toEqual({ ok: true, code: 1000, status: 200 })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://mango.test/callback')
    expect(init.method).toBe('POST')
    expect(init.headers['Content-Type']).toBe('application/x-www-form-urlencoded')
    const body = new URLSearchParams(init.body)
    expect(body.get('vpbx_api_key')).toBe('key')
    const json = body.get('json')!
    expect(json).toBe(
      '{"command_id":"c1","from":{"number":"+74950000000"},"to_number":"+79990001122","line_number":"+74951234567"}'
    )
    expect(body.get('sign')).toBe(mangoSign('key', json, 'salt'))
  })

  it('treats a non-1000 result as failure', async () => {
    const fetchMock = jest.fn().mockResolvedValue(okResponse({ result: 4001 }))
    const res = await new MangoService().initCall(
      config,
      { commandId: 'c2', toNumber: '+79990000000' },
      { fetchImpl: fetchMock as unknown as typeof fetch, endpoint: 'x' }
    )
    expect(res.ok).toBe(false)
    expect(res.code).toBe(4001)
  })

  it('never throws on network error — returns ok:false with error', async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error('boom'))
    const res = await new MangoService().initCall(
      config,
      { commandId: 'c3', toNumber: '+79990000000' },
      { fetchImpl: fetchMock as unknown as typeof fetch, endpoint: 'x' }
    )
    expect(res.ok).toBe(false)
    expect(res.error).toContain('boom')
  })
})

describe('MangoService.fetchRecording', () => {
  function audioResponse(text: string, status = 200) {
    return {
      ok: status >= 200 && status < 300,
      status,
      arrayBuffer: async () => new TextEncoder().encode(text).buffer,
      headers: { get: (h: string) => (h.toLowerCase() === 'content-type' ? 'audio/mpeg' : null) }
    }
  }

  it('builds a signed recording request and returns the audio bytes', async () => {
    const fetchMock = jest.fn().mockResolvedValue(audioResponse('AUDIO'))
    const res = await new MangoService().fetchRecording({ apiKey: 'key', apiSalt: 'salt' }, 'rec123', {
      fetchImpl: fetchMock as unknown as typeof fetch,
      endpoint: 'https://mango.test/rec'
    })

    expect(res.ok).toBe(true)
    expect(res.body?.toString('utf8')).toBe('AUDIO')
    expect(res.contentType).toBe('audio/mpeg')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://mango.test/rec')
    const body = new URLSearchParams(init.body)
    expect(body.get('vpbx_api_key')).toBe('key')
    const json = body.get('json')!
    expect(JSON.parse(json)).toEqual({ recording_id: 'rec123', action: 'download' })
    expect(body.get('sign')).toBe(mangoSign('key', json, 'salt'))
  })

  it('returns ok:false on a non-2xx response', async () => {
    const fetchMock = jest.fn().mockResolvedValue(audioResponse('', 404))
    const res = await new MangoService().fetchRecording({ apiKey: 'k', apiSalt: 's' }, 'r', {
      fetchImpl: fetchMock as unknown as typeof fetch,
      endpoint: 'x'
    })
    expect(res.ok).toBe(false)
  })
})
