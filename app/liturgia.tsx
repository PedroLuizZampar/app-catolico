import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Dimensions,
  ScrollView,
  Pressable,
  Modal,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getColors, spacing, borderRadius, typography, shadows } from '@/lib/theme/tokens';

// --- Interfaces de Dados (Tipagem) ---
interface LeituraItem {
  referencia: string;
  titulo: string;
  texto: string;
}

interface SalmoItem {
  referencia: string;
  refrao: string;
  texto: string;
}

interface LiturgyData {
  data: string;
  liturgia: string;
  cor: string;
  leituras: {
    primeiraLeitura: LeituraItem[];
    salmo: SalmoItem[];
    segundaLeitura: LeituraItem[];
    evangelho: LeituraItem[];
  };
}

// --- API ---
const API_URL = 'https://liturgia.up.railway.app/v2/';

// Função helper para formatar data para a API (YYYY-MM-DD)
const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Função helper para formatar data em português
const formatDatePT = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// --- Mapeamento de Cores ---
const liturgicalColorMap: { [key: string]: string } = {
  'branco': '#FFFFFF',
  'white': '#FFFFFF',
  'verde': '#4CAF50',
  'green': '#4CAF50',
  'roxo': '#9C27B0',
  'purple': '#9C27B0',
  'vermelho': '#F44336',
  'red': '#F44336',
  'rosa': '#E91E63',
  'rose': '#E91E63',
};

// --- Função Helper para processar versículos ---
const renderTextWithSuperscript = (text: string, color: string) => {
  // Dividir o texto preservando os números
  const parts: Array<{ isNumber: boolean; text: string }> = [];
  let currentText = '';
  let currentIsNumber = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const isDigit = /\d/.test(char);

    if (i === 0) {
      currentIsNumber = isDigit;
      currentText = char;
    } else if (isDigit !== currentIsNumber) {
      parts.push({ isNumber: currentIsNumber, text: currentText });
      currentIsNumber = isDigit;
      currentText = char;
    } else {
      currentText += char;
    }
  }
  
  if (currentText) {
    parts.push({ isNumber: currentIsNumber, text: currentText });
  }

  return (
    <View style={styles.textContainer}>
      <Text style={[styles.readingBody, { color }]}>
        {parts.map((part, index) => 
          part.isNumber ? (
            <Text key={index}>
              <Text style={styles.superscriptSpace}> </Text>
              <Text style={[styles.superscript, { color: color + 'CC' }]}>{part.text}</Text>
              <Text> </Text>
            </Text>
          ) : (
            <Text key={index}>{part.text}</Text>
          )
        )}
      </Text>
    </View>
  );
};

// --- Componentes de Leitura (Cards de Página) ---

interface ReadingPageProps {
  title: string;
  data?: LeituraItem;
  isDark: boolean;
}

const ReadingPage: React.FC<ReadingPageProps> = ({ title, data, isDark }) => {
  const colors = getColors(isDark);
  
  if (!data) return null;

  return (
    <View style={styles.pageContainer}>
      <ScrollView 
        contentContainerStyle={[styles.cardContent, { backgroundColor: colors.surface }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.cardTitle, { color: colors.text, borderBottomColor: colors.divider }]}>
          {title}
        </Text>
        <Text style={[styles.readingReference, { color: colors.primary }]}>
          {data.referencia}
        </Text>
        <Text style={[styles.readingSubtitle, { color: colors.textSecondary }]}>
          {data.titulo}
        </Text>
        {renderTextWithSuperscript(data.texto, colors.text)}
      </ScrollView>
    </View>
  );
};

interface SalmoPageProps {
  data?: SalmoItem;
  isDark: boolean;
}

