import {
  ArrowLeft,
  CircleAlert,
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageSquareText,
  Paperclip,
  Plus,
  Search,
  Send,
  Settings2,
  UsersRound,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { selectCurrentUser } from '@/features/auth/store/auth.selectors.js'
import { Button } from '@/shared/components/ui/Button.jsx'
import { useWebSocket } from '@/shared/contexts/WebSocketContext.jsx'
import { createUuid } from '@/shared/utils/uuid.js'

import {
  CreateGroupRoomModal,
  ManageGroupRoomModal,
} from '../components/GroupRoomModals.jsx'
import {
  clearChatSocketError,
  queueChatMessage,
  setActiveChatRoom,
  setChatSocketError,
} from '../store/chat.reducer.js'
import {
  selectActiveChatHistory,
  selectActiveChatMessages,
  selectActiveChatRoom,
  selectChatConnectionStatus,
  selectChatError,
  selectChatRooms,
  selectChatRoomsLoading,
  selectChatSocketError,
} from '../store/chat.selectors.js'
import { fetchChatHistory, markChatRoomRead } from '../store/chat.thunks.js'
import { uploadChatAttachmentService } from '../services/chat.service.js'

const MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024

export function DepartmentChatPage() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const rooms = useSelector(selectChatRooms)
  const roomsLoading = useSelector(selectChatRoomsLoading)
  const activeRoom = useSelector(selectActiveChatRoom)
  const messages = useSelector(selectActiveChatMessages)
  const history = useSelector(selectActiveChatHistory)
  const connectionStatus = useSelector(selectChatConnectionStatus)
  const error = useSelector(selectChatError)
  const socketError = useSelector(selectChatSocketError)
  const { isConnected, stompClient } = useWebSocket()
  const [roomSearch, setRoomSearch] = useState('')
  const [draft, setDraft] = useState('')
  const [mobileConversationOpen, setMobileConversationOpen] = useState(false)
  const [createRoomOpen, setCreateRoomOpen] = useState(false)
  const [manageRoomOpen, setManageRoomOpen] = useState(false)
  const [attachment, setAttachment] = useState(null)
  const [attachmentUploading, setAttachmentUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const messagesEndRef = useRef(null)
  const lastReadRef = useRef('')
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)

  const filteredRooms = useMemo(() => {
    const keyword = roomSearch.trim().toLocaleLowerCase('vi')
    if (!keyword) return rooms
    return rooms.filter((room) =>
      `${room.roomName} ${room.roomCode || ''}`
        .toLocaleLowerCase('vi')
        .includes(keyword),
    )
  }, [roomSearch, rooms])

  useEffect(() => {
    if (!activeRoom && rooms.length) {
      dispatch(setActiveChatRoom(rooms[0].roomId))
    }
  }, [activeRoom, dispatch, rooms])

  useEffect(() => {
    if (!activeRoom || history.initialized || history.loading) return
    dispatch(
      fetchChatHistory({
        roomId: activeRoom.roomId,
        roomType: activeRoom.roomType,
      }),
    )
  }, [activeRoom, dispatch, history.initialized, history.loading])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [activeRoom?.roomId, messages.length])

  useEffect(() => {
    if (!activeRoom || !messages.length) return undefined

    const markLatestAsRead = () => {
      if (globalThis.document.visibilityState !== 'visible') return
      const latestMessage = messages[messages.length - 1]
      if (!latestMessage?.messageId || lastReadRef.current === latestMessage.messageId) {
        return
      }
      lastReadRef.current = latestMessage.messageId
      dispatch(
        markChatRoomRead({
          roomId: activeRoom.roomId,
          roomType: activeRoom.roomType,
          lastMessageId: latestMessage.messageId,
        }),
      )
    }

    markLatestAsRead()
    globalThis.document.addEventListener('visibilitychange', markLatestAsRead)
    return () =>
      globalThis.document.removeEventListener('visibilitychange', markLatestAsRead)
  }, [activeRoom, dispatch, messages])

  function selectRoom(roomId) {
    lastReadRef.current = ''
    dispatch(setActiveChatRoom(roomId))
    setMobileConversationOpen(true)
    setAttachment(null)
  }

  async function handleFileSelected(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !activeRoom) return

    if (file.size > MAX_ATTACHMENT_SIZE) {
      dispatch(setChatSocketError('Tệp đính kèm không được vượt quá 20MB.'))
      return
    }

    setAttachmentUploading(true)
    try {
      const uploaded = await uploadChatAttachmentService({
        roomId: activeRoom.roomId,
        roomType: activeRoom.roomType,
        file,
      })
      setAttachment({
        ...uploaded,
        // Ảnh cục bộ cho phần xem trước, tránh chờ tải lại từ Cloudinary.
        localPreviewUrl:
          uploaded?.messageType === 'IMAGE'
            ? URL.createObjectURL(file)
            : null,
      })
    } catch (uploadError) {
      dispatch(
        setChatSocketError(uploadError.message || 'Không tải được tệp đính kèm.'),
      )
    } finally {
      setAttachmentUploading(false)
    }
  }

  function removeAttachment() {
    if (attachment?.localPreviewUrl) {
      URL.revokeObjectURL(attachment.localPreviewUrl)
    }
    setAttachment(null)
  }

  function loadOlderMessages() {
    if (!activeRoom || !history.nextCursor || history.loading) return
    dispatch(
      fetchChatHistory({
        roomId: activeRoom.roomId,
        roomType: activeRoom.roomType,
        cursor: history.nextCursor,
      }),
    )
  }

  function sendMessage() {
    const content = draft.trim()
    if ((!content && !attachment) || !activeRoom) return
    if (!isConnected || !stompClient?.connected) {
      dispatch(setChatSocketError('Mất kết nối chat. Vui lòng chờ kết nối lại.'))
      return
    }

    const clientMessageId = createUuid()
    const attachmentPayload = attachment
      ? {
          messageType: attachment.messageType,
          attachmentUrl: attachment.attachmentUrl,
          attachmentName: attachment.attachmentName,
          attachmentContentType: attachment.attachmentContentType,
          attachmentSize: attachment.attachmentSize,
        }
      : { messageType: 'TEXT' }

    dispatch(
      queueChatMessage({
        clientMessageId,
        roomId: activeRoom.roomId,
        roomType: activeRoom.roomType,
        departmentId:
          activeRoom.roomType === 'department' ? activeRoom.roomId : null,
        senderUserId: user?.id,
        senderName: user?.name || 'Bạn',
        senderAvatarUrl: null,
        senderPosition: null,
        content,
        ...attachmentPayload,
        sentAt: new Date().toISOString(),
      }),
    )

    stompClient.publish({
      destination:
        activeRoom.roomType === 'group'
          ? `/app/chat/groups/${activeRoom.roomId}/messages`
          : `/app/chat/rooms/${activeRoom.roomId}/messages`,
      body: JSON.stringify({ clientMessageId, content, ...attachmentPayload }),
    })
    setDraft('')
    setAttachment(null)
  }

  function handleComposerKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-950">Chat nội bộ</h1>
          <p className="mt-1 text-sm text-slate-500">
            Trao đổi theo phòng ban hoặc tạo nhóm làm việc với các tài khoản khác.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ConnectionBadge status={connectionStatus} />
          <Button
            className="bg-violet-600 hover:bg-violet-700"
            onClick={() => setCreateRoomOpen(true)}
          >
            <Plus size={17} />
            Tạo phòng
          </Button>
        </div>
      </header>

      {error || socketError ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span className="flex items-center gap-2">
            <CircleAlert size={17} />
            {socketError || error}
          </span>
          {socketError ? (
            <button
              className="font-semibold hover:text-rose-900"
              onClick={() => dispatch(clearChatSocketError())}
              type="button"
            >
              Đóng
            </button>
          ) : null}
        </div>
      ) : null}

      <section className="grid h-[calc(100dvh-10.5rem)] min-h-[520px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside
          className={[
            'min-h-0 flex-col border-r border-slate-200',
            mobileConversationOpen ? 'hidden lg:flex' : 'flex',
          ].join(' ')}
        >
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-950">Phòng trao đổi</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {rooms.length} phòng có thể truy cập
                </p>
              </div>
              <UsersRound className="text-violet-600" size={20} />
            </div>
            {rooms.length > 1 ? (
              <label className="mt-4 flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
                <Search className="text-slate-400" size={16} />
                <input
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
                  onChange={(event) => setRoomSearch(event.target.value)}
                  placeholder="Tìm phòng chat..."
                  value={roomSearch}
                />
              </label>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {roomsLoading ? (
              <LoadingState label="Đang tải phòng chat..." />
            ) : filteredRooms.length ? (
              filteredRooms.map((room) => (
                <RoomButton
                  active={activeRoom?.roomId === room.roomId}
                  key={room.roomId}
                  onClick={() => selectRoom(room.roomId)}
                  room={room}
                />
              ))
            ) : (
              <EmptyState
                description={
                  roomSearch
                    ? 'Không tìm thấy phòng chat phù hợp.'
                    : 'Tài khoản chưa có phòng chat.'
                }
                title="Chưa có phòng"
              />
            )}
          </div>
        </aside>

        <div
          className={[
            'min-h-0 min-w-0',
            mobileConversationOpen ? 'flex flex-col' : 'hidden lg:flex lg:flex-col',
          ].join(' ')}
        >
          {activeRoom ? (
            <>
              <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 px-4 sm:px-5">
                <Button
                  aria-label="Quay lại danh sách phòng"
                  className="lg:hidden"
                  onClick={() => setMobileConversationOpen(false)}
                  size="icon"
                  variant="ghost"
                >
                  <ArrowLeft size={18} />
                </Button>
                <RoomAvatar room={activeRoom} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">
                    {activeRoom.roomName}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {activeRoom.roomType === 'group'
                      ? activeRoom.roomCode || 'Nhóm chat'
                      : activeRoom.roomCode || 'Phòng ban nội bộ'}
                  </p>
                </div>
                {activeRoom.roomType === 'group' ? (
                  <Button
                    aria-label="Quản lý thành viên"
                    className="ml-auto"
                    onClick={() => setManageRoomOpen(true)}
                    size="icon"
                    title="Thành viên phòng"
                    variant="ghost"
                  >
                    <Settings2 size={18} />
                  </Button>
                ) : null}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-4 py-5 sm:px-6">
                {history.hasMore ? (
                  <div className="mb-5 text-center">
                    <button
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-100 disabled:opacity-50"
                      disabled={history.loading}
                      onClick={loadOlderMessages}
                      type="button"
                    >
                      {history.loading ? 'Đang tải...' : 'Xem tin nhắn cũ hơn'}
                    </button>
                  </div>
                ) : null}

                {history.loading && !history.initialized ? (
                  <LoadingState label="Đang tải lịch sử..." />
                ) : messages.length ? (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <MessageBubble
                        currentUserId={user?.id}
                        key={message.messageId || message.clientMessageId}
                        message={message}
                        onPreviewImage={setPreviewImage}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <EmptyState
                    description="Hãy gửi tin nhắn đầu tiên để bắt đầu trao đổi."
                    title="Chưa có tin nhắn"
                  />
                )}
              </div>

              <div className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4">
                {attachmentUploading ? (
                  <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 className="animate-spin" size={14} />
                    Đang tải tệp lên...
                  </div>
                ) : null}

                {attachment ? (
                  <AttachmentPreview
                    attachment={attachment}
                    onRemove={removeAttachment}
                  />
                ) : null}

                <input
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelected}
                  ref={imageInputRef}
                  type="file"
                />
                <input
                  className="hidden"
                  onChange={handleFileSelected}
                  ref={fileInputRef}
                  type="file"
                />

                <div className="flex items-end gap-2">
                  <Button
                    aria-label="Gửi ảnh"
                    className="size-11 shrink-0"
                    disabled={!isConnected || attachmentUploading}
                    onClick={() => imageInputRef.current?.click()}
                    size="icon"
                    title="Gửi ảnh"
                    variant="ghost"
                  >
                    <ImageIcon size={18} />
                  </Button>
                  <Button
                    aria-label="Gửi tệp"
                    className="size-11 shrink-0"
                    disabled={!isConnected || attachmentUploading}
                    onClick={() => fileInputRef.current?.click()}
                    size="icon"
                    title="Gửi tệp"
                    variant="ghost"
                  >
                    <Paperclip size={18} />
                  </Button>
                  <textarea
                    className="max-h-32 min-h-11 min-w-0 flex-1 resize-none rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-100"
                    disabled={!isConnected}
                    maxLength={2000}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    placeholder={
                      isConnected
                        ? attachment
                          ? 'Thêm chú thích (không bắt buộc)...'
                          : 'Nhập nội dung trao đổi...'
                        : 'Đang chờ kết nối chat...'
                    }
                    rows={1}
                    value={draft}
                  />
                  <Button
                    aria-label="Gửi tin nhắn"
                    className="size-11 shrink-0 bg-violet-600 hover:bg-violet-700"
                    disabled={
                      (!draft.trim() && !attachment) ||
                      !isConnected ||
                      attachmentUploading
                    }
                    onClick={sendMessage}
                    size="icon"
                  >
                    <Send size={18} />
                  </Button>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Enter để gửi, Shift + Enter để xuống dòng · Tệp tối đa 20MB
                </p>
              </div>
            </>
          ) : (
            <EmptyState
              description="Chọn một phòng chat để xem lịch sử và bắt đầu trao đổi."
              title="Chọn phòng chat"
            />
          )}
        </div>
      </section>

      {createRoomOpen ? (
        <CreateGroupRoomModal
          onClose={() => setCreateRoomOpen(false)}
          onCreated={(roomId) => {
            setCreateRoomOpen(false)
            selectRoom(roomId)
          }}
        />
      ) : null}

      {manageRoomOpen && activeRoom?.roomType === 'group' ? (
        <ManageGroupRoomModal
          onClose={() => setManageRoomOpen(false)}
          roomId={activeRoom.roomId}
        />
      ) : null}

      {previewImage ? (
        <ImagePreviewModal
          message={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      ) : null}
    </div>
  )
}

