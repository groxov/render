import { portfolioHighlights } from '../../data/landingContent';

export function PortfolioSection() {
  return (
    <section id="portfolio" className="section-anchor mx-auto max-w-[1480px] px-3 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-10">
      <div className="app-panel p-4 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="app-eyebrow">Реальные кейсы</p>
            <h2 className="mt-4 text-2xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              Несколько работ из недавней практики
            </h2>
          </div>
          <a href="#contacts" className="app-button-secondary w-full lg:w-auto">
            Обсудить похожую задачу
          </a>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-3">
          {portfolioHighlights.map((work) => (
            <article key={work.id} className="rounded-[18px] border border-slate-100 bg-slate-50/90 p-4 shadow-[0_22px_46px_-38px_rgba(15,23,42,0.38)] sm:rounded-[24px] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {work.category}
                </span>
                <span className="text-sm font-medium text-violet-700">{work.cost.toLocaleString('ru-RU')} руб.</span>
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-950">{work.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{work.device}</p>
              <div className="mt-5 space-y-4 border-t border-slate-200 pt-4">
                <div>
                  <p className="app-kicker">Проблема</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{work.problem}</p>
                </div>
                <div>
                  <p className="app-kicker">Решение</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{work.solution}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
