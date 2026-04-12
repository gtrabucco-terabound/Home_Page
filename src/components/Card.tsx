import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
      className={cn(
        'bg-[var(--card)]/80 backdrop-blur-md border border-[var(--border)] rounded-2xl p-6 shadow-sm opacity-65',
        hover && 'hover:shadow-md hover:border-[var(--primary)]/30 transition-shadow',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
