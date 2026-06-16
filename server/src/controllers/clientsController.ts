import { ClientModel } from '../models/Client';
import { ApiError, asyncHandler, sendMessage, sendSuccess } from '../utils/http';

export const getClients = asyncHandler(async (req, res) => {
  return sendSuccess(res, await ClientModel.findAll());
});

export const getClientById = asyncHandler(async (req, res) => {
  const client = await ClientModel.findById(req.params.id);

  if (!client) {
    throw new ApiError(404, 'Клиент не найден');
  }

  return sendSuccess(res, client);
});

export const createClient = asyncHandler(async (req, res) => {
  return sendSuccess(res, await ClientModel.create(req.body), 201);
});

export const updateClient = asyncHandler(async (req, res) => {
  const client = await ClientModel.update(req.params.id, req.body);

  if (!client) {
    throw new ApiError(404, 'Клиент не найден');
  }

  return sendSuccess(res, client);
});

export const deleteClient = asyncHandler(async (req, res) => {
  const deleted = await ClientModel.delete(req.params.id);

  if (!deleted) {
    throw new ApiError(404, 'Клиент не найден');
  }

  return sendMessage(res, 'Клиент удален');
});

