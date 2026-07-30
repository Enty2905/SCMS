import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { selectCurrentUser } from '@/features/auth/store/auth.selectors.js'
import { useWebSocket } from '@/shared/contexts/WebSocketContext.jsx'

import {
  clearChatState,
  receiveChatMessage,
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
  const { isConnected, stompClient } = useWebSocket()
  const roomKey = useMemo(
    () => rooms.map((room) => room.departmentId).sort().join(','),
    [rooms],
  )
  const roomIds = useMemo(
    () => (roomKey ? roomKey.split(',') : []),
    [roomKey],
  )

  useEffect(() => {
    dispatch(setChatConnectionStatus(isConnected ? 'connected' : 'disconnected'))
  }, [dispatch, isConnected])

  useEffect(() => {
    if (!user) {
      dispatch(clearChatState())
      return
    }
    dispatch(fetchChatRooms())
  }, [dispatch, user])

  useEffect(() => {
    if (!isConnected || !stompClient || !roomKey) {
      return undefined
    }

    const subscriptions = roomIds.map((departmentId) =>
      stompClient.subscribe(`/topic/chat/rooms/${departmentId}`, (frame) => {
        if (!frame.body) return

        try {
          const message = JSON.parse(frame.body)
          const isOwnMessage = message.senderUserId === user?.id
          const isReadingRoom =
            activeRoomId === message.departmentId &&
            globalThis.document.visibilityState === 'visible'

          dispatch(
            receiveChatMessage({
              message,
              shouldIncrementUnread: !isOwnMessage && !isReadingRoom,
            }),
          )
        } catch {
          dispatch(setChatSocketError('Tin nhắn realtime trả về không hợp lệ.'))
        }
      }),
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
      subscriptions.forEach((subscription) => subscription.unsubscribe())
      errorSubscription.unsubscribe()
    }
  }, [
    activeRoomId,
    dispatch,
    isConnected,
    roomKey,
    roomIds,
    stompClient,
    user?.id,
  ])

  return children
}
