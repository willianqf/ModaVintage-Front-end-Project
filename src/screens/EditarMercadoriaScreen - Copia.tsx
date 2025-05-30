import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Ajuste o caminho
import { styles } from './stylesEditarMercadoria';
import { Produto } from './ListarMercadoriasScreen'; // Importar a interface Produto

const API_BASE_URL = 'http://192.168.1.5:8080';

type EditarMercadoriaRouteProp = RouteProp<RootStackParamList, 'EditarMercadoria'>;
type EditarMercadoriaNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditarMercadoria'>;

export default function EditarMercadoriaScreen() {
  const navigation = useNavigation<EditarMercadoriaNavigationProp>();
  const route = useRoute<EditarMercadoriaRouteProp>();
  const { produtoId } = route.params;

  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [categoria, setCategoria] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProduto, setIsFetchingProduto] = useState(true);

  useEffect(() => {
    const fetchProdutoParaEditar = async () => {
      setIsFetchingProduto(true);
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) {
          Alert.alert("Erro", "Token não encontrado. Faça login.");
          navigation.goBack();
          return;
        }
        const response = await axios.get<Produto>(`${API_BASE_URL}/produtos/${produtoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const produto = response.data;
        setNome(produto.nome);
        setPreco(produto.preco.toString());
        setEstoque(produto.estoque.toString());
        setTamanho(produto.tamanho || '');
        setCategoria(produto.categoria || '');
      } catch (error) {
        console.error("Erro ao buscar produto para edição:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados da mercadoria para edição.");
        navigation.goBack();
      } finally {
        setIsFetchingProduto(false);
      }
    };

    fetchProdutoParaEditar();
  }, [produtoId, navigation]);

  const handleSalvarAlteracoes = async () => {
    if (!nome.trim() || !preco.trim() || !estoque.trim() || !tamanho.trim() || !categoria.trim()) {
      Alert.alert("Erro", "Todos os campos são obrigatórios.");
      return;
    }

    const precoNum = parseFloat(preco.replace(',', '.'));
    const estoqueNum = parseInt(estoque, 10);

    if (isNaN(precoNum) || precoNum <= 0) {
      Alert.alert("Erro", "Preço inválido.");
      return;
    }
    if (isNaN(estoqueNum) || estoqueNum < 0) {
      Alert.alert("Erro", "Quantidade em estoque inválida.");
      return;
    }

    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert("Erro", "Token não encontrado.");
        setIsLoading(false);
        return;
      }

      const produtoData = {
        nome,
        preco: precoNum,
        estoque: estoqueNum,
        tamanho,
        categoria,
      };

      await axios.put(`${API_BASE_URL}/produtos/${produtoId}`, produtoData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Sucesso", "Mercadoria atualizada com sucesso!");
      navigation.goBack(); // Volta para a lista, que deve recarregar com useFocusEffect
    } catch (error: any) {
      console.error("Erro ao atualizar mercadoria:", error);
       let errorMessage = "Não foi possível atualizar a mercadoria.";
       if (axios.isAxiosError(error) && error.response) {
            if (error.response.data?.message) {
                errorMessage = error.response.data.message;
            } else if (typeof error.response.data === 'string' && error.response.data.length < 100) {
                errorMessage = error.response.data;
            } else if (error.response.status === 401 || error.response.status === 403) {
                errorMessage = "Erro de autenticação. Faça login novamente.";
            } else if (error.response.status === 404) {
                errorMessage = "Mercadoria não encontrada para atualização.";
            }
         } else if (error.message) {
            errorMessage = error.message;
         }
      Alert.alert("Erro", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingProduto) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#323588" />
        <Text>Carregando dados da mercadoria...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.headerTitle}>Editar Mercadoria</Text>

      <TextInput style={styles.input} placeholder="Nome da Mercadoria" value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="Valor (ex: 79.90)" value={preco} onChangeText={setPreco} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Estoque" value={estoque} onChangeText={setEstoque} keyboardType="number-pad" />
      <TextInput style={styles.input} placeholder="Tamanho (P, M, G)" value={tamanho} onChangeText={setTamanho} />
      <TextInput style={styles.input} placeholder="Categoria" value={categoria} onChangeText={setCategoria} />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleSalvarAlteracoes} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SALVAR ALTERAÇÕES</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={isLoading}>
          <Text style={styles.cancelButtonText}>CANCELAR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}