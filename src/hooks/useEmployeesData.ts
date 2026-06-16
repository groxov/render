import { useEffect, useMemo, useState } from 'react';
import { employeesApi } from '../services/api';
import { ApiEmployeeItem, Employee, RepairRequest } from '../types';
import { useRequests } from './useRequests';

export interface EmployeeListItem extends Employee {
  activeAssignments: number;
}

export type EmployeesDataSource = 'api' | 'requests' | 'empty';

export function useEmployeesData() {
  const requestsState = useRequests();
  const [apiEmployees, setApiEmployees] = useState<Employee[]>([]);
  const [apiResolved, setApiResolved] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadEmployees = async () => {
      try {
        const response = await employeesApi.getAll();

        if (!cancelled) {
          setApiEmployees(response.success ? response.data.map(mapApiEmployee) : []);
        }
      } catch (error) {
        if (!cancelled) {
          setApiError(error instanceof Error ? error.message : 'Не удалось загрузить сотрудников.');
        }
      } finally {
        if (!cancelled) {
          setApiResolved(true);
        }
      }
    };

    void loadEmployees();

    return () => {
      cancelled = true;
    };
  }, []);

  const requestsDerivedEmployees = useMemo(
    () => buildEmployeesFromRequests(requestsState.requests),
    [requestsState.requests],
  );

  const dataSource: EmployeesDataSource =
    apiEmployees.length > 0 ? 'api' : requestsDerivedEmployees.length > 0 ? 'requests' : 'empty';
  const baseEmployees = dataSource === 'api' ? apiEmployees : requestsDerivedEmployees;
  const employees = useMemo(
    () =>
      baseEmployees.map((employee) => ({
        ...employee,
        activeAssignments: requestsState.requests.filter(
          (request) =>
            request.status !== 'completed' &&
            request.status !== 'cancelled' &&
            isRequestAssignedToEmployee(request.assignedTo, employee),
        ).length,
      })),
    [baseEmployees, requestsState.requests],
  );

  return {
    employees,
    loading: !apiResolved || requestsState.loading,
    usingFallbackData: dataSource === 'requests',
    dataSource,
    error: apiError ?? requestsState.error,
    isEmpty: dataSource === 'empty' && employees.length === 0,
  };
}

function mapApiEmployee(item: ApiEmployeeItem): Employee {
  return {
    id: item.id,
    name: item.name,
    position: item.position,
    specialization: item.specialization,
    phone: item.phone,
    email: item.email ?? '',
    status: item.status,
    completedRepairs: Number(item.completed_repairs ?? 0),
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
  };
}

function buildEmployeesFromRequests(requests: RepairRequest[]): Employee[] {
  const employeesByName = new Map<
    string,
    {
      id: string;
      name: string;
      deviceTypes: Set<string>;
      completedRepairs: number;
      createdAt: Date;
      updatedAt: Date;
    }
  >();

  requests.forEach((request) => {
    const assignedTo = request.assignedTo?.trim();

    if (!assignedTo || !isHumanReadableAssignee(assignedTo)) {
      return;
    }

    const key = assignedTo.toLowerCase();
    const existing = employeesByName.get(key);

    if (!existing) {
      employeesByName.set(key, {
        id: `derived-${slugify(assignedTo)}`,
        name: assignedTo,
        deviceTypes: new Set([request.deviceType]),
        completedRepairs: request.status === 'completed' ? 1 : 0,
        createdAt: request.createdAt,
        updatedAt: request.createdAt,
      });
      return;
    }

    existing.deviceTypes.add(request.deviceType);
    if (request.status === 'completed') {
      existing.completedRepairs += 1;
    }
    if (request.createdAt < existing.createdAt) {
      existing.createdAt = request.createdAt;
    }
    if (request.createdAt > existing.updatedAt) {
      existing.updatedAt = request.createdAt;
    }
  });

  return Array.from(employeesByName.values())
    .map((employee) => ({
      id: employee.id,
      name: employee.name,
      position: 'Мастер',
      specialization: Array.from(employee.deviceTypes).slice(0, 3).join(', '),
      phone: '—',
      email: '',
      status: 'active' as const,
      completedRepairs: employee.completedRepairs,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    }))
    .sort((left, right) => left.name.localeCompare(right.name, 'ru'));
}

function isHumanReadableAssignee(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return false;
  }

  if (/^[a-f0-9-]{8,}$/i.test(normalizedValue)) {
    return false;
  }

  return /[A-Za-zА-Яа-яЁё]/.test(normalizedValue);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');
}

function isRequestAssignedToEmployee(assignedTo: string | undefined, employee: Employee) {
  if (!assignedTo) {
    return false;
  }

  const normalizedAssigned = assignedTo.trim().toLowerCase();
  const normalizedName = employee.name.trim().toLowerCase();

  return normalizedAssigned === employee.id.toLowerCase() || normalizedAssigned === normalizedName;
}
