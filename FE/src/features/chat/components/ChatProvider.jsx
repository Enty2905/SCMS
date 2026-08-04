import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { selectCurrentUser } from '@/features/auth/store/auth.selectors.js'
import { useWebSocket } from '@/shared/contexts/WebSocketContext.jsx'

import {
  clearChatState,
  receiveChatMessage,
  removeChatRoom,
  setChatConnectionStatus,
  setChatSocketError,
} from '../store/chat.reducer.js'
import {
  selectActiveChatRoomId,
  selectChatRooms,
} from '../store/chat.selectors.js'
import { fetchChatRooms } from '../store/chat.thunks.js'

export function ChatProvider({ children }) {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const rooms = useSelector(selectChatRooms)
  const activeRoomId = useSelector(selectActiveChatRoomId)
  const { connectionError, isConnected, stompClient } = useWebSocket()
  const departmentRoomKey = useMemo(
    () =>
      rooms
        .filter((room) => room.roomType === 'department')
        .map((room) => room.roomId)
        .sort()
        .join(','),
    [rooms],
  )
  const departmentRoomIds = useMemo(
    () => (departmentRoomKey ? departmentRoomKey.split(',') : []),
    [departmentRoomKey],
  )

  useEffect(() => {
    dispatch(setChatConnectionStatus(isConnected ? 'connected' : 'disconnected'))
  }, [dispatch, isConnected])

  useEffect(() => {
    if (connectionError) {
      dispatch(setChatSocketError(connectionError))
    }
  }, [connectionError, dispatch])

  useEffect(() => {
    if (!user) {
      dispatch(clearChatState())
      return
    }
    dispatch(fetchChatRooms())
  }, [dispatch, user])

  useEffect(() => {
    if (!isConnected || !stompClient) {
      return undefined
    }

    const handleMessage = (message) => {
      const roomId = message.roomId || message.departmentId
      const isOwnMessage = message.senderUserId === user?.id
      const isReadingRoom =
        activeRoomId === roomId &&
        globalThis.document.visibilityState === 'visible'

      dispatch(
        receiveChatMessage({
          message: { ...message, roomId },
          shouldIncrementUnread: !isOwnMessage && !isReadingRoom,
        }),
      )
    }

    const departmentSubscriptions = departmentRoomIds.map((roomId) =>
      stompClient.subscribe(`/topic/chat/rooms/${roomId}`, (frame) => {
        try {
          if (frame.body) handleMessage(JSON.parse(frame.body))
        } catch {
          dispatch(setChatSocketError('Tin nhắn realtime trả về không hợp lệ.'))
        }
      }),
    )

    const groupMessageSubscription = stompClient.subscribe(
      '/user/queue/chat/group-messages',
      (frame) => {
        try {
          if (frame.body) handleMessage(JSON.parse(frame.body))
        } catch {
          dispatch(setChatSocketError('Tin nhắn nhóm trả về không hợp lệ.'))
        }
      },
    )

    const groupEventSubscription = stompClient.subscribe(
      '/user/queue/chat/group-events',
      (frame) => {
        try {
          const event = JSON.parse(frame.body)
          if (event.type === 'ROOM_REMOVED') {
            dispatch(removeChatRoom(event.roomId))
          }
          dispatch(fetchChatRooms())
        } catch {
          dispatch(setChatSocketError('Cập nhật phòng chat không hợp lệ.'))
        }
      },
    )

    const errorSubscription = stompClient.subscribe(
      '/user/queue/chat/errors',
      (frame) => {
        try {
          const error = JSON.parse(frame.body)
          dispatch(setChatSocketError(error.message || 'Không thể gửi tin nhắn.'))
        } catch {
          dispatch(setChatSocketError('Không thể gửi tin nhắn.'))
        }
      },
    )

    return () => {
      departmentSubscriptions.forEach((subscription) =>
        subscription.unsubscribe(),
      )
      groupMessageSubscription.unsubscribe()
      groupEventSubscription.unsubscribe()
      errorSubscription.unsubscribe()
    }
  }, [
    activeRoomId,
    departmentRoomIds,
    departmentRoomKey,
    dispatch,
    isConnected,
    stompClient,
    user?.id,
  ])

  return children
}
