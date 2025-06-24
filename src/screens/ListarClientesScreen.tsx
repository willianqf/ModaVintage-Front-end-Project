import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
import { styles } from './stylesListarClientes';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../global/themes';

// --- Interfaces (sem alterações) ---
export interface Cliente { id: number; nome: string; telefone?: string; email?: string; }
interface PaginatedResponse<T> { content: T[]; totalPages: number; totalElements: number; number: number; size: number; first: boolean; last: boolean; empty: boolean; }

const PAGE_SIZE = 10;
type ListarClientesNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListarClientes'>;

export default function ListarClientesScreen() {
  // --- Lógica de Estado e Hooks (sem alterações) ---
  const navigation = useNavigation<ListarClientesNavigationProp>();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentPageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const isFetchingRef = useRef(false);
  const [termoPesquisaInput, setTermoPesquisaInput] = useState('');
  const [termoPesquisaAtivo, setTermoPesquisaAtivo] = useState('');

  // --- Lógica de Busca e Manipulação de Dados (sem alterações) ---
  const fetchClientes = useCallback(async (pageToFetch: number, searchTerm: string, isNewSearchOrRefresh: boolean) => {
    if (isFetchingRef.current && !isNewSearchOrRefresh) return;
    if (!isNewSearchOrRefresh && !hasMoreRef.current) { setIsLoadingMore(false); return; }

    isFetchingRef.current = true;
    // Apenas mostra o spinner de tela cheia no primeiro carregamento.
    if (isNewSearchOrRefresh && pageToFetch === 0) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    if (isNewSearchOrRefresh) setError(null);

    try {
      const params: Record<string, string | number> = { page: pageToFetch, size: PAGE_SIZE, sort: 'nome,asc' };
      if (searchTerm.trim() !== '') params.nome = searchTerm.trim();
      const response = await axiosInstance.get<PaginatedResponse<Cliente>>('/clientes', { params });
      if (response.data && response.data.content) {
        setClientes(prev => (isNewSearchOrRefresh || pageToFetch === 0) ? response.data.content : [...prev, ...response.data.content]);
        hasMoreRef.current = !response.data.last;
        currentPageRef.current = response.data.number;
      } else {
        if (isNewSearchOrRefresh || pageToFetch === 0) setClientes([]);
        hasMoreRef.current = false;
      }
    } catch (err: any) {
      console.error("ListarClientesScreen: Erro ao buscar clientes:", JSON.stringify(err.response?.data || err.message));
      if (axios.isAxiosError(err)) {
        if (err.response && err.response.status !== 401) {
          setError(err.response.data?.erro || err.response.data?.message || "Não foi possível carregar os clientes.");
        } else if (!err.response) {
          setError("Erro de conexão ao buscar clientes.");
        }
      } else {
        setError("Ocorreu um erro desconhecido.");
      }
      if (isNewSearchOrRefresh || pageToFetch === 0) setClientes([]);
    } finally {
      setIsLoading(false); setIsLoadingMore(false); isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => { if (termoPesquisaInput !== termoPesquisaAtivo) setTermoPesquisaAtivo(termoPesquisaInput); }, 800);
    return () => clearTimeout(handler);
  }, [termoPesquisaInput, termoPesquisaAtivo]);

  useEffect(() => {
    currentPageRef.current = 0; hasMoreRef.current = true;
    fetchClientes(0, termoPesquisaAtivo, true);
  }, [termoPesquisaAtivo, fetchClientes]);

  useFocusEffect(useCallback(() => {
    currentPageRef.current = 0; hasMoreRef.current = true;
    fetchClientes(0, termoPesquisaAtivo, true);
  }, [termoPesquisaAtivo, fetchClientes]));

  const handleLoadMore = () => { if (!isFetchingRef.current && hasMoreRef.current && !isLoadingMore) fetchClientes(currentPageRef.current + 1, termoPesquisaAtivo, false); };
  const handleRefresh = () => { currentPageRef.current = 0; hasMoreRef.current = true; fetchClientes(0, termoPesquisaAtivo, true); };

  const confirmarDelecaoCliente = (clienteId: number, clienteNome: string) => Alert.alert("Confirmar Deleção", `Tem certeza que deseja deletar o cliente "${clienteNome}"?`, [{ text: "Cancelar", style: "cancel" }, { text: "Deletar", onPress: () => handleDeletarCliente(clienteId), style: "destructive" }]);

  const handleDeletarCliente = async (clienteId: number) => {
    setIsProcessing(clienteId);
    try {
      await axiosInstance.delete(`/clientes/${clienteId}`);
      Alert.alert("Sucesso", "Cliente deletado com sucesso!");
      handleRefresh();
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status !== 401) {
        Alert.alert("Erro ao Deletar", error.response?.data?.erro || "Não foi possível deletar o cliente.");
      } else if (!axios.isAxiosError(error)) {
        Alert.alert("Erro Desconhecido", "Ocorreu um erro inesperado.");
      }
    } finally {
      setIsProcessing(null);
    }
  };

  // --- Componentes de Renderização ( ---
  const renderItem = ({ item }: { item: Cliente }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.nome}</Text>
        {item.email && (
          <View style={styles.itemDetails}>
            <MaterialCommunityIcons name="email-outline" size={16} color={theme.colors.placeholder} />
            <Text style={styles.itemDetailsText}>{item.email}</Text>
          </View>
        )}
        {item.telefone && (
          <View style={styles.itemDetails}>
            <MaterialCommunityIcons name="phone-outline" size={16} color={theme.colors.placeholder} />
            <Text style={styles.itemDetailsText}>{item.telefone}</Text>
          </View>
        )}
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => navigation.navigate('EditarCliente', { clienteId: item.id })} disabled={isProcessing === item.id}>
          <MaterialCommunityIcons name="pencil-outline" size={18} color={theme.colors.primary} />
          <Text style={[styles.actionButtonText, styles.editText]}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => confirmarDelecaoCliente(item.id, item.nome)} disabled={isProcessing === item.id}>
          {isProcessing === item.id ?
            <ActivityIndicator size="small" color={theme.colors.error} /> :
            <>
              <MaterialCommunityIcons name="delete-outline" size={18} color={theme.colors.error} />
              <Text style={[styles.actionButtonText, styles.deleteText]}>Deletar</Text>
            </>
          }
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.centered}>
      <Text style={styles.emptyDataText}>
        {termoPesquisaAtivo ? `Nenhum cliente encontrado para "${termoPesquisaAtivo}".` : 'Nenhum cliente cadastrado.'}
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );

  const renderList = () => {
    if (isLoading && clientes.length === 0) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }
    if (error) {
      return renderErrorState();
    }
    return (
      <FlatList
        data={clientes}
        renderItem={renderItem}
        keyExtractor={(item) => `cliente-${item.id}`}
        ListEmptyComponent={renderEmptyState}
        onRefresh={handleRefresh}
        refreshing={isLoading}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isLoadingMore ? <ActivityIndicator style={{ margin: 20 }} size="large" color={theme.colors.primary} /> : null}
        contentContainerStyle={{ paddingBottom: 20 }}
        // Adiciona propriedade para não fechar o teclado ao rolar
        keyboardShouldPersistTaps="handled"
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* O cabeçalho e a pesquisa agora ficam fora da FlatList */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lista de Clientes</Text>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={24} color={theme.colors.placeholder} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar cliente por nome..."
            value={termoPesquisaInput}
            onChangeText={setTermoPesquisaInput}
            returnKeyType="search"
            placeholderTextColor={theme.colors.placeholder}
          />
        </View>
      </View>

      {renderList()}
    </View>
  );
}