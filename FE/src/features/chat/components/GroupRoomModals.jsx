import {
  Check,
  Crown,
  Loader2,
  Search,
  Trash2,
  UserPlus,
  UsersRound,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Button } from '@/shared/components/ui/Button.jsx'

import {
  selectActiveGroupRoomDetail,
  selectChatRoomMutationLoading,
  selectChatUserSearch,
} from '../store/chat.selectors.js'
import {
  addGroupChatMembers,
  createGroupChatRoom,
  fetchGroupChatRoomDetail,
  removeGroupChatMember,
  searchChatUsers,
} from '../store/chat.thunks.js'

export function CreateGroupRoomModal({ onClose, onCreated }) {
  const dispatch = useDispatch()
  const userSearch = useSelector(selectChatUserSearch)
  const loading = useSelector(selectChatRoomMutationLoading)
  const [roomName, setRoomName] = useState('')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    dispatch(searchChatUsers(''))
  }, [dispatch])

  async function submit(event) {
    event.preventDefault()
    setError('')
    try {
      const room = await dispatch(
        createGroupChatRoom({
          roomName: roomName.trim(),
          memberUserIds: selectedIds,
        }),
      ).unwrap()
      onCreated(room.roomId)
    } catch (submitError) {
      setError(submitError.message || 'Không thể tạo phòng chat.')
    }
  }

  function updateSearch(value) {
    setSearch(value)
    dispatch(searchChatUsers(value.trim()))
  }

  return (
    <ModalFrame onClose={onClose} title="Tạo phòng chat nhóm">
      <form className="space-y-4" onSubmit={submit}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Tên phòng
          </span>
          <input
            autoFocus
            className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            maxLength={150}
            minLength={2}
            onChange={(event) => setRoomName(event.target.value)}
            placeholder="Ví dụ: Nhóm triển khai Sprint 5"
            required
            value={roomName}
          />
        </label>

        <UserPicker
          loading={userSearch.loading}
          onSearch={updateSearch}
          onToggle={(userId) => toggleSelection(userId, selectedIds, setSelectedIds)}
          search={search}
          selectedIds={selectedIds}
          users={userSearch.items}
        />

        {error ? <ErrorMessage message={error} /> : null}

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <Button onClick={onClose} type="button" variant="outline">
            Hủy
          </Button>
          <Button
            className="bg-violet-600 hover:bg-violet-700"
            disabled={loading || roomName.trim().length < 2}
            type="submit"
          >
            {loading ? <Loader2 className="animate-spin" size={17} /> : <UserPlus size={17} />}
            Tạo phòng
          </Button>
        </div>
      </form>
    </ModalFrame>
  )
}

