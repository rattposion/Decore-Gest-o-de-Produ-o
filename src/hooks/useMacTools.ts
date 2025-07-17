import { useState } from 'react';
import { useToast } from '@chakra-ui/react';

interface MacData {
  localizacao: string;
  mac: string;
}

export const useMacTools = () => {
  const [inputData, setInputData] = useState('');
  const [macResults, setMacResults] = useState<MacData[]>([]);
  const toast = useToast();

  const processarDados = () => {
    const inputTexto = inputData.trim();
    if (!inputTexto) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira os dados para processar.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Divide o texto em blocos (cada bloco representa um item)
    const blocos = inputTexto.split("\n\n"); // Separa por duas quebras de linha
    const resultados: MacData[] = [];
    const erros: string[] = [];

    blocos.forEach((bloco, index) => {
      if (!bloco.trim()) return; // Pula blocos vazios

      // Extrai o MAC com regex mais robusto
      const regexMAC = /MAC:\s*([A-Fa-f0-9:]+)/i;
      const matchMAC = bloco.match(regexMAC);
      const mac = matchMAC ? matchMAC[1].replace(/:/g, "").toUpperCase() : null;

      // Extrai a Localização com regex mais robusto
      const regexLocal = /LOCAL ESTOQUE:\s*([^\n\r\t]+)/i;
      const matchLocal = bloco.match(regexLocal);
      const local = matchLocal ? matchLocal[1].trim() : null;

      // Validações adicionais
      if (!mac) {
        erros.push(`Bloco ${index + 1}: MAC não encontrado`);
        return;
      }

      if (!local) {
        erros.push(`Bloco ${index + 1}: Localização não encontrada`);
        return;
      }

      // Valida formato do MAC (deve ter 12 caracteres hexadecimais)
      if (mac.length !== 12) {
        erros.push(`Bloco ${index + 1}: MAC inválido (${mac})`);
        return;
      }

      // Valida se o MAC contém apenas caracteres hexadecimais
      if (!/^[A-F0-9]{12}$/.test(mac)) {
        erros.push(`Bloco ${index + 1}: MAC com formato inválido (${mac})`);
        return;
      }

      // Verifica se já existe um MAC igual
      const macExistente = resultados.find(r => r.mac === mac);
      if (macExistente) {
        erros.push(`Bloco ${index + 1}: MAC duplicado (${mac})`);
        return;
      }

      // Adiciona apenas se passou em todas as validações
      resultados.push({
        localizacao: local,
        mac: mac
      });
    });

    setMacResults(resultados);

    // Mostra feedback detalhado
    if (resultados.length === 0) {
      toast({
        title: 'Aviso',
        description: 'Nenhum MAC válido encontrado. Verifique o formato dos dados.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      
      if (erros.length > 0) {
        toast({
          title: 'Detalhes dos Erros',
          description: `Encontrados ${erros.length} erro(s). Verifique o console para detalhes.`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      const mensagem = erros.length > 0 
        ? `Processados ${resultados.length} MAC(s) válidos. ${erros.length} erro(s) encontrados.`
        : `Dados processados com sucesso! ${resultados.length} MAC(s) encontrado(s).`;
      
      toast({
        title: 'Sucesso',
        description: mensagem,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });


    }
  };

  const limparDados = () => {
    setInputData('');
    setMacResults([]);
  };

  return {
    inputData,
    macResults,
    setInputData,
    processarDados,
    limparDados,
  };
}; 