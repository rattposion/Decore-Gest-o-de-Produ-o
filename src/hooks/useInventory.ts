import { useState, useEffect } from 'react';
import api from '../services/api';

interface Equipment {
  id: string;
  modelName: string;
  currentStock: number;
  minStock: number;
  totalResets: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Movement {
  id: string;
  equipmentId: string;
  equipmentName: string;
  quantity: number;
  type: 'entrada' | 'saida';
  description: string;
  date: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const useInventory = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await api.get<Equipment[]>('/equipment');
      console.log('Equipamentos carregados do backend:', response.data);
      setEquipment(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar equipamentos');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      const response = await api.get<Movement[]>('/movements');
      setMovements(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar movimentações');
    }
  };

  useEffect(() => {
    Promise.all([fetchEquipment(), fetchMovements()]);
  }, []);

  const createEquipment = async (data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await api.post<Equipment>('/equipment', data);
      setEquipment(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao criar equipamento');
    }
  };

  const updateEquipment = async (id: string, data: Partial<Equipment>) => {
    try {
      const response = await api.put<Equipment>(`/equipment/${id}`, data);
      setEquipment(prev =>
        prev.map(item => (item.id === id ? response.data : item))
      );
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao atualizar equipamento');
    }
  };

  const deleteEquipment = async (id: string) => {
    try {
      await api.delete(`/equipment/${id}`);
      setEquipment(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao excluir equipamento');
    }
  };

  const createMovement = async (data: Omit<Movement, 'id' | 'equipmentName' | 'createdAt' | 'updatedAt' | 'timestamp'>) => {
    try {
      const response = await api.post<Movement>('/movements', data);
      setMovements(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao criar movimentação');
    }
  };

  const updateMovement = async (id: string, data: Partial<Movement>) => {
    try {
      const response = await api.put<Movement>(`/movements/${id}`, data);
      setMovements(prev =>
        prev.map(item => (item.id === id ? response.data : item))
      );
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao atualizar movimentação');
    }
  };

  const deleteMovement = async (id: string) => {
    try {
      await api.delete(`/movements/${id}`);
      setMovements(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao excluir movimentação');
    }
  };

  const addStockMovement = async (
    equipmentId: string,
    type: 'entrada' | 'saida',
    quantity: number,
    description: string,
    equipmentName?: string
  ) => {
    try {
      const equipmentItem = equipment.find(eq => eq.id === equipmentId);
      if (!equipmentItem) {
        throw new Error('Equipamento não encontrado');
      }

      const movement = await createMovement({
        equipmentId,
        quantity,
        type,
        description,
        date: new Date().toISOString().split('T')[0]
      });

      // O backend atualiza automaticamente o estoque do equipamento
      // Não precisamos fazer isso no frontend

      return movement;
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao adicionar movimentação');
    }
  };

  return {
    equipment,
    movements,
    loading,
    error,
    createEquipment,
    deleteEquipment,
    createMovement,
    updateMovement,
    deleteMovement,
    addStockMovement,
    refresh: () => Promise.all([fetchEquipment(), fetchMovements()]),
  };
};