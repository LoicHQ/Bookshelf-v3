'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFilterClick?: () => void;
  showFilter?: boolean;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Rechercher...',
  onFilterClick,
  showFilter = true,
  className,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'bg-secondary/80 flex items-center gap-2 rounded-2xl px-4 transition-all duration-200',
          isFocused && 'bg-secondary ring-primary/20 ring-2'
        )}
      >
        <Search className="text-muted-foreground h-5 w-5 flex-shrink-0" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="placeholder:text-muted-foreground h-11 flex-1 border-0 bg-transparent px-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                onChange('');
                inputRef.current?.focus();
              }}
              className="hover:bg-muted rounded-full p-1"
            >
              <X className="text-muted-foreground h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
        {showFilter && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onFilterClick}
            className="h-8 w-8 rounded-full"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
