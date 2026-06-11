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
