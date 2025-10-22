# Funcionalidade de Compartilhamento de Meditação

## Visão Geral

Foi implementada uma funcionalidade completa para compartilhar a meditação diária como imagem, permitindo que os usuários compartilhem suas reflexões nas redes sociais ou com amigos.

## Características

### 1. **Botão de Compartilhamento**
- Localizado abaixo do card de meditação
- Design consistente com o tema do app
- Feedback visual durante o processo (loading spinner)
- Ícone de compartilhamento intuitivo

### 2. **Imagem de Compartilhamento**
- Card otimizado especialmente para compartilhamento
- Design limpo e profissional
- Inclui todos os detalhes da meditação:
  - Ícone e nome do livro
  - Autor
  - Capítulo e nome
  - Número do parágrafo
  - Texto completo da meditação
  - Data atual formatada
  - Marca "App Católico"

### 3. **Características Visuais**
- Gradiente sutil de fundo branco
- Aspas decorativas no texto
- Badge colorida com o número do parágrafo
- Linhas decorativas
- Sombras suaves
- Dimensões otimizadas para redes sociais

## Tecnologias Utilizadas

### Dependências Instaladas
```json
{
  "react-native-view-shot": "^3.8.0",
  "expo-sharing": "^12.0.1"
}
```

### Bibliotecas Principais
- **react-native-view-shot**: Captura views do React Native como imagens
- **expo-sharing**: API do Expo para compartilhar arquivos
- **expo-linear-gradient**: Gradientes no card de compartilhamento

## Arquitetura

### Arquivos Modificados/Criados

#### 1. `app/meditacao.tsx`
- Adicionado estado `isSharing` para controlar o loading
- Criada função `handleShare` para processar o compartilhamento
- Adicionado botão de compartilhamento com animação
- Renderizado componente invisível `MeditationShareCard` fora da tela

#### 2. `components/MeditationShareCard.tsx` (NOVO)
- Componente especializado para renderizar a meditação como imagem
- Layout otimizado para compartilhamento
- Aceita todos os dados da meditação via props
- Utiliza `forwardRef` para permitir captura via `captureRef`

## Fluxo de Funcionamento

```
1. Usuário clica no botão "Compartilhar Meditação"
   ↓
2. App mostra loading ("Preparando...")
   ↓
3. Verifica se compartilhamento está disponível no dispositivo
   ↓
4. Captura o componente MeditationShareCard como imagem PNG
   ↓
5. Abre dialog nativo de compartilhamento
   ↓
6. Usuário escolhe onde compartilhar (WhatsApp, Instagram, etc.)
   ↓
7. Loading é removido e tela volta ao normal
```

## Como Usar

1. Navegue até a tela de Meditação
2. Leia a meditação do dia
3. Clique no botão "Compartilhar Meditação" (ícone de compartilhar)
4. Aguarde a preparação da imagem
5. Escolha onde deseja compartilhar

## Tratamento de Erros

- Verifica se o compartilhamento está disponível no dispositivo
- Exibe alerta em caso de erro
- Log de erros no console para debug
- Loading é sempre removido (finally block)

## Otimizações

### Performance
- Componente de compartilhamento renderizado fora da tela (`position: absolute, left: -9999`)
- Captura com qualidade máxima (quality: 1)
- Formato PNG para melhor qualidade
- Uso de `collapsable={false}` para garantir renderização

### UX
- Feedback visual durante todo o processo
- Animações suaves (FadeInDown)
- Botão desabilitado durante o compartilhamento
- Mensagens de erro claras

## Possíveis Melhorias Futuras

1. **Opções de Estilo**
   - Permitir escolher entre temas claro/escuro para a imagem
   - Diferentes layouts de compartilhamento
   - Cores personalizáveis

2. **Formatos Adicionais**
   - Compartilhar apenas como texto
   - Stories do Instagram (dimensões específicas)
   - Modo paisagem

3. **Personalização**
   - Adicionar nome do usuário na imagem
   - Permitir adicionar comentário pessoal
   - Escolher quais informações incluir

4. **Compartilhamento Direto**
   - Botões para compartilhar diretamente em apps específicos
   - WhatsApp, Instagram, Facebook, Twitter

5. **Salvar na Galeria**
   - Opção para salvar a imagem sem compartilhar
   - Criar álbum "Meditações App Católico"

## Compatibilidade

- ✅ iOS
- ✅ Android
- ⚠️ Web (funcionalidade de compartilhamento pode ter limitações)

## Notas Técnicas

### Por que MeditationShareCard é renderizado fora da tela?

O componente precisa estar renderizado no DOM para ser capturado, mas não queremos que o usuário o veja. A solução é renderizá-lo em uma posição absoluta fora da viewport (`left: -9999`).

### Por que usar captureRef em vez de outras soluções?

- `captureRef` do `react-native-view-shot` é a solução mais confiável
- Funciona bem tanto no iOS quanto no Android
- Permite controle total sobre qualidade e formato
- Não requer permissões especiais

### Dimensões da Imagem

As dimensões são calculadas dinamicamente:
```typescript
const cardWidth = Math.min(width - 40, 600);
```

Isso garante:
- Máximo de 600px de largura (ótimo para redes sociais)
- Responsivo em diferentes tamanhos de tela
- Margem de 20px de cada lado
