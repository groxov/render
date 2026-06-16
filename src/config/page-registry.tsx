import { type ReactNode } from 'react';
import CalendarPage from '../components/CalendarPage';
import ClientsPage from '../components/ClientsPage';
import Dashboard from '../components/Dashboard';
import EmployeesPage from '../components/EmployeesPage';
import FinancePage from '../components/FinancePage';
import InventoryPage from '../components/InventoryPage';
import NewRequestPage from '../components/NewRequestPage';
import PublicRequestForm from '../components/PublicRequestForm';
import ReportsPage from '../components/ReportsPage';
import RequestsPage from '../components/RequestsPage';
import SettingsPage from '../components/SettingsPage';
import { AdminPageType, PageType, RepairRequest, StandalonePageType } from '../types';

interface AdminPageContext {
  onViewRequest: (request: RepairRequest) => void;
}

type AdminPageRenderer = (context: AdminPageContext) => ReactNode;

const ADMIN_PAGE_RENDERERS: Record<AdminPageType, AdminPageRenderer> = {
  dashboard: ({ onViewRequest }) => <Dashboard onViewRequest={onViewRequest} />,
  requests: ({ onViewRequest }) => <RequestsPage onViewRequest={onViewRequest} />,
  'new-request': () => <NewRequestPage />,
  clients: () => <ClientsPage />,
  employees: () => <EmployeesPage />,
  reports: () => <ReportsPage />,
  settings: () => <SettingsPage />,
  inventory: () => <InventoryPage />,
  calendar: ({ onViewRequest }) => <CalendarPage onViewRequest={onViewRequest} />,
  finance: () => <FinancePage />,
};

export function isStandalonePage(page: PageType): page is StandalonePageType {
  return page === 'public-request';
}

export function isAdminPage(page: PageType): page is AdminPageType {
  return page in ADMIN_PAGE_RENDERERS;
}

export function renderStandalonePage(
  page: StandalonePageType,
  onNavigate: (page: PageType) => void,
) {
  return <PublicRequestForm onNavigate={onNavigate} />;
}

export function renderAdminPage(page: AdminPageType, context: AdminPageContext) {
  return ADMIN_PAGE_RENDERERS[page](context);
}
