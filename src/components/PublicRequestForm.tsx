import { ArrowLeft, CircleCheckBig, Clock3, PhoneCall, ShieldCheck, Wrench } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { DEVICE_TYPES, PRIORITY_LABELS } from '../constants';
import { getTrimmedValue, isValidEmail, isValidPhone, normalizePhoneInput, type FieldErrors } from '../lib/validation';
import { requestsApi } from '../services/api';
import { PageType } from '../types';
import { AppBrand } from './common/AppBrand';

interface PublicRequestFormProps {
  onNavigate?: (page: PageType) => void;
}

const initialFormData = {
  name: '',
  phone: '',
  email: '',
  deviceType: '',
  deviceModel: '',
  serialNumber: '',
  problem: '',
  urgency: 'medium',
};

type PublicRequestKeys = keyof typeof initialFormData;

export default function PublicRequestForm({ onNavigate }: PublicRequestFormProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestId, setRequestId] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<PublicRequestKeys>>({});

  const validateForm = () => {
    const nextErrors: FieldErrors<PublicRequestKeys> = {};

    if (!getTrimmedValue(formData.name)) {
      nextErrors.name = 'Укажите имя.';
    }

    if (!getTrimmedValue(formData.phone)) {
      nextErrors.phone = 'Укажите телефон.';
    } else if (!isValidPhone(formData.phone)) {
      nextErrors.phone = 'Проверьте формат телефона.';
    }

    if (getTrimmedValue(formData.email) && !isValidEmail(formData.email)) {
      nextErrors.email = 'Проверьте формат email.';
    }

    if (!getTrimmedValue(formData.deviceType)) {
      nextErrors.deviceType = 'Выберите тип устройства.';
    }

    if (!getTrimmedValue(formData.deviceModel)) {
      nextErrors.deviceModel = 'Укажите модель.';
    }

    if (!getTrimmedValue(formData.problem)) {
      nextErrors.problem = 'Опишите неисправность.';
    } else if (getTrimmedValue(formData.problem).length < 10) {
      nextErrors.problem = 'Добавьте чуть больше деталей.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await requestsApi.create({
        clientName: getTrimmedValue(formData.name),
        clientPhone: getTrimmedValue(formData.phone),
        clientEmail: getTrimmedValue(formData.email),
        deviceType: formData.deviceType,
        deviceModel: getTrimmedValue(formData.deviceModel),
        serialNumber: getTrimmedValue(formData.serialNumber),
        description: getTrimmedValue(formData.problem),
        priority: formData.urgency as 'low' | 'medium' | 'high',
      });

      if (response.success && response.data) {
        setRequestId(response.data.id);
        setSubmitted(true);
      } else {
        setError(response.error || 'Не удалось отправить заявку. Попробуйте позже.');
      }
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Произошла ошибка при отправке заявки. Попробуйте позже.',
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setError('');
    setRequestId('');
    setFieldErrors({});
    setFormData(initialFormData);
  };

  const FieldError = ({ value }: { value?: string }) =>
    value ? <p className="mt-2 text-sm text-red-600">{value}</p> : null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.12),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.1),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)]">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => onNavigate?.('landing')}
            className="app-button-ghost border border-slate-200 bg-white text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            На главную
          </button>
          <AppBrand compact />
        </div>
      </header>

      <main className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-6">
            <div className="app-panel p-6 sm:p-8">
              <p className="app-eyebrow">Онлайн-заявка</p>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Оставьте заявку на ремонт
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Форма составлена так, чтобы не перегружать клиента вопросами, но при этом дать мастеру достаточно вводных для быстрой оценки.
              </p>
            </div>

            {submitted ? (
              <div className="app-panel p-6 sm:p-8">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-emerald-100 text-emerald-700">
                    <CircleCheckBig className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="app-kicker">Заявка отправлена</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                      Мы получили ваше обращение
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Номер заявки: <span className="font-semibold text-slate-950">#{requestId}</span>. Менеджер свяжется с вами в ближайшее время, чтобы уточнить детали и согласовать прием техники.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={resetForm} className="app-button-primary w-full sm:w-auto">
                    Отправить еще одну заявку
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('landing')}
                    className="app-button-secondary w-full sm:w-auto"
                  >
                    Вернуться на главную
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="app-panel p-6 sm:p-8">
                <div className="space-y-8">
                  <section className="space-y-4">
                    <div>
                      <p className="app-kicker">Контакты</p>
                      <h2 className="mt-2 text-lg font-semibold text-slate-950">Как с вами связаться</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          ФИО <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(event) => {
                            setFormData({ ...formData, name: event.target.value });
                            setFieldErrors((current) => ({ ...current, name: undefined }));
                          }}
                          className="app-input"
                          placeholder="Иванов Иван Иванович"
                        />
                        <FieldError value={fieldErrors.name} />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Телефон <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(event) => {
                            setFormData({ ...formData, phone: normalizePhoneInput(event.target.value) });
                            setFieldErrors((current) => ({ ...current, phone: undefined }));
                          }}
                          className="app-input"
                          placeholder="+7 (___) ___-__-__"
                        />
                        <FieldError value={fieldErrors.phone} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(event) => {
                            setFormData({ ...formData, email: event.target.value });
                            setFieldErrors((current) => ({ ...current, email: undefined }));
                          }}
                          className="app-input"
                          placeholder="example@email.com"
                        />
                        <FieldError value={fieldErrors.email} />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4 border-t border-slate-100 pt-8">
                    <div>
                      <p className="app-kicker">Устройство</p>
                      <h2 className="mt-2 text-lg font-semibold text-slate-950">Что привезете в сервис</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Тип устройства <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.deviceType}
                          onChange={(event) => {
                            setFormData({ ...formData, deviceType: event.target.value });
                            setFieldErrors((current) => ({ ...current, deviceType: undefined }));
                          }}
                          className="app-select"
                        >
                          <option value="">Выберите тип</option>
                          {DEVICE_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        <FieldError value={fieldErrors.deviceType} />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Модель <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.deviceModel}
                          onChange={(event) => {
                            setFormData({ ...formData, deviceModel: event.target.value });
                            setFieldErrors((current) => ({ ...current, deviceModel: undefined }));
                          }}
                          className="app-input"
                          placeholder="MacBook Pro 14"
                        />
                        <FieldError value={fieldErrors.deviceModel} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-700">Серийный номер</label>
                        <input
                          type="text"
                          value={formData.serialNumber}
                          onChange={(event) => setFormData({ ...formData, serialNumber: event.target.value })}
                          className="app-input"
                          placeholder="1234567890"
                        />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4 border-t border-slate-100 pt-8">
                    <div>
                      <p className="app-kicker">Проблема</p>
                      <h2 className="mt-2 text-lg font-semibold text-slate-950">Что случилось с техникой</h2>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Опишите неисправность <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={6}
                        value={formData.problem}
                        onChange={(event) => {
                          setFormData({ ...formData, problem: event.target.value });
                          setFieldErrors((current) => ({ ...current, problem: undefined }));
                        }}
                        className="app-textarea"
                        placeholder="Опишите подробно, что произошло, как проявляется неисправность и когда она появилась."
                      />
                      <FieldError value={fieldErrors.problem} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Срочность ремонта</label>
                      <div className="grid gap-3 md:grid-cols-3">
                        {([
                          { value: 'low', title: 'Не срочно', note: '3-5 дней', active: 'border-emerald-300 bg-emerald-50' },
                          { value: 'medium', title: 'Обычно', note: '1-2 дня', active: 'border-blue-300 bg-blue-50' },
                          { value: 'high', title: 'Срочно', note: '24 часа', active: 'border-red-300 bg-red-50' },
                        ] as const).map((option) => (
                          <label
                            key={option.value}
                            className={`flex cursor-pointer items-start gap-3 rounded-[22px] border p-4 transition ${
                              formData.urgency === option.value
                                ? option.active
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="urgency"
                              value={option.value}
                              checked={formData.urgency === option.value}
                              onChange={(event) => setFormData({ ...formData, urgency: event.target.value })}
                              className="mt-1"
                            />
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{option.title}</p>
                              <p className="mt-1 text-sm text-slate-500">{option.note}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </section>

                  {error ? (
                    <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-6">
                    <button type="submit" disabled={loading} className="app-button-primary w-full justify-center py-3.5 text-base">
                      {loading ? 'Отправляем…' : 'Отправить заявку'}
                    </button>
                    <p className="text-center text-sm leading-6 text-slate-500">
                      Нажимая кнопку, вы соглашаетесь на обработку персональных данных в рамках работы с обращением.
                    </p>
                  </div>
                </div>
              </form>
            )}
          </section>

          <aside className="space-y-4">
            <InfoCard icon={<Clock3 className="h-5 w-5" />} title="Быстрый ответ" text="Свяжемся в течение 15 минут" tone="violet" />
            <InfoCard icon={<Wrench className="h-5 w-5" />} title="Диагностика" text="Предварительно оценим сложность и сроки" tone="blue" />
            <InfoCard icon={<ShieldCheck className="h-5 w-5" />} title="Гарантия" text="До 12 месяцев на выполненные работы" tone="emerald" />

            <div className="app-panel p-5">
              <p className="app-kicker">Прямой контакт</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">Нужна консультация до отправки?</h3>
              <a
                href="tel:+74012555000"
                className="mt-4 flex items-center gap-3 rounded-[22px] bg-slate-50 px-4 py-4 text-slate-800 transition hover:bg-slate-100"
              >
                <PhoneCall className="h-5 w-5 text-blue-600" />
                <span className="font-medium">+7 (4012) 555-000</span>
              </a>
            </div>

            <div className="app-panel p-5">
              <p className="app-kicker">Текущий выбор</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Приоритет заявки сейчас: <span className="font-semibold text-slate-900">{PRIORITY_LABELS[formData.urgency as 'low' | 'medium' | 'high']}</span>
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  text,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  tone: 'violet' | 'blue' | 'emerald';
}) {
  const toneClass = {
    violet: 'bg-violet-100 text-violet-700',
    blue: 'bg-blue-100 text-blue-700',
    emerald: 'bg-emerald-100 text-emerald-700',
  }[tone];

  return (
    <div className="app-panel p-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-sm text-slate-500">{text}</p>
        </div>
      </div>
    </div>
  );
}
