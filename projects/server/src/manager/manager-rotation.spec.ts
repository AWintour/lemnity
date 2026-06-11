import { pickManager } from './manager-rotation'

describe('pickManager (round-robin by key)', () => {
  it('returns null when there are no managers', () => {
    expect(pickManager([], 0)).toBeNull()
  })

  it('cycles deterministically by key', () => {
    const m = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    expect(pickManager(m, 0)?.id).toBe('a')
    expect(pickManager(m, 1)?.id).toBe('b')
    expect(pickManager(m, 2)?.id).toBe('c')
    expect(pickManager(m, 3)?.id).toBe('a')
  })

  it('handles a single manager', () => {
    const m = [{ id: 'only' }]
    expect(pickManager(m, 7)?.id).toBe('only')
  })
})
