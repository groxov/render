import { RequestStatus, Priority } from '../../types';
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from '../../constants';
import { cn } from '../ui/utils';

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center rounded-full px-3 py-1 text-xs font-medium leading-5',
        STATUS_COLORS[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center rounded-full px-3 py-1 text-xs font-medium leading-5',
        PRIORITY_COLORS[priority],
        className,
      )}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
