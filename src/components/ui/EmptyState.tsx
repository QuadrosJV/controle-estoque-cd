import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] mb-4">
        {icon}
      </div>
      <p className="text-sm font-medium text-[var(--foreground)] mb-1">{title}</p>
      {description && (
        <p className="text-xs text-[var(--muted-foreground)] max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
