import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  Heading,
  Badge,
  IconButton,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { MdDelete, MdEdit } from 'react-icons/md';
import { useAuth } from '../hooks/useAuth.tsx';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  active: boolean;
}

const UserManagement: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(name, email, password);
      toast({
        title: 'Usuário criado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Limpar formulário
      setName('');
      setEmail('');
      setPassword('');
      setRole('user');
    } catch (error: any) {
      toast({
        title: 'Erro ao criar usuário',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Heading size="md" mb={6}>
        Gerenciamento de Usuários
      </Heading>

      <Box bg="white" p={6} borderRadius="md" shadow="sm" mb={8}>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Nome</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome completo"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Senha</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Função</FormLabel>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </Select>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              isLoading={loading}
              w="full"
            >
              Criar Usuário
            </Button>
          </VStack>
        </form>
      </Box>

      <Box bg="white" p={6} borderRadius="md" shadow="sm">
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
            {/* Lista de usuários será implementada posteriormente */}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default UserManagement; 