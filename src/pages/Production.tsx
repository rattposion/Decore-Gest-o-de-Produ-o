import React, { useState, useEffect } from 'react';
import {
  UserIcon,
  ArchiveBoxIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import { useProduction } from '../hooks/useProduction';
import { useInventory } from '../hooks/useInventory';
import { useEmployees } from '../hooks/useEmployees';
import { Box, Heading, Spinner, Center, useToast, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';

export const Production: React.FC = () => {
  const { production, loading: loadingProduction, error: productionError, createProduction, refresh } = useProduction();
  const { equipment = [], addStockMovement, refresh: refreshInventory } = useInventory();
  const { employees = [], loading: loadingEmployees, error: employeesError } = useEmployees();
  const toast = useToast();
  
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [showResetForm, setShowResetForm] = useState(false);

  // Log de depuração para ver os equipamentos disponíveis
  console.log('Equipamentos disponíveis:', equipment);
  // Log de depuração para ver os funcionários disponíveis
  console.log('Lista de funcionários:', employees);
  console.log('Funcionários sem _id:', employees.filter(emp => !emp._id));

  if (loadingProduction || loadingEmployees) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (productionError || employeesError) {
    return (
      <Box p={8}>
        <Heading color="red.500" size="md">
          Erro ao carregar dados: {productionError || employeesError}
        </Heading>
      </Box>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !selectedEquipment || !quantity || parseInt(quantity) <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos corretamente",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Logs de depuração
    console.log('Equipamentos:', equipment);
    console.log('ID selecionado:', selectedEquipment);
    console.log('ID do funcionário selecionado:', selectedEmployee);

    const selectedEquipmentItem = equipment.find(eq => eq.id === selectedEquipment);
    if (!selectedEquipmentItem) {
      toast({
        title: "Erro",
        description: `Equipamento não encontrado (id: ${selectedEquipment})`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const quantityNum = parseInt(quantity);

      // Adiciona o registro de produção
      await createProduction({
        employeeId: selectedEmployee,
        equipmentId: selectedEquipment,
        quantity: quantityNum,
        date: new Date().toISOString().split('T')[0]
      });

      // Adiciona a entrada no estoque
      await addStockMovement(
        selectedEquipment,
        'entrada',
        quantityNum,
        `Entrada por produção - ${selectedEquipmentItem.modelName}`,
        selectedEquipmentItem.modelName
      );

      // Limpa o formulário
      setQuantity('');
      setSelectedEmployee('');
      setSelectedEquipment('');
      
      // Atualiza os dados em tempo real
      await refresh();
      
      toast({
        title: "Sucesso",
        description: "Produção registrada e estoque atualizado com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Erro ao registrar produção:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar produção",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const todayProductions = production.filter(
    p => p.date === new Date().toISOString().split('T')[0]
  ) || [];

  // Produção total por colaborador (todos os tempos)
  const producaoPorColaborador = employees
    .filter(emp => emp.active)
    .map(employee => {
      const total = production
        .filter(p => p.employeeId === employee._id)
        .reduce((sum, p) => sum + p.quantity, 0);
      return {
        name: employee.name,
        total
      };
    })
    .filter(e => e.total > 0);

  // Produções de reset: mostrar todos os registros de produção
  const producoesDeReset = production;

  return (
    <Box>
      <Heading mb={6}>Produção</Heading>
      <div className="p-6 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registro de Produção</h1>
          <p className="text-gray-600 mt-1">Acompanhamento da produção por colaborador</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Production Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <Tabs variant="enclosed" colorScheme="blue">
                <TabList>
                  <Tab>Registrar Produção</Tab>
                  <Tab>Produção de Reset</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    {/* Formulário de produção */}
                    <div>
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <PlusIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Novo Registro</h2>
                      </div>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Colaborador
                          </label>
                          <select
                            value={selectedEmployee}
                            onChange={(e) => {
                              console.log('Funcionário selecionado:', e.target.value);
                              setSelectedEmployee(e.target.value);
                            }}
                            className="input"
                            required
                          >
                            <option key="select-employee" value="">Selecione um colaborador</option>
                            {employees
                              .filter(emp => emp.active && emp._id)
                              .map((employee) => (
                                <option key={`employee-${employee._id}`} value={employee._id}>
                                  {employee.name}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Modelo do Equipamento
                          </label>
                          <select
                            value={selectedEquipment}
                            onChange={(e) => {
                              console.log('Novo valor selecionado:', e.target.value);
                              setSelectedEquipment(e.target.value);
                            }}
                            className="input"
                            required
                          >
                            <option key="select-equipment" value="">Selecione um modelo</option>
                            {equipment.map((item, index) => {
                              console.log('Option id:', item.id, typeof item.id);
                              return (
                                <option key={`equipment-${item.id || index}`} value={item.id}>
                                  {item.modelName}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantidade Produzida
                          </label>
                          <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            min="1"
                            className="input"
                            placeholder="Quantidade..."
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="btn-primary w-full"
                        >
                          <PlusIcon className="h-5 w-5 mr-2" />
                          <span>Registrar Produção</span>
                        </button>
                      </form>
                    </div>
                  </TabPanel>
                  <TabPanel>
                    {/* Formulário de produção de reset igual ao de produção normal, mas envia isReset: true */}
                    <div>
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <PlusIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Novo Registro de Reset</h2>
                      </div>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!selectedEmployee || !selectedEquipment || !quantity || parseInt(quantity) <= 0) {
                          toast({
                            title: "Erro",
                            description: "Por favor, preencha todos os campos corretamente",
                            status: "error",
                            duration: 3000,
                            isClosable: true,
                          });
                          return;
                        }
                        try {
                          const quantityNum = parseInt(quantity);
                          await createProduction({
                            employeeId: selectedEmployee,
                            equipmentId: selectedEquipment,
                            quantity: quantityNum,
                            date: new Date().toISOString().split('T')[0],
                            isReset: true
                          });
                          setQuantity('');
                          setSelectedEmployee('');
                          setSelectedEquipment('');
                          await refresh();
                          await refreshInventory();
                          toast({
                            title: "Sucesso",
                            description: "Produção de reset registrada com sucesso!",
                            status: "success",
                            duration: 3000,
                            isClosable: true,
                          });
                        } catch (error: any) {
                          toast({
                            title: "Erro",
                            description: error.message || "Erro ao registrar produção de reset",
                            status: "error",
                            duration: 3000,
                            isClosable: true,
                          });
                        }
                      }} className="space-y-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Colaborador
                          </label>
                          <select
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                            className="input"
                            required
                          >
                            <option key="select-employee-reset" value="">Selecione um colaborador</option>
                            {employees
                              .filter(emp => emp.active && emp._id)
                              .map((employee) => (
                                <option key={`employee-reset-${employee._id}`} value={employee._id}>
                                  {employee.name}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Modelo do Equipamento
                          </label>
                          <select
                            value={selectedEquipment}
                            onChange={(e) => setSelectedEquipment(e.target.value)}
                            className="input"
                            required
                          >
                            <option key="select-equipment-reset" value="">Selecione um modelo</option>
                            {equipment.map((item, index) => (
                              <option key={`equipment-reset-${item.id || index}`} value={item.id}>
                                {item.modelName}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantidade Produzida
                          </label>
                          <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            min="1"
                            className="input"
                            placeholder="Quantidade..."
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="btn-primary w-full"
                        >
                          <PlusIcon className="h-5 w-5 mr-2" />
                          <span>Registrar Produção de Reset</span>
                        </button>
                      </form>
                    </div>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </div>
          </div>

          {/* Employee Production Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Produção por Colaborador (Hoje)</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid gap-4">
                  {employees.filter(emp => emp.active).map((employee, index) => {
                    const employeeProductions = todayProductions.filter(p => p.employeeId === employee._id);
                    const totalProduction = employeeProductions.reduce((sum, p) => sum + p.quantity, 0);
                    
                    return (
                      <div
                        key={`employee-summary-${employee.id}-${index}`}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{totalProduction}</p>
                          <p className="text-sm text-gray-500">unidades produzidas</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Productions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <ArchiveBoxIcon className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Produções de Hoje</h2>
            </div>
          </div>
          <div className="p-6">
            {todayProductions.length > 0 ? (
              <div className="space-y-3">
                {todayProductions.map((prod, index) => {
                  const employee = employees.find(e => e.id === prod.employeeId);
                  const equipmentItem = equipment.find(e => e.id === prod.equipmentId);
                  return (
                    <div 
                      key={`production-${prod.id}-${index}`} 
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
                  Nenhuma produção registrada hoje. Use o formulário para adicionar registros.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Box>
  );
};

export default Production;