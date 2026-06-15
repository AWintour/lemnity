jest.mock('../prisma.service', () => ({ PrismaService: class PrismaService {} }))

import { ChatService } from './chat.service'
import type { PrismaService } from '../prisma.service'

function make() {
  const prisma = {
    chatMessage: { create: jest.fn().mockResolvedValue({}) },
    chatConversation: {
      update: jest.fn().mockResolvedValue({}),
      // firstVisitorAt/firstManagerAt — денормализация времени реакции.
      updateMany: jest.fn().mockResolvedValue({}),
      // outbound-хук соцсетей читает диалог (null → не соцсеть, ничего не шлём).
      findUnique: jest.fn().mockResolvedValue(null)
    },
    // $transaction получает массив промисов и резолвит их по порядку.
    $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops))
  }
  const svc = new ChatService(prisma as unknown as PrismaService)
  return { svc, prisma }
}

describe('ChatService.appendMessage', () => {
  it('сообщение посетителя инкрементит непрочитанные у менеджера', async () => {
    const { svc, prisma } = make()
    prisma.chatMessage.create.mockResolvedValue({
      id: 'm1',
      conversationId: 'c1',
      sender: 'visitor',
      body: 'привет',
      senderUserId: null,
      readAt: null,
      createdAt: new Date('2026-06-13T10:00:00Z')
    })

    await svc.appendMessage({ conversationId: 'c1', sender: 'visitor', body: 'привет' })

    const updateArg = prisma.chatConversation.update.mock.calls[0][0]
    expect(updateArg.data.unreadForManager).toEqual({ increment: 1 })
    expect(updateArg.data.unreadForVisitor).toBeUndefined()
  })

  it('ответ менеджера инкрементит непрочитанные у посетителя', async () => {
    const { svc, prisma } = make()
    prisma.chatMessage.create.mockResolvedValue({
      id: 'm2',
      conversationId: 'c1',
      sender: 'manager',
      body: 'здравствуйте',
      senderUserId: 'u1',
      readAt: null,
      createdAt: new Date('2026-06-13T10:01:00Z')
    })

    await svc.appendMessage({
      conversationId: 'c1',
      sender: 'manager',
      body: 'здравствуйте',
      senderUserId: 'u1'
    })

    const updateArg = prisma.chatConversation.update.mock.calls[0][0]
    expect(updateArg.data.unreadForVisitor).toEqual({ increment: 1 })
    expect(updateArg.data.unreadForManager).toBeUndefined()
  })

  it('пустое тело отклоняется', async () => {
    const { svc } = make()
    await expect(
      svc.appendMessage({ conversationId: 'c1', sender: 'visitor', body: '   ' })
    ).rejects.toThrow()
  })
})
