# 💻 Exemplos de Código - Compartilhamento de Meditação

## 📝 Snippets Úteis

### 1. Função de Compartilhamento

```typescript
const handleShare = useCallback(async () => {
  try {
    setIsSharing(true);
    
    // Verifica disponibilidade
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Erro', 'Compartilhamento não está disponível neste dispositivo');
      return;
    }

    // Captura a view
    if (shareCardRef.current) {
      const uri = await captureRef(shareCardRef, {
        format: 'png',
        quality: 1,
      });

      // Compartilha
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Compartilhar Meditação',
      });
    }
  } catch (error) {
    console.error('Erro ao compartilhar:', error);
    Alert.alert('Erro', 'Não foi possível compartilhar a meditação');
  } finally {
    setIsSharing(false);
  }
}, []);
```

### 2. Componente de Botão de Compartilhamento

```tsx
<Pressable
  onPress={handleShare}
  disabled={isSharing}
  style={({ pressed }) => [
    styles.shareButton,
    { 
      backgroundColor: pressed ? '#8B5A3C' : colors.primary,
      opacity: pressed || isSharing ? 0.8 : 1,
    }
  ]}
>
  {isSharing ? (
    <>
      <ActivityIndicator color="#fff" size="small" />
      <Text style={styles.shareButtonText}>Preparando...</Text>
    </>
  ) : (
    <>
      <Ionicons name="share-social-outline" size={24} color="#fff" />
      <Text style={styles.shareButtonText}>Compartilhar Meditação</Text>
    </>
  )}
</Pressable>
```

### 3. Componente Invisível para Captura

```tsx
<View style={styles.offscreenContainer}>
  <MeditationShareCard
    ref={shareCardRef}
    text={meditation.text}
    number={meditation.number}
    chapterNumber={meditation.chapterNumber}
    chapterName={meditation.chapterName}
    bookTitle={meditation.bookTitle}
    bookIcon={meditation.bookIcon}
    bookAuthor={meditation.bookAuthor}
    bookColor={meditation.bookColor}
    date={new Date().toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}
  />
</View>
```

### 4. Estilo do Container Offscreen

```typescript
offscreenContainer: {
  position: 'absolute',
  left: -9999,
  top: 0,
}
```

### 5. MeditationShareCard com forwardRef

```tsx
export const MeditationShareCard = React.forwardRef<View, MeditationShareCardProps>(
  (props, ref) => {
    return (
      <View ref={ref} collapsable={false} style={styles.container}>
        {/* Conteúdo do card */}
      </View>
    );
  }
);

MeditationShareCard.displayName = 'MeditationShareCard';
```

---

## 🎨 Exemplos de Customização

### Compartilhar com Formato JPEG

```typescript
const uri = await captureRef(shareCardRef, {
  format: 'jpg',  // Muda para JPEG
  quality: 0.9,   // 90% de qualidade
});

await Sharing.shareAsync(uri, {
  mimeType: 'image/jpeg',
  dialogTitle: 'Compartilhar Meditação',
});
```

### Adicionar Texto ao Compartilhamento (Android/iOS)

```typescript
// Nota: O texto adicional só funciona em alguns apps
await Sharing.shareAsync(uri, {
  mimeType: 'image/png',
  dialogTitle: 'Compartilhar Meditação',
  UTI: 'public.png', // iOS
});
```

### Capturar Apenas uma Área Específica

```typescript
const uri = await captureRef(shareCardRef, {
  format: 'png',
  quality: 1,
  result: 'tmpfile', // Salva em arquivo temporário
  snapshotContentContainer: false, // Não inclui scroll
});
```

---

## 🔄 Reutilização em Outras Telas

### Compartilhar Versículo da Bíblia

```tsx
// 1. Crie um VerseShareCard.tsx similar ao MeditationShareCard

// 2. Use o mesmo padrão:
const BibleScreen = () => {
  const shareCardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = useCallback(async () => {
    // Mesmo código da meditação
  }, []);

  return (
    <>
      {/* UI principal */}
      
      {/* Card invisível */}
      <View style={styles.offscreenContainer}>
        <VerseShareCard
          ref={shareCardRef}
          verse={currentVerse}
          book={bookName}
          chapter={chapterNumber}
          verseNumber={verseNumber}
        />
      </View>
    </>
  );
};
```

