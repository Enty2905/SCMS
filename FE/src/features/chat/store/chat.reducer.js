import { createSlice } from '@reduxjs/toolkit'

import {
  fetchChatHistory,
  fetchChatRooms,
  markChatRoomRead,
} from './chat.thunks.js'

const initialState = {
  rooms: [],
  messagesByRoom: {},
  historyByRoom: {},
  activeRoomId: null,
  roomsLoading: false,
  connectionStatus: 'disconnected',
  error: null,
  socketError: null,
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatConnectionStatus(state, action) {
      state.connectionStatus = action.payload
    },
    setActiveChatRoom(state, action) {
      state.activeRoomId = action.payload
    },
    queueChatMessage(state, action) {
      const message = { ...action.payload, pending: true }
      const roomId = message.departmentId
      state.messagesByRoom[roomId] = mergeMessages(
        state.messagesByRoom[roomId] || [],
        [message],
      )
    },
    receiveChatMessage(state, action) {
      const { message, shouldIncrementUnread } = action.payload
      const roomId = message.departmentId
      state.messagesByRoom[roomId] = mergeMessages(
        state.messagesByRoom[roomId] || [],
        [{ ...message, pending: false }],
      )

      const room = state.rooms.find((item) => item.departmentId === roomId)
      if (room) {
        room.lastMessage = message
        if (shouldIncrementUnread) {
          room.unreadCount = (room.unreadCount || 0) + 1
        }
      }
    },
    setChatSocketError(state, action) {
      state.socketError = action.payload
    },
    clearChatSocketError(state) {
      state.socketError = null
    },
    clearChatState() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatRooms.pending, (state) => {
        state.roomsLoading = true
        state.error = null
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.roomsLoading = false
        state.rooms = action.payload
        if (
          state.activeRoomId &&
          !state.rooms.some((room) => room.departmentId === state.activeRoomId)
        ) {
          state.activeRoomId = null
        }
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.roomsLoading = false
        state.error = action.error.message || 'Không tải được danh sách phòng chat.'
      })
      .addCase(fetchChatHistory.pending, (state, action) => {
        const roomId = action.meta.arg.departmentId
        state.historyByRoom[roomId] = {
          ...emptyHistoryState(),
          ...state.historyByRoom[roomId],
          loading: true,
          error: null,
        }
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        const { departmentId, cursor, history } = action.payload
        state.messagesByRoom[departmentId] = mergeMessages(
          state.messagesByRoom[departmentId] || [],
          history.content || [],
        )
        state.historyByRoom[departmentId] = {
          loading: false,
          initialized: true,
          hasMore: Boolean(history.hasMore),
          nextCursor: history.nextCursor || null,
          error: null,
          lastCursor: cursor || null,
        }
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        const roomId = action.meta.arg.departmentId
        state.historyByRoom[roomId] = {
          ...emptyHistoryState(),
          ...state.historyByRoom[roomId],
          loading: false,
          error: action.error.message || 'Không tải được lịch sử chat.',
        }
      })
      .addCase(markChatRoomRead.fulfilled, (state, action) => {
        const room = state.rooms.find(
          (item) => item.departmentId === action.payload?.departmentId,
        )
        if (room) {
          room.unreadCount = action.payload?.unreadCount || 0
        }
      })
  },
})

function emptyHistoryState() {
  return {
    loading: false,
    initialized: false,
    hasMore: false,
    nextCursor: null,
    error: null,
    lastCursor: null,
  }
}

function mergeMessages(currentMessages, incomingMessages) {
  const messages = [...currentMessages]

  incomingMessages.forEach((incoming) => {
    const existingIndex = messages.findIndex(
      (message) =>
        (incoming.messageId && message.messageId === incoming.messageId) ||
        (incoming.clientMessageId &&
          message.clientMessageId === incoming.clientMessageId),
    )

    if (existingIndex >= 0) {
      messages[existingIndex] = { ...messages[existingIndex], ...incoming }
    } else {
      messages.push(incoming)
    }
  })

  return messages.sort((left, right) => {
    const leftTime = new Date(left.sentAt || 0).getTime()
    const rightTime = new Date(right.sentAt || 0).getTime()
    return leftTime - rightTime
  })
}

export const {
  clearChatSocketError,
  clearChatState,
  queueChatMessage,
  receiveChatMessage,
  setActiveChatRoom,
  setChatConnectionStatus,
  setChatSocketError,
} = chatSlice.actions
export const chatReducer = chatSlice.reducer
