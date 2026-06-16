import { CircleCheckBig, RotateCcw, Send } from 'lucide-react';
import { type ChangeEvent, type FormEvent, useMemo, useState } from 'react';
import { DEVICE_TYPES, PRIORITY_LABELS } from '../constants';
import { getTrimmedValue, isValidEmail, isValidPhone, normalizePhoneInput, type FieldErrors } from '../lib/validation';
import { requestsApi } from '../services/api';

const initialFormData = {
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  deviceType: '',
  deviceModel: '',
  serialNumber: '',
  problem: '',
  priority: 'medium',
};

type RequestFormKeys = keyof typeof initialFormData;

export default function NewRequestForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestId, setRequestId] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<RequestFormKeys>>({});
  const [formData, setFormData] = useState(initialFormData);

  const completionState = useMemo(() => {
    const requiredFields: Array<RequestFormKeys> = [
      'clientName',
      'clientPhone',
      'clientEmail',
      'deviceType',
      'deviceModel',
      'problem',
    ];

    const filled = requiredFields.filter((field) => getTrimmedValue(formData[field])).length;
    return `${filled} из ${requiredFields.length}`;
  }, [formData]);

  const resetForm = () => {
    setSubmitted(false);
    setError('');
    setRequestId('');
    setFieldErrors({});
    setFormData(initialFormData);
  };

  const validateForm = () => {
    const nextErrors: FieldErrors<RequestFormKeys> = {};

    if (!getTrimmedValue(formData.clientName)) {
      nextErrors.clientName = 'Укажите имя клиента.';
    }

    if (!getTrimmedValue(formData.clientPhone)) {
      nextErrors.clientPhone = 'Укажите телефон.';
    } else if (!isValidPhone(formData.clientPhone)) {
      nextErrors.clientPhone = 'Проверьте формат телефона.';
    }

    if (!getTrimmedValue(formData.clientEmail)) {
      nextErrors.clientEmail = 'Укажите email.';
    } else if (!isValidEmail(formData.clientEmail)) {
      nextErrors.clientEmail = 'Проверьте формат email.';
    }

    if (!getTrimmedValue(formData.deviceType)) {
      nextErrors.deviceType = 'Выберите тип устройства.';
    }

    if (!getTrimmedValue(formData.deviceModel)) {
      nextErrors.deviceModel = 'Укажите модель устройства.';
    }

    if (!getTrimmedValue(formData.problem)) {
      nextErrors.problem = 'Опишите неисправность.';
    } else if (getTrimmedValue(formData.problem).length < 10) {
      nextErrors.problem = 'Добавьте чуть больше деталей для мастера.';
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
        clientName: getTrimmedValue(formData.clientName),
        clientPhone: getTrimmedValue(formData.clientPhone),
        clientEmail: getTrimmedValue(formData.clientEmail),
        deviceType: formData.deviceType,
        deviceModel: getTrimmedValue(formData.deviceModel),
        serialNumber: getTrimmedValue(formData.serialNumber),
        description: getTrimmedValue(formData.problem),
        priority: formData.priority as 'low' | 'medium' | 'high',
      });

      if (response.success && response.data) {
        setRequestId(response.data.id);
        setSubmitted(true);
      } else {
        setError(response.error || 'Не удалось создать заявку.');
      }
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Произошла ошибка. Проверьте подключение к серверу.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: name === 'clientPhone' ? normalizePhoneInput(value) : value,
    }));

    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  };

  const FieldError = ({ value }: { value?: string }) =>
    value ? <p className="mt-2 text-sm text-red-600">{value}</p> : null;

  if (submitted) {
    return (
      <div className="app-panel p-5 sm:p-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 sm:h-14 sm:w-14">
              <CircleCheckBig className="h-7 w-7" />
            </div>
            <div>
              <p className="app-kicker">Заявка создана</p>
              <h3 className="mt-2 text-xl font-semibold leading-tight text-slate-950 sm:text-2xl">
                Обращение успешно зарегистрировано
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Номер новой заявки: <span className="font-semibold text-slate-950">#{requestId}</span>. Она уже доступна в общем журнале.
              </p>
            </div>
          </div>

          <button type="button" onClick={resetForm} className="app-button-primary w-full sm:w-auto">
            <RotateCcw className="h-4 w-4" />
            Создать еще одну
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-panel p-4 sm:p-6">
      <div className="border-b border-slate-100 pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="app-kicker">Форма приема</p>
            <h2 className="mt-2 text-xl font-semibold leading-tight text-slate-950 sm:text-2xl">
              Новая заявка на ремонт
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Сначала сохраняем точные данные клиента и устройства, затем добавляем описание проблемы и приоритет.
            </p>
          </div>
          <div className="app-panel-soft w-full px-4 py-3 text-sm text-slate-600 sm:w-auto">
            <span className="app-kicker">Готовность</span>
            <p className="mt-2 font-medium text-slate-900">{completionState}</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        <section className="space-y-4">
          <div>
            <p className="app-kicker">Шаг 1</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950">Контактные данные клиента</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                ФИО клиента <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Иванов Иван Иванович"
                className="app-input"
              />
              <FieldError value={fieldErrors.clientName} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Телефон <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleChange}
                placeholder="+7 (900) 123-45-67"
                className="app-input"
              />
              <FieldError value={fieldErrors.clientPhone} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleChange}
                placeholder="example@mail.ru"
                className="app-input"
              />
              <FieldError value={fieldErrors.clientEmail} />
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t border-slate-100 pt-8">
          <div>
            <p className="app-kicker">Шаг 2</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950">Данные устройства</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Тип устройства <span className="text-red-500">*</span>
              </label>
              <select
                name="deviceType"
                value={formData.deviceType}
                onChange={handleChange}
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
                name="deviceModel"
                value={formData.deviceModel}
                onChange={handleChange}
                placeholder="MacBook Pro 14"
                className="app-input"
              />
              <FieldError value={fieldErrors.deviceModel} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Серийный номер</label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                placeholder="SN123456789"
                className="app-input"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t border-slate-100 pt-8">
          <div>
            <p className="app-kicker">Шаг 3</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950">Описание неисправности</h3>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Что произошло <span className="text-red-500">*</span>
              </label>
              <textarea
                name="problem"
                value={formData.problem}
                onChange={handleChange}
                rows={5}
                placeholder="Подробно опишите неисправность, внешние признаки и когда она появилась."
                className="app-textarea"
              />
              <FieldError value={fieldErrors.problem} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Приоритет <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="app-select"
              >
                {(['high', 'medium', 'low'] as const).map((priority) => (
                  <option key={priority} value={priority}>
                    {PRIORITY_LABELS[priority]}
                  </option>
                ))}
              </select>
              <div className="mt-4 rounded-[22px] bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                Чем точнее заполнено описание, тем быстрее мастер сможет оценить сложность и стоимость ремонта.
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row">
          <button type="submit" disabled={loading} className="app-button-primary w-full sm:w-auto">
            <Send className="h-4 w-4" />
            {loading ? 'Создаем…' : 'Создать заявку'}
          </button>
          <button type="button" onClick={resetForm} className="app-button-secondary w-full sm:w-auto">
            Очистить форму
          </button>
        </div>
      </form>
    </div>
  );
}
