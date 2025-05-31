import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
// Alterado para usar estilos de fornecedores
import { styles as listarFornecedoresStyles } from './stylesListarFornecedores'; 
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Verifique se este caminho está correto

// Interface para Fornecedor
export interface Fornecedor {
  id: number;
  nome: string;
  cnpj?: string; 
  contato?: string;
}

// Interface PaginatedResponse permanece a mesma
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

const API_BASE_URL = 'http://192.168.1.5:8080';
const PAGE_SIZE = 10;

// Tipo de navegação para esta tela
type ListarFornecedoresNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListarFornecedores'>;

// Nome do componente alterado
export default function ListarFornecedoresScreen() {
  const navigation = useNavigation<ListarFornecedoresNavigationProp>();
  
  // Estado alterado para fornecedores
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(false); 
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null); // Para o ID do fornecedor sendo deletado
  const [error, setError] = useState<string | null>(null);
  
  const currentPageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const isFetchingRef = useRef(false);

  const [termoPesquisaInput, setTermoPesquisaInput] = useState(''); 
  const [termoPesquisaAtivo, setTermoPesquisaAtivo] = useState(''); 

  // Função de busca alterada para fetchFornecedores
  const fetchFornecedores = useCallback(async (pageToFetch: number, searchTerm: string, isNewSearchOrRefresh: boolean) => {
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

    // URL alterada para usar ASC em maiúsculas
    let url = `${API_BASE_URL}/fornecedores?page=${pageToFetch}&size=${PAGE_SIZE}&sort=nome,ASC`; // ALTERADO para nome,ASC
    if (searchTerm.trim() !== '') {
        url += `&nome=${encodeURIComponent(searchTerm.trim())}`;
    }
    console.log("Frontend URL para Fornecedores (corrigida):", url); // Para verificar

    const response = await axios.get<PaginatedResponse<Fornecedor>>(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

      if (response.data && response.data.content) {
        // Atualiza o estado de fornecedores
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
      console.error("Erro ao buscar fornecedores:", JSON.stringify(err.response?.data || err.message));
      let errorMessage = "Não foi possível carregar os fornecedores.";
       if (axios.isAxiosError(err) && err.response) {
            if (err.response.status === 401 || err.response.status === 403) errorMessage = "Sessão expirada ou token inválido.";
            else if (err.response.data?.message) errorMessage = err.response.data.message;
        } else if (err.message) errorMessage = err.message;
      setError(errorMessage);
      if (isNewSearchOrRefresh || pageToFetch === 0) setFornecedores([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, []); 

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
    fetchFornecedores(0, termoPesquisaAtivo, true); // Chama fetchFornecedores
  }, [termoPesquisaAtivo, fetchFornecedores]); 

  useFocusEffect(
    useCallback(() => {
      currentPageRef.current = 0;
      hasMoreRef.current = true;
      fetchFornecedores(0, termoPesquisaAtivo, true); // Chama fetchFornecedores
      return () => {};
    }, [termoPesquisaAtivo, fetchFornecedores])
  );
  
  const handleLoadMore = () => {
    if (!isFetchingRef.current && hasMoreRef.current) {
      fetchFornecedores(currentPageRef.current + 1, termoPesquisaAtivo, false); // Chama fetchFornecedores
    }
  };

  const handleRefresh = () => {
    currentPageRef.current = 0;
    hasMoreRef.current = true;
    fetchFornecedores(0, termoPesquisaAtivo, true); // Chama fetchFornecedores
  };
  
  const handleSearchSubmit = () => {
    if (termoPesquisaInput !== termoPesquisaAtivo) {
        setTermoPesquisaAtivo(termoPesquisaInput);
    } else {
        currentPageRef.current = 0;
        hasMoreRef.current = true;
        fetchFornecedores(0, termoPesquisaInput, true); // Chama fetchFornecedores
    }
  };

  // Função para confirmar deleção de fornecedor
  const confirmarDelecao = (fornecedorId: number, fornecedorNome: string) => {
    Alert.alert( "Confirmar Deleção", `Tem certeza que deseja deletar o fornecedor "${fornecedorNome}"?`,
      [ { text: "Cancelar", style: "cancel" }, { text: "Deletar", onPress: () => handleDeletarFornecedor(fornecedorId), style: "destructive" } ]
    );
  };

  // Função para deletar fornecedor
  const handleDeletarFornecedor = async (fornecedorId: number) => {
    setIsDeleting(fornecedorId);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) throw new Error("Token não encontrado.");
      // Endpoint de delete alterado para fornecedores
      await axios.delete(`${API_BASE_URL}/fornecedores/${fornecedorId}`, { headers: { Authorization: `Bearer ${token}` } });
      Alert.alert("Sucesso", "Fornecedor deletado!");
      currentPageRef.current = 0; 
      hasMoreRef.current = true;
      fetchFornecedores(0, termoPesquisaAtivo, true); // Recarrega fornecedores
    } catch (error: any) {
      Alert.alert("Erro", "Não foi possível deletar o fornecedor.");
    } finally {
      setIsDeleting(null);
    }
  };

  const renderFooter = () => {
    if (isLoadingMore) {
      return <View style={{ paddingVertical: 20 }}><ActivityIndicator size="large" color="#323588" /></View>;
    }
    // Estado alterado para fornecedores
    if (!hasMoreRef.current && fornecedores.length > 0) {
      return <View style={{ paddingVertical: 20 }}><Text style={listarFornecedoresStyles.emptyDataText}>Fim da lista.</Text></View>;
    }
    return null;
  };

  // renderItem alterado para exibir dados de Fornecedor
  const renderItem = ({ item }: { item: Fornecedor }) => (
    <TouchableOpacity
      style={listarFornecedoresStyles.itemContainer}
      onPress={() => navigation.navigate('EditarFornecedor', { fornecedorId: item.id })}
    >
      {/* View para agrupar os textos e permitir que o botão de deletar fique à direita */}
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

      {/* Botão de Deletar */}
      <TouchableOpacity
        style={listarFornecedoresStyles.deleteButton}
        onPress={(e) => { 
            e.stopPropagation(); // Impede que o onPress do itemContainer (navegação) seja disparado
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
    // Estilos alterados para usar listarFornecedoresStyles
    <View style={listarFornecedoresStyles.container}>
      {/* Título alterado */}
      <Text style={listarFornecedoresStyles.headerTitle}>Lista de Fornecedores</Text>
      <TextInput
        style={listarFornecedoresStyles.searchInput}
        // Placeholder alterado
        placeholder="Pesquisar fornecedor por nome..."
        value={termoPesquisaInput}
        onChangeText={setTermoPesquisaInput}
        onSubmitEditing={handleSearchSubmit}
        returnKeyType="search"
      />
      {showInitialLoading ? (
        <View style={listarFornecedoresStyles.centered}>
          <ActivityIndicator size="large" color="#323588" />
          {/* Texto de loading alterado */}
          <Text style={listarFornecedoresStyles.loadingText}>Carregando fornecedores...</Text>
        </View>
      ) : showErrorScreen ? (
          <View style={listarFornecedoresStyles.centered}>
            <Text style={listarFornecedoresStyles.errorText}>Erro ao carregar: {error}</Text>
            {/* Texto de retry alterado */}
            <TouchableOpacity style={listarFornecedoresStyles.retryButton} onPress={() => fetchFornecedores(0, termoPesquisaAtivo, true)}>
              <Text style={listarFornecedoresStyles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
      ) : (
        <FlatList
          // Data da FlatList alterada para fornecedores
          data={fornecedores}
          renderItem={renderItem}
          // Key extractor ajustado
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
                      {/* Texto de lista vazia alterado */}
                      <Text style={listarFornecedoresStyles.emptyDataText}>
                          Nenhum fornecedor encontrado {termoPesquisaAtivo ? `para "${termoPesquisaAtivo}".` : 'cadastrado.'}
                      </Text>
                  </View>
              ) : null
          }
        />
      )}
    </View>
  );
}