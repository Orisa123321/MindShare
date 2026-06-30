import { forwardRef, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-7 py-3.5 text-base gap-2.5 rounded-xl',
};

const iconSizes: Record<string, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const baseClasses = [
      'relative inline-flex items-center justify-center font-semibold',
      'transition-all duration-200 ease-out',
      'active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
      'select-none cursor-pointer',
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      isDisabled ? 'opacity-50 pointer-events-none cursor-not-allowed' : '',
    ].join(' ');

    const variantClasses: Record<string, string> = {
      primary: [
        'bg-gradient-to-br from-primary-500 to-primary-600 text-white',
        'hover:from-primary-400 hover:to-primary-500',
        'hover:shadow-[0_0_20px_rgba(108,92,231,0.4)]',
        'border border-primary-400/20',
      ].join(' '),
      secondary: [
        'border border-secondary-400 bg-transparent',
        'hover:bg-secondary-400/10',
        'active:bg-secondary-400/20',
      ].join(' '),
      ghost: [
        'bg-transparent',
        'hover:bg-[var(--surface-2)]',
        'active:bg-[var(--surface-3)]',
      ].join(' '),
      danger: [
        'bg-gradient-to-br from-red-500 to-red-600 text-white',
        'hover:from-red-400 hover:to-red-500',
        'hover:shadow-[0_0_20px_rgba(255,107,107,0.3)]',
        'border border-red-400/20',
      ].join(' '),
    };

    const spinnerSize = iconSizes[size];

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        disabled={isDisabled}
        style={{
          color:
            variant === 'secondary'
              ? 'var(--color-secondary-400)'
              : variant === 'ghost'
              ? 'var(--text)'
              : undefined,
        }}
        {...props}
      >
        {isLoading && (
          <Loader2
            size={spinnerSize}
            className="animate-spin shrink-0"
          />
        )}
        {!isLoading && leftIcon && (
          <span className="shrink-0 flex items-center">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && (
          <span className="shrink-0 flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
