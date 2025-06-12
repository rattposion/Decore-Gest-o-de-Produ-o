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
  Badge,
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
  Select,
  useToast
} from '@chakra-ui/react';
import { MdEdit, MdDelete, MdAdd, MdPowerSettingsNew } from 'react-icons/md';
import { useEmployees } from '../hooks/useEmployees';
import api from '../services/api';

interface EmployeeFormData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  active: boolean;
  id?: string;
}

const Employees: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const { employees, createEmployee, updateEmployee, deleteEmployee, loading, refresh: fetchEmployees } = useEmployees();
  const toast = useToast();
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    password: '',
    role: 'user',
    active: true
  });

  const handleOpenModal = (employee?: any) => {
    if (employee) {
      setSelectedEmployee(employee);
      setFormData({
        name: employee.name,
        email: employee.email,
        password: '',
        role: employee.role || 'user',
        active: employee.active,
        id: employee.id
      });
    } else {
      setSelectedEmployee(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        active: true
      });
    }
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.email || (!selectedEmployee && !formData.password)) {
        toast({
          title: 'Campos obrigatórios',
          description: 'Por favor, preencha todos os campos obrigatórios',
          status: 'error',
          duration: 3000
        });
        return;
      }

      if (selectedEmployee) {
        const updateData = { ...formData };
        if (!updateData.password) {
          (updateData as any).password = undefined;
          delete (updateData as any).password;
        }
        await api.patch(`/auth/approve/${selectedEmployee.id}`, { active: updateData.active });
        toast({
          title: 'Usuário atualizado',
          status: 'success',
          duration: 3000
        });
        fetchEmployees();
      } else {
        await createEmployee(formData);
        toast({
          title: 'Usuário cadastrado',
          status: 'success',
          duration: 3000
        });
      }
      onClose();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        status: 'error',
        duration: 3000
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await api.delete(`/auth/user/${id}`);
        toast({
          title: 'Usuário excluído',
          status: 'success',
          duration: 3000
        });
        fetchEmployees();
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

  const handleToggleActive = async (user: any) => {
    try {
      await api.patch(`/auth/approve/${user.id}`, { active: !user.active });
      toast({
        title: user.active ? 'Usuário desativado' : 'Usuário ativado',
        status: 'success',
        duration: 3000
      });
      fetchEmployees();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        status: 'error',
        duration: 3000
      });
    }
  };

  const fetchPendingUsers = async () => {
    setLoadingPending(true);
    try {
      const res = await api.get('/auth/pending');
      setPendingUsers(res.data);
    } catch (err) {
      setPendingUsers([]);
    } finally {
      setLoadingPending(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/auth/approve/${id}`);
      toast({ title: 'Usuário aprovado!', status: 'success', duration: 3000 });
      fetchPendingUsers();
    } catch (err: any) {
      toast({ title: 'Erro ao aprovar usuário', description: err.response?.data?.message, status: 'error', duration: 3000 });
    }
  };

  React.useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <Box>
      {pendingUsers.length > 0 && (
        <Box mb={8} p={4} borderWidth={1} borderRadius={8} bg="yellow.50">
          <Heading size="md" mb={2}>Usuários pendentes de aprovação</Heading>
          {loadingPending ? (
            <p>Carregando...</p>
          ) : (
            pendingUsers.map((user, index) => (
              <Box key={user._id || user.id || index} display="flex" alignItems="center" justifyContent="space-between" mb={2} p={2} borderWidth={1} borderRadius={6}>
                <span><b>{user.name}</b> ({user.email})</span>
                <Button colorScheme="green" size="sm" onClick={() => handleApprove(user._id || user.id)}>Aprovar</Button>
              </Box>
            ))
          )}
        </Box>
      )}
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Funcionários</Heading>
        <Button leftIcon={<MdAdd />} colorScheme="blue" onClick={() => handleOpenModal()}>
          Novo Funcionário
        </Button>
      </HStack>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Nome</Th>
            <Th>Email</Th>
            <Th>Função</Th>
            <Th>Status</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {employees.map((user, idx) => (
            <Tr key={user._id || user.id || idx}>
              <Td>{user.name}</Td>
              <Td>{user.email}</Td>
              <Td>{user.role === 'admin' ? 'Administrador' : 'Usuário'}</Td>
              <Td>
                <Badge colorScheme={user.active ? 'green' : 'red'}>
                  {user.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton aria-label="Editar" icon={<MdEdit />} size="sm" onClick={() => handleOpenModal(user)} />
                  <IconButton aria-label="Excluir" icon={<MdDelete />} size="sm" colorScheme="red" onClick={() => handleDelete((user as any).id)} />
                  <IconButton aria-label={user.active ? 'Desativar' : 'Ativar'} icon={<MdPowerSettingsNew />} size="sm" colorScheme={user.active ? 'yellow' : 'green'} onClick={() => handleToggleActive(user)} />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Nome</FormLabel>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nome completo" />
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Email</FormLabel>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@exemplo.com" />
            </FormControl>

            <FormControl mb={4} isRequired={!selectedEmployee}>
              <FormLabel>{selectedEmployee ? 'Nova Senha (opcional)' : 'Senha'}</FormLabel>
              <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="********" />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Função</FormLabel>
              <Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}>
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </Select>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Status</FormLabel>
              <Select value={formData.active.toString()} onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}>
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </Select>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              {selectedEmployee ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Employees;
