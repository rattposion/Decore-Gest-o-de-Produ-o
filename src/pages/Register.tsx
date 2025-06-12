import React, { useState } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack
} from '@chakra-ui/react';
import api from '../services/api';

const Register: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/auth/register', form);
      setSuccess(res.data.message || 'Cadastro realizado! Aguarde aprovação do administrador.');
      setForm({ name: '', email: '', password: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={8} borderWidth={1} borderRadius={8} boxShadow="lg">
      <Heading mb={6} textAlign="center">Cadastro de Funcionário</Heading>
      {success && (
        <Alert status="success" mb={4}>
          <AlertIcon />
          <AlertTitle>Sucesso!</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <AlertTitle>Erro!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Nome</FormLabel>
            <Input name="name" value={form.name} onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" name="email" value={form.email} onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Senha</FormLabel>
            <Input type="password" name="password" value={form.password} onChange={handleChange} />
          </FormControl>
          <Button colorScheme="blue" type="submit" isLoading={loading} width="full">
            Registrar
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default Register; 