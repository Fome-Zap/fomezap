// src/hooks/useCurrencyInput.js - Hook para formatação de moeda
import { useState } from 'react';

/**
 * Hook para input de moeda com máscara brasileira
 * 
 * @param {number} initialValue - Valor inicial (número)
 * @returns {object} { displayValue, realValue, handleChange }
 * 
 * Exemplo de uso:
 * const preco = useCurrencyInput(0);
 * <input value={preco.displayValue} onChange={preco.handleChange} />
 * // Para enviar ao backend: preco.realValue
 */
export function useCurrencyInput(initialValue = 0) {
  const [displayValue, setDisplayValue] = useState(
    formatCurrency(initialValue)
  );
  const [realValue, setRealValue] = useState(initialValue);

  const handleChange = (e) => {
    const input = e.target.value;
    
    // Remove tudo que não é número
    const onlyNumbers = input.replace(/\D/g, '');
    
    // Se estiver vazio, zera
    if (onlyNumbers === '') {
      setDisplayValue('0,00');
      setRealValue(0);
      return;
    }
    
    // Converte para número dividindo por 100 (para ter 2 casas decimais)
    const numberValue = parseInt(onlyNumbers) / 100;
    
    // Atualiza os valores
    setRealValue(numberValue);
    setDisplayValue(formatCurrency(numberValue));
  };

  const setValue = (value) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    setRealValue(numValue);
    setDisplayValue(formatCurrency(numValue));
  };

  return {
    displayValue,
    realValue,
    handleChange,
    setValue
  };
}

/**
 * Formata número para moeda brasileira (0,00)
 */
function formatCurrency(value) {
  if (!value || isNaN(value)) return '0,00';
  
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Converte string brasileira (0,00) para número americano (0.00)
 */
export function parseToNumber(value) {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  return parseFloat(value.replace(/\./g, '').replace(',', '.'));
}
