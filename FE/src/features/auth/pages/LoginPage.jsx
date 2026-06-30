import { Boxes, KeyRound, Mail } from 'lucide-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/components/ui/Button.jsx'
import { login } from '../store/auth.thunks.js'
import {
  selectAuthError,
  selectAuthLoading,
} from '../store/auth.selectors.js'

export function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const loading = useSelector(selectAuthLoading)
  const error = useSelector(selectAuthError)
  const [email, setEmail] = useState('ops@scms.local')
  const [password, setPassword] = useState('password')

  async function handleSubmit(event) {
    event.preventDefault()
    const result = await dispatch(login({ email, password }))

    if (login.fulfilled.match(result)) {
      navigate('/')
    }
  }

  return (
    <main className="grid min-h-screen bg-stone-50 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex items-center px-5 py-10 sm:px-8 lg:px-14">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-lg bg-emerald-600 text-white">
              <Boxes size={22} />
            </div>
            <div>
              <p className="text-base font-semibold">SCMS Console</p>
              <p className="text-sm text-zinc-500">Sign in to continue</p>
            </div>
          </div>

          <h1 className="text-3xl font-semibold text-zinc-950">
            Manage supply operations from one focused workspace.
          </h1>
          <p className="mt-3 text-base leading-7 text-zinc-600">
            Use this starter to build SCMS modules for users, equipment,
            materials, work orders, and reports.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Email</span>
              <span className="relative mt-2 block">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  size={18}
                />
                <input
                  className="h-11 w-full rounded-md border border-zinc-200 bg-white pl-10 pr-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  value={email}
                />
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">
                Password
              </span>
              <span className="relative mt-2 block">
                <KeyRound
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  size={18}
                />
                <input
                  className="h-11 w-full rounded-md border border-zinc-200 bg-white pl-10 pr-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  value={password}
                />
              </span>
            </label>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <Button className="w-full" disabled={loading} type="submit">
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </section>

      <section className="hidden min-h-screen bg-zinc-950 p-8 text-white lg:block">
        <div className="flex h-full flex-col justify-between rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(14,165,233,0.12),rgba(255,255,255,0.03))] p-8">
          <p className="text-sm font-medium text-emerald-200">
            SCMS foundation
          </p>
          <p className="max-w-lg text-4xl font-semibold leading-tight">
            Feature modules, Redux state, shared services, and Tailwind styling
            are ready for project work.
          </p>
        </div>
      </section>
    </main>
  )
}
