import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Cog,
  LayoutDashboard,
  Package,
  PlusCircle,
  UserRoundCog,
  Users,
  Wallet,
} from 'lucide-react';
import { AdminPageType } from '../types';

export interface NavigationItem {
  id: AdminPageType;
  label: string;
  icon: typeof LayoutDashboard;
  section?: string;
}

export const ADMIN_NAV_ITEMS: NavigationItem[] = [
  { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { id: 'requests', label: 'Все заявки', icon: ClipboardList },
  { id: 'new-request', label: 'Новая заявка', icon: PlusCircle },
  { id: 'calendar', label: 'Календарь', icon: CalendarDays, section: 'Управление' },
  { id: 'clients', label: 'Клиенты', icon: Users },
  { id: 'employees', label: 'Сотрудники', icon: UserRoundCog },
  { id: 'inventory', label: 'Инвентарь', icon: Package },
  { id: 'finance', label: 'Финансы', icon: Wallet, section: 'Аналитика' },
  { id: 'reports', label: 'Отчеты', icon: BarChart3 },
  { id: 'settings', label: 'Настройки', icon: Cog, section: 'Система' },
];
