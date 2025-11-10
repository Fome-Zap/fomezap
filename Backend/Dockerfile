# Usar imagem Node.js LTS
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código da aplicação
COPY . .

# Criar diretório para uploads
RUN mkdir -p uploads

# Expor porta do backend
EXPOSE 5000

# Variáveis de ambiente (serão substituídas no Railway)
ENV NODE_ENV=production
ENV PORT=5000

# Comando para iniciar aplicação
CMD ["node", "index.js"]
