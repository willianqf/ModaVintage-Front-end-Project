import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
// import axios from 'axios'; // REMOVA esta linha
// import * as SecureStore from 'expo-secure-store'; // Não é mais necessário aqui
import { styles as listarVendasStyles } from './stylesListarVendas'; //
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

// Importe a instância configurada do Axios e o helper isAxiosError
import axiosInstance from '../api/axiosInstance'; // Ajuste o caminho se necessário
import axios from 'axios'; // Para usar axios.isAxiosError

// --- Interfaces (mantidas como no seu arquivo original) ---
interface ProdutoSnapshotInfo {
  id: number;
  nome?: string;
  ativo?: boolean;
}

interface ClienteSnapshotInfo {
  id: number;
  nome?: string;
  ativo?: boolean;
}

interface ItemVenda {
  id: number;
  produto: ProdutoSnapshotInfo | null;
  quantidadeVendida: number; // Frontend usa este nome
  quantidade: number; // Backend usa este nome, alinhado com ItemVenda.java
  precoUnitarioSnapshot: number;
  nomeProdutoSnapshot: string;
  tamanhoSnapshot?: string;
  categoriaSnapshot?: string;
}

export interface Venda {
  id: number;
  cliente: ClienteSnapshotInfo | null;
  itens: ItemVenda[];
  totalVenda: number;
  dataVenda: string; // Data como string ISO
  nomeClienteSnapshot: string | null;
  emailClienteSnapshot?: string | null;
  telefoneClienteSnapshot?: string | null;
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
// --- Fim das Interfaces ---

// const API_BASE_URL = 'http://192.168.1.5:8080'; // Não é mais necessário
const PAGE_SIZE = 10;

type ListarVendasNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListarVendas'>;

export default function ListarVendasScreen() {
  const navigation = useNavigation<ListarVendasNavigationProp>();

  const [vendas, setVendas] = useState<Venda[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const isFetchingRef = useRef(false);

  const fetchVendas = useCallback(async (pageToFetch: number, isNewSearchOrRefresh: boolean) => {
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
        sort: 'dataVenda,desc', // Mais recentes primeiro, conforme VendaController
      };

      // Use axiosInstance
      const response = await axiosInstance.get<PaginatedResponse<Venda>>('/vendas', { params });

      if (response.data && response.data.content) {
        setVendas(prevVendas =>
          (isNewSearchOrRefresh || pageToFetch === 0) ? response.data.content : [...prevVendas, ...response.data.content]
        );
        hasMoreRef.current = !response.data.last;
        currentPageRef.current = response.data.number;
      } else {
        if (isNewSearchOrRefresh || pageToFetch === 0) setVendas([]);
        hasMoreRef.current = false;
      }
      if (error && (isNewSearchOrRefresh || pageToFetch === 0)) setError(null);

    } catch (err: any) {
      console.error("ListarVendasScreen: Erro ao buscar vendas:", JSON.stringify(err.response?.data || err.message));
      if (axios.isAxiosError(err)) {
        if (err.response && err.response.status !== 401) {
          const apiErrorMessage = err.response.data?.erro || err.response.data?.message || "Não foi possível carregar o histórico de vendas.";
          setError(apiErrorMessage);
        } else if (!err.response) {
          setError("Erro de conexão ao buscar histórico de vendas.");
        }
      } else {
        setError("Ocorreu um erro desconhecido ao buscar o histórico de vendas.");
      }
      if (isNewSearchOrRefresh || pageToFetch === 0) setVendas([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [error]);

  useFocusEffect(
    useCallback(() => {
      currentPageRef.current = 0;
      hasMoreRef.current = true;
      fetchVendas(0, true); // true para isNewSearchOrRefresh
      return () => {};
    }, [fetchVendas]) // fetchVendas agora é estável
  );

  const handleLoadMore = () => {
    if (!isFetchingRef.current && hasMoreRef.current && !isLoadingMore) {
      fetchVendas(currentPageRef.current + 1, false); // false para isNewSearchOrRefresh
    }
  };

  const handleRefresh = () => {
    currentPageRef.current = 0;
    hasMoreRef.current = true;
    fetchVendas(0, true); // true para isNewSearchOrRefresh
  };

  const formatarData = (dataISO: string) => {
    if (!dataISO) return 'Data indisponível';
    try {
      return new Date(dataISO).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) { return dataISO; }
  };

  const renderFooter = (): React.ReactElement | null => {
    if (isLoadingMore) {
      return <View style={{ paddingVertical: 20 }}><ActivityIndicator size="large" color="#323588" /></View>;
    }
    if (!hasMoreRef.current && vendas.length > 0 && !isLoading && !error) {
      return <View style={{ paddingVertical: 20 }}><Text style={listarVendasStyles.emptyDataText}>Fim do histórico de vendas.</Text></View>;
    }
    return null;
  };

  const renderVendaItem = ({ item }: { item: Venda }) => (
    <View style={listarVendasStyles.itemContainer}>
      <View style={listarVendasStyles.itemHeader}>
        <Text style={listarVendasStyles.saleId}>Venda ID: {item.id}</Text>
        <Text style={listarVendasStyles.saleDate}>{formatarData(item.dataVenda)}</Text>
      </View>
      <Text style={listarVendasStyles.customerName}>
        Cliente: {item.nomeClienteSnapshot || 'Não informado'}
      </Text>
      <Text style={listarVendasStyles.itemsTitle}>Itens ({item.itens.length}):</Text>
      {item.itens.slice(0, 3).map(itemVenda => (
        <Text key={itemVenda.id.toString()} style={listarVendasStyles.itemDetailText}>
          - {itemVenda.quantidade || itemVenda.quantidadeVendida}x {itemVenda.nomeProdutoSnapshot} (R$ {itemVenda.precoUnitarioSnapshot.toFixed(2)})
          {itemVenda.tamanhoSnapshot ? ` - Tam: ${itemVenda.tamanhoSnapshot}` : ''}
          {itemVenda.categoriaSnapshot ? ` - Cat: ${itemVenda.categoriaSnapshot}` : ''}
        </Text>
      ))}
      {item.itens.length > 3 && <Text style={listarVendasStyles.itemDetailText}>  ...e mais {item.itens.length - 3} item(ns)</Text>}
      <Text style={listarVendasStyles.totalSale}>Total: R$ {item.totalVenda.toFixed(2)}</Text>
    </View>
  );
  
  const showInitialLoading = isLoading && vendas.length === 0 && currentPageRef.current === 0 && !error;
  const showErrorScreen = error && vendas.length === 0 && !isLoading;

  return (
    <View style={listarVendasStyles.container}>
      <Text style={listarVendasStyles.headerTitle}>Histórico de Vendas</Text>
      {showInitialLoading ? (
        <View style={listarVendasStyles.centered}>
          <ActivityIndicator size="large" color="#323588" />
          <Text style={listarVendasStyles.loadingText}>Carregando histórico...</Text>
        </View>
      ) : showErrorScreen ? (
        <View style={listarVendasStyles.centered}>
          <Text style={listarVendasStyles.errorText}>{error}</Text>
          <TouchableOpacity style={listarVendasStyles.retryButton} onPress={handleRefresh}>
            <Text style={listarVendasStyles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={vendas}
          renderItem={renderVendaItem}
          keyExtractor={(item) => `venda-${item.id.toString()}`}
          contentContainerStyle={listarVendasStyles.listContentContainer}
          onRefresh={handleRefresh}
          refreshing={isLoading && currentPageRef.current === 0 && !isLoadingMore}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            !isLoading && !error && vendas.length === 0 ? (
              <View style={listarVendasStyles.centered}>
                <Text style={listarVendasStyles.emptyDataText}>
                  Nenhuma venda registrada.
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}