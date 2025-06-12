import React from 'react';
import {
  Box,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import UserManagement from '../components/UserManagement';

const Settings: React.FC = () => {
  return (
    <Box>
      <Heading mb={8}>Configurações</Heading>

      <Tabs>
        <TabList>
          <Tab>Usuários</Tab>
          <Tab>Sistema</Tab>
          <Tab>Backup</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <UserManagement />
          </TabPanel>
          
          <TabPanel>
            <Box bg="white" p={6} borderRadius="md" shadow="sm">
              <Heading size="md" mb={4}>
                Configurações do Sistema
              </Heading>
              {/* Configurações do sistema serão implementadas posteriormente */}
            </Box>
          </TabPanel>
          
          <TabPanel>
            <Box bg="white" p={6} borderRadius="md" shadow="sm">
              <Heading size="md" mb={4}>
                Backup e Restauração
              </Heading>
              {/* Funcionalidades de backup serão implementadas posteriormente */}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Settings; 