function RoomButton({ active, onClick, room }) {
  return (
    <button
      className={[
        'flex w-full items-start gap-3 border-b border-slate-100 px-4 py-4 text-left transition',
        active ? 'bg-violet-50' : 'hover:bg-slate-50',
      ].join(' ')}
      onClick={onClick}
      type="button"
    >
      <RoomAvatar room={room} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-slate-950">
            {room.roomName}
          </p>
          {room.unreadCount ? (
            <span className="grid min-w-5 shrink-0 place-items-center rounded-full bg-violet-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
              {room.unreadCount > 99 ? '99+' : room.unreadCount}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-[11px] font-medium uppercase text-slate-400">
          {room.roomType === 'group' ? 'Nhóm chat' : 'Phòng ban'}
        </p>
        <p className="mt-1 truncate text-xs text-slate-500">
          {room.lastMessage
            ? `${room.lastMessage.senderName}: ${describeLastMessage(room.lastMessage)}`
            : 'Chưa có tin nhắn'}
        </p>
        {room.lastMessage?.sentAt ? (
          <p className="mt-1 text-[11px] text-slate-400">
            {formatMessageTime(room.lastMessage.sentAt)}
          </p>
        ) : null}
      </div>
    </button>
  )
}

function MessageBubble({ currentUserId, message, onPreviewImage }) {
  const own = message.senderUserId === currentUserId
  const hasAttachment = Boolean(message.attachmentUrl)
  const isImage = message.messageType === 'IMAGE'
  return (
    <div className={`flex gap-2 ${own ? 'justify-end' : 'justify-start'}`}>
      {!own ? <UserAvatar message={message} /> : null}
      <div className={`max-w-[min(78%,680px)] ${own ? 'items-end' : 'items-start'}`}>
        {!own ? (
          <p className="mb-1 text-xs font-semibold text-slate-600">
            {message.senderName}
            {message.senderPosition ? ` · ${message.senderPosition}` : ''}
          </p>
        ) : null}
        <div
          className={[
            'rounded-lg px-3 py-2.5 text-sm leading-6 shadow-sm',
            own
              ? 'bg-violet-600 text-white'
              : 'border border-slate-200 bg-white text-slate-800',
          ].join(' ')}
        >
          {hasAttachment && isImage ? (
            <button
              className="block overflow-hidden rounded-md"
              onClick={() => onPreviewImage?.(message)}
              type="button"
            >
              <img
                alt={message.attachmentName || 'Ảnh đính kèm'}
                className="max-h-72 w-auto max-w-full rounded-md object-cover"
                loading="lazy"
                src={message.attachmentUrl}
              />
            </button>
          ) : null}

          {hasAttachment && !isImage ? (
            <a
              className={[
                'flex items-center gap-3 rounded-md border px-3 py-2 transition',
                own
                  ? 'border-violet-400 bg-violet-500 hover:bg-violet-400'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100',
              ].join(' ')}
              download={message.attachmentName}
              href={message.attachmentUrl}
              rel="noreferrer noopener"
              target="_blank"
            >
              <FileText className="shrink-0" size={22} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {message.attachmentName || 'Tệp đính kèm'}
                </span>
                <span
                  className={`block text-xs ${own ? 'text-violet-100' : 'text-slate-500'}`}
                >
                  {formatFileSize(message.attachmentSize)}
                </span>
              </span>
              <Download className="shrink-0" size={17} />
            </a>
          ) : null}

          {message.content ? (
            <p
              className={`whitespace-pre-wrap break-words ${hasAttachment ? 'mt-2' : ''}`}
            >
              {message.content}
            </p>
          ) : null}
        </div>
        <p
          className={`mt-1 text-[11px] text-slate-400 ${own ? 'text-right' : ''}`}
        >
          {formatMessageTime(message.sentAt)}
          {message.pending ? ' · Đang gửi' : ''}
        </p>
      </div>
    </div>
  )
}

function AttachmentPreview({ attachment, onRemove }) {
  const isImage = attachment.messageType === 'IMAGE'
  return (
    <div className="mb-2 flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-2">
      {isImage && attachment.localPreviewUrl ? (
        <img
          alt={attachment.attachmentName}
          className="size-12 shrink-0 rounded object-cover"
          src={attachment.localPreviewUrl}
        />
      ) : (
        <div className="grid size-12 shrink-0 place-items-center rounded bg-slate-200 text-slate-600">
          <FileText size={20} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">
          {attachment.attachmentName}
        </p>
        <p className="text-xs text-slate-500">
          {formatFileSize(attachment.attachmentSize)}
        </p>
      </div>
      <Button
        aria-label="Bỏ tệp đính kèm"
        onClick={onRemove}
        size="icon"
        variant="ghost"
      >
        <X size={17} />
      </Button>
    </div>
  )
}

function ImagePreviewModal({ message, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-full max-w-4xl overflow-auto"
        onClick={(event) => event.stopPropagation()}
        role="presentation"
      >
        <img
          alt={message.attachmentName || 'Ảnh đính kèm'}
          className="max-h-[80dvh] w-auto rounded-lg object-contain"
          src={message.attachmentUrl}
        />
        <div className="mt-3 flex items-center justify-between gap-3 text-sm text-white">
          <span className="truncate">{message.attachmentName}</span>
          <a
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-white/15 px-3 py-2 font-semibold hover:bg-white/25"
            download={message.attachmentName}
            href={message.attachmentUrl}
            rel="noreferrer noopener"
            target="_blank"
          >
            <Download size={16} />
            Tải xuống
          </a>
        </div>
      </div>
      <Button
        aria-label="Đóng"
        className="absolute right-4 top-4 text-white hover:bg-white/20"
        onClick={onClose}
        size="icon"
        variant="ghost"
      >
        <X size={22} />
      </Button>
    </div>
  )
}

function RoomAvatar({ room }) {
  const initials = getInitials(room.roomName)
  const group = room.roomType === 'group'
  return (
    <div
      className={[
        'grid size-10 shrink-0 place-items-center rounded-md text-sm font-bold',
        group
          ? 'bg-violet-100 text-violet-700'
          : 'bg-emerald-100 text-emerald-700',
      ].join(' ')}
    >
      {initials}
    </div>
  )
}

function UserAvatar({ message }) {
  if (message.senderAvatarUrl) {
    return (
      <img
        alt={message.senderName}
        className="mt-5 size-8 shrink-0 rounded-full object-cover"
        src={message.senderAvatarUrl}
      />
    )
  }
  return (
    <div className="mt-5 grid size-8 shrink-0 place-items-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
      {getInitials(message.senderName)}
    </div>
  )
}

function ConnectionBadge({ status }) {
  const connected = status === 'connected'
  return (
    <span
      className={[
        'inline-flex h-8 items-center gap-2 rounded-full px-3 text-xs font-semibold',
        connected
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-rose-100 text-rose-700',
      ].join(' ')}
    >
      {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
      {connected ? 'Đã kết nối' : 'Mất kết nối'}
    </span>
  )
}

function LoadingState({ label }) {
  return (
    <div className="grid min-h-40 place-items-center text-sm text-slate-500">
      <span className="flex items-center gap-2">
        <Loader2 className="animate-spin" size={17} />
        {label}
      </span>
    </div>
  )
}

function EmptyState({ description, title }) {
  return (
    <div className="grid min-h-56 place-items-center p-6 text-center">
      <div>
        <MessageSquareText className="mx-auto text-slate-300" size={36} />
        <p className="mt-3 font-semibold text-slate-700">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      </div>
    </div>
  )
}

function getInitials(value = '') {
  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'PB'
  )
}

function formatMessageTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  })
}

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

/**
 * Tin nhắn chỉ có đính kèm sẽ không có nội dung văn bản,
 * nên hiển thị nhãn thay cho dòng trống ở danh sách phòng.
 */
function describeLastMessage(message) {
  if (message.content) return message.content
  if (message.messageType === 'IMAGE') return '[Hình ảnh]'
  if (message.attachmentUrl) return `[Tệp] ${message.attachmentName || ''}`.trim()
  return ''
}
