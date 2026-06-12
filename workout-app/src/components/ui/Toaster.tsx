import { CheckCircle2, Info, Trophy, AlertTriangle, X } from 'lucide-react';
import { useToastStore, type ToastKind } from '../../stores/toastStore';

const kindStyles: Record<ToastKind, { border: string; icon: typeof Info }> = {
  success: { border: 'border-l-success', icon: CheckCircle2 },
  info: { border: 'border-l-accent', icon: Info },
  pr: { border: 'border-l-accent-alt', icon: Trophy },
  error: { border: 'border-l-danger', icon: AlertTriangle },
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2 w-80">
      {toasts.map((t) => {
        const { border, icon: Icon } = kindStyles[t.kind];
        return (
          <div
            key={t.id}
            className={`bg-surface-alt border border-border border-l-[3px] ${border} rounded-sm px-3 py-2.5 flex items-center gap-2.5 shadow-lg`}
          >
            <Icon size={16} className="shrink-0 text-text-secondary" />
            <span className="text-sm text-text-primary flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-text-muted hover:text-text-primary">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
