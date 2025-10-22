# 🚀 INSTRUÇÕES FINAIS - Sistema de Autenticação

## ✅ O que foi implementado:

### Backend (Node.js + Express + PostgreSQL)
- ✅ Servidor Express com rotas de autenticação
- ✅ Integração com PostgreSQL
- ✅ Hash de senhas com bcrypt
- ✅ JWT para autenticação
- ✅ Middleware de proteção de rotas
- ✅ Validação de dados
- ✅ Sistema de favoritos na nuvem

### Frontend (React Native + Expo)
- ✅ Telas de Login e Cadastro estilizadas
- ✅ AuthContext para gerenciar sessão
- ✅ Proteção automática de rotas
- ✅ Persistência de sessão com AsyncStorage
- ✅ Logout na tela de Configurações
- ✅ Feedback visual (loading, erros)

---

## 📋 PASSO A PASSO PARA EXECUTAR:

### 1️⃣ Instalar PostgreSQL

**Windows:** https://www.postgresql.org/download/windows/
- Durante instalação, defina senha para o usuário `postgres`
- Anote essa senha!

### 2️⃣ Criar Banco de Dados

```powershell
# Abrir PostgreSQL
psql -U postgres

# Criar banco
CREATE DATABASE appcatolico;
\q
```

### 3️⃣ Configurar Backend

```powershell
# Entrar na pasta backend
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
Copy-Item .env.example .env

# Editar .env com suas credenciais
# Abra o arquivo .env e preencha:
# - DB_PASSWORD com a senha do postgres
# - JWT_SECRET com uma string aleatória forte
```

### 4️⃣ Inicializar Tabelas

```powershell
# Ainda na pasta backend
npm run init-db
```

Deve aparecer:
```
✅ Tabela "users" criada com sucesso!
✅ Tabela "user_favorites" criada com sucesso!
🎉 Banco de dados inicializado com sucesso!
```

### 5️⃣ Iniciar Backend

```powershell
# Em um terminal, pasta backend
npm run dev
```

Deve aparecer:
```
🚀 Servidor rodando na porta 3001
📍 http://localhost:3001
```

**⚠️ MANTENHA ESTE TERMINAL ABERTO!**

### 6️⃣ Configurar IP no App

**Descobrir seu IP local:**
```powershell
ipconfig
# Procure por "Endereço IPv4" ou "IPv4 Address"
# Exemplo: 192.168.1.100
```

**Editar arquivo `lib/api.ts`:**
- Abra o arquivo `lib/api.ts`
- Na linha 6, altere:

```typescript
// Para dispositivo físico ou emulador Android
const API_URL = 'http://SEU_IP_AQUI:3001/api';

// Exemplos:
// Android Emulator: 'http://10.0.2.2:3001/api'
// Dispositivo físico: 'http://192.168.1.100:3001/api'
// iOS Simulator: 'http://localhost:3001/api'
```

### 7️⃣ Iniciar Frontend

```powershell
# Em OUTRO terminal, na raiz do projeto (não na pasta backend!)
cd ..
npm start
```

- Escaneie QR code com Expo Go, ou
- Pressione `a` para Android
- Pressione `i` para iOS
- Pressione `w` para web

---

## 🎯 Como Testar:

1. **Abra o app** - Você será redirecionado para tela de Login
2. **Cadastre-se** - Clique em "Cadastre-se" e crie uma conta
3. **Explore o app** - Após cadastro, você estará autenticado
4. **Faça logout** - Vá em Configurações > Sair da Conta
5. **Faça login** - Use suas credenciais para entrar novamente

---

## 🔍 Verificar se está Funcionando:

### Teste 1: Backend está rodando?
```powershell
curl http://localhost:3001
```

Deve retornar:
```json
{"message":"🙏 App Católico API","version":"1.0.0"}
```

### Teste 2: Banco de dados foi criado?
```powershell
psql -U postgres -d appcatolico -c "\dt"
```

Deve listar as tabelas: `users` e `user_favorites`

### Teste 3: App conecta ao backend?
- Abra o app
- Veja o terminal do backend
- Deve aparecer logs das requisições

---

## ❌ Problemas Comuns:

### "Cannot connect to database"
- Verifique se PostgreSQL está rodando
- Confirme senha no arquivo `.env`
- Teste: `psql -U postgres`

### "Network request failed"
- Verifique se backend está rodando (`npm run dev`)
- Confirme IP em `lib/api.ts`
- Para dispositivo físico: use IP local (não localhost)

### "Port 3001 already in use"
- Feche outros processos na porta 3001, ou
- Mude PORT no `.env` para outra (ex: 3002)

---

## 📚 Documentação Completa:

Leia **README_AUTH.md** para:
- Documentação completa da API
- Estrutura do projeto
- Recursos de segurança
- Troubleshooting avançado

---

## 🎉 PRONTO!

Agora você tem:
- ✅ Sistema de login e cadastro
- ✅ Backend com PostgreSQL
- ✅ Autenticação JWT
- ✅ Rotas protegidas
- ✅ Favoritos na nuvem (opcional)

**Desenvolvido com ❤️**

---

## 📞 Comandos Úteis:

```powershell
# Ver tabelas do banco
psql -U postgres -d appcatolico -c "\dt"

# Ver usuários cadastrados
psql -U postgres -d appcatolico -c "SELECT * FROM users;"

# Reiniciar banco (CUIDADO: apaga tudo!)
psql -U postgres -d appcatolico -c "DROP TABLE user_favorites, users CASCADE;"
cd backend
npm run init-db

# Logs do backend em tempo real
cd backend
npm run dev

# Limpar cache do Expo
npx expo start --clear
```
