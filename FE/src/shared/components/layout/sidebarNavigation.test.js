import { describe, expect, it } from 'vitest'

import { ROLES } from '@/features/auth/utils/roles.js'
import {
  getVisibleSidebarGroups,
  isSidebarItemActive,
} from './sidebarNavigation.js'

describe('sidebarNavigation', () => {
  it('groups every admin page without duplicating routes', () => {
    const groups = getVisibleSidebarGroups({ roles: [ROLES.ADMIN] })
    const hrefs = groups.flatMap((group) => group.items.map((item) => item.href))

    expect(groups.map((group) => group.label)).toEqual([
      'Chat',
      'Nhân sự',
      'Thủ kho vật tư',
      'Thủ kho CCDC',
      'Vận hành',
      'Sửa chữa',
    ])
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })

  it('only returns shared and HR groups for an HR account', () => {
    const groups = getVisibleSidebarGroups({ roles: [ROLES.HR] })

    expect(groups.map((group) => group.label)).toEqual(['Chat', 'Nhân sự'])
  })

  it('recognizes nested pages as active', () => {
    expect(
      isSidebarItemActive('/dashboard/hr/employees/employee-01', {
        href: '/dashboard/hr/employees',
      }),
    ).toBe(true)
  })
})
