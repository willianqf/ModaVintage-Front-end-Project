import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
// import axios from 'axios'; // REMOVA esta linha
// import * as SecureStore from 'expo-secure-store'; // Não é mais necessário aqui
import { styles as listarMercadoriasStyles } from './stylesListarMercadorias'; //
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

// Importe a instância configurada do Axios e o helper isAxiosError
import axiosInstance from '../api/axiosInstance'; // Ajuste o caminho se necessário
import axios from 'axios'; // Para usar axios.isAxiosError

export interface Produto {
  id: number;
  nome: string;
  precoCusto?: number;
  preco: number; // Preço de Venda
  estoque: number;
  tamanho?: string;
  categoria?: string;
  dataCadastro?: string;
  // O campo 'ativo' não é geralmente retornado pela API para listagens de ativos,
  // mas se for, pode ser incluído aqui. O backend filtra por ativo=true.
}

interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// const API_BASE_URL = 'http://192.168.1.5:8080'; // Não é mais necessário
const PAGE_SIZE = 10;

type ListarMercadoriasNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListarMercadorias'>;

export default function ListarMercadoriasScreen() {
  const navigation = useNavigation<ListarMercadoriasNavigationProp>();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const isFetchingRef = useRef(false);

  const [termoPesquisaInput, setTermoPesquisaInput] = useState('');
  const [termoPesquisaAtivo, setTermoPesquisaAtivo] = useState('');

  const fetchProdutos = useCallback(async (pageToFetch: number, searchTerm: string, isNewSearchOrRefresh: boolean) => {
    if (isFetchingRef.current && !isNewSearchOrRefresh) {
      return;
    }
    if (!isNewSearchOrRefresh && !hasMoreRef.current) {
      setIsLoadingMore(false);
      return;
    }

    isFetchingRef.current = true;
    if (isNewSearchOrRefresh) setIsLoading(true); else setIsLoadingMore(true);
    if (isNewSearchOrRefresh) setError(null);

    try {
      // O token será adicionado automaticamente pelo interceptor
      const params: Record<string, string | number> = {
        page: pageToFetch,
        size: PAGE_SIZE,
        sort: 'nome,asc', // Ordenar por nome ascendentemente
      };
      if (searchTerm.trim() !== '') {
        params.nome = searchTerm.trim();
      }

      // Use axiosInstance
      const response = await axiosInstance.get<PaginatedResponse<Produto>>('/produtos', { params });

      if (response.data && response.data.content) {
        setProdutos(prevProdutos =>
          (isNewSearchOrRefresh || pageToFetch === 0) ? response.data.content : [...prevProdutos, ...response.data.content]
        );
        hasMoreRef.current = !response.data.last;
        currentPageRef.current = response.data.number;
      } else {
        if (isNewSearchOrRefresh || pageToFetch === 0) setProdutos([]);
        hasMoreRef.current = false;
      }
      if (error && (isNewSearchOrRefresh || pageToFetch === 0)) setError(null);

    } catch (err: any) {
      console.error("ListarMercadoriasScreen: Erro ao buscar produtos:", JSON.stringify(err.response?.data || err.message));
      if (axios.isAxiosError(err)) {
        if (err.response && err.response.status !== 401) {
          const apiErrorMessage = err.response.data?.erro || err.response.data?.message || "Não foi possível carregar as mercadorias.";
          setError(apiErrorMessage);
        } else if (!err.response) {
          setError("Erro de conexão ao buscar mercadorias.");
        }
      } else {
        setError("Ocorreu um erro desconhecido ao buscar mercadorias.");
      }
      if (isNewSearchOrRefresh || pageToFetch === 0) setProdutos([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [error]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (termoPesquisaInput !== termoPesquisaAtivo) {
        setTermoPesquisaAtivo(termoPesquisaInput);
      }
    }, 800);
    return () => clearTimeout(handler);
  }, [termoPesquisaInput, termoPesquisaAtivo]);

  useEffect(() => {
    currentPageRef.current = 0;
    hasMoreRef.current = true;
    fetchProdutos(0, termoPesquisaAtivo, true);
  }, [termoPesquisaAtivo, fetchProdutos]);

  useFocusEffect(
    useCallback(() => {
      currentPageRef.current = 0;
      hasMoreRef.current = true;
      fetchProdutos(0, termoPesquisaAtivo, true);
      return () => {};
    }, [termoPesquisaAtivo, fetchProdutos])
  );

  const handleLoadMore = () => {
    if (!isFetchingRef.current && hasMoreRef.current && !isLoadingMore) {
      fetchProdutos(currentPageRef.current + 1, termoPesquisaAtivo, false);
    }
  };

  const handleRefresh = () => {
    currentPageRef.current = 0;
    hasMoreRef.current = true;
    fetchProdutos(0, termoPesquisaAtivo, true);
  };

  const handleSearchSubmit = () => {
    if (termoPesquisaInput !== termoPesquisaAtivo) {
      setTermoPesquisaAtivo(termoPesquisaInput);
    } else {
      handleRefresh();
    }
  };

  const confirmarDelecao = (produtoId: number, produtoNome: string) => {
    Alert.alert("Confirmar Deleção", `Tem certeza que deseja deletar "${produtoNome}"?`,
      [{ text: "Cancelar", style: "cancel" }, { text: "Deletar", onPress: () => handleDeletarProduto(produtoId), style: "destructive" }]
    );
  };

  const handleDeletarProduto = async (produtoId: number) => {
    setIsDeleting(produtoId);
    try {
      // O token será adicionado automaticamente
      await axiosInstance.delete(`/produtos/${produtoId}`); //
      Alert.alert("Sucesso", "Mercadoria deletada!");
      handleRefresh(); // Recarrega a lista
    } catch (error: any) {
      console.error("ListarMercadoriasScreen: Erro ao deletar mercadoria:", JSON.stringify(error.response?.data || error.message));
      if (axios.isAxiosError(error) && error.response?.status !== 401) {
        const apiErrorMessage = error.response?.data?.erro || error.response?.data?.message || "Não foi possível deletar a mercadoria.";
        Alert.alert("Erro ao Deletar", apiErrorMessage);
      } else if(!axios.isAxiosError(error)) {
        Alert.alert("Erro Desconhecido", "Ocorreu um erro inesperado ao deletar.");
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const renderFooter = (): React.ReactElement | null => {
    if (isLoadingMore) {
      return <View style={{ paddingVertical: 20 }}><ActivityIndicator size="large" color="#323588" /></View>;
    }
    if (!hasMoreRef.current && produtos.length > 0 && !isLoading && !error) {
      return <View style={{ paddingVertical: 20 }}><Text style={listarMercadoriasStyles.emptyDataText}>Fim da lista de mercadorias.</Text></View>;
    }
    return null;
  };

  const renderItem = ({ item }: { item: Produto }) => (
    <TouchableOpacity
      style={listarMercadoriasStyles.itemContainer}
      onPress={() => navigation.navigate('EditarMercadoria', { produtoId: item.id })}
    >
      <Text style={listarMercadoriasStyles.itemName}>{item.nome} {item.tamanho ? `- ${item.tamanho}` : ''}</Text>
      <Text style={listarMercadoriasStyles.itemDetails}>Categoria: {item.categoria || 'N/A'}</Text>
      {item.precoCusto !== undefined && item.precoCusto !== null && (
        <Text style={listarMercadoriasStyles.itemDetails}>
          Preço Custo: R$ {typeof item.precoCusto === 'number' ? item.precoCusto.toFixed(2) : 'N/A'}
        </Text>
      )}
      <Text style={listarMercadoriasStyles.itemDetails}>Preço Venda: R$ {item.preco.toFixed(2)}</Text>
      <Text style={listarMercadoriasStyles.itemDetails}>Estoque: {item.estoque}</Text>
      <Text style={item.estoque > 0 ? listarMercadoriasStyles.statusDisponivel : listarMercadoriasStyles.statusVendido}>
        Status: {item.estoque > 0 ? 'Disponível' : 'Sem Estoque'}
      </Text>
      <TouchableOpacity
        style={listarMercadoriasStyles.deleteButton}
        onPress={() => confirmarDelecao(item.id, item.nome)}
        disabled={isDeleting === item.id}
      >
        {isDeleting === item.id ?
          <ActivityIndicator size="small" color="#FFFFFF" /> :
          <Text style={listarMercadoriasStyles.deleteButtonText}>Deletar</Text>
        }
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const showInitialLoading = isLoading && produtos.length === 0 && currentPageRef.current === 0 && !error;
  const showErrorScreen = error && produtos.length === 0 && !isLoading;

  return (
    <View style={listarMercadoriasStyles.container}>
      <Text style={listarMercadoriasStyles.headerTitle}>Lista de Mercadorias</Text>
      <TextInput
        style={listarMercadoriasStyles.searchInput}
        placeholder="Pesquisar mercadoria por nome..."
        value={termoPesquisaInput}
        onChangeText={setTermoPesquisaInput}
        onSubmitEditing={handleSearchSubmit}
        returnKeyType="search"
        placeholderTextColor="#888"
      />
      {showInitialLoading ? (
        <View style={listarMercadoriasStyles.centered}>
          <ActivityIndicator size="large" color="#323588" />
          <Text style={listarMercadoriasStyles.loadingText}>Carregando mercadorias...</Text>
        </View>
      ) : showErrorScreen ? (
        <View style={listarMercadoriasStyles.centered}>
          <Text style={listarMercadoriasStyles.errorText}>{error}</Text>
          <TouchableOpacity style={listarMercadoriasStyles.retryButton} onPress={handleRefresh}>
            <Text style={listarMercadoriasStyles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={produtos}
          renderItem={renderItem}
          keyExtractor={(item) => `produto-${item.id.toString()}`}
          contentContainerStyle={listarMercadoriasStyles.listContentContainer}
          onRefresh={handleRefresh}
          refreshing={isLoading && currentPageRef.current === 0 && !isLoadingMore}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            !isLoading && !error && produtos.length === 0 ? (
              <View style={listarMercadoriasStyles.centered}>
                <Text style={listarMercadoriasStyles.emptyDataText}>
                  {termoPesquisaAtivo ? `Nenhuma mercadoria encontrada para "${termoPesquisaAtivo}".` : 'Nenhuma mercadoria cadastrada.'}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}