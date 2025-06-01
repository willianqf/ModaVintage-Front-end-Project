import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { styles as listarVendasStyles } from './stylesListarVendas';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; //

// Interfaces atualizadas para refletir os campos de snapshot do backend

// Interface base para Produto (pode ser mais completa se necessário)
interface ProdutoSnapshotInfo {
  id: number; // ID do produto original
  nome?: string; // Nome atual do produto original (pode estar desatualizado ou de um produto inativo)
  ativo?: boolean; // Status atual do produto original
  // Adicione outros campos do produto original se precisar acessá-los diretamente
}

// Interface base para Cliente (pode ser mais completa se necessário)
interface ClienteSnapshotInfo {
  id: number; // ID do cliente original
  nome?: string; // Nome atual do cliente original
  ativo?: boolean; // Status atual do cliente original
  // Adicione outros campos do cliente original se precisar acessá-los
}

interface ItemVenda {
  id: number;
  produto: ProdutoSnapshotInfo | null; // Link para o produto original (pode estar inativo)
  quantidadeVendida: number; // No backend, este campo é 'quantidade' em ItemVenda.java
                               // Se o payload do frontend envia 'quantidadeVendida', certifique-se que o backend o mapeia para 'quantidade'
                               // Ou alinhe os nomes. Assumindo que o backend retorna 'quantidade'.
  quantidade: number; // Usando 'quantidade' conforme ItemVenda.java

  // Campos de Snapshot do Produto (do momento da venda)
  precoUnitarioSnapshot: number;
  nomeProdutoSnapshot: string;
  tamanhoSnapshot?: string;
  categoriaSnapshot?: string;
  // subtotal: number; // O subtotal pode ser calculado no frontend ou vir do backend
}

export interface Venda {
  id: number;
  cliente: ClienteSnapshotInfo | null; // Link para o cliente original (pode estar inativo)
  itens: ItemVenda[];
  totalVenda: number;
  dataVenda: string; // Data como string ISO

  // Campos de Snapshot do Cliente (do momento da venda)
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

const API_BASE_URL = 'http://192.168.1.5:8080';
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
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) throw new Error("Token não encontrado.");

      let url = `${API_BASE_URL}/vendas?page=${pageToFetch}&size=${PAGE_SIZE}&sort=dataVenda,desc`; // Mais recentes primeiro

      const response = await axios.get<PaginatedResponse<Venda>>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
      console.error("Erro ao buscar vendas:", JSON.stringify(err.response?.data || err.message));
      let errorMessage = "Não foi possível carregar o histórico de vendas.";
       if (axios.isAxiosError(err) && err.response) {
            if (err.response.status === 401 || err.response.status === 403) errorMessage = "Sessão expirada ou token inválido.";
            else if (err.response.data?.erro) errorMessage = err.response.data.erro; // Usar a chave 'erro' se vier do backend
            else if (err.response.data?.message) errorMessage = err.response.data.message;
        } else if (err.message) errorMessage = err.message;
      setError(errorMessage);
      if (isNewSearchOrRefresh || pageToFetch === 0) setVendas([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [error]); // Removido 'error' da dependência para evitar loops se o erro não for resetado corretamente em alguns fluxos.
               // O erro é resetado no início da função 'fetchVendas' quando 'isNewSearchOrRefresh' é true.

  useFocusEffect(
    useCallback(() => {
      currentPageRef.current = 0;
      hasMoreRef.current = true;
      fetchVendas(0, true);
      return () => {};
    }, [fetchVendas]) 
  );
  
  const handleLoadMore = () => {
    if (!isFetchingRef.current && hasMoreRef.current) {
      fetchVendas(currentPageRef.current + 1, false);
    }
  };

  const handleRefresh = () => {
    currentPageRef.current = 0;
    hasMoreRef.current = true;
    fetchVendas(0, true);
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
    if (!hasMoreRef.current && vendas.length > 0) {
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
      
      {/* Usar nomeClienteSnapshot. Se for nulo, pode indicar "Cliente Não Informado" ou similar */}
      <Text style={listarVendasStyles.customerName}>
        Cliente: {item.nomeClienteSnapshot || 'Não informado'}
      </Text>
      
      <Text style={listarVendasStyles.itemsTitle}>Itens ({item.itens.length}):</Text>
      {item.itens.slice(0, 3).map(itemVenda => (
        <Text key={itemVenda.id.toString()} style={listarVendasStyles.itemDetailText}>
          {/* Usar campos de snapshot do produto */}
          - {itemVenda.quantidade}x {itemVenda.nomeProdutoSnapshot} (R$ {itemVenda.precoUnitarioSnapshot.toFixed(2)})
          {itemVenda.tamanhoSnapshot ? ` - Tam: ${itemVenda.tamanhoSnapshot}` : ''}
          {itemVenda.categoriaSnapshot ? ` - Cat: ${itemVenda.categoriaSnapshot}` : ''}
        </Text>
      ))}
      {item.itens.length > 3 && <Text style={listarVendasStyles.itemDetailText}>  ...e mais {item.itens.length - 3} item(ns)</Text>}
      <Text style={listarVendasStyles.totalSale}>Total: R$ {item.totalVenda.toFixed(2)}</Text>
    </View>
  );

  if (isLoading && vendas.length === 0 && currentPageRef.current === 0 && !error) {
    return (
      <View style={listarVendasStyles.container}>
        <Text style={listarVendasStyles.headerTitle}>Histórico de Vendas</Text>
        <View style={listarVendasStyles.centered}>
          <ActivityIndicator size="large" color="#323588"/>
          <Text style={listarVendasStyles.loadingText}>Carregando histórico...</Text>
        </View>
      </View>
    );
  }
  
  if (error && vendas.length === 0 && !isLoading) {
      return (
        <View style={listarVendasStyles.container}>
          <Text style={listarVendasStyles.headerTitle}>Histórico de Vendas</Text>
          <View style={listarVendasStyles.centered}>
            <Text style={listarVendasStyles.errorText}>Erro ao carregar: {error}</Text>
            <TouchableOpacity style={listarVendasStyles.retryButton} onPress={() => fetchVendas(0, true)}>
              <Text style={listarVendasStyles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
  }

  return (
    <View style={listarVendasStyles.container}>
      <Text style={listarVendasStyles.headerTitle}>Histórico de Vendas</Text>
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
    </View>
  );
}