import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { processSteps } from '../../data/landingContent';
import { cardReveal } from './motion';

export function ProcessSection() {
  return (
    <section id="process" className="section-anchor mx-auto max-w-[1480px] px-3 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-10">
      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="app-panel p-4 sm:p-6">
          <p className="app-eyebrow">Процесс</p>
          <h2 className="mt-4 text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
            Как строим работу
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Каждое обращение проходит один и тот же понятный маршрут. Это убирает хаос как в сервисе, так и в
            коммуникации с клиентом.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {processSteps.map((step, index) => (
            <motion.article
              key={step.title}
              variants={cardReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.26 }}
              transition={{ duration: 0.46, delay: index * 0.06 }}
              whileHover={{ y: -5 }}
              className="app-panel p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Шаг {index + 1}
                </span>
                <Star className="h-5 w-5 text-amber-400" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-950">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
