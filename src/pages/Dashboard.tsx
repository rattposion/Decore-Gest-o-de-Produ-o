import React, { useState, useEffect } from 'react';
import { Box, Heading, SimpleGrid, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import StatCard from '../components/StatCard';
import { useProduction } from '../hooks/useProduction';
import { useInventory } from '../hooks/useInventory';
import {
  ClockIcon,
  ChartBarIcon,
  CubeIcon,
  ArrowTrendingDownIcon,
  UserIcon,
  ArchiveBoxIcon
} from "@heroicons/react/24/outline";
import api from '../services/api';

interface Employee {
  id?: string;
  _id?: string;
  name: string;
  active: boolean;
}

interface Equipment {
  id?: string;
  _id?: string;
  modelName: string;
  currentStock: number;
  minStock?: number;
  createdAt?: Date;
  updatedAt?: Date;
  totalResets?: number;
}

const Dashboard: React.FC = () => {
  const { production, getProductionByDateRange } = useProduction();
  const { equipment, movements } = useInventory();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filteredProductions, setFilteredProductions] = useState<Production[]>([]);
  
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get('/employees');
        setEmployees(response.data || []);
        console.log('Funcionários carregados:', response.data);
      } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchFilteredProduction = async () => {
      try {
        const data = await getProductionByDateRange(startDate, endDate);
        console.log('Produções filtradas recebidas:', data);
        // Deduplicate the data
        const uniqueProductions = Array.from(new Map(data.map(item => [item._id || item.id, item])).values());
        setFilteredProductions(uniqueProductions);
      } catch (error) {
        console.error('Erro ao carregar produções filtradas:', error);
        setFilteredProductions([]);
      }
    };
    fetchFilteredProduction();
  }, [startDate, endDate, getProductionByDateRange]);

  // Filtra produções de hoje
  const today = new Date().toISOString().split('T')[0];
  const todayProductions = production.filter(p => p.date === today);
  
  // Filtra saídas de hoje
  const todayMovements = movements.filter(m => 
    m.date === today && 
    m.type === 'saida'
  );
  
  // Calcula totais
  const totalProducedToday = todayProductions.reduce((sum, p) => sum + p.quantity, 0);
  const totalOutputsToday = todayMovements.reduce((sum, m) => sum + m.quantity, 0);
  const activeEmployees = employees.filter(emp => emp.active);
  const totalEquipments = equipment.length;
  const totalEquipamentosDisponiveis = equipment.reduce((sum, eq) => sum + (typeof eq.currentStock === 'number' ? eq.currentStock : 0), 0);
  const equipamentosResetados = equipment.filter(eq => eq.currentStock === 0);
  const nomesEquipamentosResetados = equipamentosResetados.map(eq => eq.modelName).join(', ') || 'Nenhum';
  
  // Logs de depuração
  console.log('Productions:', production);
  console.log('Employees:', employees);
  console.log('Equipment:', equipment);
  console.log('Filtered Productions:', filteredProductions);
  
  // Produção por colaborador no período
  const productionByEmployee = activeEmployees.map(employee => {
    const employeeProductions = filteredProductions.filter(p => p.employeeId === employee._id || p.employeeId === employee.id);
    const totalProduced = employeeProductions.reduce((sum, p) => sum + p.quantity, 0);
    return {
      ...employee,
      totalProduced,
      lastProduction: employeeProductions.length > 0 
        ? new Date(Math.max(...employeeProductions.map(p => new Date(p.timestamp).getTime()))).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
        : null
    };
  });

  console.log('Production by Employee:', productionByEmployee);

  // Calcular total de resets realizados (soma de totalResets de todos os equipamentos)
  const totalResets = equipment.reduce((sum, eq) => sum + (eq.totalResets || 0), 0);

  return (
    <Box>
      <Heading mb={6}>Dashboard</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <StatCard
          key="stat-average-per-employee"
          title="Média por Colaborador"
          value={activeEmployees.length > 0 ? Math.round(totalProducedToday / activeEmployees.length).toString() : "0"}
          icon={ChartBarIcon}
          description="Média de produção"
          color="blue"
        />
        <StatCard
          key="stat-total-equipment"
          title="Equipamentos Disponíveis"
          value={totalEquipamentosDisponiveis.toString()}
          icon={CubeIcon}
          description="Itens em estoque"
          color="purple"
        />
        <StatCard
          key="stat-outputs-today"
          title="Saídas Hoje"
          value={totalOutputsToday.toString()}
          icon={ArrowTrendingDownIcon}
          description="Itens retirados"
          color="red"
        />
        <StatCard
          key="stat-total-resets"
          title="Total de Resets"
          value={totalResets.toString()}
          icon={CubeIcon}
          description="Quantidade de resets realizados"
          color="orange"
        />
        {/* Tabela de Estoque por Modelo */}
        <Box bg="white" borderRadius="xl" shadow="sm" border="1px" borderColor="gray.100" p={6}>
          <Box borderBottom="1px" borderColor="gray.100" pb={4} mb={4}>
            <Heading size="md">Estoque por Modelo</Heading>
          </Box>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Modelo</Th>
                  <Th isNumeric>Disponível</Th>
                </Tr>
              </Thead>
              <Tbody>
                {equipment.length > 0 ? (
                  equipment.map((eq, index) => (
                    <Tr key={eq.id ?? eq._id ?? index}>
                      <Td fontWeight="medium">{eq.modelName}</Td>
                      <Td isNumeric>
                        <Box as="span" color={typeof eq.currentStock === 'number' && eq.currentStock > 0 ? "blue.600" : "red.500"} fontWeight="semibold">
                          {typeof eq.currentStock === 'number' ? eq.currentStock : '—'}
                        </Box>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={2} textAlign="center" py={8} color="gray.500">
                      Nenhum equipamento cadastrado
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </SimpleGrid>

      {/* Today's Detailed Productions */}
      <Box bg="white" borderRadius="xl" shadow="sm" border="1px" borderColor="gray.100" mb={6}>
        <Box p={6} borderBottom="1px" borderColor="gray.100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <ArchiveBoxIcon className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Produção por Colaborador</h2>
          </div>
          <Box mt={4} mb={2} display="flex" gap={4} alignItems="center">
            <label>
              Data Inicial:
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input ml-2" />
            </label>
            <label>
              Data Final:
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input ml-2" />
            </label>
          </Box>
        </Box>
        <Box p={6}>
          {filteredProductions.length > 0 ? (
            <div className="space-y-3">
              {filteredProductions.map((prod, index) => {
                const employee = employees.find(e => e.id === prod.employeeId || e._id === prod.employeeId);
                const equipmentItem = equipment.find(e => e.id === prod.equipmentId || e._id === prod.equipmentId);
                return (
                  <div 
                    key={`production-${prod.id || prod._id}-${index}`} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <ArchiveBoxIcon className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">{prod.employeeName || employee?.name || 'Funcionário não encontrado'}</p>
                        <p className="text-sm text-gray-600">{equipmentItem?.modelName || 'Modelo não encontrado'}</p>
                        <span className={`inline-block text-xs font-semibold rounded px-2 py-1 mt-1 ${prod.isReset ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                          {prod.isReset ? 'RESET' : 'PRONTO'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{prod.quantity} unidades</p>
                      <p className="text-xs text-gray-500">
                        {new Date(prod.timestamp).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ArchiveBoxIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">
                Nenhuma produção registrada no período selecionado.
              </p>
            </div>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;