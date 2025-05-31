import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { styles } from './stylesEditarMercadoria'; // CORRIGIDO: 
import { Produto } from './ListarMercadoriasScreen'; // Importar a interface Produto

const API_BASE_URL = 'http://192.168.1.5:8080';

type EditarMercadoriaRouteProp = RouteProp<RootStackParamList, 'EditarMercadoria'>;
type EditarMercadoriaNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditarMercadoria'>;

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
  const [isLoading, setIsLoading] = useState(false); // Para o botão de salvar
  const [isFetchingProduto, setIsFetchingProduto] = useState(true);

  useEffect(() => {
    const fetchProdutoParaEditar = async () => {
      setIsFetchingProduto(true);
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) {
          Alert.alert("Autenticação", "Token não encontrado. Faça login novamente.");
          navigation.goBack();
          return;
        }
        const response = await axios.get<Produto>(`<span class="math-inline">\{API\_BASE\_URL\}/produtos/</span>{produtoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const produto = response.data;
        setNome(produto.nome);
        // Certifique-se de que precoCusto é tratado como string e pode ser nulo/undefined
        setPrecoCusto(produto.precoCusto !== undefined && produto.precoCusto !== null ? produto.precoCusto.toString() : '');
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
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) {
          Alert.alert("Autenticação", "Token não encontrado.");
          setIsLoading(false);
          return;
        }

        const produtoData: Partial<Produto> = { // Usando Partial para permitir campos opcionais na atualização
            nome: nome.trim(),
            precoCusto: precoCustoVal,
            preco: precoVendaVal,
            estoque: estoqueVal,
            tamanho: tamanho.trim() || undefined,
            categoria: categoria.trim() || undefined,
        };

        await axios.put(`<span class="math-inline">\{API\_BASE\_URL\}/produtos/</span>{produtoId}`, produtoData, {
            headers: { Authorization: `Bearer ${token}` },
        });

        Alert.alert("Sucesso", "Mercadoria atualizada com sucesso!");
        navigation.goBack();
    } catch (error: any) {
        console.error("Erro ao atualizar mercadoria:", error.response?.data || error.message);
        let errorMessage = "Não foi possível atualizar a mercadoria.";
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.data?.message) errorMessage = error.response.data.message;
            else if (typeof error.response.data === 'string') errorMessage = error.response.data;
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
      <TextInput
        style={styles.input}
        placeholder="Preço de Custo (ex: 39,90)"
        value={precoCusto}
        onChangeText={setPrecoCusto}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Preço de Venda (ex: 79,90)"
        value={preco}
        onChangeText={setPreco}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Quantidade em Estoque"
        value={estoque}
        onChangeText={setEstoque}
        keyboardType="number-pad"
      />
      <TextInput style={styles.input} placeholder="Tamanho (Opcional)" value={tamanho} onChangeText={setTamanho} />
      <TextInput style={styles.input} placeholder="Categoria (Opcional)" value={categoria} onChangeText={setCategoria} />

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