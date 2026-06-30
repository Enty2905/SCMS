import { ChevronDown, Eye, EyeOff, KeyRound, UserRound, Zap } from 'lucide-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

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
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const result = await dispatch(login({ username, password }))

    if (login.fulfilled.match(result)) {
      navigate('/dashboard')
    }
  }

  function fillDemoAccount() {
    setUsername('admin')
    setPassword('password')
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0f1b2f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(79,70,229,0.2),transparent_28%),linear-gradient(115deg,#0e1728_0%,#1d3b60_48%,#102036_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />

      <section className="relative z-10 flex min-h-screen flex-col items-center px-4 py-10 sm:px-6">
        <div className="mt-8 flex flex-col items-center text-center sm:mt-16">
          <div className="grid size-16 place-items-center rounded-2xl bg-violet-600 shadow-[0_18px_45px_rgba(99,102,241,0.35)]">
            <Zap size={32} strokeWidth={2.4} />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            SCMS
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Hệ thống quản lý thiết bị, sửa chữa và bảo dưỡng
            <span className="block">Nhà máy nhiệt điện</span>
          </p>
        </div>

        <div className="mt-9 w-full max-w-md rounded-2xl bg-white p-8 text-slate-950 shadow-[0_28px_80px_rgba(2,8,23,0.38)] ring-1 ring-white/70 sm:p-9">
          <h2 className="text-2xl font-bold tracking-tight">
            Đăng nhập hệ thống
          </h2>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Tên đăng nhập
              </span>
              <span className="relative mt-2 block">
                <UserRound
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  autoComplete="username"
                  className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  type="text"
                  value={username}
                />
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Password
              </span>
              <span className="relative mt-2 block">
                <KeyRound
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  autoComplete="current-password"
                  className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-12 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nhập mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                />
                <button
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  onClick={() => setShowPassword((value) => !value)}
                  type="button"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <button
              className="h-12 w-full rounded-lg bg-violet-600 text-base font-bold text-white shadow-[0_12px_30px_rgba(109,40,217,0.25)] transition hover:bg-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/25 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <button
            className="mt-5 flex h-11 w-full items-center justify-between rounded-lg border border-dashed border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
            onClick={fillDemoAccount}
            type="button"
          >
            <span>Tài khoản demo (dành cho thử nghiệm)</span>
            <ChevronDown size={17} />
          </button>
        </div>

        <p className="mt-7 text-center text-xs text-slate-400">
          © 2026 SCMS — Nhà máy Nhiệt điện. Phiên bản 1.0
        </p>
      </section>
    </main>
  )
}
