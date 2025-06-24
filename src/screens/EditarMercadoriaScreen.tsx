import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { styles } from './stylesEditarMercadoria';
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import { theme } from '../global/themes';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';


type EditarMercadoriaNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditarMercadoria'>;
type EditarMercadoriaRouteProp = RouteProp<RootStackParamList, 'EditarMercadoria'>;

export default function EditarMercadoriaScreen() {
  const navigation = useNavigation<EditarMercadoriaNavigationProp>();
  const route = useRoute<EditarMercadoriaRouteProp>();
  const { produtoId } = route.params;

  const [nome, setNome] = useState('');
  const [precoCusto, setPrecoCusto] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imagemUri, setImagemUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleEscolherImagem = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Desculpe, precisamos da permissão para usar a câmera para que isso funcione!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImagemUri(result.assets[0].uri);
    }
  };

  useEffect(() => {
    const fetchMercadoria = async () => {
      try {
        const response = await axiosInstance.get(`/produtos/${produtoId}`);
        const mercadoria = response.data;
        setNome(mercadoria.nome);
        setPrecoCusto(String(mercadoria.precoCusto));
        setPreco(String(mercadoria.preco));
        setEstoque(String(mercadoria.estoque));
        setTamanho(mercadoria.tamanho || '');
        setCategoria(mercadoria.categoria || '');
        setImagemUri(mercadoria.imagemUri); 
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os dados da mercadoria.');
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };
    fetchMercadoria();
  }, [produtoId]);

  const handleUpdateMercadoria = async () => {
    if (!nome.trim() || !precoCusto.trim() || !preco.trim() || !estoque.trim()) {
      Alert.alert("Erro de Validação", "Todos os campos principais são obrigatórios.");
      return;
    }
    const precoCustoNum = parseFloat(precoCusto.replace(',', '.'));
    const precoVendaNum = parseFloat(preco.replace(',', '.'));
    const estoqueNum = parseInt(estoque, 10);
    
    setIsUpdating(true);
    try {
      const produtoData = {
        nome: nome.trim(),
        precoCusto: precoCustoNum,
        preco: precoVendaNum,
        estoque: estoqueNum,
        tamanho: tamanho.trim() || undefined,
        categoria: categoria.trim() || undefined,
        imagemUri: imagemUri, 
      };
      await axiosInstance.put(`/produtos/${produtoId}`, produtoData);
      Alert.alert('Sucesso', 'Mercadoria atualizada com sucesso!');
      navigation.goBack();

    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            const apiErrorMessage = error.response.data?.erro || error.response.data?.message || 'Não foi possível atualizar a mercadoria.';
            Alert.alert("Erro ao Atualizar", apiErrorMessage);
        } else {
            Alert.alert("Erro Desconhecido", "Ocorreu um erro inesperado.");
        }
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text>Carregando Mercadoria...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Editar Mercadoria</Text>
      </View>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* ... Outros campos de texto ... */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome da Mercadoria</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome} />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Preço de Custo</Text>
            <TextInput style={styles.input} value={precoCusto} onChangeText={setPrecoCusto} keyboardType="numeric" />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Preço de Venda</Text>
            <TextInput style={styles.input} value={preco} onChangeText={setPreco} keyboardType="numeric" />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Quantidade em Estoque</Text>
            <TextInput style={styles.input} value={estoque} onChangeText={setEstoque} keyboardType="number-pad" />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tamanho</Text>
            <TextInput style={styles.input} value={tamanho} onChangeText={setTamanho} />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Categoria</Text>
            <TextInput style={styles.input} value={categoria} onChangeText={setCategoria} />
          </View>
          
          {/* =======================================================
              AREA DA IMAGEM TOTALMENTE REESTRUTURADA ;/
              ======================================================= */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Foto</Text>
            
            {/* Bloco de Preview da Imagem */}
            <View style={styles.imagePreviewContainer}>
              {imagemUri ? (
                <Image key={imagemUri} source={{ uri: imagemUri }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialCommunityIcons name="image-off-outline" size={40} color={theme.colors.placeholder} />
                  <Text style={styles.imagePlaceholderText}>Sem foto</Text>
                </View>
              )}
            </View>

            {/* Botão para Tirar/Alterar a Foto */}
            <TouchableOpacity 
                style={styles.imagePickerButton}
                onPress={handleEscolherImagem}
            >
              <MaterialCommunityIcons name="camera-retake-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.imagePickerButtonText}>
                {imagemUri ? 'Alterar Foto' : 'Tirar Foto'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleUpdateMercadoria} disabled={isUpdating}>
              {isUpdating ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SALVAR ALTERAÇÕES</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={isUpdating}>
              <Text style={styles.cancelButtonText}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}