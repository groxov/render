import { InventoryStockStatus, InventoryModel } from '../models/Inventory';
import { ApiError, asyncHandler, sendMessage, sendSuccess } from '../utils/http';

export const getInventory = asyncHandler(async (req, res) => {
  const items = await InventoryModel.findAll({
    search: req.query.search as string | undefined,
    category: req.query.category as string | undefined,
    status: req.query.status as InventoryStockStatus | undefined,
  });

  return sendSuccess(res, items);
});

export const getInventoryItemById = asyncHandler(async (req, res) => {
  const item = await InventoryModel.findById(req.params.id);

  if (!item) {
    throw new ApiError(404, 'Складская позиция не найдена');
  }

  return sendSuccess(res, item);
});

export const createInventoryItem = asyncHandler(async (req, res) => {
  const item = await InventoryModel.create(req.body);
  return sendSuccess(res, item, 201);
});

export const updateInventoryItem = asyncHandler(async (req, res) => {
  const item = await InventoryModel.update(req.params.id, req.body);

  if (!item) {
    throw new ApiError(404, 'Складская позиция не найдена');
  }

  return sendSuccess(res, item);
});

export const deleteInventoryItem = asyncHandler(async (req, res) => {
  const deleted = await InventoryModel.delete(req.params.id);

  if (!deleted) {
    throw new ApiError(404, 'Складская позиция не найдена');
  }

  return sendMessage(res, 'Складская позиция удалена');
});
