import { dbTransaction } from '../database/db';
import { Client, ClientModel, ClientMutationInput } from '../models/Client';
import { EmployeeModel } from '../models/Employee';
import { RepairRequest, RepairRequestCreateInput, RepairRequestModel } from '../models/RepairRequest';
import { TransactionModel } from '../models/Transaction';
import { ApiError, asyncHandler, sendMessage, sendSuccess } from '../utils/http';

interface RequestQuery {
  status?: RepairRequest['status'];
  assigned_to?: string;
}

interface RequestWritePayload {
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  device_type?: string;
  device_model?: string;
  serial_number?: string;
  problem?: string;
  status?: RepairRequest['status'];
  priority?: RepairRequest['priority'];
  assigned_to?: string;
  estimated_cost?: number;
  actual_cost?: number;
  notes?: string;
}

export const getRequests = asyncHandler(async (req, res) => {
  const { status, assigned_to } = req.query as RequestQuery;

  return sendSuccess(
    res,
    await RepairRequestModel.findAll({
      status,
      assigned_to,
    }),
  );
});

export const getRequestById = asyncHandler(async (req, res) => {
  const request = await RepairRequestModel.findById(req.params.id);

  if (!request) {
    throw new ApiError(404, 'Заявка не найдена');
  }

  return sendSuccess(res, request);
});

export const createRequest = asyncHandler(async (req, res) => {
  const payload = req.body as RequestWritePayload;

  const request = await dbTransaction(async () => {
    await ensureEmployeeExists(payload.assigned_to);

    const client = await findOrCreateClient({
      name: payload.client_name!,
      phone: payload.client_phone!,
      email: payload.client_email ?? null,
    });

    return RepairRequestModel.create({
      client_id: client.id,
      client_name: payload.client_name!,
      client_phone: payload.client_phone!,
      client_email: payload.client_email ?? null,
      device_type: payload.device_type!,
      device_model: payload.device_model!,
      serial_number: payload.serial_number ?? null,
      problem: payload.problem!,
      status: 'new',
      priority: payload.priority ?? 'medium',
      assigned_to: payload.assigned_to ?? null,
      estimated_cost: payload.estimated_cost ?? null,
      actual_cost: payload.actual_cost ?? null,
      notes: payload.notes ?? null,
    } satisfies RepairRequestCreateInput);
  });

  return sendSuccess(res, request, 201);
});

