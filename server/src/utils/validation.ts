import { NextFunction, Request, RequestHandler, Response } from 'express';
import { z, ZodIssue } from 'zod';
import { ApiError } from './http';

const requestStatusSchema = z.enum(['new', 'in_progress', 'waiting_parts', 'completed', 'cancelled']);
const prioritySchema = z.enum(['low', 'medium', 'high']);
const userTypeSchema = z.enum(['admin', 'user']);
const employeeStatusSchema = z.enum(['active', 'inactive']);
const transactionTypeSchema = z.enum(['income', 'expense']);
const inventoryStatusSchema = z.enum(['in_stock', 'low_stock', 'out_of_stock']);

const dateStringSchema = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Неверный формат даты');

const phoneSchema = z
  .string()
  .trim()
  .refine((value) => /^\+?[1-9]\d{1,14}$/.test(value.replace(/\s|\(|\)|-/g, '')), 'Неверный формат телефона');

const optionalString = () =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().optional(),
  );

const optionalEmail = () =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().email('Неверный формат email').optional(),
  );

const optionalNumber = () =>
  z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === 'string') {
      return Number(value);
    }

    return value;
  }, z.number().finite().optional());

const idParamsSchema = z.object({
  id: z.string().trim().min(1, 'ID обязателен'),
});

function validatePart<T extends z.ZodTypeAny>(schema: T, target: 'body' | 'query' | 'params'): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      next(new ApiError(400, formatIssues(result.error.issues)));
      return;
    }

    Object.assign(req[target], result.data);
    next();
  };
}

function formatIssues(issues: ZodIssue[]) {
  return issues.map((issue) => issue.message).join('; ');
}

function pickFirstString(...values: Array<unknown>) {
  return values.find((value) => typeof value === 'string' && value.trim() !== '') as string | undefined;
}

function pickFirstNumber(...values: Array<unknown>) {
  return values.find((value) => typeof value === 'number' && Number.isFinite(value)) as number | undefined;
}

const loginBodySchema = z
  .object({
    username: optionalString(),
    login: optionalString(),
    identifier: optionalString(),
    password: z.string().min(1, 'Пароль обязателен'),
  })
  .superRefine((value, context) => {
    if (!pickFirstString(value.username, value.login, value.identifier)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Логин обязателен' });
    }
  })
  .transform((value) => ({
    username: pickFirstString(value.username, value.login, value.identifier)!,
    password: value.password,
  }));

const registerBodySchema = z.object({
  username: z.string().trim().min(3, 'Логин должен быть не короче 3 символов'),
  email: z.string().trim().email('Неверный формат email'),
  password: z.string().min(6, 'Пароль должен быть не короче 6 символов'),
  name: optionalString(),
  user_type: userTypeSchema.optional(),
});

const requestsQuerySchema = z
  .object({
    status: requestStatusSchema.optional(),
    assigned_to: optionalString(),
    assignedTo: optionalString(),
  })
  .transform((value) => ({
    status: value.status,
    assigned_to: value.assigned_to ?? value.assignedTo,
  }));

const requestCreateSchema = z
  .object({
    clientName: optionalString(),
    client_name: optionalString(),
    clientPhone: optionalString(),
    client_phone: optionalString(),
    clientEmail: optionalEmail(),
    client_email: optionalEmail(),
    deviceType: optionalString(),
    device_type: optionalString(),
    deviceModel: optionalString(),
    device_model: optionalString(),
    serialNumber: optionalString(),
    serial_number: optionalString(),
    problem: optionalString(),
    description: optionalString(),
    priority: prioritySchema.optional(),
    estimatedCost: optionalNumber(),
    estimated_cost: optionalNumber(),
    actualCost: optionalNumber(),
    actual_cost: optionalNumber(),
    assignedTo: optionalString(),
    assigned_to: optionalString(),
    notes: optionalString(),
  })
  .superRefine((value, context) => {
    if (!pickFirstString(value.clientName, value.client_name)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Имя клиента обязательно' });
    }

    const phone = pickFirstString(value.clientPhone, value.client_phone);
    if (!phone) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Телефон клиента обязателен' });
    } else if (!phoneSchema.safeParse(phone).success) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Неверный формат телефона' });
    }

    if (!pickFirstString(value.deviceType, value.device_type)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Тип устройства обязателен' });
    }

    if (!pickFirstString(value.deviceModel, value.device_model)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Модель устройства обязательна' });
    }

    if (!pickFirstString(value.problem, value.description)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Описание проблемы обязательно' });
    }
  })
  .transform((value) => ({
    client_name: pickFirstString(value.client_name, value.clientName)!,
    client_phone: pickFirstString(value.client_phone, value.clientPhone)!,
    client_email: pickFirstString(value.client_email, value.clientEmail),
    device_type: pickFirstString(value.device_type, value.deviceType)!,
    device_model: pickFirstString(value.device_model, value.deviceModel)!,
    serial_number: pickFirstString(value.serial_number, value.serialNumber),
    problem: pickFirstString(value.problem, value.description)!,
    priority: value.priority ?? 'medium',
    estimated_cost: pickFirstNumber(value.estimated_cost, value.estimatedCost),
    actual_cost: pickFirstNumber(value.actual_cost, value.actualCost),
    assigned_to: pickFirstString(value.assigned_to, value.assignedTo),
    notes: value.notes,
  }));

