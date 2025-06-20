import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, TextInput, Image } from 'react-native';
import { styles } from './stylesListarMercadorias';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../global/themes';

// --- Interfaces ---
export interface Produto {
  id: number;
  nome: string;
  precoCusto?: number;
  preco: number;
  estoque: number;
  tamanho?: string;
  categoria?: string;
  dataCadastro?: string;
  imagemUri?: string; 
}
interface PaginatedResponse<T> { content: T[]; last: boolean; number: number; }

const PAGE_SIZE = 10;
type ListarMercadoriasNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListarMercadorias'>;

// --- Funções Auxiliares de Formatação ---
const formatarMoeda = (valor?: number) => {
    if (valor === undefined || valor === null) return 'N/A';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export default function ListarMercadoriasScreen() {
  // --- Lógica de Estado e Hooks (sem alterações) ---
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

  // --- Lógica de Busca e Manipulação de Dados (sem alterações) ---
  const fetchProdutos = useCallback(async (pageToFetch: number, searchTerm: string, isNewSearchOrRefresh: boolean) => {
    if (isFetchingRef.current && !isNewSearchOrRefresh) return;
    if (!isNewSearchOrRefresh && !hasMoreRef.current) { setIsLoadingMore(false); return; }

    isFetchingRef.current = true;
    if (isNewSearchOrRefresh) setIsLoading(true); else setIsLoadingMore(true);
    if (isNewSearchOrRefresh) setError(null);

    try {
        const params: Record<string, string | number> = { page: pageToFetch, size: PAGE_SIZE, sort: 'nome,asc' };
        if (searchTerm.trim() !== '') params.nome = searchTerm.trim();
        const response = await axiosInstance.get<PaginatedResponse<Produto>>('/produtos', { params });
        if (response.data && response.data.content) {
            setProdutos(prev => (isNewSearchOrRefresh || pageToFetch === 0) ? response.data.content : [...prev, ...response.data.content]);
            hasMoreRef.current = !response.data.last;
            currentPageRef.current = response.data.number;
        } else {
            if (isNewSearchOrRefresh || pageToFetch === 0) setProdutos([]);
            hasMoreRef.current = false;
        }
    } catch (err: any) {
        if (axios.isAxiosError(err)) {
            setError(err.response?.data?.message || "Não foi possível carregar as mercadorias.");
        } else {
            setError("Ocorreu um erro desconhecido.");
        }
        if (isNewSearchOrRefresh || pageToFetch === 0) setProdutos([]);
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
    fetchProdutos(0, termoPesquisaAtivo, true);
  }, [termoPesquisaAtivo, fetchProdutos]);

  useFocusEffect(useCallback(() => {
    currentPageRef.current = 0; hasMoreRef.current = true;
    fetchProdutos(0, termoPesquisaAtivo, true);
  }, [termoPesquisaAtivo, fetchProdutos]));

  const handleLoadMore = () => { if (!isFetchingRef.current && hasMoreRef.current && !isLoadingMore) fetchProdutos(currentPageRef.current + 1, termoPesquisaAtivo, false); };
  const handleRefresh = () => { currentPageRef.current = 0; hasMoreRef.current = true; fetchProdutos(0, termoPesquisaAtivo, true); };
  const confirmarDelecao = (id: number, nome: string) => Alert.alert("Confirmar Deleção", `Tem certeza que deseja deletar "${nome}"?`, [{ text: "Cancelar", style: "cancel" }, { text: "Deletar", onPress: () => handleDeletarProduto(id), style: "destructive" }]);
  
  const handleDeletarProduto = async (id: number) => {
    setIsDeleting(id);
    try {
        await axiosInstance.delete(`/produtos/${id}`);
        Alert.alert("Sucesso", "Mercadoria deletada!");
        handleRefresh();
    } catch (error: any) {
        Alert.alert("Erro", "Não foi possível deletar a mercadoria.");
    } finally {
        setIsDeleting(null);
    }
  };

  // --- Componentes de Renderização com novo visual ---
  const renderItem = ({ item }: { item: Produto }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => navigation.navigate('EditarMercadoria', { produtoId: item.id })}>
      {/* Imagem do Produto */}
      {item.imagemUri ? 
        <Image source={{ uri: item.imagemUri }} style={styles.image} /> :
        <View style={styles.image}><MaterialCommunityIcons name="image-off-outline" size={32} color={theme.colors.placeholder} /></View>
      }
      {/* Detalhes do Produto */}
      <View style={styles.detailsContainer}>
        <Text style={styles.itemName} numberOfLines={1}>{item.nome} {item.tamanho ? `- ${item.tamanho}` : ''}</Text>
        <Text style={styles.itemDetails}>Categoria: <Text style={styles.itemDetailsBold}>{item.categoria || 'N/A'}</Text></Text>
          <Text style={styles.itemDetails}>Preço Custo: <Text style={styles.itemDetailsBold}>{formatarMoeda(item.estoque)}</Text></Text>
        <Text style={styles.itemDetails}>Preço Venda: <Text style={styles.itemDetailsBold}>{formatarMoeda(item.preco)}</Text></Text>
        <Text style={styles.itemDetails}>Estoque: <Text style={styles.itemDetailsBold}>{item.estoque}</Text></Text>
        <View style={styles.statusContainer}>
         <Text style={styles.itemDetails}>Status: <Text style={item.estoque > 0 ? styles.statusDisponivel : styles.statusVendido}>
                {item.estoque > 0 ? 'Disponível' : 'Sem Estoque'}
            </Text></Text>
        </View>
      </View>
      {/* Botão de Deletar */}
      <TouchableOpacity style={styles.deleteButton} onPress={() => confirmarDelecao(item.id, item.nome)} disabled={isDeleting === item.id}>
        {isDeleting === item.id ? 
            <ActivityIndicator size="small" color={theme.colors.error} /> : 
            <MaterialCommunityIcons name="trash-can-outline" size={22} color={theme.colors.error} />
        }
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderListContent = () => {
    if (isLoading && produtos.length === 0) {
      return (<View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /></View>);
    }
    if (error && produtos.length === 0) {
      return (<View style={styles.centered}><Text style={styles.errorText}>{error}</Text><TouchableOpacity style={styles.retryButton} onPress={handleRefresh}><Text style={styles.retryButtonText}>Tentar Novamente</Text></TouchableOpacity></View>);
    }
    return (
      <FlatList
        data={produtos}
        renderItem={renderItem}
        keyExtractor={(item) => `produto-${item.id}`}
        ListEmptyComponent={!isLoading ? (<View style={styles.centered}><Text style={styles.emptyDataText}>{termoPesquisaAtivo ? `Nenhuma mercadoria encontrada para "${termoPesquisaAtivo}".` : 'Nenhuma mercadoria cadastrada.'}</Text></View>) : null}
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
      {/* Cabeçalho e Pesquisa fora da FlatList */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lista de Mercadorias</Text>
        <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={24} color={theme.colors.placeholder} />
            <TextInput
                style={styles.searchInput}
                placeholder="Pesquisar mercadoria por nome..."
                value={termoPesquisaInput}
                onChangeText={setTermoPesquisaInput}
                returnKeyType="search"
                placeholderTextColor={theme.colors.placeholder}
            />
        </View>
      </View>
      {renderListContent()}
    </View>
  );
}