export function ManageGroupRoomModal({ roomId, onClose }) {
  const dispatch = useDispatch()
  const detail = useSelector(selectActiveGroupRoomDetail)
  const userSearch = useSelector(selectChatUserSearch)
  const loading = useSelector(selectChatRoomMutationLoading)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    dispatch(fetchGroupChatRoomDetail(roomId))
    dispatch(searchChatUsers(''))
  }, [dispatch, roomId])

  const memberIds = useMemo(
    () => new Set(detail?.members?.map((member) => member.userId) || []),
    [detail?.members],
  )
  const availableUsers = userSearch.items.filter(
    (candidate) => !memberIds.has(candidate.userId),
  )

  async function addMembers() {
    if (!selectedIds.length) return
    setError('')
    try {
      await dispatch(
        addGroupChatMembers({ roomId, memberUserIds: selectedIds }),
      ).unwrap()
      setSelectedIds([])
    } catch (requestError) {
      setError(requestError.message || 'Không thể thêm thành viên.')
    }
  }

  async function removeMember(userId) {
    setError('')
    try {
      await dispatch(removeGroupChatMember({ roomId, userId })).unwrap()
    } catch (requestError) {
      setError(requestError.message || 'Không thể xóa thành viên.')
    }
  }

  function updateSearch(value) {
    setSearch(value)
    dispatch(searchChatUsers(value.trim()))
  }

  return (
    <ModalFrame onClose={onClose} title={detail?.roomName || 'Thành viên phòng'}>
      {!detail ? (
        <div className="grid min-h-56 place-items-center text-sm text-slate-500">
          <Loader2 className="animate-spin" size={22} />
        </div>
      ) : (
        <div className="space-y-5">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">
                Thành viên ({detail.members.length})
              </h3>
              <span className="text-xs text-slate-500">
                {detail.owner ? 'Bạn là chủ phòng' : 'Chỉ chủ phòng được chỉnh sửa'}
              </span>
            </div>
            <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-md border border-slate-200">
              {detail.members.map((member) => {
                const owner = member.userId === detail.ownerUserId
                return (
                  <div
                    className="flex items-center gap-3 px-3 py-3"
                    key={member.userId}
                  >
                    <UserAvatar user={member} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {member.employeeName}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        @{member.username}
                        {member.departmentName ? ` · ${member.departmentName}` : ''}
                      </p>
                    </div>
                    {owner ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                        <Crown size={14} />
                        Chủ phòng
                      </span>
                    ) : detail.owner ? (
                      <button
                        aria-label={`Xóa ${member.employeeName} khỏi phòng`}
                        className="grid size-8 place-items-center rounded-md text-rose-500 hover:bg-rose-50"
                        disabled={loading}
                        onClick={() => removeMember(member.userId)}
                        title="Xóa khỏi phòng"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </section>

          {detail.owner ? (
            <section className="border-t border-slate-200 pt-4">
              <h3 className="mb-3 font-semibold text-slate-900">
                Thêm thành viên
              </h3>
              <UserPicker
                loading={userSearch.loading}
                onSearch={updateSearch}
                onToggle={(userId) =>
                  toggleSelection(userId, selectedIds, setSelectedIds)
                }
                search={search}
                selectedIds={selectedIds}
                users={availableUsers}
              />
              <div className="mt-3 flex justify-end">
                <Button
                  className="bg-violet-600 hover:bg-violet-700"
                  disabled={!selectedIds.length || loading}
                  onClick={addMembers}
                  type="button"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={17} />
                  ) : (
                    <UserPlus size={17} />
                  )}
                  Thêm {selectedIds.length || ''} thành viên
                </Button>
              </div>
            </section>
          ) : null}

          {error ? <ErrorMessage message={error} /> : null}
        </div>
      )}
    </ModalFrame>
  )
}

function ModalFrame({ children, onClose, title }) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4"
      role="dialog"
    >
      <div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-2">
            <UsersRound className="text-violet-600" size={20} />
            <h2 className="font-bold text-slate-950">{title}</h2>
          </div>
          <button
            aria-label="Đóng"
            className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function UserPicker({
  loading,
  onSearch,
  onToggle,
  search,
  selectedIds,
  users,
}) {
  return (
    <div>
      <label className="flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
        <Search className="text-slate-400" size={16} />
        <input
          className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Tìm theo tên hoặc tên đăng nhập..."
          value={search}
        />
      </label>
      <div className="mt-2 max-h-56 divide-y divide-slate-100 overflow-y-auto rounded-md border border-slate-200">
        {loading ? (
          <div className="grid min-h-24 place-items-center">
            <Loader2 className="animate-spin text-slate-400" size={20} />
          </div>
        ) : users.length ? (
          users.map((user) => {
            const selected = selectedIds.includes(user.userId)
            return (
              <button
                className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-slate-50"
                key={user.userId}
                onClick={() => onToggle(user.userId)}
                type="button"
              >
                <UserAvatar user={user} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {user.employeeName}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    @{user.username}
                    {user.departmentName ? ` · ${user.departmentName}` : ''}
                  </p>
                </div>
                <span
                  className={[
                    'grid size-5 place-items-center rounded border',
                    selected
                      ? 'border-violet-600 bg-violet-600 text-white'
                      : 'border-slate-300 text-transparent',
                  ].join(' ')}
                >
                  <Check size={13} />
                </span>
              </button>
            )
          })
        ) : (
          <p className="px-3 py-6 text-center text-sm text-slate-500">
            Không tìm thấy tài khoản phù hợp.
          </p>
        )}
      </div>
    </div>
  )
}

function UserAvatar({ user }) {
  if (user.avatarUrl) {
    return (
      <img
        alt={user.employeeName}
        className="size-9 shrink-0 rounded-full object-cover"
        src={user.avatarUrl}
      />
    )
  }
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
      {getInitials(user.employeeName)}
    </span>
  )
}

function ErrorMessage({ message }) {
  return (
    <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
      {message}
    </p>
  )
}

function toggleSelection(userId, selectedIds, setSelectedIds) {
  setSelectedIds(
    selectedIds.includes(userId)
      ? selectedIds.filter((id) => id !== userId)
      : [...selectedIds, userId],
  )
}

function getInitials(value = '') {
  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(-2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'U'
  )
}
