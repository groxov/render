export type RequestStatus = 'new' | 'in_progress' | 'waiting_parts' | 'completed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high';
export type UserType = 'admin' | 'user';
export type PageType = 
  | 'landing' 
  | 'login' 
  | 'dashboard' 
  | 'requests' 
  | 'new-request' 
  | 'clients' 
  | 'employees' 
  | 'reports' 
  | 'settings' 
  | 'inventory' 
  | 'calendar' 
  | 'finance' 
  | 'public-request';

export type StandalonePageType = Extract<PageType, 'public-request'>;
export type AdminPageType = Exclude<PageType, 'landing' | 'login' | StandalonePageType>;

export interface RepairRequest {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  deviceType: string;
  deviceModel: string;
  serialNumber: string;
  problem: string;
  status: RequestStatus;
  priority: Priority;
  createdAt: Date;
  assignedTo?: string;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  updatedAt?: Date;
  completedAt?: Date;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  specialization: string;
  phone: string;
  email?: string;
  status: 'active' | 'inactive';
  completedRepairs: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiClientItem {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiEmployeeItem {
  id: string;
  name: string;
  position: string;
  specialization: string;
  phone: string;
  email?: string;
  status: 'active' | 'inactive';
  completed_repairs: number;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  meta?: {
    requestId?: string;
  };
}

export interface AuthSession {
  name: string;
  type: UserType;
}

export interface AuthUserPayload {
  username?: string;
  name?: string;
  user_type?: UserType;
}

export interface AuthResponse {
  token: string;
  user: AuthUserPayload;
}

export interface FinanceStats {
  totalIncome: number;
  totalExpenses: number;
  profit: number;
  margin: number;
  avgCheck: number;
  incomeCount: number;
  expenseCount: number;
}

export interface FinanceTransaction {
  id: string;
  request_id?: string | null;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
}

export interface FinanceFilters {
  type?: FinanceTransaction['type'];
  startDate?: string;
  endDate?: string;
  request_id?: string;
}

export interface ApiRequestItem {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  deviceType: string;
  deviceModel: string;
  serialNumber?: string;
  description: string;
  status: RequestStatus;
  priority: Priority;
  assignedTo?: string;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}


