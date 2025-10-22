# 🎯 Guia de Uso - Design Minimalista e Animações

## 📖 Como Funciona

### Animações Automáticas

Todas as animações são **automáticas** e **nativas**. Você não precisa fazer nada especial para utilizá-las. O app já está configurado para proporcionar uma experiência suave e fluida.

## 🎨 Personalização

### Cores

Para ajustar as cores, edite `lib/theme/tokens.ts`:

```typescript
export const colors = {
  background: '#F8F9FA',  // Cor de fundo principal
  surface: '#FFFFFF',      // Cor dos cards
  text: '#212529',         // Cor do texto principal
  textSecondary: '#6C757D', // Cor do texto secundário
  // ... outras cores
};
```

### Velocidade das Animações

Para ajustar a velocidade das animações, edite `lib/theme/tokens.ts`:

```typescript
export const animation = {
  duration: {
    fast: 150,    // Animações rápidas (ex: hover)
    normal: 250,  // Animações normais (ex: pressionar)
    slow: 350,    // Animações lentas (ex: entrada)
  },
};
```

### Espaçamentos

Para ajustar os espaçamentos, edite `lib/theme/tokens.ts`:

```typescript
export const spacing = {
  xs: 4,   // Muito pequeno
  sm: 8,   // Pequeno
  md: 16,  // Médio (padrão)
  lg: 24,  // Grande
  xl: 32,  // Muito grande
  xxl: 48, // Extra grande
};
```

## 🎭 Componentes Animados

### BookCard
- **Ao pressionar**: Escala reduz para 98% com efeito spring
- **Entrada**: FadeInDown com delay escalonado

### ChapterCard
- **Ao pressionar**: Escala + translação horizontal
- **Entrada**: FadeInDown sequencial

### SearchBar
- **Ao focar**: Borda muda de cor suavemente
- **Ícone**: Muda de cor ao focar

### ParagraphItem
- **Ao pressionar**: Escala suave
- **Favorito**: Animação especial de "pulsar"

## 🚀 Dicas de Performance

### ✅ Boas Práticas
1. As animações usam `react-native-reanimated` (nativo)
2. Executam na UI thread (60 FPS)
3. Não bloqueiam a thread principal
4. Spring physics para movimento natural

### ⚡ Otimizações Aplicadas
- Sombras leves (menor impacto)
- Bordas simples (renderização rápida)
- Sem gradientes complexos
- FlatList com virtualization (quando aplicável)

## 🎨 Hierarquia Visual

### Níveis de Importância

```
1️⃣ Primário: Títulos principais
   - Fonte leve (300-400)
   - Tamanho grande
   - Cor escura (#212529)

2️⃣ Secundário: Subtítulos e descrições
   - Fonte regular (400)
   - Tamanho médio
   - Cor média (#6C757D)

3️⃣ Terciário: Labels e metadados
   - Fonte regular (400)
   - Tamanho pequeno
   - Cor clara (#ADB5BD)
```

## 🔄 Transições

### Entrada de Telas
Todos os elementos entram com `FadeInDown`:
- Header: 400ms, delay 100ms
- Conteúdo: 300-400ms, delay variado
- Footer: 400ms, delay no final

### Interações
Todas as interações têm feedback visual:
- Pressionar: Escala reduz
- Focar: Borda muda de cor
- Favoritar: Animação de pulsar

## 📱 Experiência Mobile

### Gestos Nativos
- ✅ Scroll suave
- ✅ Pull to refresh (pode ser adicionado)
- ✅ Swipe gestures (pode ser adicionado)
- ✅ Haptic feedback (pode ser adicionado)

### Área de Toque
Todos os botões têm `hitSlop` adequado:
```typescript
hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
```

## 🎯 Próximas Melhorias Sugeridas

### Animações Avançadas
1. **Parallax Scroll** nos headers
2. **Swipe to Delete** nos favoritos
3. **Pull to Refresh** nas listas
4. **Haptic Feedback** nas interações
5. **Skeleton Loading** ao carregar

### Gestos
1. **Swipe entre capítulos**
2. **Pinch to Zoom** no texto
3. **Long Press** para ações rápidas

### Micro-interações
1. **Animação nos ícones** ao mudar estado
2. **Progress indicator** na leitura
3. **Toast notifications** animados

## 🛠️ Troubleshooting

### Animações Lentas?
- Verifique se está em modo Debug
- Release builds são mais rápidas
- Use `npx expo start --no-dev`

### Animações Não Funcionam?
- Confirme que `react-native-reanimated` está instalado
- Verifique `babel.config.js`:
```javascript
plugins: ['react-native-reanimated/plugin']
```

### Performance Issues?
- Reduza a duração das animações
- Simplifique as sombras
- Use `removeClippedSubviews` em listas grandes

## 📚 Documentação

### React Native Reanimated
- [Documentação Oficial](https://docs.swmansion.com/react-native-reanimated/)
- [Exemplos](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/)

### Expo
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Expo Animations](https://docs.expo.dev/versions/latest/react-native/animated/)

## 💡 Exemplos de Código

### Criar Animação Personalizada

```typescript
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';

const MyComponent = () => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 15 });
    // Volta ao normal
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15 });
    }, 100);
  };

  return (
    <Animated.View style={animatedStyle}>
      {/* Seu conteúdo */}
    </Animated.View>
  );
};
```

### Entrada Animada

```typescript
import Animated, { FadeInDown } from 'react-native-reanimated';

const MyComponent = () => (
  <Animated.View entering={FadeInDown.duration(400).delay(100)}>
    {/* Seu conteúdo */}
  </Animated.View>
);
```

## ✨ Conclusão

O design minimalista com animações suaves está pronto para uso! O app agora oferece uma experiência visual limpa e interações fluidas que melhoram significativamente a usabilidade.

**Aproveite!** 🎉

---

**Desenvolvido com ❤️ para a glória de Deus**
