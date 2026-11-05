import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-primary text-white shadow-lg shadow-primary/25 hover:brightness-110 active:brightness-95 border border-transparent',
  secondary: 'bg-elevated text-ink border border-line hover:bg-elevated-hover hover:border-line-strong',
  ghost: 'text-muted hover:text-ink hover:bg-elevated border border-transparent',
  danger: 'bg-critical/10 text-critical border border-critical/25 hover:bg-critical/20',
  success: 'bg-success/10 text-success border border-success/25 hover:bg-success/20',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-5 text-sm gap-2 rounded-xl',
  icon: 'h-9 w-9 rounded-lg justify-center',
};

/**
 * Reusable button.
 * @param {'primary'|'secondary'|'ghost'|'danger'|'success'} variant
 * @param {'sm'|'md'|'lg'|'icon'} size
 * @param {React.ComponentType} icon - optional Lucide icon shown before the label
 * @param {boolean} loading - shows a spinner and disables the button
 * @param {string} to - when set, renders a React Router <Link> styled as a button
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled,
  className = '',
  children,
  type = 'button',
  to,
  ...props
}) {
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const classes = `inline-flex items-center justify-center font-semibold whitespace-nowrap transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
  const content = (
    <>
      {loading ? <Loader2 className={`${iconSize} animate-spin`} /> : Icon && <Icon className={iconSize} />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled || loading} className={classes} {...props}>
      {content}
    </button>
  );
}
