import React, { useEffect } from 'react';
import { Tabs, router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from '@/lib/theme/ThemeContext';
import { AuthProvider, useAuth } from '@/lib/auth/AuthContext';
import { getColors } from '@/lib/theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isDark } = useTheme();
  const { isAuthenticated, loading } = useAuth();
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // @ts-ignore - rota dinâmica de auth
      router.replace('/auth/login');
    }
  }, [loading, isAuthenticated]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Se não autenticado, mostrar tela de auth (Stack)
  if (!isAuthenticated) {
    return (
      <>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/cadastro" />
        </Stack>
      </>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.tabBarBorder,
            borderTopWidth: 1,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 8,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Livros',
            headerTitle: 'App Católico',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="library-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="biblia"
          options={{
            title: 'Bíblia',
            headerTitle: 'Bíblia Sagrada',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="book-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="liturgia"
          options={{
            title: 'Liturgia',
            headerTitle: 'Liturgia Diária',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="configuracoes"
          options={{
            title: 'Configurações',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="meditacao"
          options={{
            href: null,
            title: 'Meditação Rápida',
          }}
        />
        <Tabs.Screen
          name="buscar"
          options={{
            href: null,
            title: 'Buscar',
          }}
        />
        <Tabs.Screen
          name="favoritos"
          options={{
            href: null,
            title: 'Favoritos',
          }}
        />
        <Tabs.Screen
          name="livro/[slug]/index"
          options={{
            href: null,
            title: '',
          }}
        />
        <Tabs.Screen
          name="livro/[slug]/capitulo/[id]"
          options={{
            href: null,
            title: '',
          }}
        />
        <Tabs.Screen
          name="biblia/[livro]/index"
          options={{
            href: null,
            title: '',
          }}
        />
        <Tabs.Screen
          name="biblia/[livro]/capitulo/[id]"
          options={{
            href: null,
            title: '',
          }}
        />
        <Tabs.Screen
          name="auth/login"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="auth/cadastro"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}
