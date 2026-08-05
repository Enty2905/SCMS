import { apiClient } from '@/shared/api/httpClient.js'

export async function fetchChatRoomsService() {
  const [departmentResponse, groupResponse] = await Promise.all([
    apiClient.get('/chat/rooms'),
    apiClient.get('/chat/groups'),
  ])

  const departmentRooms = (departmentResponse?.data || []).map((room) => ({
    ...room,
    roomId: room.roomId || room.departmentId,
    roomType: 'department',
    roomName: room.departmentName,
    roomCode: room.departmentCode,
  }))
  const groupRooms = (groupResponse?.data || []).map((room) => ({
    ...room,
    roomType: 'group',
    roomCode: `${room.memberCount || 1} thành viên`,
  }))

  return [...departmentRooms, ...groupRooms]
}

export async function fetchChatMessagesService({
  roomId,
  roomType,
  cursor = '',
  size = 30,
}) {
  const query = new URLSearchParams({ size: String(size) })
  if (cursor) {
    query.set('cursor', cursor)
  }

  const path =
    roomType === 'group'
      ? `/chat/groups/${roomId}/messages`
      : `/chat/rooms/${roomId}/messages`
  const response = await apiClient.get(`${path}?${query.toString()}`)
  return response?.data || { content: [], nextCursor: null, hasMore: false }
}

export async function markChatRoomReadService({
  roomId,
  roomType,
  lastMessageId,
}) {
  const path =
    roomType === 'group'
      ? `/chat/groups/${roomId}/read`
      : `/chat/rooms/${roomId}/read`
  const response = await apiClient.put(path, { lastMessageId })
  return response?.data
}

/**
 * Tải tệp/ảnh đính kèm lên trước khi gửi tin nhắn.
 * Trả về metadata để đính kèm vào payload STOMP.
 */
export async function uploadChatAttachmentService({ roomId, roomType, file }) {
  const body = new FormData()
  body.append('file', file)

  const query = new URLSearchParams({ roomType: roomType || 'department' })
  const response = await apiClient.post(
    `/chat/rooms/${roomId}/attachments?${query.toString()}`,
    body,
  )
  return response?.data
}

export async function createGroupChatRoomService(payload) {
  const response = await apiClient.post('/chat/groups', payload)
  return response?.data
}

export async function fetchGroupChatRoomDetailService(roomId) {
  const response = await apiClient.get(`/chat/groups/${roomId}`)
  return response?.data
}

export async function searchChatUsersService(search = '') {
  const query = new URLSearchParams({ search, size: '100' })
  const response = await apiClient.get(`/chat/users?${query.toString()}`)
  return response?.data || []
}

export async function addGroupChatMembersService(roomId, memberUserIds) {
  const response = await apiClient.post(`/chat/groups/${roomId}/members`, {
    memberUserIds,
  })
  return response?.data
}

export async function removeGroupChatMemberService(roomId, userId) {
  const response = await apiClient.delete(
    `/chat/groups/${roomId}/members/${userId}`,
  )
  return response?.data
}
