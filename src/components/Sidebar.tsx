import React from 'react';
import { Box, VStack, Icon, Text, Flex, Button, useColorModeValue } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.tsx';
import {
  MdDashboard,
  MdInventory,
  MdBuild,
  MdAssessment,
  MdLogout,
  MdPerson,
  MdConstruction
} from 'react-icons/md';

const menuItems = [
  { path: '/dashboard', icon: MdDashboard, label: 'Dashboard' },
  { path: '/employees', icon: MdPerson, label: 'Funcionários', adminOnly: true },
  { path: '/equipment', icon: MdConstruction, label: 'Equipamentos', adminOnly: true },
  { path: '/inventory', icon: MdInventory, label: 'Estoque' },
  { path: '/production', icon: MdBuild, label: 'Produção' },
  { path: '/reports', icon: MdAssessment, label: 'Relatórios' }
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAdmin } = useAuth();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      w="64"
      bg={bg}
      borderRight="1px"
      borderColor={borderColor}
      py={8}
      position="sticky"
      top={0}
      h="100vh"
    >
      <VStack spacing={2} align="stretch">
        <Box px={8} mb={8}>
          <Text fontSize="2xl" fontWeight="bold" color="blue.500">
            Decore Gestão de Produção
          </Text>
        </Box>

        <VStack spacing={1} align="stretch">
          {menuItems
            .filter(item => !item.adminOnly || isAdmin)
            .map((item) => (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                variant="ghost"
                justifyContent="flex-start"
                pl={8}
                py={3}
                w="full"
                bg={location.pathname === item.path ? 'blue.50' : 'transparent'}
                color={location.pathname === item.path ? 'blue.500' : 'gray.600'}
                _hover={{
                  bg: location.pathname === item.path ? 'blue.50' : 'gray.100',
                }}
              >
                <Flex align="center">
                  <Icon as={item.icon} boxSize={5} mr={3} />
                  <Text>{item.label}</Text>
                </Flex>
              </Button>
            ))}
        </VStack>

        <Box mt="auto" px={8}>
          <Button
            onClick={handleLogout}
            variant="ghost"
            justifyContent="flex-start"
            w="full"
            leftIcon={<Icon as={MdLogout} boxSize={5} />}
            color="gray.600"
            _hover={{ bg: 'gray.100' }}
          >
            Sair
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

export default Sidebar;