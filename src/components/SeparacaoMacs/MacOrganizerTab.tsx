import React, { useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  VStack,
  Badge,
  useClipboard,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  ButtonGroup
} from '@chakra-ui/react';
import { gerarListaFormatada } from '../../utils/listUtils';
import { exemploDadosMac, exemploDadosComErros, gerarDadosExemplo } from '../../utils/macExampleData';

interface MacData {
  localizacao: string;
  mac: string;
}

interface EquipmentData {
  mac: string;
  equipmentInfo: string;
  model?: string;
  serialNumber?: string;
  localEstoque?: string;
  valorVenda?: string;
  tipo?: string;
  recondicionado?: string;
}

interface MacOrganizerTabProps {
  inputData: string;
  macResults: MacData[];
  onInputDataChange: (data: string) => void;
  onProcessData: () => void;
}

interface ComparisonResult {
  mac: string;
  found: boolean;
  localizacao?: string;
  equipmentInfo?: string;
  equipmentData?: EquipmentData;
}

interface ProcessedResults {
  equipamentosComLocalizacao: ComparisonResult[];
  equipamentosSemLocalizacao: EquipmentData[];
  macsNaoEncontrados: string[];
}

const MacOrganizerTab: React.FC<MacOrganizerTabProps> = ({
  inputData,
  macResults,
  onInputDataChange,
  onProcessData
}) => {
  const toast = useToast();
  const [macsParaComparar, setMacsParaComparar] = React.useState<string>('');
  const [equipmentData, setEquipmentData] = React.useState<string>('');
  const [processedResults, setProcessedResults] = React.useState<ProcessedResults | null>(null);
  const [showResults, setShowResults] = React.useState<boolean>(false);

  // Monitora mudanças nos resultados
  useEffect(() => {
    if (processedResults) {
      console.log('=== MONITORANDO RESULTADOS ===');
      console.log('processedResults atualizado:', processedResults);
      console.log('macsNaoEncontrados:', processedResults.macsNaoEncontrados);
      console.log('Quantidade de MACs não encontrados:', processedResults.macsNaoEncontrados.length);
    }
  }, [processedResults]);

  // Agrupa MACs por localização
  const macsPorLocalizacao = macResults.reduce((acc, item) => {
    if (!acc[item.localizacao]) {
      acc[item.localizacao] = [];
    }
    acc[item.localizacao].push(item.mac);
    return acc;
  }, {} as Record<string, string[]>);

  // Gera lista completa de todos os MACs
  const gerarListaCompleta = () => {
    const todosMacs = macResults.map(item => item.mac);
    return gerarListaFormatada(todosMacs);
  };

  // Gera lista de MACs carregados separados por vírgula
  const gerarListaMacsCarregados = () => {
    const macs = macsParaComparar
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(mac => formatarMacParaExibicao(mac));
    
    return macs.map((mac, index) => 
      mac + (index < macs.length - 1 ? ',' : '')
    ).join('');
  };

  // Normaliza MAC para comparação (remove : e converte para maiúsculo)
  const normalizarMac = (mac: string): string => {
    return mac.replace(/:/g, '').toUpperCase();
  };

  // Formata MAC para exibição (remove : e mantém apenas os caracteres)
  const formatarMacParaExibicao = (mac: string): string => {
    const cleanMac = mac.replace(/:/g, '').toUpperCase();
    return cleanMac;
  };

  // Copia texto para clipboard
  const copiarParaClipboard = (texto: string, descricao: string) => {
    navigator.clipboard.writeText(texto).then(() => {
      toast({
        title: 'Copiado!',
        description: `${descricao} copiado para a área de transferência`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }).catch(() => {
      toast({
        title: 'Erro',
        description: 'Erro ao copiar para a área de transferência',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    });
  };

  // Valida formato do MAC (com ou sem :)
  const validarMac = (mac: string): boolean => {
    const cleanMac = mac.replace(/:/g, '').toUpperCase();
    return /^[A-F0-9]{12}$/.test(cleanMac);
  };

  // Carrega dados de exemplo
  const carregarExemplo = () => {
    onInputDataChange(exemploDadosMac);
    toast({
      title: 'Dados de Exemplo Carregados',
      description: 'Dados de exemplo válidos foram carregados. Clique em "Processar Dados" para testar.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Carrega dados com erros
  const carregarExemploComErros = () => {
    onInputDataChange(exemploDadosComErros);
    toast({
      title: 'Dados com Erros Carregados',
      description: 'Dados com erros foram carregados para testar a validação.',
      status: 'warning',
      duration: 3000,
      isClosable: true,
    });
  };

  // Gera dados aleatórios
  const gerarDadosAleatorios = () => {
    const dadosAleatorios = gerarDadosExemplo(8);
    onInputDataChange(dadosAleatorios);
    toast({
      title: 'Dados Aleatórios Gerados',
      description: '8 MACs aleatórios foram gerados. Clique em "Processar Dados" para testar.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Processa dados e compara MACs com equipamentos
  const processarDados = () => {
    if (!macsParaComparar.trim()) {
      toast({
        title: 'Lista de MACs Vazia',
        description: 'Por favor, insira a lista de MACs primeiro.',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    if (!equipmentData.trim()) {
      toast({
        title: 'Dados de Equipamento Vazios',
        description: 'Por favor, insira os dados dos equipamentos.',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    // Extrai MACs da lista de comparação
    const macsList = macsParaComparar
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(mac => {
        // Remove : e converte para maiúsculo
        const cleanMac = mac.replace(/:/g, '').toUpperCase();
        // Valida se tem 12 caracteres hexadecimais
        if (/^[A-F0-9]{12}$/.test(cleanMac)) {
          return cleanMac;
        }
        return null;
      })
      .filter(mac => mac !== null) as string[];

    // Debug: Mostra os dados brutos
    console.log('=== DADOS BRUTOS DOS EQUIPAMENTOS ===');
    console.log(equipmentData);
    
    // Extrai dados dos equipamentos
    const equipamentos = equipmentData
      .split('\n\n')
      .map(block => block.trim())
      .filter(block => block.length > 0)
      .map(block => {
        console.log('=== PROCESSANDO BLOCO ===');
        console.log(block);
        const lines = block.split('\n');
        
        // Procura por MAC em várias possíveis posições e formatos
        let mac = '';
        
        // Primeiro, procura em todo o bloco por padrões de MAC
        const fullBlock = lines.join(' ');
        
        // Procura por padrões de MAC no bloco completo
        const macPatterns = [
          /MAC:\s*([A-F0-9:]{12,17})/i,
          /MAC[^A-F0-9]*([A-F0-9:]{12,17})/i,
          /([A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2})/i,
          /([A-F0-9]{12})/i
        ];
        
        for (const pattern of macPatterns) {
          const match = fullBlock.match(pattern);
          if (match) {
            mac = match[1];
            break;
          }
        }
        
        // Se não encontrou no bloco completo, procura linha por linha
        if (!mac) {
          for (const line of lines) {
            for (const pattern of macPatterns) {
              const match = line.match(pattern);
              if (match) {
                mac = match[1];
                break;
              }
            }
            if (mac) break;
          }
        }
        
        // Procura por informações do equipamento
        const firstLine = lines[0] || '';
        const modelMatch = firstLine.match(/\((.*?)\)\s*(.*?)(?:\s*-\s*ID Próprio:|$)/);
        const model = modelMatch ? `${modelMatch[1]} ${modelMatch[2]}`.trim() : '';
        
        // Procura por número de série
        const serialLine = lines.find(line => line.includes('NÚMERO DE SÉRIE:'));
        const serial = serialLine?.split('NÚMERO DE SÉRIE:')[1]?.trim() || '';
        
        // Procura por local de estoque
        const localLine = lines.find(line => line.includes('LOCAL ESTOQUE:'));
        let local = '';
        if (localLine) {
          // Extrai apenas o valor após LOCAL ESTOQUE: até o próximo campo
          const localMatch = localLine.match(/LOCAL ESTOQUE:\s*([^NÚMERO DE SÉRIE:EPI CA:REPARTIÇÃO:MAC:DATA VALIDADE:OBSERVAÇÕES:]*)/);
          if (localMatch && localMatch[1].trim()) {
            local = localMatch[1].trim();
          } else {
            // Fallback: pega tudo após LOCAL ESTOQUE: até o final da linha
            const fallbackMatch = localLine.match(/LOCAL ESTOQUE:\s*(.*)/);
            if (fallbackMatch && fallbackMatch[1].trim()) {
              local = fallbackMatch[1].trim();
            }
          }
        }
        
        // Procura por valor de venda
        const valorLine = lines.find(line => line.includes('VALOR VENDA:'));
        const valor = valorLine?.split('VALOR VENDA:')[1]?.trim() || '';
        
        // Procura por tipo
        const tipoLine = lines.find(line => line.includes('TIPO:'));
        const tipo = tipoLine?.split('TIPO:')[1]?.trim() || '';
        
        // Procura por recondicionado
        const recondicionadoLine = lines.find(line => line.includes('RECONDICIONADO:'));
        const recondicionado = recondicionadoLine?.split('RECONDICIONADO:')[1]?.trim() || '';
        
        // Normaliza o MAC para comparação
        const cleanMac = normalizarMac(mac);
        
        // Limpa a localização de caracteres desnecessários e remove campos extras
        let cleanLocal = local.replace(/\s+/g, ' ').trim();
        
        // Remove campos que podem ter sido capturados incorretamente
        cleanLocal = cleanLocal
          .replace(/\s*NÚMERO DE SÉRIE:.*$/i, '')
          .replace(/\s*EPI CA:.*$/i, '')
          .replace(/\s*REPARTIÇÃO:.*$/i, '')
          .replace(/\s*MAC:.*$/i, '')
          .replace(/\s*DATA VALIDADE:.*$/i, '')
          .replace(/\s*OBSERVAÇÕES:.*$/i, '')
          .replace(/\s*VALOR VENDA:.*$/i, '')
          .replace(/\s*RECONDICIONADO:.*$/i, '')
          .replace(/\s*TIPO:.*$/i, '')
          .trim();
        
        // Debug: Mostra o que foi extraído
        console.log('MAC encontrado:', mac);
        console.log('MAC limpo:', cleanMac);
        console.log('Modelo:', model);
        console.log('Serial:', serial);
        console.log('Local original:', local);
        console.log('Local limpo:', cleanLocal);
        console.log('Linha original do local:', localLine);
        
        if (/^[A-F0-9]{12}$/.test(cleanMac)) {
          console.log('✅ MAC válido encontrado:', cleanMac);
          
          // Verifica se a localização não está vazia após a limpeza
          if (!cleanLocal) {
            console.log('⚠️ Localização vazia após limpeza, usando "Sem Localização"');
            cleanLocal = 'Sem Localização';
          }
          
          return {
            mac: cleanMac,
            equipmentInfo: `${model} - S/N: ${serial} - ${cleanLocal}`.trim(),
            model,
            serialNumber: serial,
            localEstoque: cleanLocal,
            valorVenda: valor,
            tipo: tipo,
            recondicionado: recondicionado
          };
        } else {
          console.log('❌ MAC inválido ou não encontrado:', mac);
        }
        return null;
      });

    // Cria um mapa dos equipamentos
    const equipamentosMap = new Map<string, EquipmentData>();
    equipamentos
      .filter(equip => equip !== null)
      .forEach(equip => {
        if (equip) {
          equipamentosMap.set(equip.mac, equip);
        }
      });

    // Debug: Mostra informações sobre o processamento
    console.log('=== DEBUG PROCESSAMENTO ===');
    console.log('MACs da lista (normalizados):', macsList);
    console.log('Equipamentos encontrados (normalizados):', equipamentos.filter(e => e !== null).map(e => e?.mac));
    console.log('Total de equipamentos válidos:', equipamentos.filter(e => e !== null).length);
    console.log('Total de MACs na lista:', macsList.length);
    
    // Debug: Mostra exemplo de normalização
    if (macsList.length > 0 && equipamentos.filter(e => e !== null).length > 0) {
      console.log('=== EXEMPLO DE NORMALIZAÇÃO ===');
      console.log('MAC da lista (exemplo):', macsList[0]);
      console.log('MAC do equipamento (exemplo):', equipamentos.filter(e => e !== null)[0]?.mac);
      console.log('São iguais?', macsList[0] === equipamentos.filter(e => e !== null)[0]?.mac);
    }
    
    // Mostra informações de debug para o usuário
    const equipamentosValidos = equipamentos.filter(e => e !== null).length;
    
    // Conta localizações únicas
    const localizacoesUnicas = new Set(
      equipamentos
        .filter(e => e !== null)
        .map(e => e?.localEstoque)
        .filter(local => local && local.trim())
    );
    
    toast({
      title: 'Debug: Processamento',
      description: `${equipamentosValidos} equipamentos válidos encontrados, ${localizacoesUnicas.size} localizações únicas. MACs normalizados para comparação.`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });

    // Processa resultados
    const equipamentosEncontrados: EquipmentData[] = [];
    const macsNaoEncontrados: string[] = [];

    console.log('=== PROCESSANDO COMPARAÇÃO ===');
    console.log('MACs da lista para comparar:', macsList);
    console.log('Equipamentos disponíveis:', Array.from(equipamentosMap.keys()));

    // Verifica cada MAC da lista
    macsList.forEach(mac => {
      // Normaliza o MAC da lista para comparação
      const macNormalizado = normalizarMac(mac);
      
      // Procura o equipamento no mapa
      const temEquipamento = equipamentosMap.has(macNormalizado);
      console.log(`MAC ${mac} (normalizado: ${macNormalizado}): ${temEquipamento ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);
      
      if (temEquipamento) {
        // Tem equipamento
        const equipamento = equipamentosMap.get(macNormalizado);
        if (equipamento) {
          equipamentosEncontrados.push(equipamento);
        }
      } else {
        // Não tem equipamento
        macsNaoEncontrados.push(formatarMacParaExibicao(mac));
      }
    });

    console.log('Equipamentos encontrados:', equipamentosEncontrados.length);
    console.log('MACs não encontrados:', macsNaoEncontrados.length);
    console.log('Lista de MACs não encontrados:', macsNaoEncontrados);
    console.log('Tipo de macsNaoEncontrados:', typeof macsNaoEncontrados);
    console.log('É array?', Array.isArray(macsNaoEncontrados));

    const resultados: ProcessedResults = {
      equipamentosComLocalizacao: equipamentosEncontrados.map(equip => ({
        mac: formatarMacParaExibicao(equip.mac),
        found: true,
        localizacao: equip.localEstoque,
        equipmentInfo: equip.equipmentInfo,
        equipmentData: equip
      })),
      equipamentosSemLocalizacao: [],
      macsNaoEncontrados
    };

    console.log('=== RESULTADOS FINAIS ===');
    console.log('Resultados criados:', resultados);
    console.log('macsNaoEncontrados nos resultados:', resultados.macsNaoEncontrados);
    console.log('Quantidade de MACs não encontrados:', resultados.macsNaoEncontrados.length);

    setProcessedResults(resultados);
    setShowResults(true);
    
    console.log('=== ESTADO ATUALIZADO ===');
    console.log('showResults definido como:', true);
    console.log('processedResults será:', resultados);

    const total = macsList.length;
    const encontrados = equipamentosEncontrados.length;
    const naoEncontrados = macsNaoEncontrados.length;

    toast({
      title: 'Processamento Concluído',
      description: `${encontrados} encontrados, ${naoEncontrados} não encontrados`,
      status: naoEncontrados > 0 ? 'warning' : 'success',
      duration: 3000,
      isClosable: true,
    });

    // Toast adicional se há MACs não encontrados
    if (naoEncontrados > 0) {
      toast({
        title: '⚠️ MACs Não Encontrados',
        description: `${naoEncontrados} MAC(s) não foram encontrados nos dados dos equipamentos. Verifique a seção vermelha abaixo.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Limpa todos os dados
  const limparTodosDados = () => {
    setMacsParaComparar('');
    setEquipmentData('');
    setProcessedResults(null);
    setShowResults(false);
  };

  // Gera relatório completo
  const gerarRelatorioCompleto = () => {
    if (!processedResults) return;

    const { equipamentosComLocalizacao, equipamentosSemLocalizacao, macsNaoEncontrados } = processedResults;

    const relatorio = `RELATÓRIO DE PROCESSAMENTO DE EQUIPAMENTOS
Data: ${new Date().toLocaleDateString('pt-BR')}
Hora: ${new Date().toLocaleTimeString('pt-BR')}

ESTATÍSTICAS:
- Total de MACs verificados: ${equipamentosComLocalizacao.length + macsNaoEncontrados.length}
- Equipamentos encontrados: ${equipamentosComLocalizacao.length}
- MACs não encontrados: ${macsNaoEncontrados.length}

EQUIPAMENTOS ENCONTRADOS:
${equipamentosComLocalizacao.map(item => `${item.mac} - ${item.localizacao} - ${item.equipmentData?.model || ''} - ${item.equipmentData?.valorVenda || ''} - ${item.equipmentData?.tipo || ''}`).join('\n')}

MACs NÃO ENCONTRADOS:
${macsNaoEncontrados.join('\n')}

LISTA DE MACs ENCONTRADOS (com vírgulas):
${equipamentosComLocalizacao.map(item => item.mac).join(', ')}

--- Fim do Relatório ---`;

    copiarParaClipboard(relatorio, 'Relatório completo de equipamentos');
  };

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="sm">
      <Heading size="md" mb={4}>Organizador de MACs e Localização</Heading>
      <Text mb={4}>Cole os dados abaixo:</Text>
      
      {/* Passo 1: Lista de MACs */}
      <Box mb={6} p={4} bg="blue.50" borderRadius="md">
        <Heading size="sm" mb={3} color="blue.700">Passo 1: Lista de MACs</Heading>
        <Text fontSize="sm" mb={3} color="blue.600">
          Cole aqui a lista de MACs que você quer verificar (aceita formato com ou sem :)
        </Text>
        <FormControl>
          <FormLabel fontSize="sm">MACs para Verificar:</FormLabel>
          <Textarea
            value={macsParaComparar}
            onChange={(e) => setMacsParaComparar(e.target.value)}
            placeholder="Cole aqui os MACs... Exemplo:
001122334455
AABBCCDDEEFF
123456789ABC
DEADBEEFCAFE"
            height="100px"
            mb={3}
          />
        </FormControl>
        <HStack spacing={2}>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => {
              setMacsParaComparar(`200889BDFC12
746F88061D24
746F883CA314
94286F9CF555
504289FA560B`);
              toast({
                title: 'Exemplo Carregado',
                description: 'Lista de exemplo carregada',
                status: 'info',
                duration: 2000,
                isClosable: true,
              });
            }}
          >
            Exemplo
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            colorScheme="green"
            onClick={() => {
              const listaMacs = gerarListaMacsCarregados();
              if (listaMacs) {
                copiarParaClipboard(listaMacs, 'Lista de MACs carregados');
              } else {
                toast({
                  title: 'Lista Vazia',
                  description: 'Não há MACs carregados para copiar',
                  status: 'warning',
                  duration: 2000,
                  isClosable: true,
                });
              }
            }}
          >
            Colar
          </Button>
        </HStack>
      </Box>

      {/* Lista de MACs Carregados */}
      {macsParaComparar.trim() && (
        <Box mb={4} p={4} bg="gray.50" borderRadius="md">
          <HStack justify="space-between" mb={3}>
            <Heading size="xs" color="gray.700">📝 Lista de MACs Carregados:</Heading>
            <Badge colorScheme="gray">
              {macsParaComparar.split('\n').filter(line => line.trim().length > 0).length} MAC(s)
            </Badge>
          </HStack>
          <Text fontFamily="monospace" fontSize="sm" mb={3} color="gray.700" whiteSpace="pre-wrap">
            {gerarListaMacsCarregados()}
          </Text>
          <Button
            size="sm"
            colorScheme="gray"
            onClick={() => {
              const listaMacs = gerarListaMacsCarregados();
              if (listaMacs) {
                copiarParaClipboard(listaMacs, 'Lista de MACs carregados');
              }
            }}
          >
            Copiar Lista de MACs
          </Button>
        </Box>
      )}
      
      {/* Debug: Verificar se a seção deve aparecer */}
      <Box mb={2} p={2} bg="yellow.50" borderRadius="md" fontSize="xs">
        <Text color="yellow.800">
          Debug: macsParaComparar tem conteúdo? {macsParaComparar.trim() ? 'SIM' : 'NÃO'} | 
          Tamanho: {macsParaComparar.length} | 
          Conteúdo: "{macsParaComparar.substring(0, 50)}..."
        </Text>
      </Box>

      {/* Passo 2: Dados dos Equipamentos */}
      <Box mb={6} p={4} bg="green.50" borderRadius="md">
        <Heading size="sm" mb={3} color="green.700">Passo 2: Dados dos Equipamentos</Heading>
        <Text fontSize="sm" mb={3} color="green.600">
          Cole aqui os dados dos equipamentos no formato do sistema (aceita MAC com ou sem :)
        </Text>
        <FormControl>
          <FormLabel fontSize="sm">Dados dos Equipamentos:</FormLabel>
          <Textarea
            value={equipmentData}
            onChange={(e) => setEquipmentData(e.target.value)}
            placeholder="Cole aqui os dados dos equipamentos... Exemplo:

(2091071) GPON ONU WIFI ZTE F670L - ID Próprio: ZTE3BJNQ3U18521
VALOR VENDA: R$ 279.74	RECONDICIONADO: NÃO	TIPO: Patrimônio
LOCAL ESTOQUE: C.A ALLREDE - SANTA MARIA-DF	NÚMERO DE SÉRIE: ZTEGD42C3DB6	EPI CA: N/A
REPARTIÇÃO: GERAL	MAC: 9C635BDBDE0A	DATA VALIDADE: N/A
OBSERVAÇÕES: N/A"
            height="120px"
            mb={3}
          />
        </FormControl>
        <HStack spacing={2}>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => {
              setEquipmentData(`(2091071) GPON ONU WIFI ZTE F670L - ID Próprio: ZTE3BJNQ3U18521
VALOR VENDA: R$ 279.74	RECONDICIONADO: NÃO	TIPO: Patrimônio
LOCAL ESTOQUE: C.A ALLREDE - SANTA MARIA-DF	NÚMERO DE SÉRIE: ZTEGD42C3DB6	EPI CA: N/A
REPARTIÇÃO: GERAL	MAC: 20:08:89:BD:FC:8E	DATA VALIDADE: N/A
OBSERVAÇÕES: N/A

(2091072) GPON ONU WIFI ZTE F670L - ID Próprio: ZTE3BJNQ3U18522
VALOR VENDA: R$ 279.74	RECONDICIONADO: NÃO	TIPO: Patrimônio
LOCAL ESTOQUE: CD - 02 ALLREDE - ÁGUAS LINDAS - GO	NÚMERO DE SÉRIE: ZTEGD42C3DB7	EPI CA: N/A
REPARTIÇÃO: GERAL	MAC: 74:6F:88:06:1D:24	DATA VALIDADE: N/A
OBSERVAÇÕES: N/A`);
              toast({
                title: 'Exemplo Carregado',
                description: 'Dados de equipamentos carregados',
                status: 'info',
                duration: 2000,
                isClosable: true,
              });
            }}
          >
            Exemplo
          </Button>
        </HStack>
      </Box>



      {/* Botão Principal de Processamento */}
      <Box mb={6} p={4} bg="purple.50" borderRadius="md">
        <Heading size="sm" mb={3} color="purple.700">Processamento</Heading>
        <Text fontSize="sm" mb={3} color="purple.600">
          Clique no botão abaixo para verificar quais MACs da lista foram encontrados nos dados dos equipamentos
        </Text>
        <HStack spacing={4}>
          <Button colorScheme="purple" size="lg" onClick={processarDados}>
            Processar e Comparar Dados
          </Button>
          <Button variant="outline" onClick={limparTodosDados}>
            Limpar Todos os Dados
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            colorScheme="orange"
            onClick={() => {
              console.log('=== DEBUG COMPLETO ===');
              console.log('Dados dos equipamentos:', equipmentData);
              console.log('MACs para comparar:', macsParaComparar);
              toast({
                title: 'Debug Ativado',
                description: 'Verifique o console do navegador para informações detalhadas',
                status: 'info',
                duration: 3000,
                isClosable: true,
              });
            }}
          >
            Debug
          </Button>
        </HStack>
      </Box>

      {/* Instruções de formato */}
      {inputData.trim() && macResults.length === 0 && (
        <Alert status="info" mb={4}>
          <AlertIcon />
          <Box>
            <AlertTitle>Formato Esperado:</AlertTitle>
            <AlertDescription>
              Cada item deve estar separado por duas quebras de linha e conter:
              <br />• MAC: seguido do endereço MAC (ex: 00:11:22:33:44:55)
              <br />• LOCAL ESTOQUE: seguido da localização (ex: Prateleira A1)
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Lista Organizada por Localização */}
      {showResults && processedResults && (
        <Box mb={6} p={4} bg="blue.50" borderRadius="md">
          <Heading size="sm" mb={4} color="blue.700">📋 Lista Organizada por Localização:</Heading>
          <VStack spacing={4} align="stretch">
            {(() => {
              // Agrupa equipamentos por localização
              const equipamentosPorLocalizacao = processedResults.equipamentosComLocalizacao.reduce((acc, item) => {
                // Normaliza a localização (remove espaços extras e padroniza)
                const localizacao = (item.localizacao || 'Sem Localização').trim();
                if (!acc[localizacao]) {
                  acc[localizacao] = [];
                }
                acc[localizacao].push(item.mac);
                return acc;
              }, {} as Record<string, string[]>);

              // Debug: Mostra o agrupamento
              console.log('=== AGRUPAMENTO POR LOCALIZAÇÃO ===');
              console.log('Equipamentos por localização:', equipamentosPorLocalizacao);
              Object.entries(equipamentosPorLocalizacao).forEach(([localizacao, macs]) => {
                console.log(`${localizacao}: ${macs.length} MACs`);
              });

              const resultados = [];

              // Adiciona equipamentos encontrados organizados por localização
              Object.entries(equipamentosPorLocalizacao).map(([localizacao, macs]) => {
                // Remove duplicatas de MACs para a mesma localização
                const macsUnicos = [...new Set(macs)];
                
                resultados.push(
                  <Box key={localizacao} p={4} border="1px" borderColor="blue.200" borderRadius="md" bg="white">
                    <Text fontWeight="bold" color="blue.700" mb={3} fontSize="md">
                      {localizacao}
                    </Text>
                    <Text fontFamily="monospace" fontSize="sm" mb={3} color="gray.700" whiteSpace="pre-wrap">
                      {macsUnicos.map((mac, index) => (
                        <span key={index}>
                          {mac}{index < macsUnicos.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </Text>
                    <HStack justify="space-between" align="center">
                      <Badge colorScheme="blue">{macsUnicos.length} MAC(s)</Badge>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => {
                          const listaFormatada = macsUnicos.join(',');
                          copiarParaClipboard(listaFormatada, `Lista de MACs de ${localizacao}`);
                        }}
                      >
                        Copiar Lista de {localizacao}
                      </Button>
                    </HStack>
                  </Box>
                );
              });

              // Adiciona seção de equipamentos não encontrados
              if (processedResults.macsNaoEncontrados.length > 0) {
                resultados.push(
                  <Box key="nao-encontrados" p={4} border="1px" borderColor="red.200" borderRadius="md" bg="red.50">
                    <Text fontWeight="bold" color="red.700" mb={3} fontSize="md">
                      ❌ Equipamentos Não Encontrados
                    </Text>
                    <Text fontFamily="monospace" fontSize="sm" mb={3} color="gray.700" whiteSpace="pre-wrap">
                      {processedResults.macsNaoEncontrados.map((mac, index) => (
                        <span key={index}>
                          {mac}{index < processedResults.macsNaoEncontrados.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </Text>
                    <HStack justify="space-between" align="center">
                      <Badge colorScheme="red">{processedResults.macsNaoEncontrados.length} MAC(s)</Badge>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        onClick={() => {
                          const listaFormatada = processedResults.macsNaoEncontrados.join(',');
                          copiarParaClipboard(listaFormatada, 'Lista de MACs não encontrados');
                        }}
                      >
                        Copiar MACs Não Encontrados
                      </Button>
                    </HStack>
                  </Box>
                );
              }

              return resultados;
            })()}
          </VStack>
        </Box>
      )}

      {macResults.length > 0 && (
        <VStack spacing={6} align="stretch">
          {/* Estatísticas */}
          <Box p={4} bg="blue.50" borderRadius="md">
            <HStack justify="space-between">
              <Text fontWeight="bold">Estatísticas:</Text>
              <Badge colorScheme="blue">{macResults.length} MAC(s) válido(s)</Badge>
            </HStack>
            <Text fontSize="sm" mt={2}>
              Localizações únicas: {Object.keys(macsPorLocalizacao).length}
            </Text>
          </Box>

          {/* Tabela de Resultados */}
          <Box>
            <Heading size="sm" mb={4}>Resultado Detalhado:</Heading>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Localização</Th>
                  <Th>MAC</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {macResults.map((item, index) => (
                  <Tr key={index}>
                    <Td fontWeight="medium">{item.localizacao}</Td>
                    <Td fontFamily="monospace">{item.mac}</Td>
                    <Td>
                      <Badge 
                        colorScheme={validarMac(item.mac) ? "green" : "red"}
                        size="sm"
                      >
                        {validarMac(item.mac) ? "Válido" : "Inválido"}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* Listas Organizadas por Localização */}
          <Box>
            <Heading size="sm" mb={4}>Listas por Localização:</Heading>
            <VStack spacing={4} align="stretch">
              {Object.entries(macsPorLocalizacao).map(([localizacao, macs]) => (
                <Box key={localizacao} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="bold">{localizacao}</Text>
                    <Badge colorScheme="blue">{macs.length} MAC(s)</Badge>
                  </HStack>
                  <Text fontFamily="monospace" fontSize="sm" mb={2}>
                    {gerarListaFormatada(macs)}
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => copiarParaClipboard(gerarListaFormatada(macs), `Lista de ${localizacao}`)}
                  >
                    Copiar Lista
                  </Button>
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Lista Completa */}
          <Box>
            <Heading size="sm" mb={4}>Lista Completa de Todos os MACs:</Heading>
            <Box p={4} border="1px" borderColor="gray.200" borderRadius="md">
              <Text fontFamily="monospace" fontSize="sm" mb={2}>
                {gerarListaCompleta()}
              </Text>
              <Button
                size="sm"
                colorScheme="purple"
                onClick={() => copiarParaClipboard(gerarListaCompleta(), 'Lista completa de MACs')}
              >
                Copiar Lista Completa
              </Button>
            </Box>
          </Box>

                    {/* Resultados do Processamento */}
          {showResults && processedResults && (
            <Box>
              <Heading size="sm" mb={4}>Resultados do Processamento:</Heading>
              
              {/* Informações de Debug */}
              <Box p={4} bg="orange.50" borderRadius="md" mb={4}>
                <Heading size="xs" mb={2} color="orange.700">🔍 Informações de Debug:</Heading>
                <VStack align="stretch" spacing={2}>
                  <Text fontSize="sm">
                    <strong>MACs na lista:</strong> {macsParaComparar.split('\n').filter(line => line.trim().length > 0).length}
                  </Text>
                  <Text fontSize="sm">
                    <strong>Blocos de equipamentos processados:</strong> {equipmentData.split('\n\n').filter(block => block.trim().length > 0).length}
                  </Text>
                  <Text fontSize="sm">
                    <strong>Equipamentos válidos extraídos:</strong> {processedResults.equipamentosComLocalizacao.length + processedResults.equipamentosSemLocalizacao.length}
                  </Text>
                  <Text fontSize="sm">
                    <strong>Localizações únicas encontradas:</strong> {(() => {
                      const equipamentosPorLocalizacao = processedResults.equipamentosComLocalizacao.reduce((acc, item) => {
                        const localizacao = (item.localizacao || 'Sem Localização').trim();
                        if (!acc[localizacao]) {
                          acc[localizacao] = [];
                        }
                        acc[localizacao].push(item.mac);
                        return acc;
                      }, {} as Record<string, string[]>);
                      return Object.keys(equipamentosPorLocalizacao).length;
                    })()}
                  </Text>
                </VStack>
              </Box>
              
              {/* Estatísticas Gerais */}
              <Box p={4} bg="purple.50" borderRadius="md" mb={4}>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Resumo:</Text>
                  <Badge colorScheme="purple">
                    {processedResults.equipamentosComLocalizacao.length} encontrados / {processedResults.macsNaoEncontrados.length} não encontrados
                  </Badge>
                </HStack>
                <Text fontSize="sm" mt={2} color="purple.600">
                  Total de MACs verificados: {processedResults.equipamentosComLocalizacao.length + processedResults.macsNaoEncontrados.length}
                </Text>
                
                {/* Resumo Rápido dos Não Encontrados */}
                {processedResults.macsNaoEncontrados.length > 0 && (
                  <Box mt={3} p={3} bg="red.100" borderRadius="md" border="1px" borderColor="red.300">
                    <Text fontSize="sm" color="red.800" fontWeight="bold">
                      ⚠️ MACs não encontrados nos dados dos equipamentos:
                    </Text>
                    <Text fontSize="xs" color="red.700" mt={1}>
                      {processedResults.macsNaoEncontrados.slice(0, 5).join(', ')}
                      {processedResults.macsNaoEncontrados.length > 5 && ` ... e mais ${processedResults.macsNaoEncontrados.length - 5} MAC(s)`}
                    </Text>
                  </Box>
                )}
                <HStack mt={3} spacing={2}>
                  <Button size="sm" colorScheme="purple" onClick={gerarRelatorioCompleto}>
                    Gerar Relatório Completo
                  </Button>
                  <Button 
                    size="sm" 
                    colorScheme="green" 
                    onClick={() => {
                      const macsEncontrados = processedResults.equipamentosComLocalizacao
                        .map(item => item.mac)
                        .join(',');
                      copiarParaClipboard(macsEncontrados, 'Lista de MACs encontrados');
                    }}
                  >
                    Copiar MACs Encontrados
                  </Button>
                  {processedResults.macsNaoEncontrados.length > 0 && (
                    <Button 
                      size="sm" 
                      colorScheme="red" 
                      variant="outline"
                      onClick={() => {
                        const naoEncontrados = processedResults.macsNaoEncontrados.join(',');
                        copiarParaClipboard(naoEncontrados, 'Lista de MACs não encontrados');
                      }}
                    >
                      Copiar MACs Não Encontrados
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    colorScheme="orange" 
                    variant="outline"
                    onClick={() => {
                      console.log('=== DEBUG RESULTADOS ===');
                      console.log('Equipamentos encontrados:', processedResults.equipamentosComLocalizacao);
                      console.log('MACs não encontrados:', processedResults.macsNaoEncontrados);
                      console.log('Total de MACs não encontrados:', processedResults.macsNaoEncontrados.length);
                      toast({
                        title: 'Debug dos Resultados',
                        description: `Encontrados: ${processedResults.equipamentosComLocalizacao.length}, Não encontrados: ${processedResults.macsNaoEncontrados.length}`,
                        status: 'info',
                        duration: 3000,
                        isClosable: true,
                      });
                    }}
                  >
                    Debug Resultados
                  </Button>
                </HStack>
              </Box>

              {/* Lista Completa de MACs Encontrados */}
              {processedResults.equipamentosComLocalizacao.length > 0 && (
                <Box p={4} bg="green.50" borderRadius="md" mb={4}>
                  <Heading size="xs" mb={3} color="green.700">📝 Lista Completa de MACs Encontrados:</Heading>
                  <Text fontFamily="monospace" fontSize="sm" mb={3} color="gray.700" whiteSpace="pre-wrap">
                    {processedResults.equipamentosComLocalizacao.map((item, index) => (
                      <span key={index}>
                        {item.mac}{index < processedResults.equipamentosComLocalizacao.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => {
                      const listaCompleta = processedResults.equipamentosComLocalizacao
                        .map(item => item.mac)
                        .join(',');
                      copiarParaClipboard(listaCompleta, 'Lista completa de MACs encontrados');
                    }}
                  >
                    Copiar Lista Completa
                  </Button>
                </Box>
              )}

                            {/* Equipamentos Encontrados */}
              {processedResults.equipamentosComLocalizacao.length > 0 && (
                <Box mb={4}>
                  <Heading size="xs" mb={3} color="green.600">✅ Equipamentos Encontrados:</Heading>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>MAC</Th>
                        <Th>Localização</Th>
                        <Th>Equipamento</Th>
                        <Th>Valor</Th>
                        <Th>Tipo</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {processedResults.equipamentosComLocalizacao.map((item, index) => (
                        <Tr key={index}>
                          <Td fontFamily="monospace">{item.mac}</Td>
                          <Td>{item.localizacao}</Td>
                          <Td fontSize="sm">{item.equipmentData?.model}</Td>
                          <Td fontSize="sm">{item.equipmentData?.valorVenda}</Td>
                          <Td fontSize="sm">{item.equipmentData?.tipo}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}



              {/* MACs Não Encontrados */}
              <Box>
                <Heading size="xs" mb={3} color="red.600">
                  ❌ MACs Não Encontrados ({processedResults.macsNaoEncontrados.length}):
                  {processedResults.macsNaoEncontrados.length > 0 && ' ⚠️ VERIFIQUE ABAIXO'}
                </Heading>
                {processedResults.macsNaoEncontrados && processedResults.macsNaoEncontrados.length > 0 ? (
                  <Box p={4} border="1px" borderColor="red.200" borderRadius="md" bg="red.50">
                    <Text fontFamily="monospace" fontSize="sm" mb={3} color="gray.700" whiteSpace="pre-wrap">
                      {processedResults.macsNaoEncontrados.map((mac, index) => (
                        <span key={index}>
                          {mac}{index < processedResults.macsNaoEncontrados.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </Text>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => {
                        const naoEncontrados = processedResults.macsNaoEncontrados.join(',');
                        copiarParaClipboard(naoEncontrados, 'Lista de MACs não encontrados');
                      }}
                    >
                      Copiar MACs Não Encontrados
                    </Button>
                  </Box>
                ) : (
                  <Box p={4} border="1px" borderColor="green.200" borderRadius="md" bg="green.50">
                    <Text color="green.700" fontSize="sm">
                      ✅ Todos os MACs foram encontrados! Não há MACs não encontrados.
                    </Text>
                  </Box>
                )}
              </Box>
              
              {/* Debug: Verificação dos dados */}
              <Box p={3} bg="yellow.50" borderRadius="md" mt={3} border="1px" borderColor="yellow.300">
                <Text fontSize="xs" color="yellow.800" fontWeight="bold">
                  🔍 Debug - Verificação dos Dados:
                </Text>
                <Text fontSize="xs" color="yellow.700" mt={1}>
                  processedResults existe: {processedResults ? 'SIM' : 'NÃO'} | 
                  macsNaoEncontrados é array: {Array.isArray(processedResults?.macsNaoEncontrados) ? 'SIM' : 'NÃO'} | 
                  Quantidade: {processedResults?.macsNaoEncontrados?.length || 0}
                </Text>
                <Text fontSize="xs" color="yellow.700" mt={1}>
                  Dados: {JSON.stringify(processedResults?.macsNaoEncontrados || [])}
                </Text>
              </Box>
              
              {/* Debug: Informações sobre os resultados */}
              <Box p={3} bg="gray.50" borderRadius="md" mt={3}>
                <Text fontSize="xs" color="gray.600">
                  Debug: Total de MACs verificados: {processedResults.equipamentosComLocalizacao.length + processedResults.macsNaoEncontrados.length} | 
                  Encontrados: {processedResults.equipamentosComLocalizacao.length} | 
                  Não encontrados: {processedResults.macsNaoEncontrados.length}
                </Text>
              </Box>
            </Box>
          )}
        </VStack>
      )}
    </Box>
  );
};

export default MacOrganizerTab; 