import React, { useState } from 'react';
import {
  Box,
  Heading,
  Button,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Spinner,
  Center,
  Text
} from '@chakra-ui/react';
import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { useEquipment } from '../hooks/useEquipment';

interface EquipmentFormData {
  modelName: string;
}

const Equipment: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const { equipments, createEquipment, updateEquipment, deleteEquipment, loading, error } = useEquipment();
  const toast = useToast();

  const [formData, setFormData] = useState<EquipmentFormData>({
    modelName: ''
  });

  const handleOpenModal = (equipment?: any) => {
    if (equipment) {
      setSelectedEquipment(equipment);
      setFormData({
        modelName: equipment.modelName
      });
    } else {
      setSelectedEquipment(null);
      setFormData({
        modelName: ''
      });
    }
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      if (!formData.modelName.trim()) {
        toast({
          title: 'Erro',
          description: 'O nome do modelo é obrigatório',
          status: 'error',
          duration: 3000
        });
        return;
      }

      const dataToSend = {
        modelName: formData.modelName.trim()
      };
  

      if (selectedEquipment) {
        await updateEquipment(selectedEquipment.id, dataToSend);
        toast({
          title: 'Equipamento atualizado',
          status: 'success',
          duration: 3000
        });
      } else {
        await createEquipment(dataToSend);
        toast({
          title: 'Equipamento cadastrado',
          status: 'success',
          duration: 3000
        });
      }
      onClose();
    } catch (error: any) {
      console.error('Erro ao processar equipamento:', error);
      toast({
        title: 'Erro',
        description: error.message,
        status: 'error',
        duration: 3000
      });
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) {
      toast({
        title: 'Erro',
        description: 'ID do equipamento inválido!',
        status: 'error',
        duration: 3000
      });
      return;
    }
    if (window.confirm('Tem certeza que deseja excluir este equipamento?')) {
      try {
        await deleteEquipment(id);
        toast({
          title: 'Equipamento excluído',
          status: 'success',
          duration: 3000
        });
      } catch (error: any) {
        toast({
          title: 'Erro',
          description: error.message,
          status: 'error',
          duration: 3000
        });
      }
    }
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh">
        <Box textAlign="center">
          <Heading size="lg" color="red.500" mb={4}>
            Erro ao carregar equipamentos
          </Heading>
          <Text>{error}</Text>
        </Box>
      </Center>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Equipamentos</Heading>
        <Button
          leftIcon={<MdAdd />}
          colorScheme="blue"
          onClick={() => handleOpenModal()}
        >
          Novo Equipamento
        </Button>
      </HStack>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Modelo</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
  {equipments.map((equipment, index) => (
    <Tr key={`${equipment.id || 'equipment'}-${index}`}>
      <Td>{equipment.modelName}</Td>
      <Td>
        <Box display="flex" gap={2}>
          <IconButton
            aria-label="Editar"
            icon={<MdEdit />}
            size="sm"
            onClick={() => handleOpenModal(equipment)}
          />
          <IconButton
            aria-label="Excluir"
            icon={<MdDelete />}
            size="sm"
            colorScheme="red"
            onClick={() => handleDelete(equipment.id)}
          />
        </Box>
      </Td>
    </Tr>
  ))}
</Tbody>

</Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedEquipment ? 'Editar Equipamento' : 'Novo Equipamento'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Modelo</FormLabel>
              <Input
                value={formData.modelName}
                onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                placeholder="Modelo do equipamento"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSubmit}
              isDisabled={!formData.modelName.trim()}
            >
              {selectedEquipment ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Equipment; 