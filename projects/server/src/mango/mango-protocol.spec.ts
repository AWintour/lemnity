import {
  mangoSign,
  buildCallbackCommandJson,
  buildMangoCallbackForm
} from './mango-protocol'

describe('mangoSign (sha256 of api_key + json + api_salt, hex)', () => {
  it('matches a known vector for k/{}/s', () => {
    expect(mangoSign('k', '{}', 's')).toBe(
      '191a30303627fdf2dc8675859ee3d01537c4b5743eb9c58d3fe577a645be4471'
    )
  })
})

describe('buildCallbackCommandJson (deterministic string for signing)', () => {
  it('builds command with extension-based operator', () => {
    expect(
      buildCallbackCommandJson({ commandId: 'c1', fromExtension: '101', toNumber: '+79990001122' })
    ).toBe('{"command_id":"c1","from":{"extension":"101"},"to_number":"+79990001122"}')
  })

  it('builds command with external operator number + line_number (АОН)', () => {
    expect(
      buildCallbackCommandJson({
        commandId: 'c2',
        fromNumber: '+74950000000',
        toNumber: '+79991112233',
        lineNumber: '+74951234567'
      })
    ).toBe(
      '{"command_id":"c2","from":{"number":"+74950000000"},"to_number":"+79991112233","line_number":"+74951234567"}'
    )
  })

  it('produces a string whose signature matches the precomputed vector', () => {
    const json = buildCallbackCommandJson({
      commandId: 'c1',
      fromExtension: '101',
      toNumber: '+79990001122'
    })
    expect(mangoSign('mykey', json, 'mysalt')).toBe(
      '2992509118ae8424332f73fb311c3a084ad15d5510518f327b4e481b1bf9dd8c'
    )
  })
})

describe('buildMangoCallbackForm (three POST form fields)', () => {
  it('returns vpbx_api_key, json (verbatim) and sign over that exact json', () => {
    const json = '{"command_id":"c1","from":{"extension":"101"},"to_number":"+79990001122"}'
    expect(buildMangoCallbackForm('mykey', 'mysalt', json)).toEqual({
      vpbx_api_key: 'mykey',
      json,
      sign: '2992509118ae8424332f73fb311c3a084ad15d5510518f327b4e481b1bf9dd8c'
    })
  })
})
