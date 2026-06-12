import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Hex color for the left-border accent (phase/status indicators). */
  accentColor?: string;
  padded?: boolean;
}

export function Card({ children, accentColor, padded = true, className = '', style, ...rest }: CardProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-sm ${padded ? 'p-4' : ''} ${className}`}
      style={accentColor ? { borderLeft: `3px solid ${accentColor}`, ...style } : style}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="section-label">{title}</h3>
      {action}
    </div>
  );
}
