import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { App } from './App.jsx'

describe('App', () => {
  it('renders the dashboard route', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /supply chain overview/i }),
    ).toBeInTheDocument()
  })
})
