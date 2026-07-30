import { apiClient } from '@/shared/api/httpClient.js'

export async function fetchChatRoomsService() {
  const response = await apiClient.get('/chat/rooms')
  return response?.data || []
}

export async function fetchChatMessagesService({
  departmentId,
  cursor = '',
  size = 30,
}) {
  const query = new URLSearchParams({ size: String(size) })
  if (cursor) {
    query.set('cursor', cursor)
  }

  const response = await apiClient.get(
    `/chat/rooms/${departmentId}/messages?${query.toString()}`,
  )
  return response?.data || { content: [], nextCursor: null, hasMore: false }
}

export async function markChatRoomReadService(departmentId, lastMessageId) {
  const response = await apiClient.put(`/chat/rooms/${departmentId}/read`, {
    lastMessageId,
  })
  return response?.data
}
