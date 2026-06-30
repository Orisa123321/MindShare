import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className = '', id: externalId, ...props }, ref) => {
    const generatedId = useId();
    const inputId = externalId || generatedId;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium pl-0.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none transition-colors duration-200"
              style={{ color: 'var(--text-muted)' }}
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full rounded-xl px-4 py-3 text-sm font-medium',
              'border outline-none',
              'transition-all duration-200 ease-out',
              'placeholder:font-normal',
              leftIcon ? 'pl-11' : '',
              error
                ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-2 focus:ring-[var(--color-danger)]/20'
                : 'border-[var(--border)] focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
              className,
            ].join(' ')}
            style={{
              background: 'var(--surface-2)',
              color: 'var(--text)',
            }}
            {...props}
          />
          {/* Animated focus glow */}
          <div
            className={[
              'absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300',
              'group-focus-within:opacity-100',
            ].join(' ')}
            style={{
              boxShadow: error
                ? '0 0 0 3px rgba(255, 107, 107, 0.1)'
                : '0 0 0 3px rgba(108, 92, 231, 0.08)',
            }}
          />
        </div>
        {error && (
          <p
            className="text-xs font-medium pl-0.5 animate-slide-down"
            style={{ color: 'var(--color-danger)' }}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
