import { LogOut, Menu, ShieldCheck, User2 } from 'lucide-react';
import { PageType, UserType } from '../../types';
import { AppBrand } from '../common/AppBrand';
import { cn } from '../ui/utils';

interface HeaderProps {
  userName: string;
  userType: UserType;
  onLogout: () => void;
  onNavigate: (page: PageType) => void;
  onMobileMenuToggle: () => void;
}

export function Header({
  userName,
  userType,
  onLogout,
  onNavigate,
  onMobileMenuToggle,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1680px] items-center justify-between gap-2 px-3 sm:gap-3 sm:px-5 lg:h-20 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="app-button-ghost h-10 w-10 p-0 lg:hidden"
            aria-label="Открыть меню"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="min-w-0 text-left"
            aria-label="Перейти на главную страницу панели"
          >
            <AppBrand compact />
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden max-w-[280px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:flex lg:max-w-none lg:px-4">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-2xl',
                userType === 'admin'
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-slate-100 text-slate-700',
              )}
            >
              {userType === 'admin' ? <ShieldCheck className="h-5 w-5" /> : <User2 className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{userName || 'Пользователь'}</p>
              <p className="text-xs text-slate-500">
                {userType === 'admin' ? 'Администратор' : 'Пользователь'}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="app-button-secondary px-3 sm:px-4"
            aria-label="Выйти"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Выйти</span>
          </button>
        </div>
      </div>
    </header>
  );
}
