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
  const { equipment = [], addBoxMovement, refresh: refreshInventory } = useInventory();
  const { employees = [], loading: loadingEmployees, error: employeesError } = useEmployees();
  const toast = useToast();
  
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [boxId, setBoxId] = useState<string>('');
  const [macs, setMacs] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'normal' | 'reset'>('normal');

  // Log de depuração para ver os equipamentos disponíveis
  
  // Log de depuração para ver os funcionários disponíveis
  

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

  // Valida e processa lista de MACs
  const processarMacs = (macsText: string): string[] => {
    return macsText
      .split('\n')
      .map(mac => mac.trim().replace(/:/g, '').toUpperCase())
      .filter(mac => mac.length > 0 && /^[A-F0-9]{12}$/.test(mac));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !selectedEquipment || !boxId.trim() || !macs.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos: funcionário, equipamento, ID da caixa e lista de MACs",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

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

    // Processa e valida MACs
    const macsList = processarMacs(macs);
    if (macsList.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum MAC válido encontrado. MACs devem ter 12 caracteres hexadecimais.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const quantity = macsList.length;

      // Adiciona o registro de produção
      await createProduction({
        employeeId: selectedEmployee,
        equipmentId: selectedEquipment,
        boxId: boxId.trim(),
        macs: macsList,
        date: new Date().toISOString().split('T')[0],
        isReset: activeTab === 'reset'
      });

      // Adiciona a entrada da caixa no estoque
      await addBoxMovement(
        selectedEquipment,
        'entrada_caixa',
        boxId.trim(),
        macsList,
        `Entrada por produção - Caixa ${boxId.trim()} - ${selectedEquipmentItem.modelName} (${quantity} unidades)`
      );

      // Limpa o formulário
      setBoxId('');
      setMacs('');
      setSelectedEmployee('');
      setSelectedEquipment('');
      
      // Atualiza os dados em tempo real
      await refresh();
      
      toast({
        title: "Sucesso",
        description: `Caixa ${boxId.trim()} registrada com ${quantity} equipamentos e estoque atualizado!`,
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
          <p className="text-gray-600 mt-1">Registro de caixas com MACs dos equipamentos por colaborador</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Production Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <Tabs variant="enclosed" colorScheme="blue">
                <TabList>
                  <Tab onClick={() => setActiveTab('normal')}>Registrar Caixa</Tab>
                  <Tab onClick={() => setActiveTab('reset')}>Caixa de Reset</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    {/* Formulário de caixa normal */}
                    <div>
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <PlusIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Nova Caixa</h2>
                      </div>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Colaborador
                          </label>
                          <select
                            value={selectedEmployee}
                            onChange={(e) => {
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
                              setSelectedEquipment(e.target.value);
                            }}
                            className="input"
                            required
                          >
                            <option key="select-equipment" value="">Selecione um modelo</option>
                            {equipment.map((item, index) => {
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
                            ID da Caixa
                          </label>
                          <input
                            type="text"
                            value={boxId}
                            onChange={(e) => setBoxId(e.target.value)}
                            className="input"
                            placeholder="Ex: CAIXA001, BOX-2024-001..."
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lista de MACs
                          </label>
                          <textarea
                            value={macs}
                            onChange={(e) => setMacs(e.target.value)}
                            className="input min-h-[120px]"
                            placeholder="Cole aqui os MACs dos equipamentos (um por linha):
001122334455
AABBCCDDEEFF
123456789ABC
..."
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {processarMacs(macs).length} MAC(s) válido(s) detectado(s)
                          </p>
                        </div>
                        <button
                          type="submit"
                          className="btn-primary w-full"
                        >
                          <PlusIcon className="h-5 w-5 mr-2" />
                          <span>Registrar Caixa ({processarMacs(macs).length} itens)</span>
                        </button>
                      </form>
                    </div>
                  </TabPanel>
                  <TabPanel>
                    {/* Formulário de caixa de reset */}
                    <div>
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <PlusIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Nova Caixa de Reset</h2>
                      </div>
                      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
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
                            ID da Caixa de Reset
                          </label>
                          <input
                            type="text"
                            value={boxId}
                            onChange={(e) => setBoxId(e.target.value)}
                            className="input"
                            placeholder="Ex: RESET001, RESET-BOX-001..."
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lista de MACs (Reset)
                          </label>
                          <textarea
                            value={macs}
                            onChange={(e) => setMacs(e.target.value)}
                            className="input min-h-[120px]"
                            placeholder="Cole aqui os MACs dos equipamentos resetados (um por linha):
001122334455
AABBCCDDEEFF
123456789ABC
..."
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {processarMacs(macs).length} MAC(s) válido(s) detectado(s)
                          </p>
                        </div>
                        <button
                          type="submit"
                          className="btn-primary w-full"
                        >
                          <PlusIcon className="h-5 w-5 mr-2" />
                          <span>Registrar Caixa de Reset ({processarMacs(macs).length} itens)</span>
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
                  <h2 className="text-xl font-semibold text-gray-900">Caixas por Colaborador (Hoje)</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid gap-4">
                  {employees.filter(emp => emp.active).map((employee, index) => {
                    const employeeProductions = todayProductions.filter(p => p.employeeId === employee._id);
                    const totalProduction = employeeProductions.reduce((sum, p) => sum + p.quantity, 0);
                    const totalBoxes = employeeProductions.length;
                    
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
                            <p className="text-sm text-gray-600">{totalBoxes} caixa(s)</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{totalProduction}</p>
                          <p className="text-sm text-gray-500">equipamentos</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Boxes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <ArchiveBoxIcon className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Caixas Registradas Hoje</h2>
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
                          <p className="text-sm text-gray-600">
                            {equipmentItem?.modelName || 'Modelo não encontrado'} - Caixa: {prod.boxId}
                          </p>
                          <span className={`inline-block text-xs font-semibold rounded px-2 py-1 mt-1 ${prod.isReset ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                            {prod.isReset ? 'RESET' : 'PRONTO'}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {prod.macs?.length || 0} MAC(s): {prod.macs?.slice(0, 3).join(', ')}{prod.macs && prod.macs.length > 3 ? '...' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{prod.quantity} equipamentos</p>
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
                  Nenhuma caixa registrada hoje. Use o formulário para adicionar caixas.
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