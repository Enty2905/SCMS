import { ChevronDown, Eye, EyeOff, KeyRound, UserRound, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { login } from '../store/auth.thunks.js'
import { MAX_LOGIN_ATTEMPTS } from '../store/auth.constants.js'
import { clearLoginLock } from '../store/auth.reducer.js'
import {
  selectAuthError,
  selectAuthLoading,
  selectFailedLoginAttempts,
  selectLockedUntil,
} from '../store/auth.selectors.js'
import './LoginPage.scss'

export function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const loading = useSelector(selectAuthLoading)
  const error = useSelector(selectAuthError)
  const failedAttempts = useSelector(selectFailedLoginAttempts)
  const lockedUntil = useSelector(selectLockedUntil)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  const remainingLockSeconds = lockedUntil
    ? Math.max(0, Math.ceil((lockedUntil - now) / 1000))
    : 0
  const isLocked = remainingLockSeconds > 0
  const remainingAttempts = Math.max(0, MAX_LOGIN_ATTEMPTS - failedAttempts)

  useEffect(() => {
    if (!lockedUntil) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      const currentTime = Date.now()
      setNow(currentTime)

      if (currentTime >= lockedUntil) {
        dispatch(clearLoginLock())
      }
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [dispatch, lockedUntil])

  async function handleSubmit(event) {
    event.preventDefault()

    if (isLocked) {
      return
    }

    const result = await dispatch(login({ username, password }))

    if (login.fulfilled.match(result)) {
      navigate('/dashboard')
    }
  }

  function fillDemoAccount() {
    if (isLocked) {
      return
    }

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
                  disabled={isLocked}
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
                  disabled={isLocked}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nhập mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                />
                <button
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="login-form__toggle"
                  disabled={isLocked}
                  onClick={() => setShowPassword((value) => !value)}
                  type="button"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error ? <p className="login-form__error">{error}</p> : null}
            {!isLocked && failedAttempts > 0 ? (
              <p className="login-form__hint">
                Còn {remainingAttempts} lần thử trước khi tạm khóa đăng nhập.
              </p>
            ) : null}
            {isLocked ? (
              <p className="login-form__lock">
                Vui lòng thử lại sau {remainingLockSeconds} giây.
              </p>
            ) : null}

            <button
              className="login-form__submit"
              disabled={loading || isLocked}
              type="submit"
            >
              {isLocked
                ? `Tạm khóa ${remainingLockSeconds}s`
                : loading
                  ? 'Đang đăng nhập...'
                  : 'Đăng nhập'}
            </button>
          </form>

          <button
            className="login-card__demo"
            disabled={isLocked}
            onClick={fillDemoAccount}
            type="button"
          >
            <span>Tài khoản demo (dành cho thử nghiệm)</span>
            <ChevronDown size={17} />
          </button>
        </div>

        <p className="login-page__footer">
          © 2026 SCMS — Nhà máy Nhiệt điện. Code by team 2 TBNNH
        </p>
      </section>
    </main>
  )
}
