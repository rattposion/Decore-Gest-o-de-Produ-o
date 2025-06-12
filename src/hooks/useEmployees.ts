import { useState, useEffect } from 'react';
import api from '../services/api';

interface Employee {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/all');
      const formattedEmployees = response.data.map((emp: any) => ({
        _id: emp._id || emp.id,
        name: emp.name,
        email: emp.email,
        role: emp.role,
        active: emp.active,
        createdAt: emp.createdAt,
        updatedAt: emp.updatedAt
      }));
      setEmployees(formattedEmployees);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar usuários');
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const createEmployee = async (data: Omit<Employee, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await api.post<Employee>('/employees', data);
      setEmployees(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao criar funcionário');
    }
  };

  const updateEmployee = async (id: string, data: Partial<Omit<Employee, '_id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const response = await api.put<Employee>(`/employees/${id}`, data);
      setEmployees(prev =>
        prev.map(employee => (employee._id === id ? response.data : employee))
      );
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao atualizar funcionário');
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await api.delete(`/employees/${id}`);
      setEmployees(prev => prev.filter(employee => employee._id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao excluir funcionário');
    }
  };

  return {
    employees,
    loading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    refresh: fetchEmployees,
  };
}; 