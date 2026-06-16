import { ArrowRight, Star } from 'lucide-react';
import {
  clientValueItems,
  companyApproachIcon,
  companyStats,
  companyTimeline,
  companyValues,
  routeSteps,
  teamHighlights,
} from '../../data/landingContent';
import { PageType } from '../../types';
import { cn } from '../ui/utils';
import { AnimatedMetricValue } from './AnimatedMetricValue';

interface CompanySectionProps {
  onNavigate: (page: PageType) => void;
}

export function CompanySection({ onNavigate }: CompanySectionProps) {
  return (
    <section id="company" className="section-anchor mx-auto max-w-[1480px] px-3 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-10">
      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.06fr)_minmax(360px,0.94fr)] 2xl:items-start">
        <div className="rounded-[22px] bg-[linear-gradient(145deg,#fffdf9_0%,#ffffff_28%,#eef4ff_100%)] p-4 shadow-[0_28px_76px_-46px_rgba(15,23,42,0.38)] ring-1 ring-white/80 sm:rounded-[30px] sm:p-8 xl:rounded-[36px]">
          <div className="border-b border-slate-100 pb-6">
            <div className="max-w-4xl">
              <p className="app-eyebrow">О компании</p>
              <h2 className="mt-4 text-2xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                Сервисный центр, который вырос не из витрины, а из реальных ремонтов.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                «Калакуцкий Сервис» работает с 2015 года. Мы начинали как небольшая мастерская, а выросли в сильную
                ремонтную команду, где важны не только технические навыки, но и то, как человек проходит весь путь:
                от приема техники до выдачи без неприятных сюрпризов.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:max-w-[760px]">
              {companyStats.map((item) => (
                <div key={item.label} className="rounded-[18px] border border-slate-200/80 bg-white/88 px-4 py-4 shadow-[0_18px_34px_-34px_rgba(15,23,42,0.7)] sm:rounded-[22px] sm:px-5 sm:py-5">
                  <AnimatedMetricValue value={item.value} className="text-3xl font-semibold tracking-[-0.04em] text-slate-950" />
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)]">
            <article className="rounded-[20px] bg-[linear-gradient(145deg,#0f172a_0%,#1e1b4b_36%,#1d4ed8_100%)] p-4 text-white shadow-[0_30px_80px_-50px_rgba(15,23,42,0.75)] sm:rounded-[26px] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">Наш подход</p>
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
                    Не продаем пафос. Делаем понятный сервис и сильную технику на выходе.
                  </h3>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-white/10 text-white/80">
                  {companyApproachIcon}
                </div>
              </div>

              <div className="mt-8 space-y-3">
                {companyValues.map((value) => (
                  <div key={value.title} className="rounded-[22px] border border-white/10 bg-white/[0.08] px-4 py-4 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-white/80">
                        {value.icon}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-semibold">{value.title}</h4>
                        <p className="mt-2 text-sm leading-6 text-white/68">{value.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[20px] border border-slate-200/80 bg-slate-50/90 p-4 shadow-[0_24px_56px_-42px_rgba(15,23,42,0.42)] sm:rounded-[26px] sm:p-6">
              <p className="app-kicker">Как росли</p>
              <div className="mt-5 space-y-6">
                {companyTimeline.map((item, index) => (
                  <div key={item.year} className="grid grid-cols-[72px_minmax(0,1fr)] gap-4">
                    <div>
                      <div className="rounded-full bg-white px-3 py-1 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-sm">
                        {item.year}
                      </div>
                      {index < companyTimeline.length - 1 ? (
                        <div className="mx-auto mt-3 h-10 w-px bg-gradient-to-b from-slate-300 to-transparent" />
                      ) : null}
                    </div>
                    <div className="pb-3">
                      <h4 className="text-lg font-semibold text-slate-950">{item.title}</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>

        <div className="grid gap-4 content-start 2xl:h-full">
          <div className="app-panel p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="app-kicker">Команда</p>
                <h3 className="mt-2 text-xl font-semibold leading-tight text-slate-950 sm:text-2xl">
                  Люди, которые держат качество
                </h3>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                Ядро мастерской
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {teamHighlights.map((employee, index) => (
                <article
                  key={employee.id}
                  className={cn(
                    'rounded-[26px] border p-5 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.45)]',
                    index === 0
                      ? 'border-blue-100 bg-[linear-gradient(145deg,#f8fbff_0%,#eef5ff_100%)]'
                      : 'border-slate-200/80 bg-slate-50/90',
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#7c3aed] to-[#2563eb] text-lg font-semibold text-white shadow-[0_18px_32px_-24px_rgba(37,99,235,0.75)]">
                      {employee.name
                        .split(' ')
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-semibold text-slate-950">{employee.name}</h4>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                          {employee.position}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{employee.specialization}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                        <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-600 shadow-sm">
                          {employee.completedRepairs} выполненных ремонтов
                        </span>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                          В активной работе
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="app-panel p-4 sm:p-6">
            <p className="app-kicker">Что важно клиенту</p>
            <h3 className="mt-2 text-xl font-semibold leading-tight text-slate-950 sm:text-2xl">
              Сервис должен быть понятным еще до ремонта
            </h3>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {clientValueItems.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[22px] bg-slate-50 px-4 py-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                    <Star className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] bg-[linear-gradient(145deg,#0f172a_0%,#1e3a8a_58%,#2563eb_100%)] p-4 text-white shadow-[0_28px_74px_-48px_rgba(15,23,42,0.72)] sm:rounded-[30px] sm:p-6 xl:sticky xl:top-24 xl:self-start 2xl:flex 2xl:min-h-[320px] 2xl:flex-col 2xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">Маршрут заявки</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                От обращения до выдачи без пустых пауз
              </h3>
              <div className="mt-6 grid gap-3">
                {routeSteps.map((item, index) => (
                  <div key={item} className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/[0.08] px-4 py-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/12 text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-6 text-white/76">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('public-request')}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Оставить заявку
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
