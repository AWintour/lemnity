import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeProps,
  type NodeChange,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import EmojiPicker from '@/components/EmojiPicker'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import { useProjectsStore } from '@/stores/projectsStore'
import * as chatModule from '@/services/chatModule'
import { uuidv4 } from '@/common/utils/uuidv4'

import type {
  ChatWidgetType,
  Scenario,
  ScenarioStep,
  ScenarioButton,
} from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from './defaults'

/* ----------------------- store helpers ----------------------- */

const readScenario = (): Scenario => {
  const widget = useWidgetSettingsStore.getState().settings?.widget as ChatWidgetType | undefined
  return widget?.scenario ?? defaults.scenario
}

/* --------------------------- node ---------------------------- */

type StepNodeData = {
  step: ScenarioStep
  isStart: boolean
  departments: { id: string; name: string }[]
  onMessage: (stepId: string, message: string) => void
  onImage: (stepId: string, image: string | undefined) => void
  onButtonChange: (stepId: string, buttonId: string, patch: Partial<ScenarioButton>) => void
  onAddButton: (stepId: string) => void
  onDeleteButton: (stepId: string, buttonId: string) => void
  onToggleHandoff: (stepId: string, buttonId: string) => void
  onDeleteStep: (stepId: string) => void
}

const StepNode = ({ data }: NodeProps<Node<StepNodeData>>) => {
  const { step, isStart } = data
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="w-[270px] rounded-[12px] border border-[#D9D7E2] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
      <Handle type="target" position={Position.Left} className="!bg-[#5951E5]" />

      <div className="flex items-center justify-between px-3 py-2 border-b border-[#EEE] rounded-t-[12px] bg-[#F6F5FB]">
        <span className="text-[12px] font-medium text-[#5951E5]">
          {isStart ? '★ Старт' : 'Шаг'} · {step.id}
        </span>
        {!isStart && (
          <button
            type="button"
            className="nodrag text-[#B0AEBA] hover:text-[#FF4D4D] text-[14px] leading-none"
            onClick={() => data.onDeleteStep(step.id)}
            title="Удалить шаг"
          >
            ✕
          </button>
        )}
      </div>

      <div className="p-3 flex flex-col gap-2">
        <textarea
          value={step.message}
          onChange={e => data.onMessage(step.id, e.target.value)}
          rows={2}
          placeholder="Сообщение бота…"
          className="nodrag resize-none w-full text-[13px] leading-4 rounded-[8px] border border-[#E3E3E8] px-2 py-1.5 outline-none focus:border-[#5951E5]"
        />

        {/* Изображение шага — показывается в окне чата */}
        {step.image ? (
          <div className="relative">
            <img
              src={step.image}
              alt=""
              className="w-full max-h-32 object-cover rounded-[8px] border border-[#E3E3E8]"
            />
            <button
              type="button"
              onClick={() => data.onImage(step.id, undefined)}
              className="nodrag absolute top-1 right-1 w-5 h-5 rounded-full bg-black/55 text-white text-[11px] leading-none"
              title="Удалить изображение"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0]
                if (!f) return
                const reader = new FileReader()
                reader.onload = () => data.onImage(step.id, String(reader.result))
                reader.readAsDataURL(f)
                e.target.value = ''
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="nodrag flex items-center gap-1 text-[12px] text-[#5951E5] hover:underline self-start"
            >
              🖼️ Добавить изображение
            </button>
          </>
        )}

        <div className="flex flex-col gap-1.5">
          {step.buttons.map(btn => (
            <div key={btn.id} className="relative flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <EmojiPicker
                  onPick={em => data.onButtonChange(step.id, btn.id, { emoji: em })}
                  className="w-7 h-7 shrink-0 flex items-center justify-center text-[15px] rounded-[6px] border border-[#E3E3E8] hover:bg-[#F4F4F6]"
                >
                  {btn.emoji || '🙂'}
                </EmojiPicker>
                <input
                  value={btn.label}
                  onChange={e => data.onButtonChange(step.id, btn.id, { label: e.target.value })}
                  placeholder="Текст кнопки"
                  className="nodrag flex-1 min-w-0 text-[12px] rounded-[6px] border border-[#E3E3E8] px-2 py-1 outline-none focus:border-[#5951E5]"
                />
                <button
                  type="button"
                  onClick={() => data.onToggleHandoff(step.id, btn.id)}
                  title={btn.next === null ? 'Передаёт менеджеру' : 'Сделать передачей менеджеру'}
                  className={
                    'nodrag shrink-0 text-[11px] px-1.5 py-1 rounded-[6px] border ' +
                    (btn.next === null
                      ? 'border-[#5951E5] text-[#5951E5] bg-[#EEEDFB]'
                      : 'border-[#E3E3E8] text-[#9A96A2]')
                  }
                >
                  👤
                </button>
                <button
                  type="button"
                  onClick={() => data.onDeleteButton(step.id, btn.id)}
                  className="nodrag shrink-0 text-[#B0AEBA] hover:text-[#FF4D4D] text-[12px]"
                  title="Удалить кнопку"
                >
                  ✕
                </button>
                {/* Источник связи для кнопки (если не handoff) */}
                {btn.next !== null && (
                  <Handle
                    type="source"
                    id={btn.id}
                    position={Position.Right}
                    className="!bg-[#5951E5]"
                    style={{ right: -7 }}
                  />
                )}
              </div>
              {/* Маршрут в отдел — для кнопки-хэндофа (передаёт менеджеру) */}
              {btn.next === null && data.departments.length > 0 && (
                <select
                  value={btn.department ?? ''}
                  onChange={e => data.onButtonChange(step.id, btn.id, { department: e.target.value || null })}
                  className="nodrag text-[11px] rounded-[6px] border border-[#E3E3E8] px-2 py-1 outline-none focus:border-[#5951E5] bg-white text-[#5A5A5A]"
                  title="Направить в отдел"
                >
                  <option value="">Отдел: любой</option>
                  {data.departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => data.onAddButton(step.id)}
          className="nodrag text-[12px] text-[#5951E5] text-left hover:underline"
        >
          + кнопка
        </button>
      </div>
    </div>
  )
}

const nodeTypes = { step: StepNode }

/* -------------------------- editor --------------------------- */

const ScenarioEditor = () => {
  const setChatPatch = useWidgetSettingsStore(s => s.setChatPatch)
  const saveWidgetConfig = useProjectsStore(s => s.saveWidgetConfig)

  // Реактивно следим за структурой сценария (кол-во шагов/кнопок/тексты), чтобы перестроить граф.
  const scenario = useWidgetSettingsStore(
    useShallow(s => {
      const w = s.settings?.widget as ChatWidgetType | undefined
      return w?.scenario ?? defaults.scenario
    })
  )

  // Отделы проекта — для маршрутизации кнопок-хэндофов. Грузим по реальному projectId стора.
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  useEffect(() => {
    const projectId = useWidgetSettingsStore.getState().projectId
    if (!projectId || projectId === 'preview-project' || projectId === 'chat-module') return
    let alive = true
    void (async () => {
      try {
        const res = await chatModule.listDepartments(projectId)
        if (alive) setDepartments(res.departments.map(d => ({ id: d.id, name: d.name })))
      } catch {
        // отделов нет/нет доступа — без выпадающего списка
      }
    })()
    return () => { alive = false }
  }, [])

  // Сохранение сценария/настроек в реальный виджет (через widgets API).
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const handleSave = useCallback(async () => {
    const store = useWidgetSettingsStore.getState()
    const projectId = store.projectId
    const widgetId = store.settings?.id
    if (!projectId || !widgetId || projectId === 'preview-project' || projectId === 'chat-module') return
    setSaveState('saving')
    try {
      const res = store.prepareForSave()
      if (!res.ok) {
        setSaveState('error')
        return
      }
      await saveWidgetConfig(projectId, widgetId, res.data)
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch {
      setSaveState('error')
    }
  }, [saveWidgetConfig])

  const commit = useCallback(
    (mutator: (prev: Scenario) => Scenario) => {
      setChatPatch({ scenario: mutator(readScenario()) })
    },
    [setChatPatch]
  )

  /* --- мутации сценария --- */
  const onMessage = useCallback((stepId: string, message: string) => {
    commit(s => ({
      ...s,
      steps: s.steps.map(st => (st.id === stepId ? { ...st, message } : st)),
    }))
  }, [commit])

  const onImage = useCallback((stepId: string, image: string | undefined) => {
    commit(s => ({
      ...s,
      steps: s.steps.map(st => (st.id === stepId ? { ...st, image } : st)),
    }))
  }, [commit])

  const onButtonChange = useCallback(
    (stepId: string, buttonId: string, patch: Partial<ScenarioButton>) => {
      commit(s => ({
        ...s,
        steps: s.steps.map(st =>
          st.id === stepId
            ? { ...st, buttons: st.buttons.map(b => (b.id === buttonId ? { ...b, ...patch } : b)) }
            : st
        ),
      }))
    },
    [commit]
  )

  const onAddButton = useCallback((stepId: string) => {
    commit(s => ({
      ...s,
      steps: s.steps.map(st =>
        st.id === stepId
          ? { ...st, buttons: [...st.buttons, { id: `b-${uuidv4().slice(0, 8)}`, label: 'Новая кнопка', next: null }] }
          : st
      ),
    }))
  }, [commit])

  const onDeleteButton = useCallback((stepId: string, buttonId: string) => {
    commit(s => ({
      ...s,
      steps: s.steps.map(st =>
        st.id === stepId ? { ...st, buttons: st.buttons.filter(b => b.id !== buttonId) } : st
      ),
    }))
  }, [commit])

  const onToggleHandoff = useCallback((stepId: string, buttonId: string) => {
    commit(s => ({
      ...s,
      steps: s.steps.map(st =>
        st.id === stepId
          ? {
              ...st,
              buttons: st.buttons.map(b =>
                b.id === buttonId ? { ...b, next: b.next === null ? (s.startStepId ?? null) : null } : b
              ),
            }
          : st
      ),
    }))
  }, [commit])

  const onDeleteStep = useCallback((stepId: string) => {
    commit(s => ({
      ...s,
      steps: s.steps
        .filter(st => st.id !== stepId)
        // отвязываем кнопки, ведущие на удалённый шаг
        .map(st => ({
          ...st,
          buttons: st.buttons.map(b => (b.next === stepId ? { ...b, next: null } : b)),
        })),
    }))
  }, [commit])

  const onAddStep = useCallback(() => {
    commit(s => {
      const id = `step-${uuidv4().slice(0, 6)}`
      const last = s.steps[s.steps.length - 1]
      const position = { x: (last?.position.x ?? 0) + 320, y: (last?.position.y ?? 0) }
      return {
        ...s,
        steps: [...s.steps, { id, message: 'Новое сообщение', buttons: [], position }],
      }
    })
  }, [commit])

  /* --- граф react-flow --- */
  const handlers = useMemo(
    () => ({ onMessage, onImage, onButtonChange, onAddButton, onDeleteButton, onToggleHandoff, onDeleteStep }),
    [onMessage, onImage, onButtonChange, onAddButton, onDeleteButton, onToggleHandoff, onDeleteStep]
  )

  const buildNodes = useCallback(
    (): Node<StepNodeData>[] =>
      scenario.steps.map(step => ({
        id: step.id,
        type: 'step',
        position: step.position,
        data: { step, isStart: step.id === scenario.startStepId, departments, ...handlers },
      })),
    [scenario, handlers, departments]
  )

  const buildEdges = useCallback(
    (): Edge[] =>
      scenario.steps.flatMap(step =>
        step.buttons
          .filter(b => b.next)
          .map(b => ({
            id: `${step.id}:${b.id}`,
            source: step.id,
            sourceHandle: b.id,
            target: b.next as string,
            animated: true,
            style: { stroke: '#5951E5' },
          }))
      ),
    [scenario]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<StepNodeData>>(buildNodes())
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(buildEdges())

  // Сигнатура структуры — перестраиваем граф при добавлении/удалении/редактировании.
  const signature = useMemo(
    () =>
      JSON.stringify(
        scenario.steps.map(s => [s.id, s.message, s.image, s.buttons.map(b => [b.id, b.emoji, b.label, b.next, b.department])])
      ) + `|${scenario.startStepId}|${departments.length}`,
    [scenario, departments.length]
  )
  const draggingRef = useRef(false)

  useEffect(() => {
    if (draggingRef.current) return
    setNodes(buildNodes())
    setEdges(buildEdges())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])

  const handleNodesChange = useCallback(
    (changes: NodeChange<Node<StepNodeData>>[]) => {
      if (changes.some(c => c.type === 'position' && c.dragging)) draggingRef.current = true
      onNodesChange(changes)
      // По завершении перетаскивания фиксируем позиции в сторе.
      const stopped = changes.find(c => c.type === 'position' && c.dragging === false)
      if (stopped) {
        draggingRef.current = false
        setNodes(curr => {
          const posById = new Map(curr.map(n => [n.id, n.position]))
          commit(s => ({
            ...s,
            steps: s.steps.map(st => ({ ...st, position: posById.get(st.id) ?? st.position })),
          }))
          return curr
        })
      }
    },
    [onNodesChange, setNodes, commit]
  )

  const onConnect = useCallback(
    (conn: Connection) => {
      if (!conn.source || !conn.target || !conn.sourceHandle) return
      commit(s => ({
        ...s,
        steps: s.steps.map(st =>
          st.id === conn.source
            ? {
                ...st,
                buttons: st.buttons.map(b =>
                  b.id === conn.sourceHandle ? { ...b, next: conn.target } : b
                ),
              }
            : st
        ),
      }))
    },
    [commit]
  )

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      commit(s => ({
        ...s,
        steps: s.steps.map(st => {
          const hit = deleted.find(e => e.source === st.id)
          if (!hit) return st
          return {
            ...st,
            buttons: st.buttons.map(b => (b.id === hit.sourceHandle ? { ...b, next: null } : b)),
          }
        }),
      }))
    },
    [commit]
  )

  const toggleEnabled = (enabled: boolean) => commit(s => ({ ...s, enabled }))

  return (
    <BorderedContainer className="h-full">
      <div className="w-full h-full flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] leading-4.75 font-medium">Сценарий бота</h2>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-[13px] text-[#5A5A5A]">
              <input
                type="checkbox"
                checked={scenario.enabled}
                onChange={e => toggleEnabled(e.target.checked)}
              />
              Включён
            </label>
            <button
              type="button"
              onClick={onAddStep}
              className="text-[13px] px-2.5 py-1 rounded-[6px] bg-[#5951E5] text-white"
            >
              + Шаг
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saveState === 'saving'}
              className="text-[13px] px-2.5 py-1 rounded-[6px] border border-[#5951E5] text-[#5951E5] disabled:opacity-50"
            >
              {saveState === 'saving' ? 'Сохранение…' : 'Сохранить'}
            </button>
            {saveState === 'saved' && <span className="text-[12px] text-[#3BB240]">Сохранено</span>}
            {saveState === 'error' && <span className="text-[12px] text-[#E5484D]">Ошибка</span>}
          </div>
        </div>

        <div className="w-full flex-1 min-h-[460px] rounded-[10px] border border-[#E3E3E8] overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgesDelete={onEdgesDelete}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>

        <p className="text-[12px] text-[#9A96A2]">
          Перетаскивайте шаги мышью. Тяните связь от кнопки (правый кружок) к другому шагу.
          Кнопка с иконкой 👤 — «передать менеджеру» (живой оператор).
        </p>
      </div>
    </BorderedContainer>
  )
}

export default ScenarioEditor
