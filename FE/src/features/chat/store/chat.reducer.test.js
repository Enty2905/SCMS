import { describe, expect, it } from 'vitest'

import {
  chatReducer,
  clearChatState,
  queueChatMessage,
  receiveChatMessage,
} from './chat.reducer.js'
import { selectChatUnreadTotal } from './chat.selectors.js'
import { fetchChatHistory, fetchChatRooms } from './chat.thunks.js'

const room = {
  departmentId: 'room-1',
  departmentName: 'Nhân sự',
  unreadCount: 0,
  lastMessage: null,
}

describe('chat reducer', () => {
  it('replaces an optimistic message with the server response', () => {
    const queued = {
      clientMessageId: 'client-1',
      departmentId: 'room-1',
      senderUserId: 'user-1',
      content: 'Xin chào',
      sentAt: '2026-07-29T10:00:00',
    }
    let state = chatReducer(undefined, queueChatMessage(queued))

    state = chatReducer(
      state,
      receiveChatMessage({
        message: {
          ...queued,
          messageId: 'message-1',
          sentAt: '2026-07-29T10:00:01',
        },
        shouldIncrementUnread: false,
      }),
    )

    expect(state.messagesByRoom['room-1']).toHaveLength(1)
    expect(state.messagesByRoom['room-1'][0]).toMatchObject({
      messageId: 'message-1',
      pending: false,
    })
  })

  it('increments unread only when the provider requests it', () => {
    let state = chatReducer(
      undefined,
      fetchChatRooms.fulfilled([room], 'request-id'),
    )

    state = chatReducer(
      state,
      receiveChatMessage({
        message: {
          messageId: 'message-2',
          departmentId: 'room-1',
          senderUserId: 'user-2',
          content: 'Thông báo mới',
          sentAt: '2026-07-29T10:00:00',
        },
        shouldIncrementUnread: true,
      }),
    )

    expect(state.rooms[0].unreadCount).toBe(1)
    expect(selectChatUnreadTotal({ chat: state })).toBe(1)
  })

  it('merges paged history without duplicating realtime messages', () => {
    const realtimeMessage = {
      messageId: 'message-3',
      departmentId: 'room-1',
      content: 'Đã nhận realtime',
      sentAt: '2026-07-29T10:00:00',
    }
    let state = chatReducer(
      undefined,
      receiveChatMessage({
        message: realtimeMessage,
        shouldIncrementUnread: false,
      }),
    )

    state = chatReducer(
      state,
      fetchChatHistory.fulfilled(
        {
          departmentId: 'room-1',
          cursor: '',
          history: {
            content: [realtimeMessage],
            nextCursor: null,
            hasMore: false,
          },
        },
        'request-id',
        { departmentId: 'room-1' },
      ),
    )

    expect(state.messagesByRoom['room-1']).toHaveLength(1)
    expect(state.historyByRoom['room-1'].initialized).toBe(true)
  })

  it('clears all chat data on logout', () => {
    const populated = {
      rooms: [room],
      messagesByRoom: { 'room-1': [{ messageId: 'message-1' }] },
      historyByRoom: {},
      activeRoomId: 'room-1',
      roomsLoading: false,
      connectionStatus: 'connected',
      error: null,
      socketError: null,
    }

    const state = chatReducer(populated, clearChatState())

    expect(state.rooms).toEqual([])
    expect(state.messagesByRoom).toEqual({})
    expect(state.activeRoomId).toBeNull()
  })
})
