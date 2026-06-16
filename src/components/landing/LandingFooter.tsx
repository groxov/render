import { AppBrand } from '../common/AppBrand';

export function LandingFooter() {
  return (
    <footer className="border-t border-white/70 bg-white/70">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <AppBrand compact />
        </div>
        <p>© 2015-2026 Калакуцкий Сервис. Сервисный центр цифровой техники.</p>
      </div>
    </footer>
  );
}
