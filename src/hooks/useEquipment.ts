import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './useAuth';

interface Equipment {
  id: string;
  modelName: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useEquipment = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin, logout } = useAuth();

  const fetchEquipments = async () => {
    try {
      setLoading(true);
      const response = await api.get<Equipment[]>('/equipment');
      setEquipments(response.data);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Você não tem permissão para acessar os equipamentos');
        logout(); // Desloga o usuário se o token estiver inválido
      } else {
        setError(err.response?.data?.message || 'Erro ao carregar equipamentos');
      }
      console.error('Erro ao carregar equipamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  const createEquipment = async (data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!isAdmin) {
      throw new Error('Apenas administradores podem criar equipamentos');
    }

    if (!data.modelName || data.modelName.trim() === '') {
      throw new Error('Por favor, informe o modelo do equipamento');
    }

    try {
      // Tenta criar com dados simplificados
      const equipmentData = {
        modelName: data.modelName.trim()
      };

      console.log('Token:', localStorage.getItem('token'));
      console.log('Dados sendo enviados:', JSON.stringify(equipmentData, null, 2));
      
      const response = await api.post<Equipment>('/equipment', equipmentData);
      
      console.log('Resposta do servidor:', response.data);
      setEquipments(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      console.error('Erro detalhado:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          headers: err.config?.headers,
          data: err.config?.data
        }
      });
      
      if (err.response?.status === 403) {
        logout();
        throw new Error('Você não tem permissão para criar equipamentos');
      } else if (err.response?.status === 500) {
        console.error('Erro completo:', err);
        const errorMessage = err.response?.data?.message || 'Erro interno do servidor';
        throw new Error(`Erro ao criar equipamento: ${errorMessage}. Por favor, tente novamente mais tarde.`);
      }
      
      throw new Error(err.response?.data?.message || 'Erro ao criar equipamento');
    }
  };

  const updateEquipment = async (id: string, data: Partial<Equipment>) => {
    if (!isAdmin) {
      throw new Error('Apenas administradores podem atualizar equipamentos');
    }

    try {
      const response = await api.put<Equipment>(`/equipment/${id}`, data);
      setEquipments(prev =>
        prev.map(equipment => (equipment.id === id ? response.data : equipment))
      );
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 403) {
        logout(); // Desloga o usuário se o token estiver inválido
        throw new Error('Você não tem permissão para atualizar equipamentos');
      }
      throw new Error(err.response?.data?.message || 'Erro ao atualizar equipamento');
    }
  };

  const deleteEquipment = async (id: string) => {
    if (!isAdmin) {
      throw new Error('Apenas administradores podem excluir equipamentos');
    }

    try {
      await api.delete(`/equipment/${id}`);
      setEquipments(prev => prev.filter(equipment => equipment.id !== id));
    } catch (err: any) {
      if (err.response?.status === 403) {
        logout(); // Desloga o usuário se o token estiver inválido
        throw new Error('Você não tem permissão para excluir equipamentos');
      }
      throw new Error(err.response?.data?.message || 'Erro ao excluir equipamento');
    }
  };

  return {
    equipments,
    loading,
    error,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    refresh: fetchEquipments,
  };
}; 