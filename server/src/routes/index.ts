import express from 'express';
import * as authController from '../controllers/authController';
import * as clientsController from '../controllers/clientsController';
import * as employeesController from '../controllers/employeesController';
import * as financeController from '../controllers/financeController';
import * as inventoryController from '../controllers/inventoryController';
import * as requestsController from '../controllers/requestsController';
import * as statsController from '../controllers/statsController';
import {
  validateClientCreate,
  validateClientUpdate,
  validateEmployeeCreate,
  validateEmployeeUpdate,
  validateIdParams,
  validateInventoryCreate,
  validateInventoryQuery,
  validateInventoryUpdate,
  validateLogin,
  validateRegister,
  validateRequestCreate,
  validateRequestListQuery,
  validateRequestUpdate,
  validateStatsQuery,
  validateTransactionCreate,
  validateTransactionsQuery,
} from '../utils/validation';

const router = express.Router();

router.post('/auth/login', validateLogin, authController.login);
router.post('/auth/register', validateRegister, authController.register);

router.get('/requests', validateRequestListQuery, requestsController.getRequests);
router.get('/requests/:id', validateIdParams, requestsController.getRequestById);
router.post('/requests', validateRequestCreate, requestsController.createRequest);
router.put('/requests/:id', validateIdParams, validateRequestUpdate, requestsController.updateRequest);
router.delete('/requests/:id', validateIdParams, requestsController.deleteRequest);

router.get('/clients', clientsController.getClients);
router.get('/clients/:id', validateIdParams, clientsController.getClientById);
router.post('/clients', validateClientCreate, clientsController.createClient);
router.put('/clients/:id', validateIdParams, validateClientUpdate, clientsController.updateClient);
router.delete('/clients/:id', validateIdParams, clientsController.deleteClient);

router.get('/employees', employeesController.getEmployees);
router.get('/employees/:id', validateIdParams, employeesController.getEmployeeById);
router.post('/employees', validateEmployeeCreate, employeesController.createEmployee);
router.put('/employees/:id', validateIdParams, validateEmployeeUpdate, employeesController.updateEmployee);
router.delete('/employees/:id', validateIdParams, employeesController.deleteEmployee);

router.get('/finance/transactions', validateTransactionsQuery, financeController.getTransactions);
router.get('/finance/stats', validateStatsQuery, financeController.getFinanceStats);
router.post('/finance/transactions', validateTransactionCreate, financeController.createTransaction);
router.delete('/finance/transactions/:id', validateIdParams, financeController.deleteTransaction);

router.get('/stats/dashboard', validateStatsQuery, statsController.getDashboardStats);
router.get('/stats/requests', validateStatsQuery, statsController.getRequestStats);

router.get('/inventory', validateInventoryQuery, inventoryController.getInventory);
router.get('/inventory/:id', validateIdParams, inventoryController.getInventoryItemById);
router.post('/inventory', validateInventoryCreate, inventoryController.createInventoryItem);
router.put('/inventory/:id', validateIdParams, validateInventoryUpdate, inventoryController.updateInventoryItem);
router.delete('/inventory/:id', validateIdParams, inventoryController.deleteInventoryItem);

export default router;
