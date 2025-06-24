import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { styles } from './stylesAdicionarMercadoria'; 
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../global/themes';
import * as ImagePicker from 'expo-image-picker';


type AdicionarMercadoriaNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdicionarMercadoria'>;

export default function AdicionarMercadoriaScreen() {
  const navigation = useNavigation<AdicionarMercadoriaNavigationProp>();

  const [nome, setNome] = useState('');
  const [precoCusto, setPrecoCusto] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imagemUri, setImagemUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  

  const handleEscolherImagem = async () => {
    // Pede permissão para USAR A CÂMERA
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Desculpe, precisamos da permissão para usar a câmera para que isso funcione!');
      return;
    }

    // ABRE A CÂMERA do dispositivo
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, // Permite cortar a imagem depois de tirar
      aspect: [4, 4],    // Força um corte quadrado
      quality: 0.7,      // Reduz um pouco a qualidade para economizar espaço
    });

    if (!result.canceled) {
      setImagemUri(result.assets[0].uri);
    }
  };


  const handleAdicionarMercadoria = async () => {
    if (!nome.trim() || !precoCusto.trim() || !preco.trim() || !estoque.trim()) {
      Alert.alert("Erro de Validação", "Nome, Preço de Custo, Preço de Venda e Estoque são obrigatórios.");
      return;
    }
    const precoCustoNum = parseFloat(precoCusto.replace(',', '.'));
    const precoVendaNum = parseFloat(preco.replace(',', '.'));
    const estoqueNum = parseInt(estoque, 10);
    if (isNaN(precoCustoNum) || precoCustoNum <= 0) {
      Alert.alert("Erro de Validação", "Preço de custo inválido.");
      return;
    }
    if (isNaN(precoVendaNum) || precoVendaNum <= 0) {
      Alert.alert("Erro de Validação", "Preço de venda inválido.");
      return;
    }
    if (isNaN(estoqueNum) || estoqueNum < 0) {
      Alert.alert("Erro de Validação", "Estoque inválido.");
      return;
    }
    if (precoCustoNum > precoVendaNum) {
      Alert.alert("Atenção", "O preço de custo está maior que o preço de venda. Deseja continuar?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Continuar", onPress: () => cadastrarMercadoria(precoCustoNum, precoVendaNum, estoqueNum) }
      ]);
      return;
    }
    cadastrarMercadoria(precoCustoNum, precoVendaNum, estoqueNum);
  };

  const cadastrarMercadoria = async (precoCustoVal: number, precoVendaVal: number, estoqueVal: number) => {
    setIsLoading(true);
    try {
      const produtoData = {
        nome: nome.trim(),
        precoCusto: precoCustoVal,
        preco: precoVendaVal,
        estoque: estoqueVal,
        tamanho: tamanho.trim() || undefined,
        categoria: categoria.trim() || undefined,
        imagemUri: imagemUri, 
      };
      await axiosInstance.post('/produtos', produtoData);
      Alert.alert("Sucesso", "Mercadoria adicionada com sucesso!");
      navigation.goBack();
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status !== 401) {
            const apiErrorMessage = error.response.data?.erro || error.response.data?.message || 'Não foi possível adicionar a mercadoria.';
            Alert.alert("Erro ao Adicionar", apiErrorMessage);
          }
        } else {
          Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor.");
        }
      } else {
        Alert.alert("Erro Desconhecido", "Ocorreu um erro inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // O RESTANTE DO CÓDIGO (JSX) PERMANECE IDÊNTICO, NÃO PRECISA MUDAR NADA
  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Adicionar Nova Mercadoria</Text>
        </View>
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
            <View style={styles.content}>
                {/* ... Campos de texto ... */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Nome da Mercadoria</Text>
                    <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Camisa Floral" />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Preço de Custo</Text>
                    <TextInput style={styles.input} value={precoCusto} onChangeText={setPrecoCusto} placeholder="R$ 39,90" keyboardType="numeric" />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Preço de Venda</Text>
                    <TextInput style={styles.input} value={preco} onChangeText={setPreco} placeholder="R$ 79,90" keyboardType="numeric" />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Quantidade em Estoque</Text>
                    <TextInput style={styles.input} value={estoque} onChangeText={setEstoque} placeholder="Ex: 10" keyboardType="number-pad" />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Tamanho (Opcional)</Text>
                    <TextInput style={styles.input} value={tamanho} onChangeText={setTamanho} placeholder="Ex: M, 42, etc." />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Categoria (Opcional)</Text>
                    <TextInput style={styles.input} value={categoria} onChangeText={setCategoria} placeholder="Ex: Vestuário, Acessórios" />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Foto (Opcional)</Text>
                  <TouchableOpacity 
                      style={styles.imagePickerButton}
                      onPress={handleEscolherImagem}
                  >
                    {imagemUri ? (
                      <Image source={{ uri: imagemUri }} style={styles.imagePreview} />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="camera-plus-outline" size={24} color={theme.colors.placeholder} />
                        <Text style={styles.imagePickerText}>Tirar Foto</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={handleAdicionarMercadoria} disabled={isLoading}>
                        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>ADICIONAR MERCADORIA</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={isLoading}>
                        <Text style={styles.cancelButtonText}>CANCELAR</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    </View>
  );
}