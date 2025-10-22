# App Católico ✨

Um aplicativo móvel moderno e minimalista para ler os livros de São Josemaria Escrivá: Caminho, Sulco e Forja.

## 🙏 Sobre o App

O App Católico oferece uma experiência de leitura espiritual premium com:

- 📚 **3 Livros Completos**: Caminho, Sulco e Forja
- 📖 **Organização por Capítulos**: Navegação intuitiva pelos capítulos
- ❤️ **Favoritos**: Salve seus parágrafos preferidos
- 🔍 **Busca Global**: Encontre qualquer reflexão em todos os livros
- 🎨 **Design Minimalista**: Interface limpa e moderna
- ⚡ **Animações Suaves**: Transições fluidas e naturais (60 FPS)
- 💎 **Experiência Premium**: Feedback visual em todas as interações

## ✨ Novo: Design Minimalista

O app foi completamente redesenhado com:

- **Tema Claro Minimalista** - Foco total no conteúdo espiritual
- **Animações Nativas** - Usando React Native Reanimated
- **Spring Physics** - Movimento natural e fluido
- **Micro-interações** - Feedback visual em cada toque

📖 **Documentação completa:**
- Veja a pasta [`/docs`](./docs) para toda a documentação do projeto
- [`docs/autenticacao.md`](./docs/autenticacao.md) - Sistema de autenticação
- [`docs/guia-usuario.md`](./docs/guia-usuario.md) - Manual do usuário
- [`docs/DESIGN_MINIMALISTA.md`](./docs/DESIGN_MINIMALISTA.md) - Detalhes técnicos do design

## 🚀 Tecnologias

- **React Native** com Expo
- **TypeScript** (100% tipado)
- **Expo Router** (navegação baseada em arquivos)
- **React Native Reanimated** (animações nativas)
- **AsyncStorage** (persistência local)

## 📱 Como executar

### Pré-requisitos
- Node.js instalado
- Expo Go no seu celular (Android/iOS)

### Instalação

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm start

# Ou executar diretamente no Android
npm run android
```

### Execução via USB (Android)

1. Ative o modo desenvolvedor no seu celular
2. Ative a depuração USB
3. Conecte o celular via USB
4. Execute: `npm run android`

Consulte [`GUIA_USB.md`](./GUIA_USB.md) para instruções detalhadas.

## 📖 Estrutura do Projeto

```
AppCatolico/
├── app/                    # Telas do app (Expo Router)
│   ├── _layout.tsx        # Layout raiz e navegação
│   ├── index.tsx          # Tela inicial com lista de livros
│   ├── buscar.tsx         # Tela de busca
│   ├── favoritos.tsx      # Tela de favoritos
│   └── livro/[slug]/      # Rotas dinâmicas dos livros
├── components/            # Componentes reutilizáveis
├── lib/                   # Lógica e configurações
│   ├── data.ts           # Dados e funções auxiliares
│   ├── types.ts          # Tipos TypeScript
│   └── theme/            # Tema e design tokens
├── assets/               # Imagens e recursos
└── *.json               # Dados dos livros (Caminho, Sulco, Forja)
```

## ✨ Funcionalidades

- **Tela Inicial**: Lista todos os livros disponíveis
- **Detalhes do Livro**: Mostra todos os capítulos
- **Leitura de Capítulo**: Exibe todos os parágrafos
- **Favoritar**: Salve parágrafos para ler depois
- **Busca**: Encontre qualquer texto nos 3 livros
- **Persistência**: Seus favoritos são salvos localmente

## 🎨 Design

O app usa um tema escuro moderno com:
- Cores vibrantes para cada livro
- Gradientes suaves
- Tipografia legível
- Animações sutis
- Interface intuitiva

## 📝 Licença

Desenvolvido com ❤️ para a glória de Deus

---

**São Josemaria Escrivá**, rogai por nós! 🙏
