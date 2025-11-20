// src/components/LoadingScreen.jsx - Componente de loading
import React from 'react';

const LoadingScreen = ({ message = "Carregando..." }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 text-center">
        {/* Logo/Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🍕</span>
          </div>
          <img src="/img/fomezap_logoLaranjaFundoTranspHoriz.png" alt="FomeZap" className="h-12 mb-4" />
        </div>
        
        {/* Loading Animation */}
        <div className="mb-6">
          <div className="flex justify-center items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
        
        {/* Message */}
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;