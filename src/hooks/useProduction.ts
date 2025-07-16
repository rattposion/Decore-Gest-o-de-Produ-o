import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export interface Production {
  id: string;
  employeeId: string;
  employeeName: string;
  equipmentId: string;
  equipmentModel: string;
  quantity: number;
  date: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
  isReset?: boolean;
}

export const useProduction = () => {
  const [production, setProduction] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductionData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<Production[]>('/production');
      setProduction(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar registros de produção');
      setProduction([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductionData();
  }, [fetchProductionData]);

  const createProduction = useCallback(async (data: Omit<Production, 'id' | 'employeeName' | 'equipmentModel' | 'createdAt' | 'updatedAt' | 'timestamp'> & { isReset?: boolean }) => {
    try {
      setError(null);
      const productionData = {
        ...data,
        employeeId: data.employeeId.toString(),
        date: data.date || new Date().toISOString().split('T')[0]
      };
      console.log('=== DEBUG FRONTEND CREATE PRODUCTION ===');
      console.log('Dados originais:', data);
      console.log('Dados enviados para criação de produção:', productionData);
      console.log('equipmentId sendo enviado:', productionData.equipmentId);
      console.log('Tipo do equipmentId:', typeof productionData.equipmentId);
      const response = await api.post<Production>('/production', productionData);
      setProduction(prev => [...(prev || []), response.data]);
      return response.data;
    } catch (err: any) {
      console.error('Erro detalhado ao criar produção:', err.response?.data);
      const errorMessage = err.response?.data?.message || 'Erro ao criar registro de produção';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateProduction = useCallback(async (id: string, data: Partial<Production>) => {
    try {
      setError(null);
      const response = await api.put<Production>(`/production/${id}`, data);
      setProduction(prev =>
        (prev || []).map(item => (item.id === id ? response.data : item))
      );
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar registro de produção';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteProduction = useCallback(async (id: string) => {
    try {
      setError(null);
      await api.delete(`/production/${id}`);
      setProduction(prev => (prev || []).filter(item => item.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao excluir registro de produção';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getProductionByDateRange = useCallback(async (startDate: string, endDate: string) => {
    try {
      setError(null);
      console.log('Buscando produções com datas:', { startDate, endDate });
      const response = await api.get<Production[]>(`/production?startDate=${startDate}&endDate=${endDate}`);
      console.log('Resposta da API:', response.data);
      return response.data || [];
    } catch (err: any) {
      console.error('Erro ao buscar produções por data:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao buscar registros de produção';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getProductionByEmployee = useCallback(async (employeeId: string) => {
    try {
      setError(null);
      const response = await api.get<Production[]>(`/production?employeeId=${employeeId}`);
      return response.data || [];
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao buscar registros de produção';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getProductionByEquipment = useCallback(async (equipmentId: string) => {
    try {
      setError(null);
      const response = await api.get<Production[]>(`/production?equipmentId=${equipmentId}`);
      return response.data || [];
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao buscar registros de produção';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const refreshFilteredProduction = useCallback(async (startDate: string, endDate: string) => {
    try {
      const data = await getProductionByDateRange(startDate, endDate);
      setProduction(data); // Atualiza o estado principal de production com os dados filtrados
    } catch (error) {
      console.error('Erro ao carregar produções filtradas para atualização:', error);
    }
  }, [getProductionByDateRange]);

  return {
    production,
    loading,
    error,
    createProduction,
    updateProduction,
    deleteProduction,
    getProductionByDateRange,
    getProductionByEmployee,
    getProductionByEquipment,
    refresh: fetchProductionData,
    refreshFilteredProduction,
  };
};
