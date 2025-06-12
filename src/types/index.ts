export interface Equipment {
  id: string;
  name: string;
  model: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  active: boolean;
}

export interface ProductionRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  equipmentId: string;
  equipmentModel: string;
  quantity: number;
  date: string;
  timestamp: string;
}

export interface StockMovement {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'entrada' | 'saida';
  quantity: number;
  date: string;
  timestamp: string;
  description: string;
}

export interface DailyReport {
  date: string;
  totalProduction: number;
  employeeCount: number;
  topEmployee: string;
  topModel: string;
  productions: ProductionRecord[];
}