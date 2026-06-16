import { ApiRequestItem, Priority, RepairRequest, RequestStatus } from '../types';

interface ApiRepairRequestRecord {
  id: string;
  client_name: string;
  client_phone: string;
  client_email?: string | null;
  device_type: string;
  device_model: string;
  serial_number?: string | null;
  problem: string;
  status?: string | null;
  priority?: string | null;
  created_at: string;
  updated_at?: string;
  assigned_to?: string | null;
  assigned_to_name?: string | null;
  estimated_cost?: number | null;
  actual_cost?: number | null;
  notes?: string | null;
  completed_at?: string | null;
}

type ApiRequestRecord = ApiRequestItem | ApiRepairRequestRecord;

const REQUEST_STATUSES: RequestStatus[] = ['new', 'in_progress', 'waiting_parts', 'completed', 'cancelled'];
const REQUEST_PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export function transformApiRequestToRepairRequest(item: ApiRequestRecord): RepairRequest {
  if ('client_name' in item) {
    return {
      id: item.id,
      clientName: item.client_name,
      clientPhone: item.client_phone,
      clientEmail: item.client_email ?? '',
      deviceType: item.device_type,
      deviceModel: item.device_model,
      serialNumber: item.serial_number ?? '',
      problem: item.problem,
      status: normalizeStatus(item.status),
      priority: normalizePriority(item.priority),
      createdAt: parseDate(item.created_at),
      assignedTo: item.assigned_to_name ?? item.assigned_to ?? '',
      estimatedCost: item.estimated_cost ?? item.actual_cost ?? undefined,
      actualCost: item.actual_cost ?? undefined,
      notes: item.notes ?? '',
      updatedAt: item.updated_at ? parseDate(item.updated_at) : undefined,
      completedAt: item.completed_at ? parseDate(item.completed_at) : undefined,
    };
  }

  return {
    id: item.id,
    clientName: item.clientName,
    clientPhone: item.clientPhone,
    clientEmail: item.clientEmail ?? '',
    deviceType: item.deviceType,
    deviceModel: item.deviceModel,
    serialNumber: item.serialNumber ?? '',
    problem: item.description,
    status: normalizeStatus(item.status),
    priority: normalizePriority(item.priority),
    createdAt: parseDate(item.createdAt),
    assignedTo: item.assignedTo ?? '',
    estimatedCost: item.estimatedCost ?? undefined,
    actualCost: item.actualCost ?? undefined,
    notes: item.notes ?? '',
    updatedAt: item.updatedAt ? parseDate(item.updatedAt) : undefined,
    completedAt: item.completedAt ? parseDate(item.completedAt) : undefined,
  };
}

export function transformApiRequestsToRepairRequests(items: ApiRequestRecord[]): RepairRequest[] {
  return items.map(transformApiRequestToRepairRequest);
}

function normalizeStatus(value?: string | null): RequestStatus {
  return REQUEST_STATUSES.includes(value as RequestStatus) ? (value as RequestStatus) : 'new';
}

function normalizePriority(value?: string | null): Priority {
  return REQUEST_PRIORITIES.includes(value as Priority) ? (value as Priority) : 'medium';
}

function parseDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}
