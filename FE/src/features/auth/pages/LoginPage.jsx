import { ChevronDown, Eye, EyeOff, KeyRound, UserRound, Zap } from 'lucide-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { login } from '../store/auth.thunks.js'
import {
  selectAuthError,
  selectAuthLoading,
} from '../store/auth.selectors.js'
import './LoginPage.scss'

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
    <main className="login-page">
      <div className="login-page__background" />
      <div className="login-page__top-line" />

      <section className="login-page__content" aria-labelledby="login-title">
        <header className="login-page__brand">
          <div className="login-page__logo" aria-hidden="true">
            <Zap size={32} strokeWidth={2.4} />
          </div>
          <h1>SCMS</h1>
          <p>
            Hệ thống quản lý thiết bị, sửa chữa và bảo dưỡng
            <span>Nhà máy nhiệt điện</span>
          </p>
        </header>

        <div className="login-card">
          <h2 id="login-title">Đăng nhập hệ thống</h2>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-form__field">
              <span>Tên đăng nhập</span>
              <div className="login-form__control">
                <UserRound className="login-form__icon" size={18} />
                <input
                  autoComplete="username"
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  type="text"
                  value={username}
                />
              </div>
            </label>

            <label className="login-form__field">
              <span>Mật khẩu</span>
              <div className="login-form__control">
                <KeyRound className="login-form__icon" size={18} />
                <input
                  autoComplete="current-password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nhập mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                />
                <button
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="login-form__toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  type="button"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error ? <p className="login-form__error">{error}</p> : null}

            <button
              className="login-form__submit"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <button
            className="login-card__demo"
            onClick={fillDemoAccount}
            type="button"
          >
            <span>Tài khoản demo (dành cho thử nghiệm)</span>
            <ChevronDown size={17} />
          </button>
        </div>

        <p className="login-page__footer">
          © 2026 SCMS — Nhà máy Nhiệt điện. Phiên bản 1.0
        </p>
      </section>
    </main>
  )
}
