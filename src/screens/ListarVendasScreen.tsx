import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native'; // Adicionado TextInput para futura pesquisa
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { styles as listarVendasStyles } from './stylesListarVendas'; // Seus estilos
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Cliente } from './ListarClientesScreen';
import { Produto } from './ListarMercadoriasScreen';

// Interface para ItemVenda como vem do backend
interface ItemVenda {
  id: number;
  produto: Produto;
  quantidadeVendida: number;
  precoUnitario: number;
}

// Interface para Venda como vem do backend
export interface Venda {
  id: number;
  cliente: Cliente | null;
  itens: ItemVenda[];
  totalVenda: number;
  dataVenda: string; // Data como string ISO
}

// Interface para a resposta paginada da API
interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // Número da página atual (0-indexed)
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

const API_BASE_URL = 'http://192.168.1.5:8080';
const PAGE_SIZE = 10; // Quantas vendas carregar por página

type ListarVendasNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListarVendas'>;

export default function ListarVendasScreen() {
  const navigation = useNavigation<ListarVendasNavigationProp>();
  
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [isLoading, setIsLoading] = useState(false); 
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // const [isDeleting, setIsDeleting] = useState<number | null>(null); // Para futura deleção
  const [error, setError] = useState<string | null>(null);
  
  const currentPageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const isFetchingRef = useRef(false);

  // Estados para futura pesquisa (ex: por nome do cliente ou ID da venda)
  // const [termoPesquisaInput, setTermoPesquisaInput] = useState(''); 
  // const [termoPesquisaAtivo, setTermoPesquisaAtivo] = useState(''); 

  const fetchVendas = useCallback(async (pageToFetch: number, /*searchTerm: string,*/ isNewSearchOrRefresh: boolean) => {
    if (isFetchingRef.current && !isNewSearchOrRefresh) {
      console.log(`fetchVendas: SKIP - Já buscando. Page: ${pageToFetch}`);
      return;
    }
    if (!isNewSearchOrRefresh && !hasMoreRef.current) {
      console.log(`fetchVendas: SKIP - Não há mais páginas. Page: ${pageToFetch}`);
      setIsLoadingMore(false);
      return;
    }

    isFetchingRef.current = true;
    console.log(`FETCHING VENDAS: page ${pageToFetch}, newSearch/Refresh: ${isNewSearchOrRefresh}`);
    if (isNewSearchOrRefresh) setIsLoading(true); else setIsLoadingMore(true);
    if (isNewSearchOrRefresh) setError(null);

    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) throw new Error("Token não encontrado.");

      // Assumindo que o backend /vendas agora aceita paginação e ordenação
      // Ordenando pela data da venda, mais recentes primeiro
      let url = `${API_BASE_URL}/vendas?page=${pageToFetch}&size=${PAGE_SIZE}&sortBy=dataVenda&sortDir=desc`;
      // if (searchTerm.trim() !== '') { // Para futura pesquisa
      //   url += `&filtro=${encodeURIComponent(searchTerm.trim())}`; // Ajuste o nome do parâmetro de filtro
      // }

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
            else if (err.response.data?.message) errorMessage = err.response.data.message;
        } else if (err.message) errorMessage = err.message;
      setError(errorMessage);
      if (isNewSearchOrRefresh || pageToFetch === 0) setVendas([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, []); // useCallback sem dependências problemáticas

  // Efeito para debounce (se implementar pesquisa)
  // useEffect(() => { ... }, [termoPesquisaInput, termoPesquisaAtivo]);

  // Efeito para buscar quando termoPesquisaAtivo mudar (se implementar pesquisa)
  // useEffect(() => {
  //   currentPageRef.current = 0; 
  //   hasMoreRef.current = true;
  //   fetchVendas(0, termoPesquisaAtivo, true);
  // }, [termoPesquisaAtivo, fetchVendas]);

  useFocusEffect(
    useCallback(() => {
      console.log("useFocusEffect: Tela ListarVendas ganhou foco.");
      currentPageRef.current = 0;
      hasMoreRef.current = true;
      // setVendas([]); // fetchVendas com isNewSearchOrRefresh=true lida com isso
      fetchVendas(0 /*termoPesquisaAtivo*/, true); // "" para termo de pesquisa inicial
      return () => {};
    }, [fetchVendas /*, termoPesquisaAtivo*/]) // Adicionar termoPesquisaAtivo se/quando a pesquisa for implementada
  );
  
  const handleLoadMore = () => {
    if (!isFetchingRef.current && hasMoreRef.current) {
      console.log("handleLoadMore Vendas: Carregando próxima página:", currentPageRef.current + 1);
      fetchVendas(currentPageRef.current + 1, false);
    }
  };

  const handleRefresh = () => {
    console.log("handleRefresh Vendas: Puxou para atualizar.");
    currentPageRef.current = 0;
    hasMoreRef.current = true;
    fetchVendas(0, true);
  };
  
  // const handleSearchSubmit = () => { ... }; // Se implementar pesquisa

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
      {item.cliente ? (
        <Text style={listarVendasStyles.customerName}>Cliente: {item.cliente.nome}</Text>
      ) : (
        <Text style={listarVendasStyles.customerName}>Cliente: Não informado</Text>
      )}
      <Text style={listarVendasStyles.itemsTitle}>Itens ({item.itens.length}):</Text>
      {item.itens.slice(0, 3).map(itemVenda => ( // Mostra no máximo 3 itens na prévia
        <Text key={itemVenda.id.toString()} style={listarVendasStyles.itemDetailText}>
          - {itemVenda.quantidadeVendida}x {itemVenda.produto.nome} (R$ {itemVenda.precoUnitario.toFixed(2)})
        </Text>
      ))}
      {item.itens.length > 3 && <Text style={listarVendasStyles.itemDetailText}>  ...e mais {item.itens.length - 3} item(ns)</Text>}
      <Text style={listarVendasStyles.totalSale}>Total: R$ {item.totalVenda.toFixed(2)}</Text>
      {/* Adicionar aqui botões para "Ver Detalhes" ou "Deletar Venda" se necessário */}
    </View>
  );

  if (isLoading && vendas.length === 0 && currentPageRef.current === 0 && !error) {
    return (
      <View style={listarVendasStyles.container}>
        <Text style={listarVendasStyles.headerTitle}>Histórico de Vendas</Text>
        {/* Adicionar TextInput para pesquisa aqui no futuro */}
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
          {/* Adicionar TextInput para pesquisa aqui no futuro */}
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
      {/* <TextInput
        style={listarVendasStyles.searchInput} // Adicionar este estilo se implementar pesquisa
        placeholder="Pesquisar vendas..."
        value={termoPesquisaInput}
        onChangeText={setTermoPesquisaInput}
        onSubmitEditing={handleSearchSubmit}
        returnKeyType="search"
      />
      */}
      <FlatList
        data={vendas}
        renderItem={renderVendaItem}
        keyExtractor={(item) => `venda-${item.id.toString()}`} // Chave prefixada
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
                        {/* {termoPesquisaAtivo ? `para "${termoPesquisaAtivo}".` : 'registrada.'} */}
                    </Text>
                </View>
            ) : null
        }
      />
    </View>
  );
}