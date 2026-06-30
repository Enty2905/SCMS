import { clsx } from 'clsx'

const variants = {
  primary:
    'bg-zinc-950 text-white hover:bg-zinc-800 focus-visible:ring-zinc-950/20',
  secondary:
    'border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-100 focus-visible:ring-zinc-400/20',
  ghost:
    'bg-transparent text-zinc-700 hover:bg-zinc-100 focus-visible:ring-zinc-400/20',
}

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  icon: 'size-10 justify-center p-0',
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-md font-semibold outline-none transition focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      type={type}
      {...props}
    />
  )
}
