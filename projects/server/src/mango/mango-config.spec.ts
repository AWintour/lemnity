import { resolveMangoCallConfig } from './mango-config'

const secrets = { apiKey: 'key', apiSalt: 'salt' }

describe('resolveMangoCallConfig (merge secrets + widget call settings)', () => {
  it('fails when Mango secrets are missing', () => {
    const res = resolveMangoCallConfig({
      secrets: { apiKey: '', apiSalt: '' },
      call: { managerType: 'Телефон', managerAddress: '+74950000000' }
    })
    expect(res).toEqual({ ok: false, reason: 'mango_secrets_missing' })
  })

  it('fails when no manager address configured', () => {
    const res = resolveMangoCallConfig({ secrets, call: { managerType: 'Телефон', managerAddress: '' } })
    expect(res).toEqual({ ok: false, reason: 'manager_missing' })
  })

  it('maps managerType "Телефон" to an external operator number (fromNumber)', () => {
    const res = resolveMangoCallConfig({
      secrets,
      call: { managerType: 'Телефон', managerAddress: '+74950000000', clientLineNumber: '+74951234567' }
    })
    expect(res).toEqual({
      ok: true,
      config: {
        apiKey: 'key',
        apiSalt: 'salt',
        fromNumber: '+74950000000',
        lineNumber: '+74951234567'
      }
    })
  })

  it('maps managerType "SIP" to an internal extension (fromExtension)', () => {
    const res = resolveMangoCallConfig({
      secrets,
      call: { managerType: 'SIP', managerAddress: '101' }
    })
    expect(res).toEqual({ ok: true, config: { apiKey: 'key', apiSalt: 'salt', fromExtension: '101' } })
  })

  it('falls back to defaultLineNumber when widget has no clientLineNumber', () => {
    const res = resolveMangoCallConfig({
      secrets,
      call: { managerType: 'Телефон', managerAddress: '+74950000000' },
      defaultLineNumber: '+74950009999'
    })
    expect(res).toEqual({
      ok: true,
      config: { apiKey: 'key', apiSalt: 'salt', fromNumber: '+74950000000', lineNumber: '+74950009999' }
    })
  })
})
