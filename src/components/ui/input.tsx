import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary/20 selection:text-foreground',
        'h-14 w-full min-w-0 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm',
        'px-4 py-3 text-[17px] transition-all duration-200',
        'outline-none',
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus:border-primary focus:bg-card focus:shadow-sm',
        'aria-invalid:border-red-500',
        className
      )}
      {...props}
    />
  );
}

export { Input };
