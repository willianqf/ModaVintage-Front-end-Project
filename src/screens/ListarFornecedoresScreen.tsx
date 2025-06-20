import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
import { styles } from './stylesListarFornecedores';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../global/themes';

// --- Interfaces (usando a versão original do seu código) ---
export interface Fornecedor {
  id: number;
  nome: string;
  cnpj?: string;
  contato?: string;
}
interface PaginatedResponse<T> { content: T[]; last: boolean; number: number; }

const PAGE_SIZE = 10;
type ListarFornecedoresNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListarFornecedores'>;

export default function ListarFornecedoresScreen() {
  // --- Lógica de Estado e Hooks (sem alterações) ---
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

  // --- Lógica de Busca e Manipulação de Dados (mantida do seu código original) ---
  const fetchFornecedores = useCallback(async (pageToFetch: number, searchTerm: string, isNewSearchOrRefresh: boolean) => {
    if (isFetchingRef.current && !isNewSearchOrRefresh) return;
    if (!isNewSearchOrRefresh && !hasMoreRef.current) { setIsLoadingMore(false); return; }

    isFetchingRef.current = true;
    if (isNewSearchOrRefresh) setIsLoading(true); else setIsLoadingMore(true);
    if (isNewSearchOrRefresh) setError(null);

    try {
      const params: Record<string, string | number> = {
        page: pageToFetch,
        size: PAGE_SIZE,
        sort: 'nome,ASC',
      };
      if (searchTerm.trim() !== '') {
        params.nome = searchTerm.trim();
      }

      const response = await axiosInstance.get<PaginatedResponse<Fornecedor>>('/fornecedores', { params });
      if (response.data && response.data.content) {
        setFornecedores(prev => (isNewSearchOrRefresh || pageToFetch === 0) ? response.data.content : [...prev, ...response.data.content]);
        hasMoreRef.current = !response.data.last;
        currentPageRef.current = response.data.number;
      } else {
        if (isNewSearchOrRefresh || pageToFetch === 0) setFornecedores([]);
        hasMoreRef.current = false;
      }
    } catch (err: any) {
      console.error("ListarFornecedoresScreen: Erro ao buscar fornecedores:", JSON.stringify(err.response?.data || err.message));
      if (axios.isAxiosError(err)) {
        if (err.response && err.response.status !== 401) {
          setError(err.response.data?.erro || err.response.data?.message || "Não foi possível carregar os fornecedores.");
        } else if (!err.response) {
          setError("Erro de conexão.");
        }
      } else {
        setError("Ocorreu um erro desconhecido.");
      }
      if (isNewSearchOrRefresh || pageToFetch === 0) setFornecedores([]);
    } finally {
      setIsLoading(false); setIsLoadingMore(false); isFetchingRef.current = false;
    }
  }, [error]);

  useEffect(() => {
    const handler = setTimeout(() => { if (termoPesquisaInput !== termoPesquisaAtivo) setTermoPesquisaAtivo(termoPesquisaInput); }, 800);
    return () => clearTimeout(handler);
  }, [termoPesquisaInput, termoPesquisaAtivo]);

  useEffect(() => {
    currentPageRef.current = 0; hasMoreRef.current = true;
    fetchFornecedores(0, termoPesquisaAtivo, true);
  }, [termoPesquisaAtivo, fetchFornecedores]);

  useFocusEffect(useCallback(() => {
    currentPageRef.current = 0; hasMoreRef.current = true;
    fetchFornecedores(0, termoPesquisaAtivo, true);
  }, [termoPesquisaAtivo, fetchFornecedores]));

  const handleLoadMore = () => { if (!isFetchingRef.current && hasMoreRef.current && !isLoadingMore) fetchFornecedores(currentPageRef.current + 1, termoPesquisaAtivo, false); };
  const handleRefresh = () => { currentPageRef.current = 0; hasMoreRef.current = true; fetchFornecedores(0, termoPesquisaAtivo, true); };

  const confirmarDelecao = (id: number, nome: string) => Alert.alert("Confirmar Deleção", `Tem certeza que deseja deletar o fornecedor "${nome}"?`, [{ text: "Cancelar", style: "cancel" }, { text: "Deletar", onPress: () => handleDeletar(id), style: "destructive" }]);

  const handleDeletar = async (id: number) => {
    setIsDeleting(id);
    try {
      await axiosInstance.delete(`/fornecedores/${id}`);
      Alert.alert("Sucesso", "Fornecedor deletado com sucesso!");
      handleRefresh();
    } catch (error: any) {
      Alert.alert("Erro ao Deletar", "Não foi possível deletar o fornecedor.");
    } finally {
      setIsDeleting(null);
    }
  };

  // --- Componentes de Renderização com novo visual ---
  const renderItem = ({ item }: { item: Fornecedor }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.nome}</Text>
        {item.cnpj && (
          <View style={styles.itemDetails}>
            <MaterialCommunityIcons name="card-account-details-outline" size={16} color={theme.colors.placeholder} />
            <Text style={styles.itemDetailsText}>CNPJ: {item.cnpj}</Text>
          </View>
        )}
        {item.contato && (
          <View style={styles.itemDetails}>
            <MaterialCommunityIcons name="phone-outline" size={16} color={theme.colors.placeholder} />
            <Text style={styles.itemDetailsText}>{item.contato}</Text>
          </View>
        )}
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => navigation.navigate('EditarFornecedor', { fornecedorId: item.id })} disabled={isDeleting === item.id}>
          <MaterialCommunityIcons name="pencil-outline" size={18} color={theme.colors.primary} />
          <Text style={[styles.actionButtonText, styles.editText]}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => confirmarDelecao(item.id, item.nome)} disabled={isDeleting === item.id}>
          {isDeleting === item.id ?
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

  const renderListContent = () => {
    // Tela de Carregamento inicial
    if (isLoading && fornecedores.length === 0) {
      return (<View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /></View>);
    }
    // Tela de Erro
    if (error && fornecedores.length === 0) {
      return (<View style={styles.centered}><Text style={styles.errorText}>{error}</Text><TouchableOpacity style={styles.retryButton} onPress={handleRefresh}><Text style={styles.retryButtonText}>Tentar Novamente</Text></TouchableOpacity></View>);
    }
    // Lista de Fornecedores
    return (
      <FlatList
        data={fornecedores}
        renderItem={renderItem}
        keyExtractor={(item) => `fornecedor-${item.id}`}
        ListEmptyComponent={!isLoading ? (<View style={styles.centered}><Text style={styles.emptyDataText}>{termoPesquisaAtivo ? `Nenhum fornecedor encontrado para "${termoPesquisaAtivo}".` : 'Nenhum fornecedor cadastrado.'}</Text></View>) : null}
        onRefresh={handleRefresh}
        refreshing={isLoading}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isLoadingMore ? <ActivityIndicator style={{ margin: 20 }} size="large" color={theme.colors.primary} /> : null}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho e Pesquisa fora da FlatList para corrigir o problema do teclado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lista de Fornecedores</Text>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={24} color={theme.colors.placeholder} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por nome..."
            value={termoPesquisaInput}
            onChangeText={setTermoPesquisaInput}
            returnKeyType="search"
            placeholderTextColor={theme.colors.placeholder}
          />
        </View>
      </View>

      {/* Renderiza o conteúdo da lista (ou estados de loading/erro) */}
      {renderListContent()}
    </View>
  );
}