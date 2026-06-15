# Авто-переход шага сценария чата (продолжение без кнопок)

Дата: 2026-06-15

## Проблема
В редакторе сценария бота ([ScenarioEditor.tsx](../../../projects/client/src/layouts/Widgets/Chat/ScenarioEditor.tsx))
исходящая связь идёт ТОЛЬКО от кнопки шага (правый кружок = `source`-handle, `button.next` →
id целевого шага). Шаг без кнопок (информационный: только сообщение/картинка) не имеет точки-выхода —
продолжить сценарий невозможно. Рантайм ([embedRuntime.tsx](../../../projects/client/src/layouts/Widgets/Chat/embedded/embedRuntime.tsx))
переходит к следующему шагу тоже только по клику кнопки; авто-перехода нет.

## Решение
Поле `next` на уровне шага + авто-переход. Если у шага НЕТ кнопок, но задан `next`, бот после короткой
паузы (~1.5 с, с индикатором «печатает…») показывает сообщение следующего шага и идёт дальше —
имитация живого набора. Полностью обратно совместимо (`next` опционально).

## Изменения

### Схема — `packages/widget-config/src/widgets/Chat/schema.ts`
`ScenarioStepSchema`: добавить `next: z.string().nullable().optional()` (id следующего шага; отсутствует/null = нет авто-перехода).

### Редактор — `ScenarioEditor.tsx`
- `StepNode`: рендерить `<Handle type="source" id="__next" position={Position.Right}>` ТОЛЬКО когда `step.buttons.length === 0` (не конкурирует с хэндлами кнопок).
- `buildEdges`: при `step.buttons.length === 0 && step.next` добавить ребро `{ id: `${step.id}:__next`, source: step.id, sourceHandle: '__next', target: step.next }`.
- `onConnect`: если `conn.sourceHandle === '__next'` → записать `step.next = target`; иначе текущая логика кнопок.
- `onEdgesDelete`: если `sourceHandle === '__next'` → `step.next = null`; иначе текущая логика.
- `onDeleteStep`: дополнительно обнулить `step.next`, указывающий на удалённый шаг.
- `signature`: включить `s.next`, чтобы граф перестраивался.
- Обновить текст подсказки внизу.

### Рантайм — `embedRuntime.tsx`
- `useState` `typing: boolean`; `useRef<Set<string>>` `autoChainRef` (id авто-посещённых шагов — защита от циклов).
- Сброс `typing=false` и `autoChainRef` в `resetConversation` и в начале `handleQuickReply` (любое ручное действие).
- Новый `useEffect` (deps: enabled, mode, currentStepId, view, stepById, append):
  - авто-переход возможен только при `enabled`, `mode==='bot'`, `view ∈ {home, chat}`, шаг найден, `buttons.length===0`, `next` задан, целевой шаг существует и не в `autoChainRef`; иначе `setTyping(false)`.
  - иначе `setTyping(true)` + `setTimeout(~1500мс)`: добавить next в chain, `setTyping(false)`, при `view==='home'` → `setView('chat')`, добавить manager-сообщение след. шага (если есть текст/картинка), `setCurrentStepId(next)`. Смена id перезапускает эффект → цепочка.
  - cleanup: `clearTimeout`.
- Передать `typing` в `widgetProps`.

### Widget — `embedded/Widget.tsx`
- Проп `typing?: boolean`.
- В ленте чата (`view==='chat'`) после сообщений рендерить пузырь «печатает…» (3 анимированные точки в стиле manager-пузыря), когда `typing`.
- Автоскролл: добавить `props.typing` в deps.

## Матрица поведения
- Шаг с кнопками → без изменений (по клику).
- Шаг без кнопок + `next` → авто-переход после паузы (с «печатает…»).
- Шаг без кнопок без `next` → конечный (как сейчас).
- `next` на удалённый шаг → сбрасывается при удалении шага.
- Цикл из шагов-«next» → останавливается защитой `autoChainRef`.
