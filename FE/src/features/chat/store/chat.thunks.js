import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  addGroupChatMembersService,
  createGroupChatRoomService,
  fetchChatMessagesService,
  fetchChatRoomsService,
  fetchGroupChatRoomDetailService,
  markChatRoomReadService,
  removeGroupChatMemberService,
  searchChatUsersService,
} from '../services/chat.service.js'

export const fetchChatRooms = createAsyncThunk('chat/fetchRooms', async () =>
  fetchChatRoomsService(),
)

export const fetchChatHistory = createAsyncThunk(
  'chat/fetchHistory',
  async ({ roomId, roomType, cursor = '', size = 30 }) => ({
    roomId,
    roomType,
    cursor,
    history: await fetchChatMessagesService({
      roomId,
      roomType,
      cursor,
      size,
    }),
  }),
)

export const markChatRoomRead = createAsyncThunk(
  'chat/markRoomRead',
  async ({ roomId, roomType, lastMessageId }) =>
    markChatRoomReadService({ roomId, roomType, lastMessageId }),
)

export const searchChatUsers = createAsyncThunk(
  'chat/searchUsers',
  async (search = '') => searchChatUsersService(search),
)

export const createGroupChatRoom = createAsyncThunk(
  'chat/createGroupRoom',
  async (payload, { dispatch }) => {
    const room = await createGroupChatRoomService(payload)
    await dispatch(fetchChatRooms())
    return room
  },
)

export const fetchGroupChatRoomDetail = createAsyncThunk(
  'chat/fetchGroupRoomDetail',
  async (roomId) => fetchGroupChatRoomDetailService(roomId),
)

export const addGroupChatMembers = createAsyncThunk(
  'chat/addGroupMembers',
  async ({ roomId, memberUserIds }, { dispatch }) => {
    const room = await addGroupChatMembersService(roomId, memberUserIds)
    await dispatch(fetchChatRooms())
    return room
  },
)

export const removeGroupChatMember = createAsyncThunk(
  'chat/removeGroupMember',
  async ({ roomId, userId }, { dispatch }) => {
    const room = await removeGroupChatMemberService(roomId, userId)
    await dispatch(fetchChatRooms())
    return room
  },
)
