// Gera lista formatada com vírgulas (último item sem vírgula)
export const gerarListaFormatada = (items: string[]): string => {
  return items.map((item, index) => {
    const isLast = index === items.length - 1;
    return `${item}${isLast ? '' : ','}`;
  }).join(' ');
};

// Gera lista formatada com separador personalizado
export const gerarListaComSeparador = (items: string[], separador: string = ',', ultimoSeparador: string = ''): string => {
  return items.map((item, index) => {
    const isLast = index === items.length - 1;
    return `${item}${isLast ? ultimoSeparador : separador}`;
  }).join(' ');
};

// Gera lista com quebras de linha
export const gerarListaComQuebras = (items: string[]): string => {
  return items.join('\n');
};

// Gera lista com bullets
export const gerarListaComBullets = (items: string[]): string => {
  return items.map(item => `• ${item}`).join('\n');
};

// Gera lista numerada
export const gerarListaNumerada = (items: string[]): string => {
  return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
};

// Remove duplicatas de uma lista
export const removerDuplicatas = <T>(items: T[]): T[] => {
  return [...new Set(items)];
};

// Agrupa itens por uma propriedade
export const agruparPorPropriedade = <T, K extends keyof T>(
  items: T[],
  propriedade: K
): Record<string, T[]> => {
  return items.reduce((acc, item) => {
    const key = String(item[propriedade]);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
};

// Filtra itens por uma condição
export const filtrarPorCondicao = <T>(
  items: T[],
  condicao: (item: T) => boolean
): T[] => {
  return items.filter(condicao);
};

// Ordena itens alfabeticamente
export const ordenarAlfabeticamente = (items: string[]): string[] => {
  return [...items].sort((a, b) => a.localeCompare(b, 'pt-BR'));
};

// Ordena itens numericamente
export const ordenarNumericamente = (items: string[]): string[] => {
  return [...items].sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA - numB;
  });
}; 