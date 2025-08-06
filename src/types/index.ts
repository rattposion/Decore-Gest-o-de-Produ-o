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
  boxId: string;
  macs: string[];
  quantity: number; // Calculado automaticamente baseado no número de MACs
  date: string;
  timestamp: string;
  isReset?: boolean;
}

export interface StockMovement {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'entrada_caixa' | 'saida_caixa';
  boxId?: string;
  macs?: string[];
  quantity: number; // Calculado automaticamente baseado no número de MACs
  date: string;
  timestamp: string;
  description: string;
}

export interface Box {
  id: string;
  boxId: string;
  equipmentId: string;
  equipmentModel: string;
  macs: string[];
  employeeId: string;
  employeeName: string;
  date: string;
  timestamp: string;
  status: 'ativa' | 'enviada' | 'cancelada';
  isReset?: boolean;
}

export interface DailyReport {
  date: string;
  totalProduction: number;
  employeeCount: number;
  topEmployee: string;
  topModel: string;
  productions: ProductionRecord[];
}