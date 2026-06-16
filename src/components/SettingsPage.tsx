import { type ReactNode, useMemo, useState } from 'react';
import { BellRing, Building2, LockKeyhole, RotateCcw, Save, ShieldCheck } from 'lucide-react';
import { DataStatusNotice } from './common/DataStatusNotice';
import { PageIntro } from './common/PageIntro';

type SettingsTab = 'general' | 'notifications' | 'security';

interface SettingsState {
  companyName: string;
  phone: string;
  email: string;
  address: string;
  workStart: string;
  workEnd: string;
  notifyNewRequest: boolean;
  notifyStatusChange: boolean;
  notifyAssignment: boolean;
  notifyCompleted: boolean;
  pushCritical: boolean;
  pushOverdue: boolean;
  pushMessages: boolean;
  enableTwoFactor: boolean;
}

const SETTINGS_STORAGE_KEY = 'service_center_settings_v2';

const INITIAL_SETTINGS: SettingsState = {
  companyName: 'ИП Калакуцкий Юрий Викторович',
  phone: '+7 (4012) 555-000',
  email: 'info@kalakutsky-service.ru',
  address: 'г. Калининград, ул. Ленинский проспект, д. 123',
  workStart: '09:00',
  workEnd: '18:00',
  notifyNewRequest: true,
  notifyStatusChange: true,
  notifyAssignment: false,
  notifyCompleted: true,
  pushCritical: true,
  pushOverdue: true,
  pushMessages: false,
  enableTwoFactor: false,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState<SettingsState>(() => loadStoredSettings());
  const [savedSnapshot, setSavedSnapshot] = useState<SettingsState>(() => loadStoredSettings());
  const [savedMessage, setSavedMessage] = useState('');

  const isDirty = useMemo(
    () => serializeSettings(settings) !== serializeSettings(savedSnapshot),
    [savedSnapshot, settings],
  );

  const saveSettings = () => {
    persistSettings(settings);
    setSavedSnapshot(cloneSettings(settings));
    setSavedMessage(
      `Изменения сохранены локально ${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
    );
  };

  const resetUnsavedChanges = () => {
    setSettings(cloneSettings(savedSnapshot));
    setSavedMessage('Несохраненные изменения сброшены до последней локальной версии.');
  };

  const restoreDefaults = () => {
    setSettings(cloneSettings(INITIAL_SETTINGS));
    setSavedMessage('Базовые настройки восстановлены. Не забудьте сохранить изменения.');
  };

  const setSetting = <T extends keyof SettingsState>(key: T, value: SettingsState[T]) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    if (savedMessage) {
      setSavedMessage('');
    }
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <PageIntro
        eyebrow="Системные параметры"
        title="Настройки сервисного центра"
        description="Экран теперь ведет себя как рабочий инструмент: видно, есть ли несохраненные изменения, а настройки переживают перезагрузку страницы, даже пока backend-хранилище для них еще не подключено."
        actions={
          <>
            <div className="app-panel-soft flex items-center gap-3 px-4 py-3 text-sm text-slate-600">
              <span className="app-kicker">{isDirty ? 'Изменения' : 'Состояние'}</span>
              <span>{isDirty ? 'Есть несохраненные правки' : 'Локальная версия актуальна'}</span>
            </div>
            <button
              onClick={saveSettings}
              disabled={!isDirty}
              className="app-button-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              Сохранить изменения
            </button>
          </>
        }
      />

      <DataStatusNotice
        title="Пока это локальные настройки браузера"
        description="До подключения серверного хранения этот экран сохраняет параметры в localStorage текущего браузера. Повторный вход на том же устройстве подхватит последнюю локальную версию."
      />

      {savedMessage ? <DataStatusNotice variant="success" description={savedMessage} /> : null}

      <section className="app-panel p-3 sm:p-5">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {[
            { id: 'general' as const, label: 'Общие', icon: <Building2 className="h-4 w-4" /> },
            { id: 'notifications' as const, label: 'Уведомления', icon: <BellRing className="h-4 w-4" /> },
            { id: 'security' as const, label: 'Безопасность', icon: <ShieldCheck className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition sm:rounded-2xl ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 shadow-[0_12px_30px_-22px_rgba(37,99,235,0.7)]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === 'general' ? (
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="app-panel p-5 sm:p-6">
            <div>
              <p className="app-kicker">Компания</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Основные реквизиты</h2>
            </div>

            <div className="mt-6 space-y-4">
              <Field label="Название компании">
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(event) => setSetting('companyName', event.target.value)}
                  className="app-input"
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Телефон">
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(event) => setSetting('phone', event.target.value)}
                    className="app-input"
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(event) => setSetting('email', event.target.value)}
                    className="app-input"
                  />
                </Field>
              </div>

              <Field label="Адрес">
                <input
                  type="text"
                  value={settings.address}
                  onChange={(event) => setSetting('address', event.target.value)}
                  className="app-input"
                />
              </Field>
            </div>
          </section>

          <section className="app-panel p-5 sm:p-6">
            <div>
              <p className="app-kicker">График</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Рабочее время</h2>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <Field label="Начало работы">
                <input
                  type="time"
                  value={settings.workStart}
                  onChange={(event) => setSetting('workStart', event.target.value)}
                  className="app-input"
                />
              </Field>
              <Field label="Конец работы">
                <input
                  type="time"
                  value={settings.workEnd}
                  onChange={(event) => setSetting('workEnd', event.target.value)}
                  className="app-input"
                />
              </Field>
            </div>

            <div className="mt-6 app-panel-soft p-4 text-sm leading-6 text-slate-600">
              Этот график пока используется как локальный справочный слой для административных экранов и публичного описания сервиса.
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === 'notifications' ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <NotificationSection
            title="Email уведомления"
            description="Что уходит на почту команде и администраторам"
            items={[
              {
                label: 'Новая заявка',
                value: settings.notifyNewRequest,
                onChange: (value) => setSetting('notifyNewRequest', value),
              },
              {
                label: 'Изменение статуса заявки',
                value: settings.notifyStatusChange,
                onChange: (value) => setSetting('notifyStatusChange', value),
              },
              {
                label: 'Назначение исполнителя',
                value: settings.notifyAssignment,
                onChange: (value) => setSetting('notifyAssignment', value),
              },
              {
                label: 'Завершение ремонта',
                value: settings.notifyCompleted,
                onChange: (value) => setSetting('notifyCompleted', value),
              },
            ]}
          />

          <NotificationSection
            title="Push уведомления"
            description="Что требует мгновенного внимания внутри команды"
            items={[
              {
                label: 'Критические заявки',
                value: settings.pushCritical,
                onChange: (value) => setSetting('pushCritical', value),
              },
              {
                label: 'Просроченные обращения',
                value: settings.pushOverdue,
                onChange: (value) => setSetting('pushOverdue', value),
              },
              {
                label: 'Новые сообщения',
                value: settings.pushMessages,
                onChange: (value) => setSetting('pushMessages', value),
              },
            ]}
          />
        </div>
      ) : null}

      {activeTab === 'security' ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
          <section className="app-panel p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="app-kicker">Безопасность</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">Защита доступа</h2>
              </div>
              <LockKeyhole className="h-5 w-5 text-slate-400" />
            </div>

            <div className="mt-6 space-y-4">
              <Field label="Текущий пароль">
                <input type="password" className="app-input" placeholder="Введите текущий пароль" />
              </Field>
              <Field label="Новый пароль">
                <input type="password" className="app-input" placeholder="Минимум 8 символов" />
              </Field>
              <Field label="Подтверждение">
                <input type="password" className="app-input" placeholder="Повторите новый пароль" />
              </Field>
            </div>

            <div className="mt-6 app-panel-soft p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">Двухфакторная аутентификация</p>
                  <p className="mt-1 text-sm text-slate-500">Дополнительный уровень защиты для администратора.</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.enableTwoFactor}
                    onChange={(event) => setSetting('enableTwoFactor', event.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-blue-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition after:content-[''] peer-checked:after:translate-x-full" />
                </label>
              </div>
            </div>
          </section>

          <section className="app-panel p-5 sm:p-6">
            <div>
              <p className="app-kicker">История входов</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Последние сессии</h2>
            </div>

            <div className="mt-6 space-y-3">
              {[
                { date: '27 апреля 2026, 09:15', ip: '192.168.1.11', device: 'Chrome, Windows', current: true },
                { date: '26 апреля 2026, 18:32', ip: '192.168.1.11', device: 'Chrome, Windows', current: false },
                { date: '26 апреля 2026, 09:05', ip: '192.168.1.11', device: 'Chrome, Windows', current: false },
              ].map((item) => (
                <article key={item.date} className="app-panel-soft p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.date}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.ip} • {item.device}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.current ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.current ? 'Текущая' : 'Завершена'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
        <button
          onClick={restoreDefaults}
          className="app-button-secondary"
        >
          <RotateCcw className="h-4 w-4" />
          Вернуть базовые
        </button>
        <button
          onClick={resetUnsavedChanges}
          disabled={!isDirty}
          className="app-button-secondary disabled:cursor-not-allowed disabled:opacity-60"
        >
          Сбросить несохраненное
        </button>
        <button
          onClick={saveSettings}
          disabled={!isDirty}
          className="app-button-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          Сохранить
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function NotificationSection({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: Array<{
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
  }>;
}) {
  return (
    <section className="app-panel p-5 sm:p-6">
      <div>
        <p className="app-kicker">Уведомления</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <label key={item.label} className="app-panel-soft flex items-center justify-between gap-4 p-4">
            <span className="text-sm font-medium text-slate-700">{item.label}</span>
            <input
              type="checkbox"
              checked={item.value}
              onChange={(event) => item.onChange(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        ))}
      </div>
    </section>
  );
}

function loadStoredSettings() {
  if (typeof window === 'undefined') {
    return cloneSettings(INITIAL_SETTINGS);
  }

  const rawSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);

  if (!rawSettings) {
    return cloneSettings(INITIAL_SETTINGS);
  }

  try {
    const parsed = JSON.parse(rawSettings) as Partial<SettingsState>;
    return {
      ...cloneSettings(INITIAL_SETTINGS),
      ...parsed,
    };
  } catch {
    return cloneSettings(INITIAL_SETTINGS);
  }
}

function persistSettings(settings: SettingsState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

function cloneSettings(settings: SettingsState): SettingsState {
  return JSON.parse(JSON.stringify(settings)) as SettingsState;
}

function serializeSettings(settings: SettingsState) {
  return JSON.stringify(settings);
}
