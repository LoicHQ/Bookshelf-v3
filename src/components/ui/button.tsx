import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-base font-semibold transition-ios disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-ios-sm hover:bg-primary/90 active:bg-primary/95',
        destructive:
          'bg-red-500 text-white shadow-ios-sm hover:bg-red-600 active:bg-red-700',
        outline:
          'border border-border/40 glass-card hover:bg-accent/50 active:bg-accent',
        secondary: 'bg-secondary text-foreground shadow-ios-sm hover:bg-secondary/80 active:bg-secondary/70',
        ghost: 'hover:bg-accent/50 active:bg-accent',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-10 rounded-xl px-4 text-sm',
        lg: 'h-14 rounded-2xl px-8 text-lg',
        icon: 'size-12 rounded-2xl',
        'icon-sm': 'size-10 rounded-xl',
        'icon-lg': 'size-14 rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
