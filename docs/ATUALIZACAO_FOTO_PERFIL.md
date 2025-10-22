# 📸 Sistema de Upload de Foto de Perfil - Atualização

## ✅ O que foi implementado:

### 🗄️ Banco de Dados
- ✅ Nova coluna `photo_url` (TEXT) na tabela `users`
- ✅ Migração executada com sucesso
- ✅ Campo opcional que armazena foto em base64

### 🔧 Backend (API)

#### Nova rota: `/api/upload`

**POST `/api/upload/profile-photo`** - Upload de foto
- Recebe foto em base64
- Valida formato (deve ser image/*)
- Valida tamanho (máximo 5MB)
- Salva no banco de dados
- Retorna usuário atualizado

**DELETE `/api/upload/profile-photo`** - Remover foto
- Remove foto do perfil
- Define photo_url como NULL

#### Rotas atualizadas:
- `POST /api/auth/register` - Agora retorna photo_url
- `POST /api/auth/login` - Agora retorna photo_url
- `GET /api/auth/me` - Agora retorna photo_url

### 📱 Frontend

#### Novo componente: `ProfilePhotoPicker`
- ✅ Exibe foto atual ou ícone placeholder
- ✅ Botão de edição com ícone de câmera
- ✅ Menu de opções:
  - Tirar foto (câmera)
  - Escolher da galeria
  - Remover foto (se existir)
- ✅ Upload automático com feedback
- ✅ Indicador de loading
- ✅ Integração com tema dark/light

#### Tela de Configurações atualizada:
- ✅ Seletor de foto no topo da seção "Conta"
- ✅ Atualização automática dos dados do usuário
- ✅ Visual caprichado e consistente

#### API atualizada:
- ✅ Interface `User` com campo `photo_url` opcional
- ✅ Novas funções no `uploadAPI`:
  - `uploadProfilePhoto(photoBase64)`
  - `removeProfilePhoto()`

### 📦 Dependências Instaladas
- ✅ `expo-image-picker@~17.0.8` - Seleção de imagens e câmera

---

## 🚀 Como Usar:

### 1. Reiniciar Backend

Se o backend não estiver rodando:

```powershell
cd backend
node server.js
```

### 2. Testar no App

1. Abra o app
2. Vá em **Configurações**
3. Na seção **CONTA**, toque na foto/círculo
4. Escolha uma opção:
   - **Tirar foto** - Abre a câmera
   - **Escolher da galeria** - Abre suas fotos
   - **Remover foto** - Remove foto atual

### 3. Fluxo Completo

```
Usuário toca na foto
    ↓
Sistema pede permissão (câmera ou galeria)
    ↓
Usuário seleciona/tira foto
    ↓
Imagem é redimensionada (1:1) e convertida para base64
    ↓
Backend valida e salva no banco
    ↓
Foto é atualizada na tela
```

---

## 🔒 Segurança e Validações:

### Backend:
- ✅ Tamanho máximo: 5MB
- ✅ Formato validado: deve começar com `data:image/`
- ✅ Autenticação obrigatória (JWT)
- ✅ Apenas o próprio usuário pode alterar sua foto

### Frontend:
- ✅ Qualidade de imagem: 70% (reduz tamanho)
- ✅ Proporção forçada: 1:1 (quadrado)
- ✅ Permissões solicitadas antes de acessar câmera/galeria
- ✅ Feedback visual durante upload

---

## 📊 Estrutura Atualizada:

```
backend/
├── migrations/
│   └── add-photo-profile.js         ✨ NOVO
├── routes/
│   ├── auth.js                      📝 ATUALIZADO (retorna photo_url)
│   └── upload.js                    ✨ NOVO
└── server.js                        📝 ATUALIZADO (rota /api/upload)

app/
└── configuracoes.tsx                📝 ATUALIZADO (ProfilePhotoPicker)

components/
└── ProfilePhotoPicker.tsx           ✨ NOVO

lib/
└── api.ts                           📝 ATUALIZADO (uploadAPI, User.photo_url)
```

---

## 🎯 Endpoints da API Atualizados:

| Método | Endpoint | Descrição | Novo? |
|--------|----------|-----------|-------|
| POST | `/api/upload/profile-photo` | Upload de foto | ✨ |
| DELETE | `/api/upload/profile-photo` | Remover foto | ✨ |
| POST | `/api/auth/register` | Cadastro (c/ photo_url) | 📝 |
| POST | `/api/auth/login` | Login (c/ photo_url) | 📝 |
| GET | `/api/auth/me` | Perfil (c/ photo_url) | 📝 |

---

## 🐛 Troubleshooting:

### Erro: "Permissão negada"
**Solução:** Vá nas configurações do dispositivo e permita acesso à câmera/galeria para o Expo Go.

### Erro: "Arquivo muito grande"
**Solução:** A foto deve ter no máximo 5MB. O componente já reduz a qualidade para 70%, mas fotos muito grandes podem exceder o limite.

### Foto não aparece
**Solução:** 
1. Verifique se o backend está rodando
2. Confira o console do backend para ver se o upload foi bem-sucedido
3. Tente fazer logout e login novamente

### Erro de TypeScript no VSCode
**Solução:** O TypeScript pode precisar reiniciar. Pressione `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

---

## 💡 Melhorias Futuras (Opcional):

- [ ] Salvar fotos em storage externo (AWS S3, Cloudinary)
- [ ] Adicionar crop/edição de imagem antes do upload
- [ ] Implementar cache de imagens
- [ ] Adicionar filtros e efeitos
- [ ] Comprimir imagens no backend antes de salvar
- [ ] Miniaturas (thumbnails) para performance

---

## 🎨 Exemplo de Uso da API:

### Upload de Foto (JavaScript)

```javascript
import { uploadAPI } from './lib/api';

// Após selecionar foto com ImagePicker
const result = await ImagePicker.launchImageLibraryAsync({
  base64: true,
  quality: 0.7,
});

if (result.assets[0].base64) {
  const photoBase64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
  
  const response = await uploadAPI.uploadProfilePhoto(photoBase64);
  console.log('Foto atualizada:', response.user.photo_url);
}
```

### Remover Foto

```javascript
await uploadAPI.removeProfilePhoto();
console.log('Foto removida');
```

---

## ✅ Checklist de Verificação:

- [x] Migração do banco executada
- [x] Coluna photo_url criada
- [x] Rota de upload implementada
- [x] Rota de remoção implementada
- [x] Validações de segurança
- [x] Componente de UI criado
- [x] Tela de configurações atualizada
- [x] expo-image-picker instalado
- [x] Permissões de câmera/galeria solicitadas
- [x] Feedback visual (loading, alertas)
- [x] Integração com tema
- [x] 0 erros de compilação

---

**🎉 Sistema de foto de perfil completo e funcionando!**

Agora seus usuários podem personalizar seus perfis com fotos! 📸✨