const requestUpdateSchema = z
  .object({
    clientName: optionalString(),
    client_name: optionalString(),
    clientPhone: optionalString(),
    client_phone: optionalString(),
    clientEmail: optionalEmail(),
    client_email: optionalEmail(),
    deviceType: optionalString(),
    device_type: optionalString(),
    deviceModel: optionalString(),
    device_model: optionalString(),
    serialNumber: optionalString(),
    serial_number: optionalString(),
    problem: optionalString(),
    description: optionalString(),
    status: requestStatusSchema.optional(),
    priority: prioritySchema.optional(),
    assignedTo: optionalString(),
    assigned_to: optionalString(),
    estimatedCost: optionalNumber(),
    estimated_cost: optionalNumber(),
    actualCost: optionalNumber(),
    actual_cost: optionalNumber(),
    notes: optionalString(),
  })
  .transform((value) => {
    const payload: Record<string, unknown> = {};

    const mapping: Array<[string, unknown]> = [
      ['client_name', pickFirstString(value.client_name, value.clientName)],
      ['client_phone', pickFirstString(value.client_phone, value.clientPhone)],
      ['client_email', pickFirstString(value.client_email, value.clientEmail)],
      ['device_type', pickFirstString(value.device_type, value.deviceType)],
      ['device_model', pickFirstString(value.device_model, value.deviceModel)],
      ['serial_number', pickFirstString(value.serial_number, value.serialNumber)],
      ['problem', pickFirstString(value.problem, value.description)],
      ['status', value.status],
      ['priority', value.priority],
      ['assigned_to', pickFirstString(value.assigned_to, value.assignedTo)],
      ['estimated_cost', pickFirstNumber(value.estimated_cost, value.estimatedCost)],
      ['actual_cost', pickFirstNumber(value.actual_cost, value.actualCost)],
      ['notes', value.notes],
    ];

    mapping.forEach(([key, fieldValue]) => {
      if (fieldValue !== undefined) {
        payload[key] = fieldValue;
      }
    });

    return payload;
  })
  .superRefine((value, context) => {
    if (Object.keys(value).length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Укажите хотя бы одно поле для обновления',
      });
    }
  });

const clientCreateSchema = z.object({
  name: z.string().trim().min(1, 'Имя клиента обязательно'),
  phone: phoneSchema,
  email: optionalEmail(),
  address: optionalString(),
  notes: optionalString(),
});

const clientUpdateSchema = clientCreateSchema.partial().superRefine((value, context) => {
  if (Object.keys(value).length === 0) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Укажите хотя бы одно поле для обновления' });
  }
});

const employeeCreateSchema = z.object({
  name: z.string().trim().min(1, 'Имя сотрудника обязательно'),
  position: z.string().trim().min(1, 'Должность обязательна'),
  specialization: z.string().trim().min(1, 'Специализация обязательна'),
  phone: phoneSchema,
  email: optionalEmail(),
  status: employeeStatusSchema.optional(),
});

const employeeUpdateSchema = employeeCreateSchema.partial().superRefine((value, context) => {
  if (Object.keys(value).length === 0) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Укажите хотя бы одно поле для обновления' });
  }
});

const dateRangeFields = {
  startDate: z.preprocess(
    (value) => (value === '' ? undefined : value),
    dateStringSchema.optional(),
  ),
  endDate: z.preprocess(
    (value) => (value === '' ? undefined : value),
    dateStringSchema.optional(),
  ),
};

const dateRangeSchema = z
  .object(dateRangeFields)
  .superRefine((value, context) => {
    if (value.startDate && value.endDate && new Date(value.startDate).getTime() > new Date(value.endDate).getTime()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Дата начала не может быть позже даты окончания',
      });
    }
  });

