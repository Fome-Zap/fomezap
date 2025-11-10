# Deploy e Configuração DNS para SaaS

## 🌐 Configuração DNS
```
Tipo: A Record
Host: fomezap.com
Value: 192.168.1.100 (IP do servidor)

Tipo: CNAME  
Host: *.fomezap.com
Value: fomezap.com
```

## 🐳 Docker Compose para Produção
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80:3000"
      - "443:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/fomezap
    depends_on:
      - mongo
      - redis
    
  mongo:
    image: mongo:latest
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=fomezap
    
  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data
      
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - app

volumes:
  mongo_data:
  redis_data:
```

## 🔧 Nginx Configuration
```nginx
server {
    listen 80;
    server_name *.fomezap.com fomezap.com;
    
    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name *.fomezap.com fomezap.com;
    
    # Certificados SSL (Let's Encrypt)
    ssl_certificate /etc/ssl/fomezap.crt;
    ssl_certificate_key /etc/ssl/fomezap.key;
    
    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location / {
        proxy_pass http://app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://app:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## ⚡ Comandos de Deploy
```bash
# Build da aplicação
npm run build

# Deploy usando Docker
docker-compose up -d

# Verificar logs
docker-compose logs -f

# Backup do banco
docker exec mongo mongodump --out /backup

# Renovar certificado SSL
certbot renew --nginx
```

## 📊 Monitoramento
- **Uptime:** UptimeRobot ou Pingdom
- **Analytics:** Google Analytics por tenant
- **Logs:** ELK Stack ou Datadog
- **Performance:** New Relic ou AppDynamics