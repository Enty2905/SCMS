import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { App } from './App.jsx'

describe('App', () => {
  it('renders the login route first', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /đăng nhập hệ thống/i }),
    ).toBeInTheDocument()
  })
})
