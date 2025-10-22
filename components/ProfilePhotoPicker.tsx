import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { uploadAPI } from '../lib/api';
import { useAuth } from '../lib/auth/AuthContext';

interface ProfilePhotoPickerProps {
  colors: any;
  onPhotoUpdated?: () => void;
}

export function ProfilePhotoPicker({ colors, onPhotoUpdated }: ProfilePhotoPickerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    // Pedir permissão
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de permissão para acessar suas fotos.'
      );
      return;
    }

    // Abrir seletor de imagem
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      await uploadPhoto(result.assets[0].base64, result.assets[0].mimeType || 'image/jpeg');
    }
  };

  const takePhoto = async () => {
    // Pedir permissão
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de permissão para usar a câmera.'
      );
      return;
    }

    // Abrir câmera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      await uploadPhoto(result.assets[0].base64, result.assets[0].mimeType || 'image/jpeg');
    }
  };

  const uploadPhoto = async (base64: string, mimeType: string) => {
    setLoading(true);
    try {
      const photoBase64 = `data:${mimeType};base64,${base64}`;
      await uploadAPI.uploadProfilePhoto(photoBase64);
      
      Alert.alert('Sucesso!', 'Foto de perfil atualizada');
      onPhotoUpdated?.();
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.message || 'Não foi possível atualizar a foto'
      );
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = async () => {
    Alert.alert(
      'Remover foto',
      'Tem certeza que deseja remover sua foto de perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await uploadAPI.removeProfilePhoto();
              Alert.alert('Sucesso!', 'Foto removida');
              onPhotoUpdated?.();
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Não foi possível remover a foto');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const showOptions = () => {
    Alert.alert(
      'Foto de perfil',
      'Escolha uma opção',
      [
        {
          text: 'Tirar foto',
          onPress: takePhoto,
        },
        {
          text: 'Escolher da galeria',
          onPress: pickImage,
        },
        ...(user?.photo_url ? [{
          text: 'Remover foto',
          style: 'destructive' as const,
          onPress: removePhoto,
        }] : []),
        {
          text: 'Cancelar',
          style: 'cancel' as const,
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surfaceLight }]}
      onPress={showOptions}
      disabled={loading}
    >
      <View style={styles.photoContainer}>
        {user?.photo_url ? (
          <Image
            source={{ uri: user.photo_url }}
            style={styles.photo}
          />
        ) : (
          <View style={[styles.photoPlaceholder, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="person" size={50} color={colors.primary} />
          </View>
        )}
        
        <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="camera" size={16} color="#fff" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
