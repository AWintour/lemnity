import Header from '@/layouts/Header/Header'
import DashboardLayout from '@/layouts/DashboardLayout/DashboardLayout'
import { useProjectsStore } from '@/stores/projectsStore'
import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import CallsTableHeader from './components/CallsTableHeader'
import CallRow from './components/CallRow'
import CallsToolbar from './layouts/CallsToolbar'
import ManagersPanel from './components/ManagersPanel'
import {
  buildProjectMenuModel,
  buildCallsCsv,
  formatDuration,
  getSelectedProjectLabel,
  periodOptions,
  type PeriodKey
} from './calls.model'
import * as callsService from '@/services/calls'
import type { CallItem, CallsSummary } from '@/services/calls'

const EMPTY_SUMMARY: CallsSummary = {
  byManager: [],
  totals: { count: 0, answeredCount: 0, avgDurationSec: 0, answeredRate: 0 }
}

const CallsPage = (): ReactElement => {
  const projects = useProjectsStore(s => s.projects)
  const ensureProjectsLoaded = useProjectsStore(s => s.ensureLoaded)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all')
  const [periodKey, setPeriodKey] = useState<PeriodKey>('30d')
  const [managersOpen, setManagersOpen] = useState(false)

  const isMountedRef = useRef(true)
  const [calls, setCalls] = useState<CallItem[]>([])
  const [summary, setSummary] = useState<CallsSummary>(EMPTY_SUMMARY)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    isMountedRef.current = true
    void ensureProjectsLoaded()
    return () => {
      isMountedRef.current = false
    }
  }, [ensureProjectsLoaded])

  const loadCalls = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await callsService.listCalls({
        period: periodKey,
        projectId: selectedProjectId === 'all' ? undefined : selectedProjectId
      })
      if (!isMountedRef.current) return
      setCalls(res.calls)
      setSummary(res.summary)
    } catch {
      if (!isMountedRef.current) return
      setError('Не удалось загрузить звонки')
    } finally {
      if (isMountedRef.current) setIsLoading(false)
    }
  }, [periodKey, selectedProjectId])

  useEffect(() => {
    void loadCalls()
  }, [loadCalls])

  const { projectById, projectMenuItems, disabledKeys } = useMemo(
    () => buildProjectMenuModel(projects),
    [projects]
  )

  const selectedProjectLabel = useMemo(
    () => getSelectedProjectLabel(selectedProjectId, projectById),
    [projectById, selectedProjectId]
  )

  const canManageManagers = selectedProjectId !== 'all'

  const downloadCsv = useCallback(() => {
    const csv = buildCallsCsv(calls, projectId => projectById.get(projectId)?.name ?? projectId)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'calls.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }, [calls, projectById])

  return (
    <div className="h-full flex flex-col">
      <Header />
      <DashboardLayout>
        <div className="flex flex-col gap-4">
          <CallsToolbar
            selectedProjectLabel={selectedProjectLabel}
            projectMenuItems={projectMenuItems}
            disabledKeys={disabledKeys}
            onProjectChange={setSelectedProjectId}
            periodKey={periodKey}
            onPeriodChange={setPeriodKey}
            onDownload={downloadCsv}
            onOpenManagers={() => setManagersOpen(v => !v)}
            canManageManagers={canManageManagers}
            periodOptions={periodOptions}
          />

          {managersOpen && canManageManagers && (
            <ManagersPanel projectId={selectedProjectId} onClose={() => setManagersOpen(false)} />
          )}

          {/* Сводка по менеджерам */}
          {summary.totals.count > 0 && (
            <div className="flex flex-wrap gap-3">
              <div className="rounded-[12px] border border-default-200 bg-white px-4 py-3 min-w-[160px]">
                <div className="text-[12px] text-default-500">Всего звонков</div>
                <div className="text-[18px] font-medium text-black">{summary.totals.count}</div>
                <div className="text-[12px] text-default-500">
                  Дозвон {Math.round(summary.totals.answeredRate * 100)}% · средн.{' '}
                  {formatDuration(summary.totals.avgDurationSec)}
                </div>
              </div>
              {summary.byManager.map(m => (
                <div
                  key={m.managerId ?? 'none'}
                  className="rounded-[12px] border border-default-200 bg-white px-4 py-3 min-w-[160px]"
                >
                  <div className="text-[12px] text-default-500">{m.managerName ?? 'Без менеджера'}</div>
                  <div className="text-[18px] font-medium text-black">{m.count}</div>
                  <div className="text-[12px] text-default-500">
                    Дозвон {Math.round(m.answeredRate * 100)}% · средн. {formatDuration(m.avgDurationSec)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 min-h-0">
            <CallsTableHeader />
            <div className="flex flex-col gap-3 min-h-0">
              {error && (
                <div className="rounded-lg border border-danger-200 bg-danger-50 p-6 text-[14px] text-danger-700">
                  {error}
                </div>
              )}
              {isLoading && (
                <div className="rounded-lg border border-default-200 bg-default-50 p-6 text-[14px] text-default-700">
                  Загрузка звонков…
                </div>
              )}
              {calls.map(c => (
                <div key={c.id} className="overflow-x-auto">
                  <CallRow call={c} />
                </div>
              ))}
              {!isLoading && !error && !calls.length && (
                <div className="rounded-lg border border-default-200 bg-default-50 p-6 text-[14px] text-default-700">
                  По выбранным фильтрам звонков нет
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  )
}

export default memo(CallsPage)
