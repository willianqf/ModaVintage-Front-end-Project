import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { styles } from './stylesEditarMercadoria';
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import { theme } from '../global/themes';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type EditarMercadoriaNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditarMercadoria'>;
type EditarMercadoriaRouteProp = RouteProp<RootStackParamList, 'EditarMercadoria'>;

export default function EditarMercadoriaScreen() {
  const navigation = useNavigation<EditarMercadoriaNavigationProp>();
  const route = useRoute<EditarMercadoriaRouteProp>();
  
  // ===== CORREÇÃO 1: Usando 'produtoId' que é o parâmetro correto recebido da rota =====
  const { produtoId } = route.params;

  // --- SEU BLOCO DE ESTADOS E LÓGICA (COM AS CORREÇÕES) ---
  const [nome, setNome] = useState('');
  const [precoCusto, setPrecoCusto] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [categoria, setCategoria] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchMercadoria = async () => {
      try {
        // CORREÇÃO 1: Usando 'produtoId' para buscar os dados
        const response = await axiosInstance.get(`/produtos/${produtoId}`);
        const mercadoria = response.data;
        setNome(mercadoria.nome);
        // Convertendo para string para os inputs
        setPrecoCusto(String(mercadoria.precoCusto));
        setPreco(String(mercadoria.preco));
        setEstoque(String(mercadoria.estoque));
        setTamanho(mercadoria.tamanho || '');
        setCategoria(mercadoria.categoria || '');
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os dados da mercadoria.');
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };
    // CORREÇÃO 1: Usando 'produtoId' na dependência do useEffect
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
      };
      // CORREÇÃO 1: Usando 'produtoId' para fazer o PUT
      await axiosInstance.put(`/produtos/${produtoId}`, produtoData);
      Alert.alert('Sucesso', 'Mercadoria atualizada com sucesso!');
      
      // ===== CORREÇÃO 2: Usando goBack() para voltar à lista, que se atualiza sozinha =====
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
  // --- FIM DO BLOCO DE LÓGICA ---

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
          
          <View style={styles.formGroup}>
            <TouchableOpacity 
              style={styles.imagePickerButton}
              onPress={() => Alert.alert("Funcionalidade Pendente", "A alteração de foto será implementada futuramente.")}
            >
              <MaterialCommunityIcons name="image-edit-outline" size={32} color={theme.colors.placeholder} />
              <Text style={styles.imagePickerText}>Alterar Foto (Pendente)</Text> 
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