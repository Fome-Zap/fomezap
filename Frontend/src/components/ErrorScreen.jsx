// src/components/ErrorScreen.jsx - Componente de erro
import React from 'react';

const ErrorScreen = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 text-center">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Ops! Algo deu errado</h1>
        </div>
        
        {/* Error Message */}
        <div className="mb-6">
          <p className="text-gray-600 text-sm bg-gray-100 rounded-lg p-4">
            {error}
          </p>
        </div>
        
        {/* Actions */}
        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              🔄 Tentar Novamente
            </button>
          )}
          
          <button
            onClick={() => window.location.href = 'https://fomezap.com'}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            🏠 Ir para Página Inicial
          </button>
        </div>
        
        {/* Help Text */}
        <div className="mt-6 text-xs text-gray-500">
          <p>Se o problema persistir, entre em contato:</p>
          <p>📧 suporte@fomezap.com</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;