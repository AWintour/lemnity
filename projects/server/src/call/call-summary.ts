/**
 * Сводка по звонкам с распределением по менеджерам (чистая, для вкладки «Звонки»).
 * `avgDurationSec` — средняя длительность по отвеченным (status==='used') звонкам.
 * `answeredRate` — доля отвеченных (0..1, округление до сотых). См. plan-wid-call.md.
 */
export type CallSummaryRow = {
  managerId: string | null
  managerName: string | null
  status: string
  callDurationSec: number | null
}

export type ManagerStat = {
  managerId: string | null
  managerName: string | null
  count: number
  answeredCount: number
  avgDurationSec: number
  answeredRate: number
}

export type CallsSummary = {
  byManager: ManagerStat[]
  totals: Omit<ManagerStat, 'managerId' | 'managerName'>
}

const round2 = (n: number) => Math.round(n * 100) / 100

function stat(
  managerId: string | null,
  managerName: string | null,
  rows: CallSummaryRow[]
): ManagerStat {
  const count = rows.length
  const answered = rows.filter(r => r.status === 'used')
  const answeredCount = answered.length
  const durSum = answered.reduce((a, r) => a + (r.callDurationSec ?? 0), 0)
  return {
    managerId,
    managerName,
    count,
    answeredCount,
    avgDurationSec: answeredCount ? Math.round(durSum / answeredCount) : 0,
    answeredRate: count ? round2(answeredCount / count) : 0
  }
}

export function buildCallsSummary(rows: CallSummaryRow[]): CallsSummary {
  const groups = new Map<string, { name: string | null; rows: CallSummaryRow[] }>()
  for (const r of rows) {
    const key = r.managerId ?? '__null__'
    const g = groups.get(key) ?? { name: r.managerName, rows: [] }
    g.rows.push(r)
    groups.set(key, g)
  }

  const byManager = Array.from(groups.entries()).map(([key, g]) =>
    stat(key === '__null__' ? null : key, g.name, g.rows)
  )

  const totalStat = stat(null, null, rows)
  return {
    byManager,
    totals: {
      count: totalStat.count,
      answeredCount: totalStat.answeredCount,
      avgDurationSec: totalStat.avgDurationSec,
      answeredRate: totalStat.answeredRate
    }
  }
}
