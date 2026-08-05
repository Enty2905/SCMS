import { describe, expect, it, vi } from 'vitest'

import { createUuid } from './uuid.js'

describe('createUuid', () => {
  it('uses randomUUID when the browser supports it', () => {
    const randomUUID = vi.fn(() => '11111111-2222-4333-8444-555555555555')

    expect(createUuid({ randomUUID })).toBe(
      '11111111-2222-4333-8444-555555555555',
    )
    expect(randomUUID).toHaveBeenCalledOnce()
  })

  it('creates a valid UUID v4 when randomUUID is unavailable', () => {
    const cryptoApi = {
      getRandomValues(bytes) {
        bytes.fill(0xab)
        return bytes
      },
    }

    expect(createUuid(cryptoApi)).toBe('abababab-abab-4bab-abab-abababababab')
  })

  it('keeps a valid UUID fallback without Web Crypto', () => {
    expect(createUuid(null, () => 0)).toBe(
      '00000000-0000-4000-8000-000000000000',
    )
  })
})
