import { buildCallsSummary } from './call-summary'

describe('buildCallsSummary', () => {
  it('returns empty summary for no rows', () => {
    expect(buildCallsSummary([])).toEqual({
      byManager: [],
      totals: { count: 0, answeredCount: 0, avgDurationSec: 0, answeredRate: 0 }
    })
  })

  it('groups by manager: count, answered, avg duration (over answered), answered rate', () => {
    const rows = [
      { managerId: 'm1', managerName: 'Иван', status: 'used', callDurationSec: 60 },
      { managerId: 'm1', managerName: 'Иван', status: 'not_processed', callDurationSec: 0 },
      { managerId: 'm2', managerName: 'Пётр', status: 'used', callDurationSec: 40 }
    ]
    const s = buildCallsSummary(rows)

    expect(s.byManager).toEqual([
      { managerId: 'm1', managerName: 'Иван', count: 2, answeredCount: 1, avgDurationSec: 60, answeredRate: 0.5 },
      { managerId: 'm2', managerName: 'Пётр', count: 1, answeredCount: 1, avgDurationSec: 40, answeredRate: 1 }
    ])
    expect(s.totals).toEqual({ count: 3, answeredCount: 2, avgDurationSec: 50, answeredRate: 0.67 })
  })

  it('buckets unassigned calls (no manager) under null', () => {
    const rows = [{ managerId: null, managerName: null, status: 'used', callDurationSec: 10 }]
    const s = buildCallsSummary(rows)
    expect(s.byManager).toEqual([
      { managerId: null, managerName: null, count: 1, answeredCount: 1, avgDurationSec: 10, answeredRate: 1 }
    ])
  })
})
