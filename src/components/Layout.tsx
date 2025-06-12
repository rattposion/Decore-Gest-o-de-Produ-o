import React, { Suspense } from 'react';
import { Box, Flex, Spinner, Center } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  return (
    <Flex minH="100vh" bg="gray.50">
      <Sidebar />
      <Box flex="1" p={8} overflow="auto">
        <Suspense fallback={
          <Center h="100vh">
            <Spinner size="xl" color="blue.500" />
          </Center>
        }>
          <Outlet />
        </Suspense>
      </Box>
    </Flex>
  );
};

export default Layout; 