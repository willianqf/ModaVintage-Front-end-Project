import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native'; // Removido StyleSheet pois os estilos vêm de arquivo externo
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
// A importação de estilos está correta aqui, usando um alias.
import { styles as listarMercadoriasStyles } from './stylesListarMercadorias'; // [origem: willianqf/modavintage_frontand_backand/modavintage_frontand_backand-master/Modavintage_Frontand/src/screens/stylesListarMercadorias.ts]
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Ajuste o caminho se necessário

export interface Produto {
  id: number;
  nome: string;
  precoCusto?: number; // NOVO CAMPO: Preço de custo (opcional para compatibilidade inicial)
  preco: number;       // Este campo é o Preço de Venda
  estoque: number;
  tamanho?: string;
  categoria?: string;
  dataCadastro?: string;
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

const API_BASE_URL = 'http://192.168.1.5:8080'; // Confirme seu IP
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
    if (isFetchingRef.current && !isNewSearchOrRefresh) return;
    if (!isNewSearchOrRefresh && !hasMoreRef.current) {
      setIsLoadingMore(false);
      return;
    }

    isFetchingRef.current = true;
    if (isNewSearchOrRefresh) setIsLoading(true); else setIsLoadingMore(true);
    if (isNewSearchOrRefresh) setError(null);

    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) throw new Error("Token não encontrado.");

      let url = `${API_BASE_URL}/produtos?page=${pageToFetch}&size=${PAGE_SIZE}&sort=id,asc`;
      if (searchTerm.trim() !== '') {
        url += `&nome=${encodeURIComponent(searchTerm.trim())}`;
      }

      const response = await axios.get<PaginatedResponse<Produto>>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
      let errorMessage = "Não foi possível carregar os produtos.";
       if (axios.isAxiosError(err) && err.response) {
            if (err.response.status === 401 || err.response.status === 403) errorMessage = "Sessão expirada ou token inválido.";
            else if (err.response.data?.message) errorMessage = err.response.data.message;
        } else if (err.message) errorMessage = err.message;
      setError(errorMessage);
      if (isNewSearchOrRefresh || pageToFetch === 0) setProdutos([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [error]); // Adicionado `error` como dependência para resetá-lo corretamente

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
    if (!isFetchingRef.current && hasMoreRef.current) {
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
        currentPageRef.current = 0;
        hasMoreRef.current = true;
        fetchProdutos(0, termoPesquisaInput, true);
    }
  };

  const confirmarDelecao = (produtoId: number, produtoNome: string) => {
    Alert.alert( "Confirmar Deleção", `Tem certeza que deseja deletar "${produtoNome}"?`,
      [ { text: "Cancelar", style: "cancel" }, { text: "Deletar", onPress: () => handleDeletarProduto(produtoId), style: "destructive" } ]
    );
  };

  const handleDeletarProduto = async (produtoId: number) => {
    setIsDeleting(produtoId);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) throw new Error("Token não encontrado.");
      await axios.delete(`${API_BASE_URL}/produtos/${produtoId}`, { headers: { Authorization: `Bearer ${token}` } });
      Alert.alert("Sucesso", "Mercadoria deletada!");
      currentPageRef.current = 0;
      hasMoreRef.current = true;
      fetchProdutos(0, termoPesquisaAtivo, true); 
    } catch (error: any) {
      Alert.alert("Erro", "Não foi possível deletar a mercadoria.");
    } finally {
      setIsDeleting(null);
    }
  };

  const renderFooter = () => {
    if (isLoadingMore) {
      return <View style={{ paddingVertical: 20 }}><ActivityIndicator size="large" color="#323588" /></View>;
    }
    if (!hasMoreRef.current && produtos.length > 0) {
      return <View style={{ paddingVertical: 20 }}><Text style={listarMercadoriasStyles.emptyDataText}>Fim da lista.</Text></View>;
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
      {/* Exibindo Preço de Custo se existir */}
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

  if (isLoading && produtos.length === 0 && currentPageRef.current === 0 && !error) {
    return (
      <View style={listarMercadoriasStyles.container}>
        <Text style={listarMercadoriasStyles.headerTitle}>Lista de Mercadorias</Text>
        <TextInput style={listarMercadoriasStyles.searchInput} placeholder="Pesquisar mercadoria por nome..." value={termoPesquisaInput} onChangeText={setTermoPesquisaInput} onSubmitEditing={handleSearchSubmit} returnKeyType="search" />
        <View style={listarMercadoriasStyles.centered}>
          <ActivityIndicator size="large" color="#323588" />
          <Text style={listarMercadoriasStyles.loadingText}>Carregando mercadorias...</Text>
        </View>
      </View>
    );
  }

  if (error && produtos.length === 0 && !isLoading) {
      return (
        <View style={listarMercadoriasStyles.container}>
          <Text style={listarMercadoriasStyles.headerTitle}>Lista de Mercadorias</Text>
          <TextInput style={listarMercadoriasStyles.searchInput} placeholder="Pesquisar mercadoria por nome..." value={termoPesquisaInput} onChangeText={setTermoPesquisaInput} onSubmitEditing={handleSearchSubmit} returnKeyType="search" />
          <View style={listarMercadoriasStyles.centered}>
            <Text style={listarMercadoriasStyles.errorText}>Erro ao carregar: {error}</Text>
            <TouchableOpacity style={listarMercadoriasStyles.retryButton} onPress={() => fetchProdutos(0, termoPesquisaAtivo, true)}>
              <Text style={listarMercadoriasStyles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
  }

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
      />
      <FlatList
        data={produtos}
        renderItem={renderItem}
        keyExtractor={(item) => `produto-${item.id}`}
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
                        Nenhuma mercadoria encontrada {termoPesquisaAtivo ? `para "${termoPesquisaAtivo}".` : 'cadastrada.'}
                    </Text>
                </View>
            ) : null
        }
      />
    </View>
  );
}