import React, { useState } from 'react';
import {
  ArrowTrendingDownIcon,
  CubeIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { useInventory } from '../hooks/useInventory';
import { Box, Heading } from '@chakra-ui/react';

export const Inventory: React.FC = () => {
  const { equipment, addBoxMovement } = useInventory();
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [boxId, setBoxId] = useState<string>('');
  const [macs, setMacs] = useState<string>('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtra equipamentos baseado na busca
  const filteredEquipment = equipment.filter(item =>
    item.modelName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Valida e processa lista de MACs
  const processarMacs = (macsText: string): string[] => {
    return macsText
      .split('\n')
      .map(mac => mac.trim().replace(/:/g, '').toUpperCase())
      .filter(mac => mac.length > 0 && /^[A-F0-9]{12}$/.test(mac));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const item = equipment.find(eq => eq.id === selectedEquipment);
    if (!item) return;

    if (!boxId.trim()) {
      alert('Por favor, informe o ID da caixa.');
      return;
    }

    // Processa e valida MACs
    const macsList = processarMacs(macs);
    if (macsList.length === 0) {
      alert('Nenhum MAC válido encontrado. MACs devem ter 12 caracteres hexadecimais.');
      return;
    }

    if (macsList.length > item.currentStock) {
      alert(`Quantidade de MACs (${macsList.length}) é maior que o estoque disponível (${item.currentStock})!`);
      return;
    }

    if (!description.trim()) {
      alert('Por favor, informe o destino/motivo da saída.');
      return;
    }

    await addBoxMovement(
      selectedEquipment,
      'saida_caixa',
      boxId.trim(),
      macsList,
      `${description} - Caixa: ${boxId.trim()}`
    );

    // Atualiza o inventário em tempo real
    if (typeof useInventory === 'function') {
      try { await useInventory().refresh(); } catch {}
    }

    setSelectedEquipment('');
    setBoxId('');
    setMacs('');
    setDescription('');
    alert(`Saída da caixa ${boxId.trim()} registrada com sucesso! ${macsList.length} equipamentos retirados.`);
  };

  return (
    <Box>
      <Heading mb={6}>Inventário</Heading>
      <div className="p-6 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Estoque por Caixa</h1>
          <p className="text-gray-600 mt-1">Controle as saídas de caixas com MACs e monitore o estoque</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário de Saída de Caixa */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Registrar Saída de Caixa</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipamento
                  </label>
                  <select
  value={selectedEquipment}
  onChange={(e) => setSelectedEquipment(e.target.value)}
  className="input"
  required
>
  <option key="default" value="">Selecione um equipamento</option>
  {filteredEquipment.map((item, index) => (
    <option key={`${item.id || 'equip'}-${index}`} value={item.id}>
      {item.modelName} ({item.currentStock} disponíveis)
    </option>
  ))}
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
                    required
                    placeholder="Ex: SAIDA001, OUT-BOX-001..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lista de MACs para Saída
                  </label>
                  <textarea
                    value={macs}
                    onChange={(e) => setMacs(e.target.value)}
                    className="input min-h-[100px]"
                    required
                    placeholder="Cole aqui os MACs dos equipamentos (um por linha):
001122334455
AABBCCDDEEFF
123456789ABC
..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {processarMacs(macs).length} MAC(s) válido(s) detectado(s)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destino/Motivo da Saída
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input min-h-[80px]"
                    required
                    placeholder="Descreva para onde vai ou o motivo da saída..."
                  />
                </div>

                <button type="submit" className="btn-primary w-full">
                  <ArrowTrendingDownIcon className="w-5 h-5 mr-2" />
                  Registrar Saída de Caixa ({processarMacs(macs).length} itens)
                </button>
              </form>
            </div>
          </div>

          {/* Lista de Estoque */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CubeIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Estoque Atual</h2>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar equipamento..."
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid gap-4">
                  {filteredEquipment.map((item, index) => (
                    <div
                      key={`${item.id || 'equip'}-${index}`}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{item.modelName}</h3>
                        <p className="text-xs text-gray-500">Gerenciado por caixas com MACs</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${
                          item.currentStock <= item.minStock ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {item.currentStock}
                        </p>
                        <p className="text-xs text-gray-500">em estoque</p>
                      </div>
                    </div>
                  ))}
                  {filteredEquipment.length === 0 && (
                    <div key="no-equipment" className="text-center py-8">
                      <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">
                        {searchTerm ? 'Nenhum equipamento encontrado' : 'Nenhum equipamento cadastrado'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default Inventory;