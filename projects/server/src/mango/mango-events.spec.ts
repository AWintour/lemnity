import { parseMangoSummaryEvent, isAllowedMangoSource } from './mango-events'

describe('isAllowedMangoSource', () => {
  it('allows any source in dev', () => {
    expect(isAllowedMangoSource('1.2.3.4', { isProd: false, skip: false })).toBe(true)
  })
  it('allows any source when skip flag set', () => {
    expect(isAllowedMangoSource('1.2.3.4', { isProd: true, skip: true })).toBe(true)
  })
  it('in prod, allows Mango source IPs', () => {
    expect(isAllowedMangoSource('81.88.80.132', { isProd: true, skip: false })).toBe(true)
    expect(isAllowedMangoSource('81.88.82.36', { isProd: true, skip: false })).toBe(true)
  })
  it('in prod, rejects other IPs', () => {
    expect(isAllowedMangoSource('8.8.8.8', { isProd: true, skip: false })).toBe(false)
    expect(isAllowedMangoSource(undefined, { isProd: true, skip: false })).toBe(false)
  })
})

describe('parseMangoSummaryEvent', () => {
  it('extracts command_id, duration and recording; answered when talk_time > 0', () => {
    expect(
      parseMangoSummaryEvent('{"command_id":"cmd1","talk_time":42,"recording":"https://rec/abc.mp3"}')
    ).toEqual({ commandId: 'cmd1', durationSec: 42, recordingUrl: 'https://rec/abc.mp3', answered: true })
  })

  it('marks not answered when talk_time is 0', () => {
    expect(parseMangoSummaryEvent('{"command_id":"cmd2","talk_time":0}')).toEqual({
      commandId: 'cmd2',
      durationSec: 0,
      answered: false
    })
  })

  it('accepts call_duration as an alias for talk_time', () => {
    const ev = parseMangoSummaryEvent('{"command_id":"c3","call_duration":7}')
    expect(ev?.durationSec).toBe(7)
    expect(ev?.answered).toBe(true)
  })

  it('returns null for non-JSON input', () => {
    expect(parseMangoSummaryEvent('not-json')).toBeNull()
  })

  it('returns null when command_id is absent', () => {
    expect(parseMangoSummaryEvent('{"talk_time":10}')).toBeNull()
  })
})