### Hook Customizado para Compartilhamento

```typescript
// hooks/useShareImage.ts
import { useRef, useState, useCallback } from 'react';
import { Alert, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export const useShareImage = () => {
  const shareRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);

  const share = useCallback(async (options?: {
    format?: 'png' | 'jpg';
    quality?: number;
  }) => {
    try {
      setIsSharing(true);
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Erro', 'Compartilhamento não disponível');
        return;
      }

      if (shareRef.current) {
        const uri = await captureRef(shareRef, {
          format: options?.format || 'png',
          quality: options?.quality || 1,
        });

        await Sharing.shareAsync(uri, {
          mimeType: `image/${options?.format || 'png'}`,
        });
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar');
    } finally {
      setIsSharing(false);
    }
  }, []);

  return { shareRef, isSharing, share };
};

// Uso:
const MyScreen = () => {
  const { shareRef, isSharing, share } = useShareImage();

  return (
    <>
      <Button onPress={() => share()} disabled={isSharing}>
        Compartilhar
      </Button>
      
      <View style={styles.offscreen}>
        <ShareableContent ref={shareRef} />
      </View>
    </>
  );
};
```

---

## 🧪 Testes

### Teste Manual

```typescript
// Adicione logs para debug
const handleShare = useCallback(async () => {
  console.log('1. Iniciando compartilhamento...');
  
  try {
    setIsSharing(true);
    console.log('2. Loading ativado');
    
    const isAvailable = await Sharing.isAvailableAsync();
    console.log('3. Compartilhamento disponível?', isAvailable);
    
    if (!isAvailable) return;

    if (shareCardRef.current) {
      console.log('4. Capturando ref...');
      
      const uri = await captureRef(shareCardRef, {
        format: 'png',
        quality: 1,
      });
      
      console.log('5. URI gerada:', uri);
      
      await Sharing.shareAsync(uri);
      console.log('6. Compartilhamento concluído!');
    }
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    console.log('7. Loading desativado');
    setIsSharing(false);
  }
}, []);
```

### Verificar se a View Está Renderizada

```typescript
// Adicione verificação antes de capturar
if (!shareCardRef.current) {
  console.error('Ref não está anexada!');
  return;
}

console.log('Ref válida:', shareCardRef.current);
```

---

## 🎯 Otimizações

### Lazy Loading do Componente de Compartilhamento

```typescript
import { lazy, Suspense } from 'react';

const MeditationShareCard = lazy(() => 
  import('@/components/MeditationShareCard')
    .then(module => ({ default: module.MeditationShareCard }))
);

// Uso
<Suspense fallback={<View />}>
  <MeditationShareCard {...props} />
</Suspense>
```

### Memoização do Componente

```typescript
import { memo } from 'react';

export const MeditationShareCard = memo(
  React.forwardRef<View, MeditationShareCardProps>((props, ref) => {
    // Componente
  }),
  (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.text === nextProps.text &&
           prevProps.number === nextProps.number;
  }
);
```

---

## 📊 Analytics (Opcional)

### Rastrear Compartilhamentos

```typescript
import analytics from '@react-native-firebase/analytics';

const handleShare = useCallback(async () => {
  try {
    // ... código de compartilhamento
    
    // Registra evento
    await analytics().logEvent('meditation_shared', {
      book: meditation.bookTitle,
      chapter: meditation.chapterNumber,
      paragraph: meditation.number,
    });
  } catch (error) {
    // ...
  }
}, [meditation]);
```

---

## 🔐 Permissões (Se Necessário)

### Android (android/app/src/main/AndroidManifest.xml)

```xml
<!-- Para salvar imagens -->
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
```

### iOS (ios/AppCatolico/Info.plist)

```xml
<!-- Para salvar na galeria -->
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Permitir salvar meditações compartilhadas</string>
```

---

## 🎓 Recursos Adicionais

### Documentação Oficial
- [react-native-view-shot](https://github.com/gre/react-native-view-shot)
- [expo-sharing](https://docs.expo.dev/versions/latest/sdk/sharing/)
- [React forwardRef](https://react.dev/reference/react/forwardRef)

### Exemplos Similares
- Instagram Stories sharing
- Pinterest Pin creation
- Twitter card sharing

---

**Estes exemplos podem ser adaptados para qualquer funcionalidade de compartilhamento de conteúdo no app!** 🚀
