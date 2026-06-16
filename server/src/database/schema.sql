CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  user_type TEXT NOT NULL DEFAULT 'user' CHECK(user_type IN ('admin', 'user')),
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  specialization TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
  completed_repairs INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS repair_requests (
  id TEXT PRIMARY KEY,
  client_id TEXT,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  device_type TEXT NOT NULL,
  device_model TEXT NOT NULL,
  serial_number TEXT,
  problem TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'in_progress', 'waiting_parts', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
  assigned_to TEXT,
  estimated_cost DOUBLE PRECISION,
  actual_cost DOUBLE PRECISION,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  request_id TEXT,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  description TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES repair_requests(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 0,
  unit_price DOUBLE PRECISION,
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_repair_requests_status ON repair_requests(status);
CREATE INDEX IF NOT EXISTS idx_repair_requests_client_id ON repair_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_repair_requests_assigned_to ON repair_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_repair_requests_created_at ON repair_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_repair_requests_status_created_at ON repair_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_repair_requests_assigned_status_created_at ON repair_requests(assigned_to, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_request_id ON transactions(request_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type_date ON transactions(type, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_request_type_created_at ON transactions(request_id, type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_updated_created_at ON clients(updated_at DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employees_status_name ON employees(status, name);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory(name);
CREATE INDEX IF NOT EXISTS idx_inventory_category_name ON inventory(category, name);
