import { ReactNode } from 'react';
import { cn } from '../ui/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  description?: string;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  iconBgColor = 'bg-gradient-to-br from-purple-100 to-blue-100',
  iconColor = 'text-purple-600',
  description,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'group app-panel p-4 transition duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-[0_22px_52px_-36px_rgba(37,99,235,0.38)] sm:p-5 xl:p-6',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 break-words text-2xl font-semibold leading-tight text-slate-950 transition duration-200 group-hover:text-blue-700 sm:text-3xl xl:text-4xl">
            {value}
          </p>
          {description ? (
            <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
          ) : null}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition duration-200 group-hover:scale-[1.03] sm:h-14 sm:w-14 xl:h-16 xl:w-16',
            iconBgColor,
          )}
        >
          <div className={cn('flex h-7 w-7 items-center justify-center sm:h-8 sm:w-8', iconColor)}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
