# 🔧 Guia Rápido de Setup - Backend

## Instalação Rápida

### 1. Instalar PostgreSQL (se não tiver)

**Windows:**
```powershell
# Download do instalador oficial
https://www.postgresql.org/download/windows/

# Durante instalação, anote a senha do usuário postgres!
```

### 2. Criar Banco de Dados

```powershell
# Abrir PostgreSQL
psql -U postgres

# Dentro do psql:
CREATE DATABASE appcatolico;
\q
```

### 3. Configurar Backend

```powershell
# Na pasta backend
cd backend

# Instalar dependências
npm install

# Copiar arquivo de exemplo
Copy-Item .env.example .env

# Editar .env com suas credenciais
notepad .env
```

### 4. Inicializar Tabelas

```powershell
npm run init-db
```

### 5. Iniciar Servidor

```powershell
npm run dev
```

Pronto! Backend rodando em http://localhost:3001

---

## 📱 Configurar IP no App

**Encontre seu IP:**
```powershell
ipconfig
# Procure por "IPv4 Address"
```

**Edite `lib/api.ts`:**
```typescript
const API_URL = 'http://SEU_IP_AQUI:3001/api';
// Exemplo: 'http://192.168.1.100:3001/api'
```

---

## ✅ Testar API

```powershell
# Teste se está rodando
curl http://localhost:3001

# Deve retornar:
# {"message":"🙏 App Católico API","version":"1.0.0"}
```

---

Para mais detalhes, veja **README_AUTH.md**