const SalmoPage: React.FC<SalmoPageProps> = ({ data, isDark }) => {
  const colors = getColors(isDark);
  
  if (!data) return null;

  // Dividir o texto do salmo em versículos (separados por \n)
  const verses = data.texto.split('\n').filter(v => v.trim());

  return (
    <View style={styles.pageContainer}>
      <ScrollView contentContainerStyle={[styles.cardContent, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text, borderBottomColor: colors.divider }]}>
          Salmo Responsorial
        </Text>
        <Text style={[styles.readingReference, { color: colors.primary }]}>
          {data.referencia}
        </Text>
        <Text style={[styles.psalmResponse, { color: isDark ? '#FF6B6B' : '#d32f2f' }]}>
          R. {data.refrao}
        </Text>
        <View style={{ marginTop: spacing.md }}>
          {verses.map((verse, index) => (
            <Text key={index} style={[styles.readingBody, { color: colors.text, marginBottom: spacing.sm }]}>
              {verse.replace(/^— /, '').replace(/^– /, '')}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// --- Componente de Calendário Simples ---
interface CalendarModalProps {
  visible: boolean;
  selectedDate: Date;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  isDark: boolean;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ 
  visible, 
  selectedDate, 
  onClose, 
  onSelectDate,
  isDark 
}) => {
  const colors = getColors(isDark);
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleSelectDate = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onSelectDate(newDate);
    onClose();
  };

  const handleQuickSelect = (date: Date) => {
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    onSelectDate(date);
    onClose();
  };

  const getNextSunday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilSunday);
    return nextSunday;
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextSunday = getNextSunday();

  const renderCalendarDays = () => {
    const days = [];
    
    // Espaços vazios antes do primeiro dia
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = 
        day === selectedDate.getDate() &&
        currentMonth.getMonth() === selectedDate.getMonth() &&
        currentMonth.getFullYear() === selectedDate.getFullYear();

      const isToday = 
        day === new Date().getDate() &&
        currentMonth.getMonth() === new Date().getMonth() &&
        currentMonth.getFullYear() === new Date().getFullYear();

      days.push(
        <Pressable
          key={day}
          style={[
            styles.calendarDay,
            isSelected && { backgroundColor: colors.primary, borderRadius: borderRadius.sm }
          ]}
          onPress={() => handleSelectDate(day)}
        >
          <Text
            style={[
              styles.calendarDayText,
              { color: isSelected ? '#fff' : colors.text },
              isToday && !isSelected && { 
                color: colors.primary, 
                fontWeight: 'bold',
                textDecorationLine: 'underline'
              }
            ]}
          >
            {day}
          </Text>
        </Pressable>
      );
    }

    return days;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable 
          style={[styles.calendarContainer, { backgroundColor: colors.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Atalhos Rápidos */}
          <View style={styles.quickSelectContainer}>
            <Pressable 
              style={[styles.quickSelectButton, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
              onPress={() => handleQuickSelect(new Date())}
            >
              <Ionicons name="today-outline" size={18} color={colors.primary} />
              <Text style={[styles.quickSelectText, { color: colors.primary }]}>Hoje</Text>
            </Pressable>
            <Pressable 
              style={[styles.quickSelectButton, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
              onPress={() => handleQuickSelect(tomorrow)}
            >
              <Ionicons name="sunny-outline" size={18} color={colors.text} />
              <Text style={[styles.quickSelectText, { color: colors.text }]}>Amanhã</Text>
            </Pressable>
            <Pressable 
              style={[styles.quickSelectButton, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
              onPress={() => handleQuickSelect(nextSunday)}
            >
              <Ionicons name="medal-outline" size={18} color={colors.text} />
              <Text style={[styles.quickSelectText, { color: colors.text }]}>Domingo</Text>
            </Pressable>
          </View>

          {/* Header do calendário */}
          <View style={styles.calendarHeader}>
            <Pressable onPress={handlePrevMonth} hitSlop={10}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </Pressable>
            <Text style={[styles.calendarMonth, { color: colors.text }]}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <Pressable onPress={handleNextMonth} hitSlop={10}>
              <Ionicons name="chevron-forward" size={24} color={colors.text} />
            </Pressable>
          </View>

          {/* Dias da semana */}
          <View style={styles.weekDaysContainer}>
            {weekDays.map((day) => (
              <Text key={day} style={[styles.weekDay, { color: colors.textSecondary }]}>
                {day}
              </Text>
            ))}
          </View>

          {/* Grid de dias */}
          <View style={styles.daysGrid}>
            {renderCalendarDays()}
          </View>

          {/* Botão fechar */}
          <Pressable 
            style={[styles.closeButton, { backgroundColor: colors.surfaceLight }]}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: colors.text }]}>Fechar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// --- Componente Principal ---
export default function LiturgiaScreen() {
  const [loading, setLoading] = useState<boolean>(true);
  const [liturgy, setLiturgy] = useState<LiturgyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const flatListRef = React.useRef<FlatList>(null);
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  const fetchLiturgy = async (date: Date) => {
    try {
      setError(null);
      
      // Construir URL com query params
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      const url = `${API_URL}?dia=${day}&mes=${month}&ano=${year}`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const json = await response.json();
      setLiturgy(json);
    } catch (e: any) {
      setError('Não foi possível carregar a liturgia. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiturgy(selectedDate);
  }, [selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setLoading(true);
    setActivePageIndex(0);
  };

  const pages = useMemo(() => {
    if (!liturgy?.leituras) return [];
    
    const { leituras } = liturgy;
    const allPages = [];
    let readingCount = 0;
    
    // Primeira Leitura
    if (leituras.primeiraLeitura && leituras.primeiraLeitura.length > 0) {
      readingCount++;
      allPages.push({ 
        type: 'reading', 
        title: '1ª Leitura',
        navTitle: '1ª Leitura',
        data: leituras.primeiraLeitura[0] 
      });
    }
    
    // Salmo
    if (leituras.salmo && leituras.salmo.length > 0) {
      allPages.push({ 
        type: 'salmo',
        title: 'Salmo',
        navTitle: 'Salmo',
        data: leituras.salmo[0] 
      });
    }
    
    // Segunda Leitura (se existir)
    if (leituras.segundaLeitura && leituras.segundaLeitura.length > 0) {
      readingCount++;
      allPages.push({ 
        type: 'reading', 
        title: '2ª Leitura',
        navTitle: '2ª Leitura',
        data: leituras.segundaLeitura[0] 
      });
    }
    
    // Evangelho
    if (leituras.evangelho && leituras.evangelho.length > 0) {
      allPages.push({ 
        type: 'evangelho', 
        title: 'Evangelho',
        navTitle: 'Evangelho',
        data: leituras.evangelho[0] 
      });
    }
    
    return allPages;
  }, [liturgy]);

  const renderPage = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'reading':
        return <ReadingPage title={item.title} data={item.data} isDark={isDark} />;
      case 'evangelho':
        return <ReadingPage title="Evangelho" data={item.data} isDark={isDark} />;
      case 'salmo':
        return <SalmoPage data={item.data} isDark={isDark} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Carregando liturgia...
        </Text>
      </View>
    );
  }

  if (error || !liturgy) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>
          Erro ao carregar liturgia
        </Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          {error || 'Dados não encontrados.'}
        </Text>
        <Pressable 
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            setLoading(true);
            fetchLiturgy(selectedDate);
          }}
        >
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </Pressable>
      </View>
    );
  }

  const liturgyColor = liturgicalColorMap[liturgy?.cor?.toLowerCase() || ''] || '#7f8c8d';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CalendarModal
        visible={showCalendar}
        selectedDate={selectedDate}
        onClose={() => setShowCalendar(false)}
        onSelectDate={handleDateSelect}
        isDark={isDark}
      />

      {/* Cabeçalho em formato de Card */}
      <Animated.View 
        entering={FadeInDown.duration(400)}
        style={[
          styles.headerCard, 
          shadows.md,
          { backgroundColor: colors.surface, borderColor: colors.border }
        ]}
      >
        <View style={styles.headerTextContainer}>
          <Text style={[styles.mainTitle, { color: colors.text }]} numberOfLines={2}>
            {liturgy.liturgia}
          </Text>
          <Pressable 
            onPress={() => setShowCalendar(true)}
            style={({ pressed }) => [
              styles.dateButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {formatDatePT(selectedDate)}
            </Text>
          </Pressable>
        </View>
        <View 
          style={[
            styles.colorIndicator, 
            { 
              backgroundColor: liturgyColor,
              borderColor: colors.border,
            }
          ]} 
        />
      </Animated.View>

      {/* Navbar de Navegação entre Leituras */}
      {pages.length > 0 && (
        <Animated.View 
          entering={FadeIn.duration(500).delay(200)}
          style={[styles.navBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
        >
          <View style={styles.navBarContent}>
            {pages.map((page, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  setActivePageIndex(index);
                  flatListRef.current?.scrollToIndex({ index, animated: true });
                }}
                style={[
                  styles.navButton,
                  activePageIndex === index && { 
                    backgroundColor: colors.primary + '15',
                    borderBottomWidth: 3,
                    borderBottomColor: colors.primary,
                  }
                ]}
              >
                <Text 
                  style={[
                    styles.navButtonText,
                    { color: activePageIndex === index ? colors.primary : colors.textSecondary },
                    activePageIndex === index && { fontWeight: '700' }
                  ]}
                >
                  {page.navTitle}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Lista de Páginas com Rolagem Lateral */}
      <FlatList
        ref={flatListRef}
        data={pages}
        renderItem={renderPage}
        keyExtractor={(item, index) => item.type + index}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setActivePageIndex(index);
        }}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
    </View>
  );
}

// --- Estilos ---
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.md,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.body,
    textAlign: 'center',
  },
  headerCard: {
    borderRadius: borderRadius.lg,
    marginVertical: spacing.md,
    marginHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  headerTextContainer: {
    flex: 1,
  },
  mainTitle: {
    ...typography.h3,
    fontWeight: '600',
  },
  dateText: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  colorIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: spacing.md,
    borderWidth: 2,
  },
  navBar: {
    borderBottomWidth: 1,
    paddingVertical: spacing.xs,
  },
  navBarContent: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  navButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    ...typography.small,
    fontWeight: '600',
    textAlign: 'center',
  },
  pageContainer: {
    width: width,
    padding: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  cardContent: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  textContainer: {
    width: '100%',
  },
  cardTitle: {
    ...typography.h3,
    textAlign: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    paddingBottom: spacing.sm,
  },
  readingReference: {
    ...typography.body,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  readingSubtitle: {
    ...typography.small,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  readingBody: {
    ...typography.bodyLarge,
    lineHeight: 30,
    textAlign: 'justify',
  },
  superscript: {
    fontSize: 11,
    lineHeight: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  superscriptSpace: {
    fontSize: 6,
  },
  readingFooter: {
    ...typography.body,
    fontWeight: 'bold',
    marginTop: spacing.lg,
  },
  readingResponse: {
    ...typography.body,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  psalmResponse: {
    ...typography.body,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginVertical: spacing.md,
  },
  gospelAcclamation: {
    ...typography.body,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  // Estilos do Calendário
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.lg,
  },
  quickSelectContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickSelectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  quickSelectText: {
    ...typography.small,
    fontWeight: '600',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  calendarMonth: {
    ...typography.h3,
    fontWeight: 'bold',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  weekDay: {
    ...typography.small,
    fontWeight: '600',
    width: '14.28%',
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xs,
  },
  calendarDayText: {
    ...typography.body,
  },
  closeButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  closeButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '600',
  },
});
