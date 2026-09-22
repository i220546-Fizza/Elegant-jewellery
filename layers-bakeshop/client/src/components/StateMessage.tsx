import type { LucideIcon } from 'lucide-react';

interface StateMessageProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export default function StateMessage({ icon: Icon, title, description, action }: StateMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <Icon size={44} className="text-layers-accent-soft" strokeWidth={1.25} />
      <h3 className="font-display text-xl text-layers-ink">{title}</h3>
      {description && <p className="max-w-sm text-sm text-layers-muted">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 rounded-full bg-layers-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-layers-primary-hover"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
