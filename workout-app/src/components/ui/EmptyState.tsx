import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  headline: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, headline, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <Icon size={40} className="text-text-muted mb-4" />
      <h3 className="text-base font-extrabold text-text-primary mb-1">{headline}</h3>
      {description && <p className="text-sm text-text-secondary max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
