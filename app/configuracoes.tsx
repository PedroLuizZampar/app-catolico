import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, Pressable, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { ProfilePhotoPicker } from '@/components/ProfilePhotoPicker';
import { authAPI } from '@/lib/api';
import { getColors, spacing, typography, borderRadius, shadows } from '@/lib/theme/tokens';

export default function ConfiguracoesScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, signOut } = useAuth();
  const [currentUser, setCurrentUser] = useState(user);
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();

  // Atualizar dados do usuário
  const refreshUserData = async () => {
    try {
      const response = await authAPI.getMe();
      setCurrentUser(response.user);
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    }
  };

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: spacing.xxl + insets.bottom }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.duration(400).delay(100)}
          style={styles.header}
        >
          <Text style={[styles.title, { color: colors.text }]}>Configurações</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Personalize sua experiência
          </Text>
        </Animated.View>

        {/* Seção Conta */}
        <Animated.View 
          entering={FadeInDown.duration(400).delay(250)}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            CONTA
          </Text>
          
          <View style={[styles.card, shadows.sm, { 
            backgroundColor: colors.surface,
            borderColor: colors.border 
          }]}>
            {/* Foto de perfil */}
            <ProfilePhotoPicker colors={colors} onPhotoUpdated={refreshUserData} />

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            {/* Informações do usuário */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surfaceLight }]}>
                  <Ionicons name="person-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    {currentUser?.nome || 'Usuário'}
                  </Text>
                  <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
                    {currentUser?.email || 'email@exemplo.com'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            {/* Botão de Logout */}
            <Pressable
              style={({ pressed }) => [
                styles.settingRow,
                pressed && { backgroundColor: colors.surfaceLight }
              ]}
              onPress={handleLogout}
            >
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
                  <Ionicons name="log-out-outline" size={20} color={colors.error} />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.error }]}>
                    Sair da Conta
                  </Text>
                  <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
                    Desconectar do aplicativo
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Seção Aparência */}
        <Animated.View 
          entering={FadeInDown.duration(400).delay(200)}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            APARÊNCIA
          </Text>
          
          <View style={[styles.card, shadows.sm, { 
            backgroundColor: colors.surface,
            borderColor: colors.border 
          }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surfaceLight }]}>
                  <Ionicons 
                    name={isDark ? "moon" : "sunny"} 
                    size={20} 
                    color={colors.primary} 
                  />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Tema Escuro
                  </Text>
                  <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
                    {isDark ? 'Ativado' : 'Desativado'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
            </View>
          </View>
        </Animated.View>

        {/* Seção Sobre */}
        <Animated.View 
          entering={FadeInDown.duration(400).delay(300)}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            SOBRE
          </Text>
          
          <View style={[styles.card, shadows.sm, { 
            backgroundColor: colors.surface,
            borderColor: colors.border 
          }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surfaceLight }]}>
                  <Ionicons name="information-circle-outline" size={20} color={colors.info} />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Versão do App
                  </Text>
                  <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
                    1.0.0
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surfaceLight }]}>
                  <Ionicons name="book-outline" size={20} color={colors.secondary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Autor
                  </Text>
                  <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
                    São Josemaria Escrivá
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surfaceLight }]}>
                  <Ionicons name="heart-outline" size={20} color={colors.error} />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Desenvolvido com ❤️
                  </Text>
                  <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
                    Para a glória de Deus
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Footer */}
        <Animated.View 
          entering={FadeInDown.duration(400).delay(400)}
          style={styles.footer}
        >
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            App Católico © 2025
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  title: {
    ...typography.h1,
  },
  subtitle: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.small,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  settingTitle: {
    ...typography.body,
    fontWeight: '500',
  },
  settingDescription: {
    ...typography.small,
  },
  divider: {
    height: 1,
    marginLeft: spacing.md + 40 + spacing.md,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    ...typography.small,
  },
});
