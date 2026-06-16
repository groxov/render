import { ReactNode } from 'react';
import { cn } from '../ui/utils';

interface PageIntroProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageIntro({
  title,
  description,
  eyebrow,
  actions,
  className,
}: PageIntroProps) {
  return (
    <section
      className={cn(
        'flex flex-col gap-4 rounded-[18px] border border-white/70 bg-white/82 p-4 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.42)] backdrop-blur sm:rounded-[24px] sm:p-6 lg:flex-row lg:items-end lg:justify-between lg:p-8',
        className,
      )}
    >
      <div className="min-w-0 max-w-3xl">
        {eyebrow ? <p className="app-eyebrow mb-3">{eyebrow}</p> : null}
        <h1 className="text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">{actions}</div> : null}
    </section>
  );
}
