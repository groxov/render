import { motion } from 'framer-motion';
import { Wrench } from 'lucide-react';
import { serviceCards } from '../../data/landingContent';
import { PageType } from '../../types';
import { cardReveal } from './motion';
import { QuickServiceEstimator } from './QuickServiceEstimator';

interface ServicesSectionProps {
  onNavigate: (page: PageType) => void;
}

export function ServicesSection({ onNavigate }: ServicesSectionProps) {
  return (
    <section id="services" className="section-anchor mx-auto max-w-[1480px] px-3 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-10">
      <div className="app-panel p-4 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="app-eyebrow">Услуги</p>
            <h2 className="mt-4 text-2xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              Что мы ремонтируем чаще всего
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Сервис выстроен не вокруг шаблонной витрины, а вокруг реальных задач клиентов. Поэтому в списке только
              направления, которые действительно загружены в работе.
            </p>
          </div>
          <button type="button" onClick={() => onNavigate('public-request')} className="app-button-secondary w-full lg:w-auto">
            Получить консультацию
          </button>
        </div>

        <QuickServiceEstimator onNavigate={onNavigate} />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {serviceCards.map((service, index) => (
            <motion.article
              key={service.title}
              variants={cardReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.24 }}
              transition={{ duration: 0.46, delay: index * 0.06 }}
              whileHover={{ y: -6, scale: 1.015 }}
              className="rounded-[18px] border border-slate-100 bg-slate-50/90 p-4 shadow-[0_20px_40px_-36px_rgba(15,23,42,0.4)] sm:rounded-[24px] sm:p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-white text-blue-700 shadow-sm">
                  <Wrench className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-slate-300">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">{service.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{service.description}</p>
              <div className="mt-5 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {service.metric}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
