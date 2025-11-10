// src/contexts/TenantContext.jsx - Context para dados do tenant
import { createContext, useContext } from 'react';

const TenantContext = createContext(null);

export const TenantProvider = ({ children, value }) => {
  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  
  if (!context) {
    throw new Error('useTenant deve ser usado dentro de um TenantProvider');
  }
  
  return context;
};

export default TenantProvider;