export const updateRequest = asyncHandler(async (req, res) => {
  const payload = req.body as RequestWritePayload;
  const id = req.params.id;

  const request = await dbTransaction(async () => {
    const currentRequest = await RepairRequestModel.findById(id);

    if (!currentRequest) {
      throw new ApiError(404, 'Заявка не найдена');
    }

    await ensureEmployeeExists(payload.assigned_to);

    const clientId = await syncRequestClient(currentRequest, payload);
    const nextStatus = payload.status ?? currentRequest.status;
    const updateData: Partial<RepairRequest> = {
      ...payload,
      client_id: clientId,
    };

    if (nextStatus === 'completed' && currentRequest.status !== 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    if (nextStatus !== 'completed' && currentRequest.status === 'completed') {
      updateData.completed_at = null;
    }

    const updatedRequest = await RepairRequestModel.update(id, updateData);

    if (!updatedRequest) {
      throw new ApiError(404, 'Заявка не найдена');
    }

    await syncCompletedRepairsCounters(currentRequest, updatedRequest);
    await syncCompletionIncomeTransaction(updatedRequest);

    return updatedRequest;
  });

  return sendSuccess(res, request);
});

export const deleteRequest = asyncHandler(async (req, res) => {
  await dbTransaction(async () => {
    const request = await RepairRequestModel.findById(req.params.id);

    if (!request) {
      throw new ApiError(404, 'Заявка не найдена');
    }

    if (request.status === 'completed' && request.assigned_to) {
      await EmployeeModel.adjustCompletedRepairs(request.assigned_to, -1);
    }

    await TransactionModel.deleteIncomeByRequestId(request.id);

    const deleted = await RepairRequestModel.delete(req.params.id);
    if (!deleted) {
      throw new ApiError(404, 'Заявка не найдена');
    }
  });

  return sendMessage(res, 'Заявка удалена');
});

async function ensureEmployeeExists(employeeId?: string | null) {
  if (!employeeId) {
    return;
  }

  const employee = await EmployeeModel.findById(employeeId);
  if (!employee) {
    throw new ApiError(400, 'Назначенный сотрудник не найден');
  }
}

async function findOrCreateClient(input: Pick<ClientMutationInput, 'name' | 'phone' | 'email'>): Promise<Client> {
  const existingClient = await ClientModel.findByPhone(input.phone);

  if (!existingClient) {
    return ClientModel.create({
      name: input.name,
      phone: input.phone,
      email: input.email ?? null,
    });
  }

  const shouldUpdate =
    existingClient.name !== input.name ||
    (existingClient.email ?? null) !== (input.email ?? null);

  if (!shouldUpdate) {
    return existingClient;
  }

  const updatedClient = await ClientModel.update(existingClient.id, {
    name: input.name,
    email: input.email ?? null,
  });

  return updatedClient ?? existingClient;
}

async function syncRequestClient(currentRequest: RepairRequest, payload: RequestWritePayload) {
  const clientName = payload.client_name ?? currentRequest.client_name;
  const clientPhone = payload.client_phone ?? currentRequest.client_phone;
  const clientEmail = payload.client_email ?? currentRequest.client_email;

  if (currentRequest.client_id) {
    await ClientModel.update(currentRequest.client_id, {
      name: clientName,
      phone: clientPhone,
      email: clientEmail ?? null,
    });

    return currentRequest.client_id;
  }

  const client = await findOrCreateClient({
    name: clientName,
    phone: clientPhone,
    email: clientEmail ?? null,
  });

  return client.id;
}

async function syncCompletedRepairsCounters(previousRequest: RepairRequest, nextRequest: RepairRequest) {
  const wasCompleted = previousRequest.status === 'completed';
  const isCompleted = nextRequest.status === 'completed';
  const previousEmployeeId = previousRequest.assigned_to;
  const nextEmployeeId = nextRequest.assigned_to;

  if (!wasCompleted && isCompleted && nextEmployeeId) {
    await EmployeeModel.adjustCompletedRepairs(nextEmployeeId, 1);
    return;
  }

  if (wasCompleted && !isCompleted && previousEmployeeId) {
    await EmployeeModel.adjustCompletedRepairs(previousEmployeeId, -1);
    return;
  }

  if (wasCompleted && isCompleted && previousEmployeeId !== nextEmployeeId) {
    if (previousEmployeeId) {
      await EmployeeModel.adjustCompletedRepairs(previousEmployeeId, -1);
    }

    if (nextEmployeeId) {
      await EmployeeModel.adjustCompletedRepairs(nextEmployeeId, 1);
    }
  }
}

async function syncCompletionIncomeTransaction(request: RepairRequest) {
  const existingTransaction = await TransactionModel.findIncomeByRequestId(request.id);

  const amount = request.actual_cost ?? request.estimated_cost;
  if (request.status !== 'completed' || !amount || amount <= 0) {
    if (existingTransaction) {
      await TransactionModel.deleteIncomeByRequestId(request.id);
    }
    return;
  }

  const description = `Ремонт ${request.device_type} ${request.device_model}`;
  const date = request.completed_at ?? new Date().toISOString();
  if (!existingTransaction) {
    await TransactionModel.create({
      request_id: request.id,
      type: 'income',
      description,
      amount,
      date,
    });
    return;
  }

  await TransactionModel.update(existingTransaction.id, {
    description,
    amount,
    date,
  });
}