const transactionsQuerySchema = z
  .object({
    ...dateRangeFields,
    type: transactionTypeSchema.optional(),
    request_id: optionalString(),
  })
  .superRefine((value, context) => {
    if (value.startDate && value.endDate && new Date(value.startDate).getTime() > new Date(value.endDate).getTime()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Дата начала не может быть позже даты окончания',
      });
    }
  });

const transactionCreateSchema = z.object({
  request_id: optionalString(),
  type: transactionTypeSchema,
  description: z.string().trim().min(1, 'Описание операции обязательно'),
  amount: z.coerce.number().positive('Сумма должна быть больше нуля'),
  date: z.preprocess((value) => (value === '' ? undefined : value), dateStringSchema.optional()),
});

const statsQuerySchema = dateRangeSchema;

const inventoryQuerySchema = z.object({
  search: optionalString(),
  category: optionalString(),
  status: inventoryStatusSchema.optional(),
});

const inventoryCreateSchema = z
  .object({
    name: z.string().trim().min(1, 'Название позиции обязательно'),
    category: z.string().trim().min(1, 'Категория обязательна'),
    quantity: z.coerce.number().int().min(0, 'Количество не может быть отрицательным').optional(),
    minQuantity: z.coerce.number().int().min(0, 'Минимальный остаток не может быть отрицательным').optional(),
    min_quantity: z.coerce.number().int().min(0, 'Минимальный остаток не может быть отрицательным').optional(),
    unitPrice: optionalNumber(),
    unit_price: optionalNumber(),
    supplier: optionalString(),
    notes: optionalString(),
  })
  .transform((value) => ({
    name: value.name,
    category: value.category,
    quantity: value.quantity ?? 0,
    min_quantity: value.min_quantity ?? value.minQuantity ?? 0,
    unit_price: pickFirstNumber(value.unit_price, value.unitPrice),
    supplier: value.supplier,
    notes: value.notes,
  }));

const inventoryUpdateSchema = z
  .object({
    name: optionalString(),
    category: optionalString(),
    quantity: z.coerce.number().int().min(0, 'Количество не может быть отрицательным').optional(),
    minQuantity: z.coerce.number().int().min(0, 'Минимальный остаток не может быть отрицательным').optional(),
    min_quantity: z.coerce.number().int().min(0, 'Минимальный остаток не может быть отрицательным').optional(),
    unitPrice: optionalNumber(),
    unit_price: optionalNumber(),
    supplier: optionalString(),
    notes: optionalString(),
  })
  .transform((value) => {
    const payload: Record<string, unknown> = {};

    if (value.name !== undefined) payload.name = value.name;
    if (value.category !== undefined) payload.category = value.category;
    if (value.quantity !== undefined) payload.quantity = value.quantity;
    if (value.min_quantity !== undefined || value.minQuantity !== undefined) {
      payload.min_quantity = value.min_quantity ?? value.minQuantity;
    }
    if (value.unit_price !== undefined || value.unitPrice !== undefined) {
      payload.unit_price = pickFirstNumber(value.unit_price, value.unitPrice);
    }
    if (value.supplier !== undefined) payload.supplier = value.supplier;
    if (value.notes !== undefined) payload.notes = value.notes;

    return payload;
  })
  .superRefine((value, context) => {
    if (Object.keys(value).length === 0) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Укажите хотя бы одно поле для обновления' });
    }
  });

export const validateLogin = validatePart(loginBodySchema, 'body');
export const validateRegister = validatePart(registerBodySchema, 'body');
export const validateRequestListQuery = validatePart(requestsQuerySchema, 'query');
export const validateRequestCreate = validatePart(requestCreateSchema, 'body');
export const validateRequestUpdate = validatePart(requestUpdateSchema, 'body');
export const validateIdParams = validatePart(idParamsSchema, 'params');
export const validateClientCreate = validatePart(clientCreateSchema, 'body');
export const validateClientUpdate = validatePart(clientUpdateSchema, 'body');
export const validateEmployeeCreate = validatePart(employeeCreateSchema, 'body');
export const validateEmployeeUpdate = validatePart(employeeUpdateSchema, 'body');
export const validateTransactionsQuery = validatePart(transactionsQuerySchema, 'query');
export const validateTransactionCreate = validatePart(transactionCreateSchema, 'body');
export const validateStatsQuery = validatePart(statsQuerySchema, 'query');
export const validateInventoryQuery = validatePart(inventoryQuerySchema, 'query');
export const validateInventoryCreate = validatePart(inventoryCreateSchema, 'body');
export const validateInventoryUpdate = validatePart(inventoryUpdateSchema, 'body');

export function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  return validateRequestCreate(req, res, next);
}
