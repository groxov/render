import { PageType } from '../../types';

interface ContactsSectionProps {
  onLogin: () => void;
  onNavigate: (page: PageType) => void;
  isLoggedIn: boolean;
}

export function ContactsSection({ onLogin, onNavigate, isLoggedIn }: ContactsSectionProps) {
  return (
    <section id="contacts" className="section-anchor mx-auto max-w-[1480px] px-3 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-12">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-[22px] bg-[linear-gradient(135deg,#0f172a_0%,#1f2937_42%,#1d4ed8_100%)] p-5 text-white shadow-[0_32px_100px_-44px_rgba(15,23,42,0.75)] sm:rounded-[30px] sm:p-8 xl:rounded-[36px]">
          <p className="app-eyebrow border-white/15 bg-white/10 text-white/80">Контакты</p>
          <h2 className="mt-4 text-2xl font-semibold leading-tight sm:text-4xl">
            Если техника нужна в работе, лучше не откладывать диагностику.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
            Оставьте заявку онлайн или позвоните. Подскажем по срокам, объясним, что взять с собой, и запишем без
            ненужных формальностей.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onNavigate('public-request')}
              className="app-button-primary bg-white px-6 text-slate-950 shadow-none hover:bg-slate-100"
            >
              Оставить заявку
            </button>
            {!isLoggedIn ? (
              <button
                type="button"
                onClick={onLogin}
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.16]"
              >
                Войти в АИС
              </button>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <div className="app-panel p-5">
            <p className="app-kicker">Телефон</p>
            <a href="tel:+74012555000" className="mt-3 block text-2xl font-semibold tracking-[-0.04em] text-slate-950">
              +7 (4012) 555-000
            </a>
            <p className="mt-2 text-sm text-slate-500">Пн-Сб, 09:00-20:00</p>
          </div>
          <div className="app-panel p-5">
            <p className="app-kicker">Адрес</p>
            <p className="mt-3 text-lg font-semibold text-slate-950">Калининград, ул. Советская, 15</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Центр города, удобный подъезд и быстрая приемка техники без долгих очередей.
            </p>
          </div>
          <div className="app-panel p-5">
            <p className="app-kicker">Почта</p>
            <a href="mailto:info@kalakutsky-service.ru" className="mt-3 block text-lg font-semibold text-slate-950">
              info@kalakutsky-service.ru
            </a>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Можно заранее прислать фото устройства или описать ситуацию в письме.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
