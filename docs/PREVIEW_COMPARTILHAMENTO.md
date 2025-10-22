# 📸 Preview da Funcionalidade de Compartilhamento

## Tela de Meditação com Botão de Compartilhamento

A meditação agora possui um botão elegante para compartilhar:

```
┌─────────────────────────────────────────┐
│  ◀  Meditação                          │
├─────────────────────────────────────────┤
│                                         │
│  ╔═══════════════════════════════════╗ │
│  ║ 💡 Puxe para baixo para uma nova  ║ │
│  ║    reflexão                        ║ │
│  ╚═══════════════════════════════════╝ │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  📖  Caminho                     │   │
│  │      São Josemaria Escrivá      │   │
│  │                                  │   │
│  │  CAPÍTULO 5                      │   │
│  │  Presença de Deus                │   │
│  │  [ #267 ]                        │   │
│  │                                  │   │
│  │  "Procura viver na presença de  │   │
│  │  Deus. Habitua-te a falar com   │   │
│  │  Ele como com um Amigo..."       │   │
│  │                                  │   │
│  │  ━━━━━                           │   │
│  │  terça-feira, 22 de outubro...  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🔗 Compartilhar Meditação      │   │◄─ NOVO!
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

## Fluxo de Compartilhamento

### 1️⃣ Usuário Clica no Botão
```
┌─────────────────────────────────┐
│  ⏳ Preparando...              │ ◄─ Loading
└─────────────────────────────────┘
```

### 2️⃣ Sistema Prepara a Imagem
O app captura o componente MeditationShareCard e converte em PNG

### 3️⃣ Dialog Nativo Aparece
```
╔═══════════════════════════════════╗
║  Compartilhar via:                ║
║                                   ║
║  📱 WhatsApp                      ║
║  📸 Instagram                     ║
║  💬 Telegram                      ║
║  📘 Facebook                      ║
║  📧 Email                         ║
║  💾 Salvar na Galeria             ║
║                                   ║
║  [Cancelar]                       ║
╚═══════════════════════════════════╝
```

### 4️⃣ Imagem Gerada (Exemplo)

```
╔══════════════════════════════════════════╗
║  ┌─────┐  Caminho                       ║
║  │ 📖  │  São Josemaria Escrivá         ║
║  └─────┘                                 ║
║  ━━━━━━━━━                               ║
║                                          ║
║  CAPÍTULO 5 · PRESENÇA DE DEUS          ║
║  [ #267 ]                                ║
║                                          ║
║  "                                       ║
║  Procura viver na presença de Deus.     ║
║  Habitua-te a falar com Ele como        ║
║  com um Amigo a quem confias as tuas    ║
║  alegrias, os teus sofrimentos, os      ║
║  teus êxitos e os teus fracassos; as    ║
║  tuas preocupações e os teus anseios.   ║
║                                          ║
║  ━━━                                     ║
║  terça-feira, 22 de outubro de 2025     ║
║  APP CATÓLICO                            ║
╚══════════════════════════════════════════╝
```

## Características da Imagem

### 🎨 Design
- ✅ Fundo branco com gradiente sutil
- ✅ Tipografia hierárquica clara
- ✅ Aspas decorativas grandes
- ✅ Badge colorida para número do parágrafo
- ✅ Linhas decorativas
- ✅ Marca do app no rodapé

### 📐 Dimensões
- Largura: Máximo 600px
- Altura: Dinâmica baseada no conteúdo
- Formato: Otimizado para Instagram/WhatsApp/Facebook

### 📱 Responsividade
- Adapta-se a diferentes tamanhos de tela
- Mantém proporções ideais
- Texto sempre legível

## Estados da Interface

### Estado Normal
```tsx
┌──────────────────────────────┐
│  🔗 Compartilhar Meditação  │
└──────────────────────────────┘
```

### Estado Carregando
```tsx
┌──────────────────────────────┐
│  ⏳ Preparando...           │
└──────────────────────────────┘
```

### Estado Pressionado
```tsx
┌──────────────────────────────┐
│  🔗 Compartilhar Meditação  │ (mais escuro)
└──────────────────────────────┘
```

## Casos de Uso

### 📱 WhatsApp
1. Usuário clica em compartilhar
2. Escolhe WhatsApp
3. Seleciona contato ou grupo
4. Imagem é enviada com alta qualidade

### 📸 Instagram
1. Usuário clica em compartilhar
2. Escolhe Instagram
3. Opções:
   - Post no feed
   - Stories
   - Direct

### 💾 Salvar Localmente
1. Usuário clica em compartilhar
2. Escolhe "Salvar na Galeria"
3. Imagem salva em alta qualidade
4. Pode ser usada depois

## Exemplos de Diferentes Livros

### Caminho 📖
```
Cor do tema: #A0522D (Marrom)
Ícone: 📖
```

### Forja 🔥
```
Cor do tema: #FF6347 (Vermelho)
Ícone: 🔥
```

### Sulco 🌾
```
Cor do tema: #DAA520 (Dourado)
Ícone: 🌾
```

## Feedback Visual

### ✅ Sucesso
- Dialog de compartilhamento abre
- Imagem é enviada/salva
- Loading desaparece

### ❌ Erro
```
┌────────────────────────────────┐
│  ⚠️ Erro                       │
│                                │
│  Não foi possível compartilhar │
│  a meditação                   │
│                                │
│  [OK]                          │
└────────────────────────────────┘
```

## Animações

### Entrada do Botão
- FadeInDown com duração de 500ms
- Delay de 200ms
- Suave e elegante

### Pressionar
- Opacidade reduz para 0.8
- Cor escurece levemente
- Feedback instantâneo

## Acessibilidade

- ✅ Ícones com labels
- ✅ Texto legível (mínimo 14px)
- ✅ Contraste adequado
- ✅ Touch targets grandes (44px mínimo)

---

**Esta funcionalidade transforma cada meditação em um conteúdo compartilhável, permitindo que os usuários evangelizem e inspirem outros através das redes sociais!** 🙏✨
