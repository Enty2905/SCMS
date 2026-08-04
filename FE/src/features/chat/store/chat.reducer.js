import { createSlice } from '@reduxjs/toolkit'

import {
  addGroupChatMembers,
  createGroupChatRoom,
  fetchChatHistory,
  fetchChatRooms,
  fetchGroupChatRoomDetail,
  markChatRoomRead,
  removeGroupChatMember,
  searchChatUsers,
} from './chat.thunks.js'

const initialState = {
  rooms: [],
  messagesByRoom: {},
  historyByRoom: {},
  roomDetails: {},
  activeRoomId: null,
  roomsLoading: false,
  roomMutationLoading: false,
  userSearch: {
    items: [],
    loading: false,
    error: null,
  },
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
      const roomId = message.roomId || message.departmentId
      state.messagesByRoom[roomId] = mergeMessages(
        state.messagesByRoom[roomId] || [],
        [message],
      )
    },
    receiveChatMessage(state, action) {
      const { message, shouldIncrementUnread } = action.payload
      const roomId = message.roomId || message.departmentId
      state.messagesByRoom[roomId] = mergeMessages(
        state.messagesByRoom[roomId] || [],
        [{ ...message, roomId, pending: false }],
      )

      const room = state.rooms.find((item) => item.roomId === roomId)
      if (room) {
        room.lastMessage = message
        if (shouldIncrementUnread) {
          room.unreadCount = (room.unreadCount || 0) + 1
        }
      }
    },
    removeChatRoom(state, action) {
      const roomId = action.payload
      state.rooms = state.rooms.filter((room) => room.roomId !== roomId)
      delete state.messagesByRoom[roomId]
      delete state.historyByRoom[roomId]
      delete state.roomDetails[roomId]
      if (state.activeRoomId === roomId) {
        state.activeRoomId = null
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
          !state.rooms.some((room) => room.roomId === state.activeRoomId)
        ) {
          state.activeRoomId = null
        }
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.roomsLoading = false
        state.error = action.error.message || 'Không tải được danh sách phòng chat.'
      })
      .addCase(fetchChatHistory.pending, (state, action) => {
        const roomId = action.meta.arg.roomId
        state.historyByRoom[roomId] = {
          ...emptyHistoryState(),
          ...state.historyByRoom[roomId],
          loading: true,
          error: null,
        }
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        const { roomId, cursor, history } = action.payload
        state.messagesByRoom[roomId] = mergeMessages(
          state.messagesByRoom[roomId] || [],
          history.content || [],
        )
        state.historyByRoom[roomId] = {
          loading: false,
          initialized: true,
          hasMore: Boolean(history.hasMore),
          nextCursor: history.nextCursor || null,
          error: null,
          lastCursor: cursor || null,
        }
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        const roomId = action.meta.arg.roomId
        state.historyByRoom[roomId] = {
          ...emptyHistoryState(),
          ...state.historyByRoom[roomId],
          loading: false,
          error: action.error.message || 'Không tải được lịch sử chat.',
        }
      })
      .addCase(markChatRoomRead.fulfilled, (state, action) => {
        const roomId = action.payload?.roomId || action.payload?.departmentId
        const room = state.rooms.find((item) => item.roomId === roomId)
        if (room) {
          room.unreadCount = action.payload?.unreadCount || 0
        }
      })
      .addCase(searchChatUsers.pending, (state) => {
        state.userSearch.loading = true
        state.userSearch.error = null
      })
      .addCase(searchChatUsers.fulfilled, (state, action) => {
        state.userSearch.loading = false
        state.userSearch.items = action.payload
      })
      .addCase(searchChatUsers.rejected, (state, action) => {
        state.userSearch.loading = false
        state.userSearch.error =
          action.error.message || 'Không tải được danh sách tài khoản.'
      })
      .addCase(fetchGroupChatRoomDetail.fulfilled, storeRoomDetail)
      .addCase(createGroupChatRoom.pending, setMutationLoading)
      .addCase(createGroupChatRoom.fulfilled, finishMutationWithDetail)
      .addCase(createGroupChatRoom.rejected, finishMutation)
      .addCase(addGroupChatMembers.pending, setMutationLoading)
      .addCase(addGroupChatMembers.fulfilled, finishMutationWithDetail)
      .addCase(addGroupChatMembers.rejected, finishMutation)
      .addCase(removeGroupChatMember.pending, setMutationLoading)
      .addCase(removeGroupChatMember.fulfilled, finishMutationWithDetail)
      .addCase(removeGroupChatMember.rejected, finishMutation)
  },
})

function setMutationLoading(state) {
  state.roomMutationLoading = true
}

function finishMutation(state) {
  state.roomMutationLoading = false
}

function finishMutationWithDetail(state, action) {
  state.roomMutationLoading = false
  if (action.payload?.roomId) {
    state.roomDetails[action.payload.roomId] = action.payload
  }
}

function storeRoomDetail(state, action) {
  if (action.payload?.roomId) {
    state.roomDetails[action.payload.roomId] = action.payload
  }
}

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
  removeChatRoom,
  setActiveChatRoom,
  setChatConnectionStatus,
  setChatSocketError,
} = chatSlice.actions
export const chatReducer = chatSlice.reducer
