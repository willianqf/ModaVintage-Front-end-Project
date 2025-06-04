import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
// import axios from 'axios'; // REMOVA esta linha
// import * as SecureStore from 'expo-secure-store'; // Não é mais necessário aqui
import { styles as listarClientesStyles } from './stylesListarClientes'; //
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

// Importe a instância configurada do Axios e o helper isAxiosError
import axiosInstance from '../api/axiosInstance'; // Ajuste o caminho se necessário
import axios from 'axios'; // Para usar axios.isAxiosError

export interface Cliente {
  id: number;
  nome: string;
  telefone?: string;
  email?: string;
  // O campo 'ativo' não é geralmente retornado pela API para listagens de ativos,
  // mas se for, pode ser incluído aqui. O backend filtra por ativo=true.
}

interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // Página atual (base 0)
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// const API_BASE_URL = 'http://192.168.1.5:8080'; // Não é mais necessário
const PAGE_SIZE = 10;

type ListarClientesNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListarClientes'>;

export default function ListarClientesScreen() {
  const navigation = useNavigation<ListarClientesNavigationProp>();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isProcessing, setIsProcessing] = useState<number | null>(null); // Para feedback de deleção/edição
  const [error, setError] = useState<string | null>(null);

  const currentPageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const isFetchingRef = useRef(false);

  const [termoPesquisaInput, setTermoPesquisaInput] = useState('');
  const [termoPesquisaAtivo, setTermoPesquisaAtivo] = useState('');

  const fetchClientes = useCallback(async (pageToFetch: number, searchTerm: string, isNewSearchOrRefresh: boolean) => {
    if (isFetchingRef.current && !isNewSearchOrRefresh) {
      console.log("ListarClientesScreen: Fetch em andamento, retornando.");
      return;
    }
    if (!isNewSearchOrRefresh && !hasMoreRef.current) {
      console.log("ListarClientesScreen: Sem mais páginas para carregar.");
      setIsLoadingMore(false);
      return;
    }

    isFetchingRef.current = true;
    console.log(`ListarClientesScreen: Buscando clientes - Página: ${pageToFetch}, Termo: "${searchTerm}", Novo/Refresh: ${isNewSearchOrRefresh}`);
    if (isNewSearchOrRefresh) setIsLoading(true); else setIsLoadingMore(true);
    if (isNewSearchOrRefresh) setError(null);

    try {
      // O token será adicionado automaticamente pelo interceptor do axiosInstance
      const params: Record<string, string | number> = {
        page: pageToFetch,
        size: PAGE_SIZE,
        sort: 'nome,asc', // Ordenar por nome ascendentemente
      };
      if (searchTerm.trim() !== '') {
        params.nome = searchTerm.trim();
      }

      // Use axiosInstance
      const response = await axiosInstance.get<PaginatedResponse<Cliente>>('/clientes', { params });

      if (response.data && response.data.content) {
        setClientes(prevClientes =>
          (isNewSearchOrRefresh || pageToFetch === 0) ? response.data.content : [...prevClientes, ...response.data.content]
        );
        hasMoreRef.current = !response.data.last;
        currentPageRef.current = response.data.number;
      } else {
        if (isNewSearchOrRefresh || pageToFetch === 0) setClientes([]);
        hasMoreRef.current = false;
      }
      if (error && (isNewSearchOrRefresh || pageToFetch === 0)) setError(null);

    } catch (err: any) {
      console.error("ListarClientesScreen: Erro ao buscar clientes:", JSON.stringify(err.response?.data || err.message));
      if (axios.isAxiosError(err)) {
         if (err.response && err.response.status !== 401) { // 401 é tratado globalmente
            const apiErrorMessage = err.response.data?.erro || err.response.data?.message || "Não foi possível carregar os clientes.";
            setError(apiErrorMessage);
        } else if (!err.response) {
            setError("Erro de conexão ao buscar clientes.");
        }
        // Se for 401, o interceptor deve deslogar.
      } else {
        setError("Ocorreu um erro desconhecido ao buscar clientes.");
      }
      if (isNewSearchOrRefresh || pageToFetch === 0) setClientes([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [error]); // Adicionada dependência 'error' para permitir reset quando um novo fetch é bem sucedido

  // Debounce para pesquisa
  useEffect(() => {
    const handler = setTimeout(() => {
      if (termoPesquisaInput !== termoPesquisaAtivo) {
        setTermoPesquisaAtivo(termoPesquisaInput);
      }
    }, 800); // Aguarda 800ms após o usuário parar de digitar
    return () => clearTimeout(handler);
  }, [termoPesquisaInput, termoPesquisaAtivo]);

  // Efeito para buscar quando o termo de pesquisa ativo mudar
  useEffect(() => {
    currentPageRef.current = 0;
    hasMoreRef.current = true;
    // Não limpa os clientes aqui para evitar piscar a tela, setIsLoading(true) já cobre isso.
    fetchClientes(0, termoPesquisaAtivo, true);
  }, [termoPesquisaAtivo, fetchClientes]); // fetchClientes é agora uma dependência estável com useCallback

  // useFocusEffect para recarregar dados quando a tela entra em foco
  useFocusEffect(
    useCallback(() => {
      console.log("ListarClientesScreen: Tela em foco, recarregando dados.");
      currentPageRef.current = 0;
      hasMoreRef.current = true;
      // Força um refresh buscando da página 0 com o termo de pesquisa ativo.
      // O true indica que é um "novo refresh" e deve limpar os dados existentes antes de adicionar novos.
      fetchClientes(0, termoPesquisaAtivo, true);
      return () => {
        console.log("ListarClientesScreen: Tela perdeu foco.");
        // Opcional: Lógica de limpeza ao sair da tela, se necessário
      };
    }, [termoPesquisaAtivo, fetchClientes]) // fetchClientes é estável devido ao useCallback
  );

  const handleLoadMore = () => {
    if (!isFetchingRef.current && hasMoreRef.current && !isLoadingMore) {
      console.log("ListarClientesScreen: Carregando mais clientes...");
      fetchClientes(currentPageRef.current + 1, termoPesquisaAtivo, false);
    }
  };

  const handleRefresh = () => {
    console.log("ListarClientesScreen: Refresh solicitado pelo usuário.");
    currentPageRef.current = 0;
    hasMoreRef.current = true;
    fetchClientes(0, termoPesquisaAtivo, true);
  };

  const handleSearchSubmit = () => {
    // Se o termo de input é diferente do ativo, atualiza o ativo (o useEffect cuidará do fetch)
    // Se for igual, força um novo fetch com o mesmo termo (caso o usuário queira reenviar a busca)
    if (termoPesquisaInput !== termoPesquisaAtivo) {
      setTermoPesquisaAtivo(termoPesquisaInput);
    } else {
      handleRefresh(); // Reutiliza handleRefresh para buscar com o termo atual
    }
  };

  const confirmarDelecaoCliente = (clienteId: number, clienteNome: string) => {
    Alert.alert(
      "Confirmar Deleção",
      `Tem certeza que deseja deletar o cliente "${clienteNome}"? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Deletar", onPress: () => handleDeletarCliente(clienteId), style: "destructive" }
      ]
    );
  };

  const handleDeletarCliente = async (clienteId: number) => {
    setIsProcessing(clienteId);
    try {
      // O token será adicionado automaticamente pelo interceptor do axiosInstance
      await axiosInstance.delete(`/clientes/${clienteId}`); //
      Alert.alert("Sucesso", "Cliente deletado com sucesso!");
      // Recarrega a lista para refletir a deleção
      handleRefresh();
    } catch (error: any) {
      console.error("ListarClientesScreen: Erro ao deletar cliente:", JSON.stringify(error.response?.data || error.message));
       if (axios.isAxiosError(error) && error.response?.status !== 401) {
            const apiErrorMessage = error.response?.data?.erro || error.response?.data?.message || "Não foi possível deletar o cliente.";
            Alert.alert("Erro ao Deletar", apiErrorMessage);
       } else if (!axios.isAxiosError(error)) {
           Alert.alert("Erro Desconhecido", "Ocorreu um erro inesperado ao deletar.");
       }
       // Se for 401, o interceptor global deve deslogar
    } finally {
      setIsProcessing(null);
    }
  };

  const renderFooter = (): React.ReactElement | null => {
    if (isLoadingMore) {
      return <View style={{ paddingVertical: 20 }}><ActivityIndicator size="large" color="#323588" /></View>;
    }
    if (!hasMoreRef.current && clientes.length > 0 && !isLoading && !error) {
      return <View style={{ paddingVertical: 20 }}><Text style={listarClientesStyles.emptyDataText}>Fim da lista de clientes.</Text></View>;
    }
    return null;
  };

  const renderItem = ({ item }: { item: Cliente }) => (
    <View style={listarClientesStyles.itemContainer}>
      <View style={listarClientesStyles.itemTextContainer}>
        <Text style={listarClientesStyles.itemName} numberOfLines={1} ellipsizeMode="tail">{item.nome}</Text>
        {item.email && <Text style={listarClientesStyles.itemDetails} numberOfLines={1} ellipsizeMode="tail">Email: {item.email}</Text>}
        {item.telefone && <Text style={listarClientesStyles.itemDetails}>Telefone: {item.telefone}</Text>}
      </View>
      <View style={listarClientesStyles.buttonsContainer}>
        <TouchableOpacity
          style={[listarClientesStyles.actionButton, listarClientesStyles.editButton]}
          onPress={() => navigation.navigate('EditarCliente', { clienteId: item.id })}
          disabled={isProcessing === item.id}
        >
          <Text style={listarClientesStyles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[listarClientesStyles.actionButton, listarClientesStyles.deleteButton]}
          onPress={() => confirmarDelecaoCliente(item.id, item.nome)}
          disabled={isProcessing === item.id}
        >
          {isProcessing === item.id ? <ActivityIndicator size="small" color="#fff" /> : <Text style={listarClientesStyles.actionButtonText}>Deletar</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );

  const showInitialLoading = isLoading && clientes.length === 0 && currentPageRef.current === 0 && !error;
  const showErrorScreen = error && clientes.length === 0 && !isLoading;

  return (
    <View style={listarClientesStyles.container}>
      <Text style={listarClientesStyles.headerTitle}>Lista de Clientes</Text>
      <TextInput
        style={listarClientesStyles.searchInput}
        placeholder="Pesquisar cliente por nome..."
        value={termoPesquisaInput}
        onChangeText={setTermoPesquisaInput}
        onSubmitEditing={handleSearchSubmit} // Permite submeter com "Enter" do teclado
        returnKeyType="search"
        placeholderTextColor="#888"
      />
      {showInitialLoading ? (
        <View style={listarClientesStyles.centered}>
          <ActivityIndicator size="large" color="#323588" />
          <Text style={listarClientesStyles.loadingText}>Carregando clientes...</Text>
        </View>
      ) : showErrorScreen ? (
        <View style={listarClientesStyles.centered}>
          <Text style={listarClientesStyles.errorText}>{error}</Text>
          <TouchableOpacity style={listarClientesStyles.retryButton} onPress={handleRefresh}>
            <Text style={listarClientesStyles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={clientes}
          renderItem={renderItem}
          keyExtractor={(item) => `cliente-${item.id.toString()}`}
          contentContainerStyle={listarClientesStyles.listContentContainer}
          onRefresh={handleRefresh}
          refreshing={isLoading && currentPageRef.current === 0 && !isLoadingMore} // Só mostra refresh no topo
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            !isLoading && !error && clientes.length === 0 ? (
              <View style={listarClientesStyles.centered}>
                <Text style={listarClientesStyles.emptyDataText}>
                  {termoPesquisaAtivo ? `Nenhum cliente encontrado para "${termoPesquisaAtivo}".` : 'Nenhum cliente cadastrado.'}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}