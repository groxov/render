import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '../ui/utils';

type DataStatusVariant = 'info' | 'warning' | 'success';

interface DataStatusNoticeProps {
  variant?: DataStatusVariant;
  title?: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<
  DataStatusVariant,
  {
    wrapper: string;
    iconWrapper: string;
    icon: ReactNode;
  }
> = {
  info: {
    wrapper: 'border-blue-100/80 bg-blue-50/55 text-slate-700',
    iconWrapper: 'bg-white text-blue-700',
    icon: <Info className="h-4 w-4" />,
  },
  warning: {
    wrapper: 'border-amber-100/80 bg-amber-50/70 text-slate-700',
    iconWrapper: 'bg-white text-amber-700',
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  success: {
    wrapper: 'border-emerald-100/80 bg-emerald-50/70 text-slate-700',
    iconWrapper: 'bg-white text-emerald-700',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
};

export function DataStatusNotice({
  variant = 'info',
  title,
  description,
  action,
  className,
}: DataStatusNoticeProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      className={cn(
        'app-panel-soft flex flex-col gap-4 border px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5',
        styles.wrapper,
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm sm:rounded-2xl', styles.iconWrapper)}>
          {styles.icon}
        </div>
        <div className="min-w-0 space-y-1">
          {title ? <p className="text-sm font-semibold text-slate-900">{title}</p> : null}
          <div className="text-sm leading-6 text-slate-600">{description}</div>
        </div>
      </div>

      {action ? <div className="w-full sm:w-auto sm:shrink-0">{action}</div> : null}
    </div>
  );
}
