import { ADMIN_NAV_ITEMS } from '../../config/navigation';
import { AdminPageType } from '../../types';
import { cn } from '../ui/utils';

interface SidebarProps {
  currentPage: AdminPageType;
  onNavigate: (page: AdminPageType) => void;
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ currentPage, onNavigate, isOpen, onClose }: SidebarProps) {
  let currentSection: string | undefined;

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-[min(18.5rem,calc(100vw-1rem))] flex-col border-r border-slate-800/80 bg-[linear-gradient(180deg,rgba(2,6,23,0.98)_0%,rgba(5,12,32,0.98)_100%)] px-3 pb-3 pt-18 shadow-[0_24px_80px_-34px_rgba(2,6,23,0.78)] transition-transform duration-300 lg:w-[18.5rem] lg:translate-x-0 lg:pt-20',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-4 text-slate-300">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Операционный центр
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Все ключевые действия по приему, распределению и контролю заявок в одном месте.
        </p>
      </div>

      <nav className="sidebar-scrollbar mt-6 flex-1 overflow-y-auto pr-2">
        {ADMIN_NAV_ITEMS.map((item, index) => {
          const showSection = item.section && item.section !== currentSection;

          if (showSection) {
            currentSection = item.section;
          }

          const Icon = item.icon;

          return (
            <div key={item.id} className={cn(index < ADMIN_NAV_ITEMS.length - 1 && 'mb-1.5')}>
              {showSection ? (
                <div className="px-2 pb-2 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                    {item.section}
                  </p>
                </div>
              ) : null}

              <button
                onClick={() => {
                  onNavigate(item.id);
                  onClose?.();
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-[18px] px-3.5 py-3 text-left text-sm font-medium transition',
                  currentPage === item.id
                    ? 'border border-white/6 bg-white/[0.045] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                    : 'text-slate-300 hover:bg-white/[0.06] hover:text-white',
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                    currentPage === item.id
                      ? 'bg-gradient-to-br from-[#7c3aed] to-[#2563eb] text-white shadow-[0_12px_24px_-18px_rgba(37,99,235,0.82)]'
                      : 'bg-white/[0.07]',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="truncate">{item.label}</span>
              </button>
            </div>
          );
        })}
      </nav>

      <div className="mt-4 hidden rounded-2xl border border-white/10 bg-white/[0.045] p-4 sm:block">
        <p className="text-sm font-semibold text-white">Приоритет дня</p>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Держите в фокусе новые заявки и обращения со статусом «Ожидание запчастей», чтобы не
          терять темп обработки.
        </p>
      </div>
    </aside>
  );
}
