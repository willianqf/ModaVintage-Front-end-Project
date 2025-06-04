import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
// import axios from 'axios'; // REMOVA esta linha
// import * as SecureStore from 'expo-secure-store'; // Não é mais necessário aqui
import { styles as listarFornecedoresStyles } from './stylesListarFornecedores'; //
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

// Importe a instância configurada do Axios e o helper isAxiosError
import axiosInstance from '../api/axiosInstance'; // Ajuste o caminho se necessário
import axios from 'axios'; // Para usar axios.isAxiosError

export interface Fornecedor {
  id: number;
  nome: string;
  cnpj?: string;
  contato?: string;
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

type ListarFornecedoresNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListarFornecedores'>;

export default function ListarFornecedoresScreen() {
  const navigation = useNavigation<ListarFornecedoresNavigationProp>();

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const isFetchingRef = useRef(false);

  const [termoPesquisaInput, setTermoPesquisaInput] = useState('');
  const [termoPesquisaAtivo, setTermoPesquisaAtivo] = useState('');

  const fetchFornecedores = useCallback(async (pageToFetch: number, searchTerm: string, isNewSearchOrRefresh: boolean) => {
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
      // O token será adicionado automaticamente pelo interceptor do axiosInstance
      const params: Record<string, string | number> = {
        page: pageToFetch,
        size: PAGE_SIZE,
        sort: 'nome,ASC', // Endpoint do backend espera 'ASC' ou 'DESC'
      };
      if (searchTerm.trim() !== '') {
        params.nome = searchTerm.trim();
      }
      
      console.log("ListarFornecedoresScreen: Enviando params:", params); // Debug

      // Use axiosInstance
      const response = await axiosInstance.get<PaginatedResponse<Fornecedor>>('/fornecedores', { params });

      if (response.data && response.data.content) {
        setFornecedores(prevFornecedores =>
          (isNewSearchOrRefresh || pageToFetch === 0) ? response.data.content : [...prevFornecedores, ...response.data.content]
        );
        hasMoreRef.current = !response.data.last;
        currentPageRef.current = response.data.number;
      } else {
        if (isNewSearchOrRefresh || pageToFetch === 0) setFornecedores([]);
        hasMoreRef.current = false;
      }
      if (error && (isNewSearchOrRefresh || pageToFetch === 0)) setError(null);

    } catch (err: any) {
      console.error("ListarFornecedoresScreen: Erro ao buscar fornecedores:", JSON.stringify(err.response?.data || err.message));
      if (axios.isAxiosError(err)) {
        if (err.response && err.response.status !== 401) {
          const apiErrorMessage = err.response.data?.erro || err.response.data?.message || "Não foi possível carregar os fornecedores.";
          setError(apiErrorMessage);
        } else if (!err.response) {
          setError("Erro de conexão ao buscar fornecedores.");
        }
      } else {
        setError("Ocorreu um erro desconhecido ao buscar fornecedores.");
      }
      if (isNewSearchOrRefresh || pageToFetch === 0) setFornecedores([]);
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
    fetchFornecedores(0, termoPesquisaAtivo, true);
  }, [termoPesquisaAtivo, fetchFornecedores]);

  useFocusEffect(
    useCallback(() => {
      currentPageRef.current = 0;
      hasMoreRef.current = true;
      fetchFornecedores(0, termoPesquisaAtivo, true);
      return () => {};
    }, [termoPesquisaAtivo, fetchFornecedores])
  );

  const handleLoadMore = () => {
    if (!isFetchingRef.current && hasMoreRef.current && !isLoadingMore) {
      fetchFornecedores(currentPageRef.current + 1, termoPesquisaAtivo, false);
    }
  };

  const handleRefresh = () => {
    currentPageRef.current = 0;
    hasMoreRef.current = true;
    fetchFornecedores(0, termoPesquisaAtivo, true);
  };

  const handleSearchSubmit = () => {
    if (termoPesquisaInput !== termoPesquisaAtivo) {
      setTermoPesquisaAtivo(termoPesquisaInput);
    } else {
      handleRefresh();
    }
  };

  const confirmarDelecao = (fornecedorId: number, fornecedorNome: string) => {
    Alert.alert("Confirmar Deleção", `Tem certeza que deseja deletar o fornecedor "${fornecedorNome}"?`,
      [{ text: "Cancelar", style: "cancel" }, { text: "Deletar", onPress: () => handleDeletarFornecedor(fornecedorId), style: "destructive" }]
    );
  };

  const handleDeletarFornecedor = async (fornecedorId: number) => {
    setIsDeleting(fornecedorId);
    try {
      // O token será adicionado automaticamente pelo interceptor
      await axiosInstance.delete(`/fornecedores/${fornecedorId}`); //
      Alert.alert("Sucesso", "Fornecedor deletado!");
      handleRefresh(); // Recarrega a lista
    } catch (error: any) {
      console.error("ListarFornecedoresScreen: Erro ao deletar fornecedor:", JSON.stringify(error.response?.data || error.message));
      if (axios.isAxiosError(error) && error.response?.status !== 401) {
        const apiErrorMessage = error.response?.data?.erro || error.response?.data?.message || "Não foi possível deletar o fornecedor.";
        Alert.alert("Erro ao Deletar", apiErrorMessage);
      } else if (!axios.isAxiosError(error)){
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
    if (!hasMoreRef.current && fornecedores.length > 0 && !isLoading && !error) {
      return <View style={{ paddingVertical: 20 }}><Text style={listarFornecedoresStyles.emptyDataText}>Fim da lista de fornecedores.</Text></View>;
    }
    return null;
  };

  const renderItem = ({ item }: { item: Fornecedor }) => (
    <TouchableOpacity
      style={listarFornecedoresStyles.itemContainer}
      onPress={() => navigation.navigate('EditarFornecedor', { fornecedorId: item.id })}
    >
      <View style={listarFornecedoresStyles.itemTextContainer}>
        <Text style={listarFornecedoresStyles.itemName} numberOfLines={1} ellipsizeMode="tail">
          {item.nome}
        </Text>
        {item.cnpj && (
          <Text style={listarFornecedoresStyles.itemDetails} numberOfLines={1} ellipsizeMode="tail">
            CNPJ: {item.cnpj}
          </Text>
        )}
        {item.contato && (
          <Text style={listarFornecedoresStyles.itemDetails} numberOfLines={1} ellipsizeMode="tail">
            Contato: {item.contato}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={listarFornecedoresStyles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          confirmarDelecao(item.id, item.nome);
        }}
        disabled={isDeleting === item.id}
      >
        {isDeleting === item.id ?
          <ActivityIndicator size="small" color="#FFFFFF" /> :
          <Text style={listarFornecedoresStyles.deleteButtonText}>Deletar</Text>
        }
      </TouchableOpacity>
    </TouchableOpacity>
  );
  
  const showInitialLoading = isLoading && fornecedores.length === 0 && currentPageRef.current === 0 && !error;
  const showErrorScreen = error && fornecedores.length === 0 && !isLoading;

  return (
    <View style={listarFornecedoresStyles.container}>
      <Text style={listarFornecedoresStyles.headerTitle}>Lista de Fornecedores</Text>
      <TextInput
        style={listarFornecedoresStyles.searchInput}
        placeholder="Pesquisar fornecedor por nome..."
        value={termoPesquisaInput}
        onChangeText={setTermoPesquisaInput}
        onSubmitEditing={handleSearchSubmit}
        returnKeyType="search"
        placeholderTextColor="#888"
      />
      {showInitialLoading ? (
        <View style={listarFornecedoresStyles.centered}>
          <ActivityIndicator size="large" color="#323588" />
          <Text style={listarFornecedoresStyles.loadingText}>Carregando fornecedores...</Text>
        </View>
      ) : showErrorScreen ? (
        <View style={listarFornecedoresStyles.centered}>
          <Text style={listarFornecedoresStyles.errorText}>{error}</Text>
          <TouchableOpacity style={listarFornecedoresStyles.retryButton} onPress={handleRefresh}>
            <Text style={listarFornecedoresStyles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={fornecedores}
          renderItem={renderItem}
          keyExtractor={(item) => `fornecedor-${item.id.toString()}`}
          contentContainerStyle={listarFornecedoresStyles.listContentContainer}
          onRefresh={handleRefresh}
          refreshing={isLoading && currentPageRef.current === 0 && !isLoadingMore}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            !isLoading && !error && fornecedores.length === 0 ? (
              <View style={listarFornecedoresStyles.centered}>
                <Text style={listarFornecedoresStyles.emptyDataText}>
                  {termoPesquisaAtivo ? `Nenhum fornecedor encontrado para "${termoPesquisaAtivo}".` : 'Nenhum fornecedor cadastrado.'}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}