import React, { useState } from 'react';
import {
  Box,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { useMacTools } from '../hooks/useMacTools';
import MacOrganizerTab from '../components/SeparacaoMacs/MacOrganizerTab';

const SeparacaoMacs: React.FC = () => {
  const {
    inputData,
    macResults,
    setInputData,
    processarDados
  } = useMacTools();

  return (
    <Box>
      <Box mb={6}>
        <Heading>Organizador de MACs</Heading>
      </Box>

      <Tabs variant="enclosed">
        <TabList>
          <Tab>Organizador de MACs</Tab>
        </TabList>

        <TabPanels>
          {/* Aba Organizador de MACs */}
          <TabPanel>
            <MacOrganizerTab
              inputData={inputData}
              macResults={macResults}
              onInputDataChange={setInputData}
              onProcessData={processarDados}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default SeparacaoMacs; 