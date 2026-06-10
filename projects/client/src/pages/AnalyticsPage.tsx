import { useEffect, useMemo, useState } from 'react'
import Header from '@/layouts/Header/Header'
import DashboardLayout from '@/layouts/DashboardLayout/DashboardLayout'
import { Select, SelectItem } from '@heroui/select'
import { Input } from '@heroui/input'
import { Button } from '@heroui/button'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Divider } from '@heroui/divider'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { listProjects } from '@/services/projects'
import { listWidgets } from '@/services/widgets'
import {
  fetchEvents,
  fetchSummary,
  fetchTimeseries,
  type StatsEvent,
  type StatsTimeseriesPoint
} from '@/services/stats'
import type { Project, Widget } from '@lemnity/api-sdk'

const granularityOptions = [
  { key: 'day', label: 'По дням' },
  { key: 'hour', label: 'По часам' }
]

const periodPresets = [
  { key: '7d', label: 'Последние 7 дней', from: () => offsetDays(7) },
  { key: '30d', label: 'Последние 30 дней', from: () => offsetDays(30) }
]

function offsetDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

const AnalyticsPage = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [projectId, setProjectId] = useState<string>('')
  const [widgetId, setWidgetId] = useState<string>('')
  const [eventName, setEventName] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [url, setUrl] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [granularity, setGranularity] = useState<'hour' | 'day'>('day')
  const [loading, setLoading] = useState(false)

  const [summary, setSummary] = useState<number | null>(null)
  const [timeseries, setTimeseries] = useState<StatsTimeseriesPoint[]>([])
  const [events, setEvents] = useState<StatsEvent[]>([])

  useEffect(() => {
    listProjects().then(setProjects).catch(console.error)
  }, [])

  useEffect(() => {
    if (!projectId) {
      setWidgets([])
      setWidgetId('')
      return
    }
    listWidgets(projectId).then(setWidgets).catch(console.error)
  }, [projectId])

  const filters = useMemo(
    () => ({
      widget_id: widgetId,
      project_id: projectId,
      event_name: eventName || undefined,
      session_id: sessionId || undefined,
      url: url || undefined,
      from: from || undefined,
      to: to || undefined,
      granularity
    }),
    [widgetId, projectId, eventName, sessionId, url, from, to, granularity]
  )

  const loadStats = async (overrideFilters?: Partial<typeof filters>) => {
    const effectiveFilters = overrideFilters ? { ...filters, ...overrideFilters } : filters
    if (!effectiveFilters.widget_id) return
    setLoading(true)
    try {
      const [sum, ts, ev] = await Promise.all([
        fetchSummary(effectiveFilters),
        fetchTimeseries(effectiveFilters),
        fetchEvents({ ...effectiveFilters, limit: 50 })
      ])
      setSummary(sum.events)
      setTimeseries(ts)
      setEvents(ev)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (widgetId) {
      loadStats().catch(console.error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [granularity])

  const chartData = useMemo(() => {
    const stepMs = granularity === 'hour' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000

    const toBucketMs = (iso: string) => {
      const d = new Date(iso)
      if (Number.isNaN(d.getTime())) return null
      return granularity === 'hour'
        ? Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), 0, 0, 0)
        : Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0)
    }

    const raw = timeseries
      .map(p => {
        const ms = toBucketMs(p.bucket)
        if (ms === null) return null
        return { ms, events: Number(p.events) || 0 }
      })
      .filter((p): p is { ms: number; events: number } => p !== null)
      .sort((a, b) => a.ms - b.ms)

    if (raw.length === 0) return [] as Array<{ ts: number; bucket: string; events: number }>

    const fromMs = from ? toBucketMs(from) : null
    const toMs = to ? toBucketMs(to) : null
    const startMs = fromMs ?? raw[0].ms
    const endMs = toMs ?? raw[raw.length - 1].ms

    const byMs = new Map<number, number>()
    for (const p of raw) byMs.set(p.ms, p.events)

    const out: Array<{ ts: number; bucket: string; events: number }> = []
    for (let ms = startMs; ms <= endMs; ms += stepMs) {
      out.push({ ts: ms, bucket: new Date(ms).toISOString(), events: byMs.get(ms) ?? 0 })
      if (out.length > 10_000) break
    }
    return out
  }, [timeseries, granularity, from, to])

  const formatXAxisTick = (bucketIso: string) => {
    const d = new Date(bucketIso)
    return granularity === 'hour'
      ? d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false })
      : d.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })
  }

  const formatTooltipLabel = (bucketIso: string) => {
    const d = new Date(bucketIso)
    return granularity === 'hour'
      ? d.toLocaleString('ru-RU', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      : d.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })
  }

  const mainContent = (
    <div className="flex-1 px-1 sm:px-2 md:px-3 lg:px-4 xl:px-6 py-4 max-w-6xl w-full mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Статистика виджетов</h1>
          <p className="text-default-500 text-sm">
            Выберите проект и виджет, чтобы посмотреть события и динамику.
          </p>
        </div>
        <div className="flex gap-2">
          {periodPresets.map(preset => (
            <Button
              key={preset.key}
              size="sm"
              variant="flat"
              onPress={() => {
                const nextFrom = preset.from()
                setFrom(nextFrom)
                setTo('')
                loadStats({ from: nextFrom, to: undefined }).catch(console.error)
              }}
            >
              {preset.label}
            </Button>
          ))}
          <Button
            color="primary"
            onPress={() => loadStats().catch(console.error)}
            isLoading={loading}
            isDisabled={!widgetId}
          >
            Обновить
          </Button>
        </div>
      </div>

      <Card>
        <CardBody className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Select
            label="Проект"
            placeholder="Выберите проект"
            selectedKeys={projectId ? new Set([projectId]) : new Set<string>()}
            onSelectionChange={keys => {
              const first = Array.from(keys as Set<string>)[0] ?? ''
              setProjectId(first)
              setSummary(null)
              setTimeseries([])
              setEvents([])
            }}
          >
            {projects.map(p => (
              <SelectItem key={p.id}>{p.title}</SelectItem>
            ))}
          </Select>
          <Select
            label="Виджет"
            placeholder="Выберите виджет"
            selectedKeys={widgetId ? new Set([widgetId]) : new Set<string>()}
            onSelectionChange={keys => {
              const first = Array.from(keys as Set<string>)[0] ?? ''
              setWidgetId(first)
              loadStats({ widget_id: first }).catch(console.error)
            }}
            isDisabled={!projectId}
          >
            {widgets.map(w => (
              <SelectItem key={w.id}>{w.name}</SelectItem>
            ))}
          </Select>
          <Select
            label="Гранулярность"
            selectedKeys={new Set([granularity])}
            onSelectionChange={keys => {
              const first = Array.from(keys as Set<string>)[0]
              if (!first) return
              if (first === 'day' || first === 'hour') setGranularity(first)
            }}
          >
            {granularityOptions.map(o => (
              <SelectItem key={o.key}>{o.label}</SelectItem>
            ))}
          </Select>
          <Input
            label="event_name"
            value={eventName}
            onChange={e => setEventName(e.target.value)}
          />
          <Input
            label="session_id"
            value={sessionId}
            onChange={e => setSessionId(e.target.value)}
          />
          <Input label="URL содержит" value={url} onChange={e => setUrl(e.target.value)} />
          <Input
            label="Дата от"
            type="datetime-local"
            placeholder="Выберите дату"
            value={from ? from.slice(0, 16) : ''}
            onChange={e => setFrom(e.target.value ? new Date(e.target.value).toISOString() : '')}
          />
          <Input
            label="Дата до"
            type="datetime-local"
            placeholder="Выберите дату"
            value={to ? to.slice(0, 16) : ''}
            onChange={e => setTo(e.target.value ? new Date(e.target.value).toISOString() : '')}
          />
        </CardBody>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <div>
              <p className="text-default-500 text-sm">Всего событий</p>
              <h2 className="text-3xl font-semibold">{summary ?? '—'}</h2>
            </div>
          </CardHeader>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex justify-between items-center">
            <div>
              <p className="text-default-500 text-sm">Динамика</p>
              <h3 className="text-lg font-semibold">График</h3>
            </div>
          </CardHeader>
          <CardBody>
            {chartData.length === 0 ? (
              <p className="text-default-500 text-sm">Нет данных</p>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bucket" minTickGap={24} tickFormatter={formatXAxisTick} />
                    <YAxis allowDecimals={false} width={44} />
                    <Tooltip
                      formatter={(value: unknown) => [value as number, 'Событий']}
                      labelFormatter={(value: unknown) => formatTooltipLabel(String(value))}
                    />
                    <Line
                      type="monotone"
                      dataKey="events"
                      stroke="#1A52DB"
                      strokeWidth={2}
                      dot={chartData.length < 2 ? { r: 3 } : false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex justify-between">
          <div>
            <p className="text-default-500 text-sm">Последние события</p>
            <h3 className="text-lg font-semibold">Сырые данные (до 50)</h3>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="overflow-x-auto">
          {events.length === 0 ? (
            <p className="text-default-500 text-sm">Нет событий</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-default-500">
                  <th className="py-2 pr-4">Время</th>
                  <th className="py-2 pr-4">event</th>
                  <th className="py-2 pr-4">session</th>
                  <th className="py-2 pr-4">url</th>
                  <th className="py-2 pr-4">referrer</th>
                  <th className="py-2 pr-4">ip</th>
                </tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={`${ev.event_time}-${ev.session_id}-${ev.event_name}`}>
                    <td className="py-1 pr-4">
                      {new Date(ev.event_time).toLocaleString('ru-RU', {
                        hour12: false
                      })}
                    </td>
                    <td className="py-1 pr-4">{ev.event_name}</td>
                    <td className="py-1 pr-4 text-default-500">{ev.session_id || '—'}</td>
                    <td className="py-1 pr-4 truncate max-w-[200px]">{ev.url || '—'}</td>
                    <td className="py-1 pr-4 truncate max-w-[200px]">{ev.referrer || '—'}</td>
                    <td className="py-1 pr-4 text-default-500">{ev.ip || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      <Header />
      <DashboardLayout>{mainContent}</DashboardLayout>
    </div>
  )
}

export default AnalyticsPage
