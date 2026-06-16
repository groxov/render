import { ArrowRight, PhoneCall, Sparkles } from 'lucide-react';
import { heroStats, trustItems } from '../../data/landingContent';
import { PageType } from '../../types';
import { AnimatedMetricValue } from './AnimatedMetricValue';

interface HeroSectionProps {
  onNavigate: (page: PageType) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <section id="hero" className="section-anchor mx-auto max-w-[1480px] px-3 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-16">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)] lg:items-stretch xl:gap-8">
        <div className="rounded-[22px] bg-[linear-gradient(135deg,#0f172a_0%,#1e1b4b_38%,#1d4ed8_100%)] px-5 py-7 text-white shadow-[0_28px_82px_-46px_rgba(15,23,42,0.72)] sm:rounded-[30px] sm:px-8 sm:py-10 lg:px-10 xl:rounded-[36px]">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase leading-5 tracking-[0.14em] text-white/80 sm:text-xs sm:tracking-[0.2em]">
            <Sparkles className="h-4 w-4" />
            Сервисный центр с 2015 года
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight sm:mt-6 sm:text-5xl lg:text-6xl">
            Ремонт техники без лишних обещаний, но с понятным результатом.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:mt-5 sm:text-lg sm:leading-8">
            Берем в работу ноутбуки, смартфоны, планшеты, компьютеры и офисную технику. Даем ясную диагностику,
            согласованный план ремонта и аккуратную коммуникацию на каждом этапе.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onNavigate('public-request')}
              className="app-button-primary bg-white px-6 text-slate-950 shadow-none hover:bg-slate-100"
            >
              Оставить заявку
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.16]"
            >
              Посмотреть услуги
            </a>
          </div>

          <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-3">
            {heroStats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/[0.12] bg-white/[0.08] px-4 py-4 sm:rounded-[22px]">
                <AnimatedMetricValue value={item.value} className="text-2xl font-semibold" />
                <p className="mt-2 text-sm leading-6 text-white/70">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="app-panel p-4 sm:p-6">
            <p className="app-kicker">Почему нам доверяют</p>
            <h2 className="mt-2 text-xl font-semibold leading-tight text-slate-950 sm:text-2xl">
              Интерфейс сервиса такой же аккуратный, как и сам процесс ремонта.
            </h2>
            <div className="mt-6 space-y-4">
              {trustItems.map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-4 sm:rounded-[22px]">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="app-panel p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div>
                <p className="app-kicker">Связь</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">Нужна консультация?</h3>
              </div>
              <div className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                Сегодня работаем
              </div>
            </div>
            <a
              href="tel:+74012555000"
              className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4 text-slate-900 transition hover:bg-slate-100 sm:rounded-[22px]"
            >
              <PhoneCall className="h-5 w-5 text-blue-700" />
              <div>
                <p className="text-sm font-semibold">+7 (4012) 555-000</p>
                <p className="text-sm text-slate-500">Пн-Сб, с 09:00 до 20:00</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
