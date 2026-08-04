export const selectChatRooms = (state) => state.chat.rooms
export const selectChatRoomsLoading = (state) => state.chat.roomsLoading
export const selectActiveChatRoomId = (state) => state.chat.activeRoomId
export const selectChatConnectionStatus = (state) => state.chat.connectionStatus
export const selectChatError = (state) => state.chat.error
export const selectChatSocketError = (state) => state.chat.socketError
export const selectChatRoomMutationLoading = (state) =>
  state.chat.roomMutationLoading
export const selectChatUserSearch = (state) => state.chat.userSearch
export const selectChatUnreadTotal = (state) =>
  state.chat.rooms.reduce((total, room) => total + (room.unreadCount || 0), 0)

export const selectActiveChatRoom = (state) =>
  state.chat.rooms.find((room) => room.roomId === state.chat.activeRoomId) || null

export const selectActiveChatMessages = (state) =>
  state.chat.messagesByRoom[state.chat.activeRoomId] || []

export const selectActiveChatHistory = (state) =>
  state.chat.historyByRoom[state.chat.activeRoomId] || {
    loading: false,
    initialized: false,
    hasMore: false,
    nextCursor: null,
    error: null,
  }

export const selectActiveGroupRoomDetail = (state) =>
  state.chat.roomDetails[state.chat.activeRoomId] || null
