import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  fetchChatMessagesService,
  fetchChatRoomsService,
  markChatRoomReadService,
} from '../services/chat.service.js'

export const fetchChatRooms = createAsyncThunk('chat/fetchRooms', async () =>
  fetchChatRoomsService(),
)

export const fetchChatHistory = createAsyncThunk(
  'chat/fetchHistory',
  async ({ departmentId, cursor = '', size = 30 }) => ({
    departmentId,
    cursor,
    history: await fetchChatMessagesService({ departmentId, cursor, size }),
  }),
)

export const markChatRoomRead = createAsyncThunk(
  'chat/markRoomRead',
  async ({ departmentId, lastMessageId }) =>
    markChatRoomReadService(departmentId, lastMessageId),
)
