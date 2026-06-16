import { EmployeeModel } from '../models/Employee';
import { ApiError, asyncHandler, sendMessage, sendSuccess } from '../utils/http';

export const getEmployees = asyncHandler(async (req, res) => {
  return sendSuccess(res, await EmployeeModel.findAll());
});

export const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await EmployeeModel.findById(req.params.id);

  if (!employee) {
    throw new ApiError(404, 'Сотрудник не найден');
  }

  return sendSuccess(res, employee);
});

export const createEmployee = asyncHandler(async (req, res) => {
  return sendSuccess(res, await EmployeeModel.create(req.body), 201);
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await EmployeeModel.update(req.params.id, req.body);

  if (!employee) {
    throw new ApiError(404, 'Сотрудник не найден');
  }

  return sendSuccess(res, employee);
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  const deleted = await EmployeeModel.delete(req.params.id);

  if (!deleted) {
    throw new ApiError(404, 'Сотрудник не найден');
  }

  return sendMessage(res, 'Сотрудник удален');
});

