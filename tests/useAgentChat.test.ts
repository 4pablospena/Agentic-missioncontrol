/** @vitest-environment happy-dom */
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import type { ChatMessage, Conversation, SendChatMessageResult } from '~/models/chat'
import type { MissionControlEvent } from '~/models/realtime'
import { useAgentChat } from '~/composables/useAgentChat'

vi.mock('~/composables/useMcConfig', () => ({
  useMcConfig: () => ({ apiBase: ref('') }),
}))

describe('useAgentChat', () => {
  const conv: Conversation = {
    id: 'c1',
    agentId: 'main',
    title: 'Hi',
    createdAt: 'a',
    updatedAt: 'b',
  }
  const userMsg: ChatMessage = {
    id: 'u1',
    agentId: 'main',
    conversationId: 'c1',
    role: 'user',
    content: 'hey',
    createdAt: 't1',
  }
  const asstMsg: ChatMessage = {
    id: 'a1',
    agentId: 'main',
    conversationId: 'c1',
    role: 'assistant',
    content: 'hi',
    createdAt: 't2',
  }
  const turn: SendChatMessageResult = {
    conversationId: 'c1',
    userMessage: userMsg,
    assistantMessage: asstMsg,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sendMessage calls chatService', async () => {
    const listConversations = vi.fn(async () => [conv])
    const listMessages = vi.fn(async () => [userMsg, asstMsg])
    const sendMessage = vi.fn(async (): Promise<SendChatMessageResult> => ({ ...turn }))
    const chatService = {
      listConversations,
      listMessages,
      sendMessage,
      createConversation: vi.fn(),
    }

    const wrapper = mount(
      defineComponent({
        setup() {
          const events = ref<MissionControlEvent[]>([])
          const composable = useAgentChat({ chatService, events })
          composable.agentId.value = 'main'
          return composable
        },
        template: '<span />',
      }),
    )

    await wrapper.vm.sendMessage('hello')
    await flushPromises()
    expect(sendMessage).toHaveBeenCalledWith(
      'main',
      expect.objectContaining({ content: 'hello' }),
    )

    wrapper.unmount()
  })

  it('chat.message.created triggers reload', async () => {
    let convCalls = 0
    const listConversations = vi.fn(async () => {
      convCalls++
      return [conv]
    })
    const listMessages = vi.fn(async () => [])
    const chatService = {
      listConversations,
      listMessages,
      sendMessage: vi.fn(),
      createConversation: vi.fn(),
    }

    const wrapper = mount(
      defineComponent({
        setup() {
          const events = ref<MissionControlEvent[]>([])
          const composable = useAgentChat({ chatService, events })
          composable.agentId.value = 'main'
          return { ...composable, events }
        },
        template: '<span />',
      }),
    )

    await flushPromises()
    const before = convCalls
    expect(before).toBeGreaterThanOrEqual(1)

    wrapper.vm.events.push({
      id: 'e1',
      type: 'chat.message.created',
      payload: {},
      createdAt: new Date().toISOString(),
    })
    await flushPromises()
    expect(convCalls).toBeGreaterThan(before)

    wrapper.unmount()
  })
})
