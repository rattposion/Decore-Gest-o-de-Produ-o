// Dados de exemplo para testar o Organizador de MACs
export const exemploDadosMac = `MAC: 001122334455
LOCAL ESTOQUE: Prateleira A1

MAC: AABBCCDDEEFF
LOCAL ESTOQUE: Gaveta B2

MAC: 123456789ABC
LOCAL ESTOQUE: Armário C3

MAC: DEADBEEFCAFE
LOCAL ESTOQUE: Caixa D4

MAC: 112233445566
LOCAL ESTOQUE: Prateleira A1

MAC: 778899AABBCC
LOCAL ESTOQUE: Gaveta B2`;

// Dados com erros para testar validação
export const exemploDadosComErros = `MAC: 001122334455
LOCAL ESTOQUE: Prateleira A1

MAC: INVALID_MAC
LOCAL ESTOQUE: Gaveta B2

MAC: 123456789ABC
LOCAL ESTOQUE: 

MAC: DEADBEEFCAFE
LOCAL ESTOQUE: Caixa D4

MAC: 001122334455
LOCAL ESTOQUE: Prateleira A1

MAC: 778899AABBCC
LOCAL ESTOQUE: Gaveta B2`;

// Função para gerar dados de exemplo aleatórios
export const gerarDadosExemplo = (quantidade: number = 10): string => {
  const localizacoes = [
    'Prateleira A1', 'Gaveta B2', 'Armário C3', 'Caixa D4', 
    'Estante E5', 'Compartimento F6', 'Depósito G7', 'Almoxarifado H8'
  ];

  const dados: string[] = [];

  for (let i = 0; i < quantidade; i++) {
    // Gera MAC aleatório (sem dois pontos)
    const mac = Array.from({ length: 6 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('').toUpperCase();

    // Seleciona localização aleatória
    const localizacao = localizacoes[Math.floor(Math.random() * localizacoes.length)];

    dados.push(`MAC: ${mac}\nLOCAL ESTOQUE: ${localizacao}`);
  }

  return dados.join('\n\n');
}; 