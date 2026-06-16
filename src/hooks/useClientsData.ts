import { useEffect, useMemo, useState } from 'react';
import { clientsApi } from '../services/api';
import { ApiClientItem, Client, RepairRequest } from '../types';
import { useRequests } from './useRequests';

export interface ClientListItem extends Client {
  totalOrders: number;
  lastVisit: Date | null;
}

export type ClientsDataSource = 'api' | 'requests' | 'empty';

export function useClientsData() {
  const requestsState = useRequests();
  const [apiClients, setApiClients] = useState<Client[]>([]);
  const [apiResolved, setApiResolved] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadClients = async () => {
      try {
        const response = await clientsApi.getAll();

        if (!cancelled) {
          setApiClients(response.success ? response.data.map(mapApiClient) : []);
        }
      } catch (error) {
        if (!cancelled) {
          setApiError(error instanceof Error ? error.message : 'Не удалось загрузить клиентов.');
        }
      } finally {
        if (!cancelled) {
          setApiResolved(true);
        }
      }
    };

    void loadClients();

    return () => {
      cancelled = true;
    };
  }, []);

  const requestsDerivedClients = useMemo(
    () => buildClientsFromRequests(requestsState.requests),
    [requestsState.requests],
  );

  const dataSource: ClientsDataSource =
    apiClients.length > 0 ? 'api' : requestsDerivedClients.length > 0 ? 'requests' : 'empty';
  const baseClients = dataSource === 'api' ? apiClients : requestsDerivedClients;
  const clients = useMemo(
    () => decorateClients(baseClients, requestsState.requests),
    [baseClients, requestsState.requests],
  );

  return {
    clients,
    loading: !apiResolved || requestsState.loading,
    usingFallbackData: dataSource === 'requests',
    dataSource,
    fallbackSource: dataSource === 'requests' ? 'requests' : null,
    error: apiError ?? requestsState.error,
    isEmpty: dataSource === 'empty' && clients.length === 0,
  };
}

function mapApiClient(item: ApiClientItem): Client {
  return {
    id: item.id,
    name: item.name,
    phone: item.phone,
    email: item.email ?? '',
    address: item.address ?? '',
    notes: item.notes ?? '',
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
  };
}

function buildClientsFromRequests(requests: RepairRequest[]): Client[] {
  const clientsByPhone = new Map<string, Client>();

  requests.forEach((request) => {
    if (!request.clientPhone) {
      return;
    }

    const existingClient = clientsByPhone.get(request.clientPhone);
    const updatedAt = request.createdAt;

    if (!existingClient) {
      clientsByPhone.set(request.clientPhone, {
        id: request.clientPhone,
        name: request.clientName,
        phone: request.clientPhone,
        email: request.clientEmail ?? '',
        address: '',
        notes: '',
        createdAt: updatedAt,
        updatedAt,
      });
      return;
    }

    if (updatedAt > existingClient.updatedAt) {
      clientsByPhone.set(request.clientPhone, {
        ...existingClient,
        name: request.clientName || existingClient.name,
        email: request.clientEmail || existingClient.email,
        updatedAt,
      });
    }
  });

  return Array.from(clientsByPhone.values()).sort(
    (left, right) => right.updatedAt.getTime() - left.updatedAt.getTime(),
  );
}

function decorateClients(clients: Client[], requests: RepairRequest[]): ClientListItem[] {
  return clients
    .map((client) => {
      const clientRequests = requests.filter((request) => isRequestLinkedToClient(request, client));
      const lastVisit = clientRequests.reduce<Date | null>((latest, request) => {
        if (!latest || request.createdAt > latest) {
          return request.createdAt;
        }

        return latest;
      }, null);

      return {
        ...client,
        totalOrders: clientRequests.length,
        lastVisit,
      };
    })
    .sort((left, right) => {
      const leftTimestamp = left.lastVisit?.getTime() ?? left.updatedAt.getTime();
      const rightTimestamp = right.lastVisit?.getTime() ?? right.updatedAt.getTime();
      return rightTimestamp - leftTimestamp;
    });
}

function isRequestLinkedToClient(request: RepairRequest, client: Client) {
  const normalizedClientName = client.name.trim().toLowerCase();
  const normalizedRequestName = request.clientName.trim().toLowerCase();

  return (
    request.clientPhone === client.phone ||
    (!!client.email && !!request.clientEmail && request.clientEmail === client.email) ||
    normalizedRequestName === normalizedClientName
  );
}
