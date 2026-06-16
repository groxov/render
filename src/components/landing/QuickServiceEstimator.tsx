import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { quickServicePresets } from '../../data/landingContent';
import { PageType } from '../../types';
import { cn } from '../ui/utils';

interface QuickServiceEstimatorProps {
  onNavigate: (page: PageType) => void;
}

export function QuickServiceEstimator({ onNavigate }: QuickServiceEstimatorProps) {
  const [selectedQuickService, setSelectedQuickService] = useState(0);
  const quickService = quickServicePresets[selectedQuickService];

  return (
    <div className="mt-6 grid gap-4 lg:mt-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)]">
      <div className="rounded-[18px] border border-slate-100 bg-slate-50/90 p-4 shadow-[0_22px_46px_-40px_rgba(15,23,42,0.4)] sm:rounded-[24px] sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="app-kicker">Быстрый подбор</p>
            <h3 className="mt-2 text-xl font-semibold leading-tight text-slate-950 sm:text-2xl">
              Выберите технику, а мы покажем стартовый ориентир
            </h3>
          </div>
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
            Живой расчет
          </span>
        </div>

        <div className="mt-5 grid gap-2 sm:mt-6 sm:grid-cols-3">
          {quickServicePresets.map((preset, index) => (
            <button
              key={preset.title}
              type="button"
              onClick={() => setSelectedQuickService(index)}
              aria-pressed={selectedQuickService === index}
              className={cn(
                'rounded-xl border px-4 py-3 text-left text-sm font-semibold transition sm:rounded-2xl',
                selectedQuickService === index
                  ? 'border-blue-200 bg-white text-blue-700 shadow-[0_18px_32px_-28px_rgba(37,99,235,0.72)]'
                  : 'border-slate-200 bg-white/60 text-slate-600 hover:border-blue-100 hover:bg-white',
              )}
            >
              {preset.title}
            </button>
          ))}
        </div>

        <motion.div
          key={quickService.title}
          aria-live="polite"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="mt-5 rounded-[18px] bg-white p-4 ring-1 ring-slate-100 sm:rounded-[22px] sm:p-5"
        >
          <p className="text-sm font-medium text-slate-500">{quickService.problem}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Стоимость</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{quickService.price}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Срок</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{quickService.time}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="rounded-[18px] bg-[linear-gradient(145deg,#0f172a_0%,#1e3a8a_100%)] p-4 text-white shadow-[0_26px_60px_-44px_rgba(15,23,42,0.76)] sm:rounded-[24px] sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">Что входит</p>
        <div className="mt-4 space-y-3">
          {quickService.includes.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/[0.08] px-4 py-3">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-200" />
              <p className="text-sm text-white/78">{item}</p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
            <span>Загрузка сегодня</span>
            <span>{quickService.load}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/12">
            <motion.div
              key={quickService.load}
              initial={{ width: 0 }}
              animate={{ width: `${quickService.load}%` }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-blue-200"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('public-request')}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
        >
          Записаться на диагностику
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
