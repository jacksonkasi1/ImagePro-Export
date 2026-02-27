import { h } from 'preact';

// ** import utils
import { cn } from '@/lib/utils';

// ** import types
import { AIRenameStatus } from '@/types/ai';

interface AIStatusBadgeProps {
  status: AIRenameStatus;
  newName?: string;
}

const statusConfig: Record<AIRenameStatus, { label: string; classes: string }> = {
  idle: {
    label: '—',
    classes: 'text-secondary-text',
  },
  pending: {
    label: '⏳',
    classes: 'text-brand-bg animate-pulse',
  },
  done: {
    label: '✓',
    classes: 'text-green-500',
  },
  error: {
    label: '✕',
    classes: 'text-red-500',
  },
};

const AIStatusBadge = ({ status, newName }: AIStatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-1 shrink-0">
      <span className={cn('text-xs font-medium', config.classes)}>{config.label}</span>
      {status === 'done' && newName && (
        <span className="text-xs text-secondary-text truncate max-w-[80px]" title={newName}>
          {newName}
        </span>
      )}
    </div>
  );
};

export default AIStatusBadge;
