import { useEffect, useState } from 'react'
import {
  Bell,
  ChevronDown,
  LogOut,
  Zap,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { clearStoredAuth } from '@/features/auth/services/token.service.js'
import { logout } from '@/features/auth/store/auth.reducer.js'
import { selectCurrentUser } from '@/features/auth/store/auth.selectors.js'
import { selectChatUnreadTotal } from '@/features/chat/store/chat.selectors.js'
import {
  getPrimaryRoleLabel,
  hasAnyRole,
  ROLES,
} from '@/features/auth/utils/roles.js'
import { Button } from '@/shared/components/ui/Button.jsx'
import { apiClient } from '@/shared/api/httpClient.js'
import {
  getVisibleSidebarGroups,
  getVisibleSidebarItems,
  isSidebarItemActive,
} from '@/shared/components/layout/sidebarNavigation.js'
import { useWebSocket } from '@/shared/contexts/WebSocketContext.jsx'
import { env } from '@/shared/config/env.js'

import { fetchConsumableStocks } from '@/features/inventory/services/consumableStock.service.js'
import { fetchTools } from '@/features/inventory/services/tool.service.js'
import { fetchConsumableRequests } from '@/features/inventory/services/consumableRequest.service.js'
import { fetchSparePartRequests } from '@/features/inventory/services/sparePartRequest.service.js'
import { fetchAllRepairRequests } from '@/features/repairrequest/services/repairRequest.service.js'


export function AppShell() {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const chatUnreadTotal = useSelector(selectChatUnreadTotal)

  // State for dynamic notifications
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showAllNotifs, setShowAllNotifs] = useState(false)
  const [navGroupOpenState, setNavGroupOpenState] = useState({})
  const [reloadNotifTrigger, setReloadNotifTrigger] = useState(0)

  // State cho websocket toast
  const [realtimeToast, setRealtimeToast] = useState(null)

  const { stompClient, isConnected } = useWebSocket()

  const canSeeNotifications = hasAnyRole(user, [
    ROLES.OPS_MANAGER, 
    ROLES.ADMIN,
    ROLES.REPAIR_MANAGER,
    ROLES.TEAM_LEADER,
    ROLES.WAREHOUSE_MAT,
    ROLES.WAREHOUSE_TOOL,
  ])

  useEffect(() => {
    if (!canSeeNotifications) {
      const clearTimer = globalThis.setTimeout(() => setNotifications([]), 0)
      return () => globalThis.clearTimeout(clearTimer)
    }

    async function loadNotifications() {
      try {
        let allNotifications = []

        // Load consumable stock warnings STRICTLY for TKVT role (VT)
        if (user?.roles?.includes(ROLES.WAREHOUSE_MAT)) {
          try {
            const stockData = await fetchConsumableStocks({ size: 1000 })
            const stocks = stockData.content || []
            const stockWarnings = stocks
              .filter((item) => item.status === 'low' || item.status === 'out')
              .map((item) => ({
                id: `mat-${item.consumableId}`,
                code: item.code,
                name: item.name,
                status: item.status,
                title: item.status === 'out' ? 'Hết vật tư' : 'Vật tư sắp hết',
                message: `${item.name} - Tồn: ${item.stockQuantity}`,
                type: item.status === 'out' ? 'error' : 'warning',
                category: 'material',
              }))
            allNotifications = [...allNotifications, ...stockWarnings]
          } catch (err) {
            console.error('Failed to load material notifications', err)
          }

          // Load pending material requests
          try {
            const [consRes, spareRes] = await Promise.all([
              fetchConsumableRequests({ status: 'pending', size: 100 }),
              fetchSparePartRequests({ status: 'pending', size: 100 })
            ])
            const consRequests = consRes.content || []
            const spareRequests = spareRes.content || []

            const matReqWarnings = [...consRequests, ...spareRequests].map((req) => ({
              id: `mat-req-${req.reqId}`,
              title: 'Yêu cầu cấp phát vật tư mới',
              message: `Mã phiếu: ${req.reqNumber} đang chờ cấp phát.`,
              type: 'info',
              category: 'material_request',
              timestamp: req.createdAt ? new Date(req.createdAt).getTime() : Date.now(),
              reqId: req.reqId,
            }))
            allNotifications = [...matReqWarnings, ...allNotifications]
          } catch (err) {
            console.error('Failed to load pending material requests', err)
          }
        }

        // Load damaged tool warnings STRICTLY for TKCCDC role
        if (user?.roles?.includes(ROLES.WAREHOUSE_TOOL)) {
          try {
            const toolData = await fetchTools(null, null, 0, 1000)
            const tools = toolData.content || []
            const toolWarnings = tools
              .filter((item) => item.status === 'damaged')
              .map((item) => ({
                id: `tool-${item.toolId}`,
                name: item.name,
                status: item.status,
                title: 'CCDC bị hỏng',
                message: `${item.name} - Bị hỏng: ${item.damagedQuantity}`,
                type: 'soft_error',
                category: 'tool',
              }))
            allNotifications = [...allNotifications, ...toolWarnings]
          } catch (err) {
            console.error('Failed to load tool notifications', err)
          }
        }

        // Load pending repair requests
        if (hasAnyRole(user, [ROLES.ADMIN, ROLES.REPAIR_MANAGER, ROLES.TEAM_LEADER])) {
          try {
            const repairData = await fetchAllRepairRequests('processing')
            const requests = Array.isArray(repairData) ? repairData : []
            const requestWarnings = requests.map((req) => {
              let priorityText = ''
              let type = 'warning'
              let title = 'Yêu cầu sửa chữa mới'
              let statusLabel = 'Bảo dưỡng'

              if (req.priority === 'low') priorityText = 'mức thấp'
              else if (req.priority === 'medium') priorityText = 'mức trung bình'
              else if (req.priority === 'high') {
                priorityText = 'mức cao'
                type = 'alert'
                title = 'Cảnh báo Sự cố (Mức cao)'
                statusLabel = 'Sự cố'
              }
              else if (req.priority === 'critical') {
                priorityText = 'khẩn cấp'
                type = 'error'
                title = 'Cảnh báo Sự cố (Khẩn cấp)'
                statusLabel = 'Sự cố'
              }

              return {
                id: `req-${req.requestId}`,
                kksCode: req.equipmentKksCode,
                name: req.equipmentName,
                status: statusLabel,
                systemId: req.systemId || 'all',
                title: title,
                message: `Thiết bị ${req.equipmentName} (${req.equipmentKksCode}) có yêu cầu sửa chữa (${priorityText}).`,
                type: type,
                category: 'repair_request',
                timestamp: req.createdAt ? new Date(req.createdAt).getTime() : Date.now(),
              }
            })
            // Put repair requests at the top, since they are the most urgent/dynamic
            allNotifications = [...requestWarnings, ...allNotifications]
          } catch (err) {
            console.error('Failed to load pending repair requests', err)
          }
        } // Closing brace for if (hasAnyRole(..., [ROLES.ADMIN, ...]))

        // Fetch unread material request response notifications
        if (hasAnyRole(user, [ROLES.ADMIN, ROLES.REPAIR_MANAGER, ROLES.TEAM_LEADER])) {
          try {
            const { fetchUnreadConsumableNotificationsService, fetchUnreadSparePartNotificationsService } = await import('@/features/maintenance/services/maintenance.service.js')
            const unreadConsumable = await fetchUnreadConsumableNotificationsService()
            const unreadSparePart = await fetchUnreadSparePartNotificationsService()
            const allUnread = [...unreadConsumable, ...unreadSparePart]
            
            const responseNotifs = allUnread.map((data) => {
              const isIssued = data.status === 'issued'
              return {
                id: `ws-mat-res-${data.reqId}`,
                title: isIssued ? 'Phiếu đã được cấp phát' : 'Phiếu bị từ chối cấp phát',
                message: isIssued 
                  ? `Mã phiếu: ${data.reqNumber} đã được cấp phát bởi ${data.issuedByName}.` 
                  : `Mã phiếu: ${data.reqNumber} bị từ chối. Lý do: ${data.reason}`,
                type: isIssued ? 'success' : 'error',
                category: 'material_request_response',
                timestamp: data.timestamp,
                reqId: data.reqId,
                reqType: data.type,
              }
            })
            allNotifications = [...responseNotifs, ...allNotifications]
          } catch (err) {
            console.error('Failed to load unread material request responses', err)
          }
        }

        setNotifications(allNotifications)
      } catch (err) {
        console.error('Failed to load notifications in AppShell', err)
      }
    }

    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [user, canSeeNotifications, reloadNotifTrigger])

  // Lắng nghe sự kiện realtime qua WebSocket
  useEffect(() => {
    const canSeeRepairRequests = hasAnyRole(user, [ROLES.ADMIN, ROLES.REPAIR_MANAGER, ROLES.TEAM_LEADER])
    if (isConnected && stompClient && canSeeRepairRequests) {
      const subscription = stompClient.subscribe('/topic/repair-requests', (message) => {
        if (message.body) {
          const data = JSON.parse(message.body)
          
          let priorityText = ''
          let type = 'warning'
          let title = 'Yêu cầu sửa chữa mới'
          let statusLabel = 'Bảo dưỡng'

          if (data.priority === 'low') priorityText = 'mức thấp'
          else if (data.priority === 'medium') priorityText = 'mức trung bình'
          else if (data.priority === 'high') {
            priorityText = 'mức cao'
            type = 'alert'
            title = 'Cảnh báo Sự cố (Mức cao)'
            statusLabel = 'Sự cố'
          }
          else if (data.priority === 'critical') {
            priorityText = 'khẩn cấp'
            type = 'error'
            title = 'Cảnh báo Sự cố (Khẩn cấp)'
            statusLabel = 'Sự cố'
          }

          const newNotif = {
            id: 'ws-' + Date.now(),
            kksCode: data.equipmentKksCode,
            name: data.equipmentName,
            status: statusLabel,
            systemId: 'all',
            title: title,
            message: `Thiết bị ${data.equipmentName} (${data.equipmentKksCode}) có yêu cầu sửa chữa (${priorityText}).`,
            type: type,
            category: 'repair_request',
            timestamp: Date.now(),
            requestId: data.requestId,
          }

          // Hiện thông báo popup 5s
          setRealtimeToast(newNotif)
          setTimeout(() => {
            setRealtimeToast(null)
          }, 5000)

          // Cập nhật mảng thông báo chung
          setNotifications(prev => [newNotif, ...prev])
        }
      })
      return () => {
        subscription.unsubscribe()
      }
    }
  }, [isConnected, stompClient, canSeeNotifications, user])

  // Lắng nghe sự kiện realtime qua WebSocket cho yêu cầu cấp phát vật tư
  useEffect(() => {
    const canSeeMaterialRequests = hasAnyRole(user, [ROLES.ADMIN, ROLES.WAREHOUSE_MAT])
    if (isConnected && stompClient && canSeeMaterialRequests) {
      const subscription = stompClient.subscribe('/topic/material-requests', (message) => {
        if (message.body) {
          const data = JSON.parse(message.body)
          
          const newNotif = {
            id: 'ws-mat-' + Date.now(),
            title: 'Yêu cầu cấp phát vật tư mới',
            message: `Mã phiếu: ${data.reqNumber} vừa được tạo.`,
            type: 'info',
            category: 'material_request',
            timestamp: Date.now(),
            reqId: data.reqId,
          }

          // Hiện thông báo popup 5s
          setRealtimeToast(newNotif)
          setTimeout(() => {
            setRealtimeToast(null)
          }, 5000)

          // Cập nhật mảng thông báo chung (fetch lại pending từ DB)
          setReloadNotifTrigger(prev => prev + 1)
        }
      })
      return () => {
        subscription.unsubscribe()
      }
    }
  }, [isConnected, stompClient, user])

  // Lắng nghe sự kiện realtime phản hồi cấp phát/từ chối vật tư
  useEffect(() => {
    const canSeeResponses = hasAnyRole(user, [ROLES.ADMIN, ROLES.REPAIR_MANAGER, ROLES.TEAM_LEADER])
    if (isConnected && stompClient && canSeeResponses) {
      const subscription = stompClient.subscribe('/topic/material-request-response', (message) => {
        if (message.body) {
          const data = JSON.parse(message.body)
          
          // Chỉ hiện thông báo nếu mình là người tạo phiếu, hoặc mình là admin/repair_manager
          const currentUsername = user?.username || user?.name
          if (data.createdByUsername !== currentUsername && !hasAnyRole(user, [ROLES.ADMIN, ROLES.REPAIR_MANAGER])) {
             return
          }

          const isIssued = data.status === 'issued'
          const newNotif = {
            id: 'ws-mat-res-' + Date.now(),
            title: isIssued ? 'Phiếu đã được cấp phát' : 'Phiếu bị từ chối cấp phát',
            message: isIssued 
              ? `Mã phiếu: ${data.reqNumber} đã được cấp phát bởi ${data.issuedByName}.` 
              : `Mã phiếu: ${data.reqNumber} bị từ chối. Lý do: ${data.reason}`,
            type: isIssued ? 'success' : 'error',
            category: 'material_request_response',
            timestamp: Date.now(),
            reqId: data.reqId,
          }

          // Hiện thông báo popup 5s
          setRealtimeToast(newNotif)
          setTimeout(() => {
            setRealtimeToast(null)
          }, 5000)

          // Thêm vào danh sách thông báo để lưu trữ đến khi đọc
          setNotifications(prev => [newNotif, ...prev])
        }
      })
      return () => subscription.unsubscribe()
    }
  }, [isConnected, stompClient, user])

  const handleNotifClick = (notif) => {
    setIsNotifOpen(false)
    if (notif.category === 'material_request_response') {
      // Tự động xóa thông báo khi click vào và gọi API mark as read
      setNotifications(prev => prev.filter(n => n.id !== notif.id))
      import('@/features/maintenance/services/maintenance.service.js').then(module => {
        if (notif.reqType === 'consumable') {
          module.markConsumableNotificationReadService(notif.reqId).catch(console.error)
        } else if (notif.reqType === 'sparepart') {
          module.markSparePartNotificationReadService(notif.reqId).catch(console.error)
        }
      })
      navigate('/dashboard/maintenance/material-requests')
    } else if (notif.category === 'material') {
      navigate('/dashboard/inventory/consumable-stocks')
    } else if (notif.category === 'tool') {
      navigate('/dashboard/inventory/tools')
    } else if (notif.category === 'repair_request') {
      const requestId = notif.requestId || notif.id.replace('req-', '')
      navigate(`/dashboard/maintenance/requests?highlight=${requestId}`)
    } else if (notif.category === 'material_request') {
      navigate('/dashboard/inventory/material-dispatch')
    } else {
      navigate(`/dashboard/equipment?systemId=${notif.systemId || 'all'}`)
    }
  }
  const visibleNavItems = getVisibleSidebarItems(user)
  const visibleNavGroups = getVisibleSidebarGroups(user)
  const useGroupedNavigation = user?.roles?.includes(ROLES.ADMIN)
  const currentItem = visibleNavItems.find((item) =>
    isSidebarItemActive(location.pathname, item),
  )
  const activeNavGroupId = visibleNavGroups.find((group) =>
    group.items.some((item) => isSidebarItemActive(location.pathname, item)),
  )?.id
  const roleLabel = getPrimaryRoleLabel(user)
  const initials = getInitials(user?.name)

  function isNavGroupOpen(groupId) {
    return navGroupOpenState[groupId] ?? activeNavGroupId === groupId
  }

  function toggleNavGroup(groupId) {
    setNavGroupOpenState((current) => ({
      ...current,
      [groupId]: !(current[groupId] ?? activeNavGroupId === groupId),
    }))
  }

  function renderNavItem(item, nested = false) {
    return (
      <NavLink
        className={({ isActive }) =>
          [
            'flex items-center gap-3 rounded-md px-3 text-sm font-semibold transition',
            nested ? 'h-9' : 'h-10',
            isActive
              ? 'bg-violet-600 text-white shadow-sm shadow-violet-950/20'
              : 'text-slate-300 hover:bg-white/10 hover:text-white',
          ].join(' ')
        }
        end={item.href === '/dashboard'}
        key={item.label + item.href}
        to={item.href}
      >
        <item.icon size={nested ? 16 : 18} />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {item.href === '/dashboard/chat' && chatUnreadTotal > 0 ? (
          <span className="grid min-w-5 place-items-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {chatUnreadTotal > 99 ? '99+' : chatUnreadTotal}
          </span>
        ) : null}
      </NavLink>
    )
  }

  async function handleLogout() {
    try {
      const token = window.localStorage.getItem('scms.auth.token')
      const refreshToken = window.localStorage.getItem('scms.auth.refreshToken')

      if (token || refreshToken) {
        await apiClient.post('/auth/logout', { token, refreshToken })
      }
    } catch (e) {
      console.error('Logout API failed', e)
    } finally {
      clearStoredAuth()
      dispatch(logout())
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-20 hidden h-dvh w-72 flex-col overflow-hidden border-r border-slate-800 bg-slate-950 px-3 py-4 text-white lg:flex">
        <div className="flex shrink-0 items-center gap-3 px-2">
          <div className="grid size-9 place-items-center rounded-lg bg-violet-600 text-white">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">{env.appName}</p>
            <p className="mt-1 text-xs text-slate-300">
              {env.companyShortName}
            </p>
          </div>
        </div>

        <nav className="mt-6 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pb-2 pr-1 [scrollbar-color:rgb(71_85_105)_transparent] [scrollbar-width:thin]">
          {useGroupedNavigation
            ? visibleNavGroups.map((group) => {
                const isOpen = isNavGroupOpen(group.id)
                const isActive = activeNavGroupId === group.id
                const containsChat = group.items.some(
                  (item) => item.href === '/dashboard/chat',
                )

                return (
                  <div key={group.id}>
                    <button
                      aria-controls={`sidebar-group-${group.id}`}
                      aria-expanded={isOpen}
                      className={[
                        'flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold transition',
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white',
                      ].join(' ')}
                      onClick={() => toggleNavGroup(group.id)}
                      type="button"
                    >
                      <group.icon size={18} />
                      <span className="min-w-0 flex-1 truncate text-left">
                        {group.label}
                      </span>
                      {containsChat && chatUnreadTotal > 0 && !isOpen ? (
                        <span className="grid min-w-5 place-items-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {chatUnreadTotal > 99 ? '99+' : chatUnreadTotal}
                        </span>
                      ) : null}
                      <ChevronDown
                        className={[
                          'shrink-0 transition-transform duration-200',
                          isOpen ? 'rotate-180' : '',
                        ].join(' ')}
                        size={16}
                      />
                    </button>

                    {isOpen ? (
                      <div
                        className="ml-4 mt-1 space-y-1 border-l border-slate-800 pl-2"
                        id={`sidebar-group-${group.id}`}
                      >
                        {group.items.map((item) => renderNavItem(item, true))}
                      </div>
                    ) : null}
                  </div>
                )
              })
            : visibleNavItems.map((item) => renderNavItem(item))}
        </nav>

        <div className="mt-4 shrink-0 border-t border-slate-800 pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="grid size-9 place-items-center rounded-full bg-violet-600 text-sm font-bold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {user?.name || 'Guest user'}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-300">{roleLabel}</p>
            </div>
          </div>
          <Button
            className="mt-4 w-full border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
            onClick={handleLogout}
            size="sm"
            variant="secondary"
          >
            <LogOut size={16} />
            Đăng xuất
          </Button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div>
              <p className="text-base font-semibold text-slate-950">
                {currentItem?.label || 'Dashboard'}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 lg:hidden">
                {roleLabel}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Button 
                  className="relative" 
                  size="icon" 
                  variant="ghost"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                >
                  <Bell size={18} />
                  {notifications.length > 0 && (
                    <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-red-600 text-[10px] font-bold text-white animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                </Button>

                {isNotifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-[380px] rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                      <div className="border-b border-slate-100 px-3 py-2 text-xs font-bold text-slate-900 uppercase tracking-wider flex justify-between items-center">
                        <span>Thông báo cảnh báo ({notifications.length})</span>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto mt-1 divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <div className="px-3 py-4 text-center text-xs text-slate-500 italic">
                            Không có cảnh báo nào hiện tại.
                          </div>
                        ) : (
                          <>
                            {(showAllNotifs ? notifications : notifications.slice(0, 15)).map((notif) => {
                              let dotColor = 'bg-amber-500'
                              let textColor = 'text-amber-700'
                              let bgColor = 'hover:bg-slate-50'
                              let messageColor = 'text-slate-600'
                              let timeColor = 'text-slate-400'
                              
                              if (notif.type === 'error') {
                                bgColor = 'bg-red-600 hover:bg-red-700 mb-1'
                                dotColor = 'bg-white animate-pulse'
                                textColor = 'text-white'
                                messageColor = 'text-white/90'
                                timeColor = 'text-red-200'
                              } else if (notif.type === 'alert') {
                                bgColor = 'bg-orange-500 hover:bg-orange-600 mb-1'
                                dotColor = 'bg-white animate-pulse'
                                textColor = 'text-white'
                                messageColor = 'text-white/90'
                                timeColor = 'text-orange-200'
                              } else if (notif.type === 'info') {
                                bgColor = 'bg-blue-50 hover:bg-blue-100 mb-1'
                                dotColor = 'bg-blue-500 animate-pulse'
                                textColor = 'text-blue-800'
                                messageColor = 'text-slate-600'
                                timeColor = 'text-slate-400'
                              } else if (notif.type === 'soft_error') {
                                bgColor = 'bg-red-50 hover:bg-red-100 mb-1'
                                dotColor = 'bg-red-600 animate-pulse'
                                textColor = 'text-red-700'
                                messageColor = 'text-slate-700'
                                timeColor = 'text-slate-400'
                              } else if (notif.type === 'success') {
                                bgColor = 'bg-emerald-50 hover:bg-emerald-100 mb-1'
                                dotColor = 'bg-emerald-500 animate-pulse'
                                textColor = 'text-emerald-800'
                                messageColor = 'text-slate-700'
                                timeColor = 'text-slate-500'
                              }
                              
                              return (
                                <button
                                  key={notif.id}
                                  onClick={() => handleNotifClick(notif)}
                                  className={`w-full text-left px-3 py-2.5 transition rounded-md block text-xs cursor-pointer ${bgColor}`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className={`inline-block size-2 rounded-full shrink-0 ${dotColor}`} />
                                    <p className={`font-semibold ${textColor}`}>
                                      {notif.title}
                                    </p>
                                    {notif.timestamp && (
                                      <span className={`ml-auto text-[10px] ${timeColor}`}>
                                        {new Date(notif.timestamp).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                      </span>
                                    )}
                                  </div>
                                  <p className={`mt-0.5 leading-normal pl-[18px] ${messageColor}`}>{notif.message}</p>
                                </button>
                              )
                            })}
                            
                            {!showAllNotifs && notifications.length > 15 && (
                              <button
                                onClick={() => setShowAllNotifs(true)}
                                className="w-full text-center px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                              >
                                Hiển thị thêm ({notifications.length - 15} thông báo)
                              </button>
                            )}
                            
                            {showAllNotifs && notifications.length > 15 && (
                              <button
                                onClick={() => setShowAllNotifs(false)}
                                className="w-full text-center px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                              >
                                Thu gọn
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-full bg-violet-600 text-sm font-bold text-white">
                  {initials}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-950">
                    {user?.name || 'Guest user'}
                  </p>
                  <p className="text-xs text-slate-500">{roleLabel}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>

      {/* Realtime Toast Notification */}
      {realtimeToast && (
        <div className={`fixed bottom-4 right-4 z-[999] animate-in slide-in-from-right fade-in duration-300 w-80 rounded-lg border-l-4 p-4 shadow-xl ${
          realtimeToast.type === 'error' ? 'bg-red-600 border-red-800 text-white' : 
          realtimeToast.type === 'alert' ? 'bg-orange-500 border-orange-700 text-white' : 
          realtimeToast.type === 'success' ? 'bg-emerald-600 border-emerald-800 text-white' :
          realtimeToast.type === 'info' ? 'bg-white border-blue-500 text-slate-900' :
          'bg-white border-amber-500 text-slate-900'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 rounded-full p-1 ${
              realtimeToast.type === 'error' ? 'bg-red-700' : 
              realtimeToast.type === 'alert' ? 'bg-orange-600' : 
              realtimeToast.type === 'success' ? 'bg-emerald-700' :
              realtimeToast.type === 'info' ? 'bg-blue-100' : 'bg-amber-100'
            }`}>
              <Bell className={
                realtimeToast.type === 'error' || realtimeToast.type === 'alert' || realtimeToast.type === 'success' ? 'text-white' : 
                realtimeToast.type === 'info' ? 'text-blue-600' : 'text-amber-600'
              } size={16} />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${
                realtimeToast.type === 'error' || realtimeToast.type === 'alert' || realtimeToast.type === 'success' ? 'text-white' : 'text-slate-900'
              }`}>{realtimeToast.title}</h4>
              <p className={`mt-1 text-xs ${
                realtimeToast.type === 'error' || realtimeToast.type === 'alert' || realtimeToast.type === 'success' ? 'text-white/90' : 'text-slate-600'
              }`}>{realtimeToast.message}</p>
            </div>
            <button
              onClick={() => setRealtimeToast(null)}
              className={`ml-auto ${
                realtimeToast.type === 'error' || realtimeToast.type === 'alert' || realtimeToast.type === 'success' ? 'text-white/70 hover:text-white' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="sr-only">Close</span>
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function getInitials(name = '') {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(-2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'S'
  )
}
