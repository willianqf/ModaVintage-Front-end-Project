import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
// import axios from 'axios'; // REMOVA esta linha
// import * as SecureStore from 'expo-secure-store'; // Não é mais necessário
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { styles } from './stylesEditarMercadoria'; //
import { Produto } from './ListarMercadoriasScreen'; //

// Importe a instância configurada do Axios e o helper isAxiosError
import axiosInstance from '../api/axiosInstance'; // Ajuste o caminho se necessário
import axios from 'axios'; // Para usar axios.isAxiosError

// const API_BASE_URL = 'http://192.168.1.5:8080'; // Não é mais necessário

type EditarMercadoriaRouteProp = RouteProp<RootStackParamList, 'EditarMercadoria'>;
type EditarMercadoriaNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditarMercadoria'>;

export default function EditarMercadoriaScreen() {
  const navigation = useNavigation<EditarMercadoriaNavigationProp>();
  const route = useRoute<EditarMercadoriaRouteProp>();
  const { produtoId } = route.params;

  const [nome, setNome] = useState('');
  const [precoCusto, setPrecoCusto] = useState('');
  const [preco, setPreco] = useState(''); // Preço de venda
  const [estoque, setEstoque] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [categoria, setCategoria] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProduto, setIsFetchingProduto] = useState(true);

  useEffect(() => {
    const fetchProdutoParaEditar = async () => {
      setIsFetchingProduto(true);
      try {
        // O token será adicionado automaticamente pelo interceptor do axiosInstance
        const response = await axiosInstance.get<Produto>(`/produtos/${produtoId}`); //
        const produto = response.data;
        setNome(produto.nome);
        setPrecoCusto(produto.precoCusto !== undefined && produto.precoCusto !== null ? produto.precoCusto.toString() : '');
        setPreco(produto.preco.toString());
        setEstoque(produto.estoque.toString());
        setTamanho(produto.tamanho || '');
        setCategoria(produto.categoria || '');
      } catch (error: any) {
        console.error("EditarMercadoriaScreen: Erro ao buscar produto para edição:", JSON.stringify(error.response?.data || error.message));
        if (axios.isAxiosError(error) && error.response?.status !== 401) {
          Alert.alert("Erro ao Carregar Dados", "Não foi possível carregar os dados da mercadoria para edição.");
        } else if (!axios.isAxiosError(error)) {
           Alert.alert("Erro Desconhecido", "Ocorreu um erro inesperado ao carregar os dados.");
        }
        // navigation.goBack(); // Comentado, o logout global trata o redirecionamento em caso de 401
      } finally {
        setIsFetchingProduto(false);
      }
    };

    fetchProdutoParaEditar();
  }, [produtoId]);

  const handleSalvarAlteracoes = async () => {
    if (!nome.trim() || !precoCusto.trim() || !preco.trim() || !estoque.trim()) {
      Alert.alert("Erro de Validação", "Nome, Preço de Custo, Preço de Venda e Estoque são obrigatórios.");
      return;
    }

    const precoCustoNum = parseFloat(precoCusto.replace(',', '.'));
    const precoNum = parseFloat(preco.replace(',', '.'));
    const estoqueNum = parseInt(estoque, 10);

    if (isNaN(precoCustoNum) || precoCustoNum <= 0) {
      Alert.alert("Erro de Validação", "Preço de custo inválido.");
      return;
    }
    if (isNaN(precoNum) || precoNum <= 0) {
      Alert.alert("Erro de Validação", "Preço de venda inválido.");
      return;
    }
    if (isNaN(estoqueNum) || estoqueNum < 0) {
      Alert.alert("Erro de Validação", "Estoque inválido.");
      return;
    }
    if (precoCustoNum > precoNum) {
      Alert.alert("Atenção", "O preço de custo está maior que o preço de venda. Deseja continuar?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Continuar", onPress: () => salvarAlteracoesNoBackend(precoCustoNum, precoNum, estoqueNum) }
      ]);
      return;
    }
    salvarAlteracoesNoBackend(precoCustoNum, precoNum, estoqueNum);
  };

  const salvarAlteracoesNoBackend = async (precoCustoVal: number, precoVendaVal: number, estoqueVal: number) => {
    setIsLoading(true);
    try {
      // O token será adicionado automaticamente pelo interceptor do axiosInstance
      const produtoData: Partial<Produto> = {
        nome: nome.trim(),
        precoCusto: precoCustoVal,
        preco: precoVendaVal, // Preço de venda
        estoque: estoqueVal,
        tamanho: tamanho.trim() || undefined,
        categoria: categoria.trim() || undefined,
      };

      await axiosInstance.put(`/produtos/${produtoId}`, produtoData); //

      Alert.alert("Sucesso", "Mercadoria atualizada com sucesso!");
      navigation.goBack();
    } catch (error: any) {
      console.error("EditarMercadoriaScreen: Erro ao atualizar mercadoria:", JSON.stringify(error.response?.data || error.message));
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status !== 401) {
            const apiErrorMessage = error.response.data?.erro || error.response.data?.message || 'Não foi possível atualizar a mercadoria.';
            Alert.alert("Erro ao Salvar", apiErrorMessage);
          } else {
            console.warn("EditarMercadoriaScreen: Erro 401, o interceptor deve ter deslogado.");
          }
        } else {
          Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor.");
        }
      } else {
        Alert.alert("Erro Desconhecido", "Ocorreu um erro inesperado ao salvar.");
      }
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }} keyboardShouldPersistTaps="handled">
      <Text style={styles.headerTitle}>Editar Mercadoria</Text>

      <TextInput style={styles.input} placeholder="Nome da Mercadoria" value={nome} onChangeText={setNome} placeholderTextColor="#888"/>
      <TextInput
        style={styles.input}
        placeholder="Preço de Custo (ex: 39,90)"
        value={precoCusto}
        onChangeText={setPrecoCusto}
        keyboardType="numeric"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Preço de Venda (ex: 79,90)"
        value={preco}
        onChangeText={setPreco}
        keyboardType="numeric"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Quantidade em Estoque"
        value={estoque}
        onChangeText={setEstoque}
        keyboardType="number-pad"
        placeholderTextColor="#888"
      />
      <TextInput style={styles.input} placeholder="Tamanho (Opcional)" value={tamanho} onChangeText={setTamanho} placeholderTextColor="#888"/>
      <TextInput style={styles.input} placeholder="Categoria (Opcional)" value={categoria} onChangeText={setCategoria} placeholderTextColor="#888"/>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleSalvarAlteracoes} disabled={isLoading || isFetchingProduto}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SALVAR ALTERAÇÕES</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={isLoading || isFetchingProduto}>
          <Text style={styles.cancelButtonText}>CANCELAR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}