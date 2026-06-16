import { Menu } from 'lucide-react';
import { useState } from 'react';
import { navigationLinks } from '../../data/landingContent';
import { PageType } from '../../types';
import { AppBrand } from '../common/AppBrand';

interface LandingHeaderProps {
  onLogin: () => void;
  onNavigate: (page: PageType) => void;
  isLoggedIn: boolean;
  userName: string;
  onLogout?: () => void;
}

export function LandingHeader({
  onLogin,
  onNavigate,
  isLoggedIn,
  userName,
  onLogout,
}: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-3 px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
        <AppBrand compact />

        <nav className="hidden items-center gap-2 lg:flex">
          <a href="#hero" className="app-button-ghost">
            Главная
          </a>
          {navigationLinks.map((link) => (
            <a key={link.href} href={link.href} className="app-button-ghost">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isLoggedIn ? (
            <>
              <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                Вы вошли как <span className="font-semibold text-slate-900">{userName}</span>
              </div>
              <button type="button" onClick={onLogout} className="app-button-secondary">
                Выйти
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={onLogin} className="app-button-secondary">
                Войти в АИС
              </button>
              <button type="button" onClick={() => onNavigate('public-request')} className="app-button-primary">
                Оставить заявку
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="app-button-ghost border border-slate-200 bg-white text-slate-700 lg:hidden"
          aria-label="Открыть меню"
          aria-expanded={mobileMenuOpen}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-slate-100 bg-white px-3 py-3 sm:px-6 sm:py-4 lg:hidden">
          <div className="flex flex-col gap-2">
            <a href="#hero" onClick={closeMenu} className="app-button-ghost justify-start">
              Главная
            </a>
            {navigationLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={closeMenu} className="app-button-ghost justify-start">
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              {isLoggedIn ? (
                <button type="button" onClick={onLogout} className="app-button-secondary justify-center">
                  Выйти
                </button>
              ) : (
                <>
                  <button type="button" onClick={onLogin} className="app-button-secondary justify-center">
                    Войти в АИС
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      onNavigate('public-request');
                    }}
                    className="app-button-primary justify-center"
                  >
                    Оставить заявку
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
