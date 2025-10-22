# 🔐 Sistema de Autenticação - App Católico

Sistema completo de autenticação com PostgreSQL, backend em Node.js e integração com React Native.

---

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Configuração do Backend](#configuração-do-backend)
- [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
- [Configuração do Frontend](#configuração-do-frontend)
- [Executando o Projeto](#executando-o-projeto)
- [API Endpoints](#api-endpoints)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Troubleshooting](#troubleshooting)

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (v16 ou superior) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 ou superior) - [Download](https://www.postgresql.org/download/)
- **npm** ou **yarn**
- **Expo CLI** (já instalado no projeto)

### Verificar instalações:

```powershell
node --version
npm --version
psql --version
```

---

## ⚙️ Configuração do Backend

### 1. Instalar dependências do backend

```powershell
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```powershell
Copy-Item .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Configuração do Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_do_postgres
DB_NAME=appcatolico

# Configuração do Servidor
PORT=3001

# JWT Secret (IMPORTANTE: Mude para uma string aleatória e segura!)
JWT_SECRET=chave_super_secreta_mude_isso_em_producao_12345
JWT_EXPIRES_IN=7d
```

**⚠️ IMPORTANTE:** Nunca compartilhe suas credenciais reais! O arquivo `.env` está no `.gitignore`.

---

## 🗄️ Configuração do Banco de Dados

### 1. Criar o banco de dados

Abra o PostgreSQL (pgAdmin ou terminal):

```powershell
# Conectar ao PostgreSQL
psql -U postgres

# Criar o banco de dados
CREATE DATABASE appcatolico;

# Sair
\q
```

### 2. Inicializar as tabelas

Execute o script de inicialização do banco:

```powershell
cd backend
npm run init-db
```

Isso criará as seguintes tabelas:

- **`users`** - Armazena informações dos usuários
  - id (SERIAL PRIMARY KEY)
  - nome (VARCHAR)
  - email (VARCHAR UNIQUE)
  - senha (VARCHAR - hash bcrypt)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)

- **`user_favorites`** - Armazena favoritos dos usuários
  - id (SERIAL PRIMARY KEY)
  - user_id (INTEGER - referência para users)
  - book_slug (VARCHAR)
  - chapter_id (VARCHAR)
  - paragraph_index (INTEGER)
  - paragraph_text (TEXT)
  - created_at (TIMESTAMP)

### 3. Verificar se as tabelas foram criadas

```powershell
psql -U postgres -d appcatolico

# Listar tabelas
\dt

# Ver estrutura da tabela users
\d users

# Ver estrutura da tabela user_favorites
\d user_favorites

# Sair
\q
```

---

## 📱 Configuração do Frontend

### 1. Configurar URL da API

Edite o arquivo `lib/api.ts` e altere a constante `API_URL`:

```typescript
// Se estiver rodando no emulador Android
const API_URL = 'http://10.0.2.2:3001/api';

// Se estiver rodando em dispositivo físico, use seu IP local
// Descubra seu IP com: ipconfig (Windows) ou ifconfig (Mac/Linux)
const API_URL = 'http://192.168.1.100:3001/api';

// Se estiver testando no navegador
const API_URL = 'http://localhost:3001/api';
```

**💡 Como descobrir seu IP local (Windows):**

```powershell
ipconfig
# Procure por "IPv4 Address" na seção do seu adaptador de rede
```

---

## 🚀 Executando o Projeto

### 1. Iniciar o Backend

Em um terminal, dentro da pasta `backend`:

```powershell
npm run dev
```

Você verá:

```
🚀 Servidor rodando na porta 3001
📍 http://localhost:3001
🔐 Auth: http://localhost:3001/api/auth
⭐ Favorites: http://localhost:3001/api/favorites
```

### 2. Iniciar o Frontend

Em **outro terminal**, na raiz do projeto:

```powershell
npm start
```

Escaneie o QR code com o app **Expo Go** no seu celular, ou pressione:
- `a` - Abrir no Android Emulator
- `i` - Abrir no iOS Simulator
- `w` - Abrir no navegador web

---

## 📡 API Endpoints

### Autenticação

#### POST `/api/auth/register`
Cadastrar novo usuário.

**Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Response (201):**
```json
{
  "message": "Usuário cadastrado com sucesso!",
  "user": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

#### POST `/api/auth/login`
Fazer login.

**Body:**
```json
{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Response (200):**
```json
{
  "message": "Login realizado com sucesso!",
  "user": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

#### GET `/api/auth/me`
Obter dados do usuário autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com",
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

---

#### POST `/api/auth/verify`
Verificar se o token é válido.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "valid": true,
  "userId": 1
}
```

---

### Favoritos (Requer Autenticação)

#### GET `/api/favorites`
Buscar favoritos do usuário.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "favorites": [
    {
      "id": 1,
      "user_id": 1,
      "book_slug": "caminho",
      "chapter_id": "1",
      "paragraph_index": 0,
      "paragraph_text": "Não deixe de fazer o teu exame...",
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

#### POST `/api/favorites`
Adicionar favorito.

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "book_slug": "caminho",
  "chapter_id": "1",
  "paragraph_index": 0,
  "paragraph_text": "Não deixe de fazer o teu exame..."
}
```

**Response (201):**
```json
{
  "message": "Favorito adicionado",
  "favorite": { ... }
}
```

---

#### DELETE `/api/favorites/:id`
Remover favorito específico.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Favorito removido"
}
```

---

#### DELETE `/api/favorites`
Limpar todos os favoritos.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Todos os favoritos foram removidos"
}
```

---

## 📁 Estrutura do Projeto

```
AppCatolico/
├── app/
│   ├── auth/
│   │   ├── _layout.tsx          # Layout das telas de auth
│   │   ├── login.tsx             # Tela de login
│   │   └── cadastro.tsx          # Tela de cadastro
│   ├── _layout.tsx               # Layout principal (com proteção de rotas)
│   └── configuracoes.tsx         # Tela de configurações (com logout)
├── lib/
│   ├── api.ts                    # Serviço de API
│   └── auth/
│       └── AuthContext.tsx       # Contexto de autenticação
├── backend/
│   ├── config/
│   │   └── database.js           # Configuração do PostgreSQL
│   ├── middleware/
│   │   └── auth.js               # Middleware de autenticação JWT
│   ├── routes/
│   │   ├── auth.js               # Rotas de autenticação
│   │   └── favorites.js          # Rotas de favoritos
│   ├── init-db.js                # Script de inicialização do banco
│   ├── server.js                 # Servidor Express
│   ├── package.json
│   ├── .env                      # Variáveis de ambiente (NÃO COMMITAR!)
│   └── .env.example              # Exemplo de variáveis
└── README_AUTH.md                # Esta documentação
```

---

## 🔒 Segurança

### Boas Práticas Implementadas:

✅ **Senhas Criptografadas** - Usando bcrypt com 10 rounds de salt
✅ **JWT com Expiração** - Tokens expiram em 7 dias por padrão
✅ **Validação de Dados** - Express-validator em todas as rotas
✅ **CORS Configurado** - Proteção contra requisições de origens não autorizadas
✅ **SQL Injection Protection** - Usando prepared statements (pg)
✅ **Headers Seguros** - Authorization Bearer Token

### ⚠️ Para Produção:

1. **Mudar JWT_SECRET** para uma string aleatória de 64+ caracteres
2. **Usar HTTPS** em produção
3. **Configurar CORS** para aceitar apenas seu domínio
4. **Usar variáveis de ambiente** seguras (não compartilhar `.env`)
5. **Implementar rate limiting** para evitar ataques de força bruta
6. **Adicionar logs** de segurança

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

**Solução:**
1. Verifique se o PostgreSQL está rodando:
   ```powershell
   # Ver serviços do Windows
   Get-Service postgresql*
   ```
2. Confirme as credenciais no `.env`
3. Teste a conexão:
   ```powershell
   psql -U postgres -d appcatolico
   ```

---

### Erro: "Network request failed" no app

**Solução:**
1. Verifique se o backend está rodando (`npm run dev`)
2. Confirme a URL da API em `lib/api.ts`
3. Se estiver em dispositivo físico, use o IP local (não localhost)
4. Desabilite firewall ou libere a porta 3001

---

### Erro: "Token inválido"

**Solução:**
1. Faça logout e login novamente
2. Verifique se o `JWT_SECRET` no backend não mudou
3. Limpe o AsyncStorage do app:
   ```typescript
   AsyncStorage.clear()
   ```

---

### Erro: "relation users does not exist"

**Solução:**
Execute o script de inicialização:
```powershell
cd backend
npm run init-db
```

---

## 🎨 Recursos do Sistema

### Frontend (React Native)

✅ Telas de Login e Cadastro estilizadas
✅ Validação de formulários
✅ Feedback visual (loading, erros)
✅ Proteção de rotas automática
✅ Persistência de sessão
✅ Logout com confirmação
✅ Integração com tema dark/light

### Backend (Node.js + Express)

✅ API RESTful
✅ Autenticação JWT
✅ Middleware de proteção
✅ Validação de dados
✅ Tratamento de erros
✅ Logs de requisições
✅ CORS configurado

### Banco de Dados (PostgreSQL)

✅ Tabelas relacionadas
✅ Índices para performance
✅ Constraints de integridade
✅ Timestamps automáticos
✅ Cascade delete

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do backend no terminal
2. Verifique os erros no console do app (Expo)
3. Confira se todas as dependências foram instaladas
4. Revise este guia passo a passo

---

## 🎉 Pronto!

Agora você tem um sistema completo de autenticação funcionando!

**Próximos passos sugeridos:**

- [ ] Implementar recuperação de senha por email
- [ ] Adicionar validação de email (confirmação por link)
- [ ] Sincronizar favoritos locais com o servidor
- [ ] Implementar paginação na listagem de favoritos
- [ ] Adicionar foto de perfil do usuário
- [ ] Implementar refresh token
- [ ] Adicionar logs de atividades

**Desenvolvido com ❤️ e ☕**
