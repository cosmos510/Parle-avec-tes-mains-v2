import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Description d'erreur pour aria-describedby */
  errorId?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, errorId, 'aria-invalid': ariaInvalid, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          ariaInvalid && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        ref={ref}
        aria-invalid={ariaInvalid}
        aria-describedby={errorId}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
