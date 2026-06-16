import { ArrowLeft, CheckCircle2, KeyRound, ShieldCheck, Sparkles } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';
import { authApi } from '../services/api';
import { getTrimmedValue, isValidEmail, type FieldErrors } from '../lib/validation';
import { AppBrand } from './common/AppBrand';

interface LoginRegisterPageProps {
  onLogin: (userType: 'admin' | 'user', userName: string) => void;
  onBack?: () => void;
}

interface AuthFormData {
  identifier: string;
  email: string;
  password: string;
  name: string;
  username: string;
  confirmPassword: string;
}

const initialFormData: AuthFormData = {
  identifier: '',
  email: '',
  password: '',
  name: '',
  username: '',
  confirmPassword: '',
};

export default function LoginRegisterPage({ onLogin, onBack }: LoginRegisterPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState<AuthFormData>(initialFormData);
  const [errors, setErrors] = useState<FieldErrors<keyof AuthFormData>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const registerPasswordStrength = useMemo(() => {
    const length = formData.password.length;

    if (length >= 10) return 'Сильный пароль';
    if (length >= 6) return 'Базовый пароль';
    return 'Минимум 6 символов';
  }, [formData.password]);

  const updateField = <K extends keyof AuthFormData>(field: K, value: AuthFormData[K]) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setError('');
    setErrors({});
  };

  const validateLogin = () => {
    const nextErrors: FieldErrors<keyof AuthFormData> = {};

    if (!getTrimmedValue(formData.identifier)) {
      nextErrors.identifier = 'Введите логин или email.';
    }

    if (!formData.password) {
      nextErrors.password = 'Введите пароль.';
    }

    return nextErrors;
  };

  const validateRegister = () => {
    const nextErrors: FieldErrors<keyof AuthFormData> = {};

    if (!getTrimmedValue(formData.name)) {
      nextErrors.name = 'Укажите имя клиента.';
    }

    if (!getTrimmedValue(formData.email)) {
      nextErrors.email = 'Укажите email.';
    } else if (!isValidEmail(formData.email)) {
      nextErrors.email = 'Проверьте формат email.';
    }

    if (!formData.password) {
      nextErrors.password = 'Придумайте пароль.';
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Пароль должен содержать минимум 6 символов.';
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Повторите пароль.';
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Пароли не совпадают.';
    }

    if (formData.username && getTrimmedValue(formData.username).length < 3) {
      nextErrors.username = 'Логин должен быть не короче 3 символов.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    const nextErrors = mode === 'login' ? validateLogin() : validateRegister();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const response = await authApi.login(getTrimmedValue(formData.identifier), formData.password);

        if (response.success && response.data) {
          localStorage.setItem('auth_token', response.data.token);
          const userType = response.data.user.user_type === 'admin' ? 'admin' : 'user';
          const userName = response.data.user.name || response.data.user.username || 'Пользователь';
          onLogin(userType, userName);
        } else {
          setError(response.error || 'Неверный логин или пароль.');
        }

        return;
      }

      const username = getTrimmedValue(formData.username) || getTrimmedValue(formData.email).split('@')[0];
      const response = await authApi.register(
        username,
        getTrimmedValue(formData.email),
        formData.password,
        getTrimmedValue(formData.name),
      );

      if (response.success && response.data) {
        localStorage.setItem('auth_token', response.data.token);
        const userType = response.data.user.user_type === 'admin' ? 'admin' : 'user';
        const userName = response.data.user.name || response.data.user.username || 'Пользователь';
        onLogin(userType, userName);
      } else {
        setError(response.error || 'Не удалось завершить регистрацию.');
      }
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Произошла ошибка. Проверьте соединение с сервером.',
      );
    } finally {
      setLoading(false);
    }
  };

  const FieldError = ({ value }: { value?: string }) =>
    value ? <p className="mt-2 text-sm text-red-600">{value}</p> : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.38),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.3),transparent_24%),linear-gradient(160deg,#0f172a_0%,#1e1b4b_44%,#1d4ed8_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute left-[-12%] top-[-10%] h-72 w-72 rounded-full bg-white/25 blur-3xl" />
        <div className="absolute bottom-[-8%] right-[-6%] h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-6 flex justify-between gap-4">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="app-button-ghost border border-white/10 bg-white/[0.06] text-white hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              На главную
            </button>
          ) : (
            <span />
          )}
          <AppBrand light compact />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[36px] border border-white/10 bg-white/[0.08] p-6 text-white shadow-[0_32px_80px_-40px_rgba(15,23,42,0.65)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
              <Sparkles className="h-4 w-4" />
              Единый центр управления
            </div>

            <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Сервисная система без визуального шума и лишних действий.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
              Вход для администраторов и регистрация клиентских аккаунтов собраны в одном понятном потоке. Интерфейс оставляет только нужные действия и ясные статусы.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <ValueCard title="24/7" text="Доступ к данным и заявкам из любой смены" />
              <ValueCard title="1 поток" text="Прием, контроль и выдача в одной системе" />
              <ValueCard title="Четко" text="Минимум непонятных состояний и лишних шагов" />
            </div>

            <div className="mt-8 space-y-4">
              {[
                'Отдельный доступ для администратора и клиента.',
                'Понятные ошибки вместо немых отказов формы.',
                'Быстрый вход по логину или email.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/[0.08] px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
                  <p className="text-sm leading-6 text-white/80">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[28px] border border-white/10 bg-slate-950/25 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Демо-доступ администратора</p>
                  <p className="text-sm text-white/60">Для быстрого входа в панель управления</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DemoField label="Логин" value="admin" />
                <DemoField label="Пароль" value="admin123" />
              </div>
              {mode === 'login' ? (
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setErrors({});
                    setFormData((current) => ({
                      ...current,
                      identifier: 'admin',
                      password: 'admin123',
                    }));
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15"
                >
                  <KeyRound className="h-4 w-4" />
                  Подставить demo-данные
                </button>
              ) : null}
            </div>
          </section>

          <section className="app-panel p-6 sm:p-8">
            <div className="flex gap-2 rounded-[22px] bg-slate-100 p-1">
              <ModeButton active={mode === 'login'} onClick={() => switchMode('login')}>
                Вход
              </ModeButton>
              <ModeButton active={mode === 'register'} onClick={() => switchMode('register')}>
                Регистрация
              </ModeButton>
            </div>

            <div className="mt-8">
              <p className="app-kicker">{mode === 'login' ? 'Авторизация' : 'Новый аккаунт'}</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                {mode === 'login' ? 'Войти в систему' : 'Создать клиентский профиль'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {mode === 'login'
                  ? 'Используйте логин или email, чтобы быстро открыть рабочую панель.'
                  : 'Регистрация упрощена: только необходимые поля и прозрачные проверки.'}
              </p>
            </div>

            {error ? (
              <div className="mt-6 rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {mode === 'register' ? (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      ФИО <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(event) => updateField('name', event.target.value)}
                      className="app-input"
                      placeholder="Иванов Иван Иванович"
                    />
                    <FieldError value={errors.name} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Логин</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(event) => updateField('username', event.target.value)}
                      className="app-input"
                      placeholder="Если не укажете, логин создастся из email"
                    />
                    <FieldError value={errors.username} />
                  </div>
                </>
              ) : null}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {mode === 'login' ? 'Логин или email' : 'Email'} <span className="text-red-500">*</span>
                </label>
                <input
                  type={mode === 'login' ? 'text' : 'email'}
                  value={mode === 'login' ? formData.identifier : formData.email}
                  onChange={(event) =>
                    mode === 'login'
                      ? updateField('identifier', event.target.value)
                      : updateField('email', event.target.value)
                  }
                  className="app-input"
                  placeholder={mode === 'login' ? 'admin или admin@kalakutsky-service.ru' : 'example@email.com'}
                />
                <FieldError value={mode === 'login' ? errors.identifier : errors.email} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Пароль <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(event) => updateField('password', event.target.value)}
                  className="app-input"
                  placeholder={mode === 'login' ? 'Введите пароль' : 'Минимум 6 символов'}
                />
                <FieldError value={errors.password} />
                {mode === 'register' ? (
                  <p className="mt-2 text-sm text-slate-500">{registerPasswordStrength}</p>
                ) : null}
              </div>

              {mode === 'register' ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Подтвердите пароль <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(event) => updateField('confirmPassword', event.target.value)}
                    className="app-input"
                    placeholder="Повторите пароль"
                  />
                  <FieldError value={errors.confirmPassword} />
                </div>
              ) : null}

              <button type="submit" disabled={loading} className="app-button-primary mt-2 w-full justify-center py-3.5 text-base">
                {loading ? 'Подождите…' : mode === 'login' ? 'Войти в систему' : 'Создать аккаунт'}
              </button>
            </form>

            {mode === 'register' ? (
              <p className="mt-5 text-sm leading-6 text-slate-500">
                Регистрация создает обычный клиентский аккаунт. Административный доступ назначается только из системы.
              </p>
            ) : (
              <div className="mt-6 rounded-[24px] bg-slate-50 px-4 py-4">
                <p className="text-sm font-semibold text-slate-700">Подсказка для входа</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Если вы не помните, какой идентификатор использовали, попробуйте логин или email. Система принимает оба варианта.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-[18px] px-4 py-3 text-sm font-semibold transition ${
        active
          ? 'bg-gradient-to-r from-[#7c3aed] via-[#5b5bd6] to-[#2563eb] text-white shadow-[0_18px_36px_-24px_rgba(37,99,235,0.6)]'
          : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  );
}

function ValueCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/10 p-4">
      <p className="text-2xl font-semibold">{title}</p>
      <p className="mt-2 text-sm text-white/70">{text}</p>
    </div>
  );
}

function DemoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] bg-white/[0.08] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-white/50">{label}</p>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
    </div>
  );
}
