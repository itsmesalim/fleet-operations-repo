// Reusable Card component
import React from 'react';
import { cn } from '../../utils/helpers';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Card component for content containers
 */
export function Card({ children, className, padding = 'md' }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  };

  return (
    <div
      className={cn(
        'premium-card premium-card-strong rounded-[24px] transition-all duration-300',
        'hover:-translate-y-0.5 hover:shadow-[var(--app-shadow-strong)]',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
