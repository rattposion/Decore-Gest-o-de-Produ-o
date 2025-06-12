import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CubeIcon
} from "@heroicons/react/24/outline";
import { useProduction } from '../hooks/useProduction';
import { useInventory } from '../hooks/useInventory';
import { Box, Heading } from '@chakra-ui/react';
import api from '../services/api';

const Reports: React.FC = () => {
  const { production, loading } = useProduction();
  const { equipment, movements } = useInventory();
  const [employees, setEmployees] = useState([]);
  
  // Estados para filtros
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get('/employees');
        setEmployees(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  // Filtra produções pelo período e filtros selecionados
  const filteredProductions = production.filter(production => {
    const dateMatch = production.date >= startDate && production.date <= endDate;
    const employeeMatch = !selectedEmployee || production.employeeId === selectedEmployee;
    const modelMatch = !selectedModel || production.equipmentModel.includes(selectedModel);
    return dateMatch && employeeMatch && modelMatch;
  });

  // Filtra saídas pelo período
  const filteredMovements = movements.filter(movement => 
    movement.date >= startDate && 
    movement.date <= endDate && 
    movement.type === 'saida'
  );

  // Cálculos de totais
  const totalProduction = filteredProductions.reduce((sum, p) => sum + p.quantity, 0);
  const totalOutputs = filteredMovements.reduce((sum, m) => sum + m.quantity, 0);
  const uniqueEmployees = new Set(filteredProductions.map(p => p.employeeId)).size;
  
  // Produção por colaborador
  const productionByEmployee = employees.map(employee => {
    const employeeProductions = filteredProductions.filter(p => p.employeeId === employee.id);
    const total = employeeProductions.reduce((sum, p) => sum + p.quantity, 0);
    return {
      ...employee,
      totalProduction: total,
      productions: employeeProductions
    };
  }).filter(emp => emp.totalProduction > 0);

  // Produção por modelo
  const productionByModel = filteredProductions.reduce((acc, production) => {
    if (!acc[production.equipmentModel]) {
      acc[production.equipmentModel] = 0;
    }
    acc[production.equipmentModel] += production.quantity;
    return acc;
  }, {} as Record<string, number>);

  // Saídas por modelo
  const outputsByModel = filteredMovements.reduce((acc, movement) => {
    const equipmentItem = equipment.find(e => e.id === movement.equipmentId);
    if (equipmentItem) {
      const model = equipmentItem.model;
      if (!acc[model]) {
        acc[model] = 0;
      }
      acc[model] += movement.quantity;
    }
    return acc;
  }, {} as Record<string, number>);

  // Função para exportar dados
  const handleExport = () => {
    const csvContent = [
      ['Período:', `${startDate} até ${endDate}`],
      [''],
      ['PRODUÇÃO POR COLABORADOR'],
      ['Colaborador', 'Departamento', 'Total Produzido'],
      ...productionByEmployee.map(emp => [
        emp.name,
        emp.department,
        emp.totalProduction.toString()
      ]),
      [''],
      ['PRODUÇÃO POR MODELO'],
      ['Modelo', 'Quantidade Produzida', 'Quantidade em Saídas', 'Saldo'],
      ...Object.keys(productionByModel).map(model => [
        model,
        productionByModel[model].toString(),
        (outputsByModel[model] || 0).toString(),
        (productionByModel[model] - (outputsByModel[model] || 0)).toString()
      ]),
      [''],
      ['REGISTROS DETALHADOS'],
      ['Data', 'Hora', 'Colaborador', 'Modelo', 'Quantidade', 'Tipo'],
      ...filteredProductions.map(p => [
        p.date,
        new Date(p.timestamp).toLocaleTimeString('pt-BR'),
        p.employeeName,
        p.equipmentModel,
        p.quantity.toString(),
        p.isReset ? 'RESET' : 'PRONTO'
      ]),
      ...filteredMovements.map(m => [
        m.date,
        new Date(m.timestamp).toLocaleTimeString('pt-BR'),
        '-',
        m.equipmentName,
        m.quantity.toString(),
        'Saída'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_producao_${startDate}_${endDate}.csv`;
    link.click();
  };

  return (
    <Box>
      <Heading mb={6}>Relatórios</Heading>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios de Produção</h1>
            <p className="text-gray-600 mt-1">Análise detalhada da produção e saídas</p>
          </div>
          <button
            onClick={handleExport}
            className="btn-primary flex items-center"
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            Exportar Relatório
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Inicial
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Final
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Colaborador
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="input"
              >
                <option key="all-employees" value="">Todos</option>
                {employees.map((emp) => (
                  <option key={`employee-${emp.id}`} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="input"
              >
                <option key="all-models" value="">Todos</option>
                {equipment.map((eq, index) => (
                  <option key={`model-${eq.id || index}`} value={eq.model}>
                    {eq.model}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produção Total</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{totalProduction}</p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Saídas</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{totalOutputs}</p>
              </div>
              <ArrowTrendingDownIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo no Período</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {totalProduction - totalOutputs}
                </p>
              </div>
              <CubeIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Colaboradores Ativos</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{uniqueEmployees}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Produção por Colaborador */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Produção por Colaborador</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {productionByEmployee.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{employee.name}</p>
                      <p className="text-sm text-gray-600">{employee.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">{employee.totalProduction}</p>
                      <p className="text-xs text-gray-500">unidades</p>
                    </div>
                  </div>
                ))}
                {productionByEmployee.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Nenhuma produção encontrada para os filtros selecionados
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Produção e Saídas por Modelo */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Produção e Saídas por Modelo</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Object.keys(productionByModel).map((model) => (
                  <div key={model} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{model}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Produção</p>
                        <p className="font-semibold text-blue-600">{productionByModel[model]}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Saídas</p>
                        <p className="font-semibold text-red-600">{outputsByModel[model] || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Saldo</p>
                        <p className="font-semibold text-green-600">
                          {productionByModel[model] - (outputsByModel[model] || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {Object.keys(productionByModel).length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Nenhuma produção encontrada para os filtros selecionados
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Registros Detalhados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Registros Detalhados</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Colaborador/Destino
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modelo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  ...filteredProductions.map(p => ({
                    id: p.id,
                    date: p.date,
                    timestamp: p.timestamp,
                    type: p.isReset ? 'RESET' : 'PRONTO',
                    name: p.employeeName,
                    model: p.equipmentModel,
                    quantity: p.quantity
                  })),
                  ...filteredMovements.map(m => ({
                    id: m.id,
                    date: m.date,
                    timestamp: m.timestamp,
                    type: 'Saída',
                    name: m.description,
                    model: m.equipmentName,
                    quantity: m.quantity
                  }))
                ]
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.timestamp).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          record.type === 'PRONTO'
                            ? 'bg-blue-100 text-blue-600'
                            : record.type === 'RESET'
                              ? 'bg-orange-100 text-orange-600'
                              : 'bg-red-100 text-red-600'
                        }`}>
                          {record.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.model}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={record.type === 'Saída' ? 'text-red-600' : 'text-blue-600'}>
                          {record.quantity} unidades
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {filteredProductions.length === 0 && filteredMovements.length === 0 && (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  Nenhum registro encontrado para os filtros selecionados
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Box>
  );
};

export default Reports;