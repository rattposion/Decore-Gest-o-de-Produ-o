import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f6ff',
      100: '#b3e3ff',
      200: '#80cfff',
      300: '#4dbbff',
      400: '#1aa7ff',
      500: '#0088e6',
      600: '#0066b3',
      700: '#004480',
      800: '#00224d',
      900: '#00111a',
    },
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'blue',
      },
    },
    Table: {
      variants: {
        simple: {
          th: {
            borderColor: 'gray.200',
            backgroundColor: 'gray.50',
          },
          td: {
            borderColor: 'gray.100',
          },
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
});

export default theme; 