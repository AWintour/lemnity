import { encryptWithKey, decryptWithKey } from './secret-cipher'

// 32-byte key (64 hex chars) for AES-256-GCM.
const KEY = '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff'

describe('secret-cipher (AES-256-GCM)', () => {
  it('round-trips a secret back to plaintext', () => {
    const enc = encryptWithKey('mango-api-salt', KEY)
    expect(decryptWithKey(enc, KEY)).toBe('mango-api-salt')
  })

  it('produces different ciphertext each time (random IV) but decrypts to the same value', () => {
    const a = encryptWithKey('same', KEY)
    const b = encryptWithKey('same', KEY)
    expect(a).not.toBe(b)
    expect(decryptWithKey(a, KEY)).toBe('same')
    expect(decryptWithKey(b, KEY)).toBe('same')
  })

  it('throws when the ciphertext was tampered with (GCM auth)', () => {
    const enc = encryptWithKey('secret', KEY)
    const parts = enc.split(':')
    const lastChar = parts[2].slice(-1) === 'A' ? 'B' : 'A'
    const tampered = `${parts[0]}:${parts[1]}:${parts[2].slice(0, -1)}${lastChar}`
    expect(() => decryptWithKey(tampered, KEY)).toThrow()
  })

  it('throws when decrypting with the wrong key', () => {
    const enc = encryptWithKey('secret', KEY)
    const wrong = 'ffeeddccbbaa99887766554433221100ffeeddccbbaa99887766554433221100'
    expect(() => decryptWithKey(enc, wrong)).toThrow()
  })

  it('throws on a malformed key (wrong length)', () => {
    expect(() => encryptWithKey('x', 'tooshort')).toThrow()
  })
})
