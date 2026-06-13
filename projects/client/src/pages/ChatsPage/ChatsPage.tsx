import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactElement,
} from 'react'
import { cn } from '@heroui/theme'

import Header from '@/layouts/Header/Header'
import DashboardLayout from '@/layouts/DashboardLayout/DashboardLayout'
import { useChatSocket } from '@/hooks/useChatSocket'
import * as chatsService from '@/services/chats'
import type { ChatConversation, ChatMessage } from '@/services/chats'

const formatTime = (iso?: string | null) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

const ConversationListItem = ({
  conversation,
  active,
  onSelect,
}: {
  conversation: ChatConversation
  active: boolean
  onSelect: () => void
}) => (
  <button
    type="button"
    onClick={onSelect}
    className={cn(
      'w-full text-left px-4 py-3 border-b border-default-100 flex flex-col gap-1',
      active ? 'bg-default-100' : 'hover:bg-default-50',
    )}
  >
    <div className="flex items-center justify-between gap-2">
      <span className="text-[14px] font-medium truncate">
        {conversation.visitorName || `Гость #${conversation.number}`}
      </span>
      <span className="text-[11px] text-default-400 shrink-0">
        {formatTime(conversation.lastMessageAt)}
      </span>
    </div>
    <div className="flex items-center justify-between gap-2">
      <span className="text-[13px] text-default-500 truncate">
        {conversation.lastMessagePreview ?? 'Нет сообщений'}
      </span>
      {conversation.unreadForManager > 0 && (
        <span className="bg-success text-white text-[10px] px-1.5 leading-4 rounded-full shrink-0">
          {conversation.unreadForManager}
        </span>
      )}
    </div>
  </button>
)

const MessageThread = ({ messages }: { messages: ChatMessage[] }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
      {messages.map(m => {
        if (m.sender === 'system') {
          return (
            <div key={m.id} className="w-full flex justify-center">
              <span className="text-[11px] text-default-400">{m.body}</span>
            </div>
          )
        }
        const isManager = m.sender === 'manager'
        return (
          <div key={m.id} className={cn('w-full flex', isManager ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[70%] px-3.5 py-2 text-[14px] leading-5 rounded-[14px]',
                isManager
                  ? 'bg-primary text-white rounded-br-[4px]'
                  : 'bg-default-100 text-default-900 rounded-bl-[4px]',
              )}
            >
              {m.body}
              <div className={cn('text-[10px] mt-1', isManager ? 'text-white/70' : 'text-default-400')}>
                {formatTime(m.createdAt)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const ChatsPage = (): ReactElement => {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const selectedIdRef = useRef<string | null>(null)
  selectedIdRef.current = selectedId

  const loadConversations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await chatsService.listConversations({ period: 'all' })
      setConversations(res.conversations)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadConversations()
  }, [loadConversations])

  const { connected, subscribe, sendMessage, markRead } = useChatSocket({
    onMessage: useCallback((msg: ChatMessage) => {
      if (msg.conversationId === selectedIdRef.current) {
        setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]))
      }
    }, []),
    onConversationUpdated: useCallback(() => {
      void loadConversations()
    }, [loadConversations]),
  })

  const selectConversation = useCallback(
    async (id: string) => {
      setSelectedId(id)
      subscribe(id)
      markRead(id)
      setConversations(prev =>
        prev.map(c => (c.id === id ? { ...c, unreadForManager: 0 } : c))
      )
      const res = await chatsService.getConversationMessages(id)
      setMessages(res.messages)
    },
    [subscribe, markRead]
  )

  const handleSend = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      const body = draft.trim()
      if (!body || !selectedId) return
      sendMessage(selectedId, body)
      setDraft('')
    },
    [draft, selectedId, sendMessage]
  )

  const selectedConversation = useMemo(
    () => conversations.find(c => c.id === selectedId) ?? null,
    [conversations, selectedId]
  )

  return (
    <div className="h-full flex flex-col">
      <Header />
      <DashboardLayout>
        <div className="flex flex-col gap-3 h-[calc(100vh-180px)] min-h-[420px]">
          <div className="flex items-center justify-between">
            <h1 className="text-[20px] font-medium">Чаты</h1>
            <span className={cn('text-[12px]', connected ? 'text-success' : 'text-default-400')}>
              {connected ? 'realtime подключён' : 'offline'}
            </span>
          </div>

          <div className="flex-1 flex min-h-0 rounded-[14px] border border-default-200 overflow-hidden">
            {/* Список диалогов */}
            <div className="w-[320px] shrink-0 border-r border-default-200 overflow-y-auto">
              {loading && (
                <div className="p-4 text-[13px] text-default-500">Загрузка…</div>
              )}
              {!loading && conversations.length === 0 && (
                <div className="p-4 text-[13px] text-default-500">Диалогов пока нет</div>
              )}
              {conversations.map(c => (
                <ConversationListItem
                  key={c.id}
                  conversation={c}
                  active={c.id === selectedId}
                  onSelect={() => void selectConversation(c.id)}
                />
              ))}
            </div>

            {/* Тред */}
            <div className="flex-1 flex flex-col min-w-0">
              {selectedConversation ? (
                <>
                  <div className="shrink-0 px-4 py-3 border-b border-default-200">
                    <span className="text-[15px] font-medium">
                      {selectedConversation.visitorName ||
                        `Гость #${selectedConversation.number}`}
                    </span>
                  </div>
                  <MessageThread messages={messages} />
                  <form
                    onSubmit={handleSend}
                    className="shrink-0 border-t border-default-200 p-2.5 flex items-end gap-2"
                  >
                    <textarea
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSend(e)
                        }
                      }}
                      rows={1}
                      placeholder="Ответить…"
                      className="flex-1 resize-none max-h-28 px-3 py-2 text-[14px] rounded-[10px] bg-default-100 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={draft.trim().length === 0}
                      className="shrink-0 h-10 px-4 rounded-[10px] bg-primary text-white text-[14px] disabled:opacity-50"
                    >
                      Отправить
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-[14px] text-default-400">
                  Выберите диалог
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  )
}

export default memo(ChatsPage)
