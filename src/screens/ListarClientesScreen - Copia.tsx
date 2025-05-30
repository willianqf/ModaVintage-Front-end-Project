import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { styles as listarClientesStyles } from './stylesListarClientes';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

export interface Cliente {
  id: number;
  nome: string;
  telefone?: string;
  email?: string;
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

type ListarClientesNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListarClientes'>;

export default function ListarClientesScreen() {
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

  const fetchClientes = useCallback(async (pageToFetch: number, searchTerm: string, isNewSearchOrRefresh: boolean) => {
    if (isFetchingRef.current && !isNewSearchOrRefresh) {
        return;
    }
    if (!isNewSearchOrRefresh && !hasMoreRef.current) {
        setIsLoadingMore(false);
        return;
    }

    isFetchingRef.current = true;
    console.log(`FETCHING CLIENTES: page ${pageToFetch}, term: "${searchTerm}", newSearch/Refresh: ${isNewSearchOrRefresh}`);
    if (isNewSearchOrRefresh) setIsLoading(true); else setIsLoadingMore(true);
    if (isNewSearchOrRefresh) setError(null);

    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) throw new Error("Token não encontrado.");

      let url = `${API_BASE_URL}/clientes?page=${pageToFetch}&size=${PAGE_SIZE}&sort=nome,asc`;
      if (searchTerm.trim() !== '') {
        url += `&nome=${encodeURIComponent(searchTerm.trim())}`;
      }

      const response = await axios.get<PaginatedResponse<Cliente>>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
      console.error("Erro ao buscar clientes:", JSON.stringify(err.response?.data || err.message));
      let errorMessage = "Não foi possível carregar os clientes.";
       if (axios.isAxiosError(err) && err.response) {
            if (err.response.status === 401 || err.response.status === 403) errorMessage = "Sessão expirada ou token inválido.";
            else if (err.response.data?.message) errorMessage = err.response.data.message;
        } else if (err.message) errorMessage = err.message;
      setError(errorMessage);
      if (isNewSearchOrRefresh || pageToFetch === 0) setClientes([]);
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
    fetchClientes(0, termoPesquisaAtivo, true);
  }, [termoPesquisaAtivo, fetchClientes]);

  useFocusEffect(
    useCallback(() => {
      currentPageRef.current = 0;
      hasMoreRef.current = true;
      fetchClientes(0, termoPesquisaAtivo, true);
      return () => {};
    }, [termoPesquisaAtivo, fetchClientes])
  );
  
  const handleLoadMore = () => {
    if (!isFetchingRef.current && hasMoreRef.current) {
      fetchClientes(currentPageRef.current + 1, termoPesquisaAtivo, false);
    }
  };

  const handleRefresh = () => {
    fetchClientes(0, termoPesquisaAtivo, true);
  };
  
  const handleSearchSubmit = () => {
    if (termoPesquisaInput !== termoPesquisaAtivo) {
        setTermoPesquisaAtivo(termoPesquisaInput);
    } else {
        fetchClientes(0, termoPesquisaInput, true);
    }
  };

  const confirmarDelecaoCliente = (clienteId: number, clienteNome: string) => {
    Alert.alert(
      "Confirmar Deleção",
      `Tem certeza que deseja deletar o cliente "${clienteNome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Deletar", onPress: () => handleDeletarCliente(clienteId), style: "destructive" }
      ]
    );
  };

  const handleDeletarCliente = async (clienteId: number) => {
    setIsProcessing(clienteId);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) throw new Error("Token não encontrado.");
      await axios.delete(`${API_BASE_URL}/clientes/${clienteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("Sucesso", "Cliente deletado com sucesso!");
      fetchClientes(0, termoPesquisaAtivo, true); // Recarrega a lista
    } catch (error: any) {
      console.error("Erro ao deletar cliente:", error);
      Alert.alert("Erro", "Não foi possível deletar o cliente.");
    } finally {
      setIsProcessing(null);
    }
  };

  const renderFooter = (): React.ReactElement | null => { // Especificando o tipo de retorno
    if (isLoadingMore) {
      return <View style={{ paddingVertical: 20 }}><ActivityIndicator size="large" color="#323588" /></View>;
    }
    if (!hasMoreRef.current && clientes.length > 0) {
      return <View style={{ paddingVertical: 20 }}><Text style={listarClientesStyles.emptyDataText}>Fim da lista.</Text></View>;
    }
    return null; // Retorno explícito de null
  };

  const renderItem = ({ item }: { item: Cliente }) => (
    <View style={listarClientesStyles.itemContainer}>
      <View style={listarClientesStyles.itemTextContainer}>
        <Text style={listarClientesStyles.itemName}>{item.nome}</Text>
        {item.email && <Text style={listarClientesStyles.itemDetails}>Email: {item.email}</Text>}
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
          {isProcessing === item.id ? <ActivityIndicator size="small" color="#fff"/> : <Text style={listarClientesStyles.actionButtonText}>Deletar</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && clientes.length === 0 && currentPageRef.current === 0 && !error) {
    return (
      <View style={listarClientesStyles.container}>
        <Text style={listarClientesStyles.headerTitle}>Lista de Clientes</Text>
        <TextInput style={listarClientesStyles.searchInput} placeholder="Pesquisar cliente por nome..." value={termoPesquisaInput} onChangeText={setTermoPesquisaInput} onSubmitEditing={handleSearchSubmit} returnKeyType="search" />
        <View style={listarClientesStyles.centered}>
          <ActivityIndicator size="large" color="#323588" />
          <Text style={listarClientesStyles.loadingText}>Carregando clientes...</Text>
        </View>
      </View>
    );
  }
  
  if (error && clientes.length === 0 && !isLoading) {
      return (
        <View style={listarClientesStyles.container}>
          <Text style={listarClientesStyles.headerTitle}>Lista de Clientes</Text>
          <TextInput style={listarClientesStyles.searchInput} placeholder="Pesquisar cliente por nome..." value={termoPesquisaInput} onChangeText={setTermoPesquisaInput} onSubmitEditing={handleSearchSubmit} returnKeyType="search" />
          <View style={listarClientesStyles.centered}>
            <Text style={listarClientesStyles.errorText}>Erro ao carregar: {error}</Text>
            <TouchableOpacity style={listarClientesStyles.retryButton} onPress={() => fetchClientes(0, termoPesquisaAtivo, true)}>
              <Text style={listarClientesStyles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
  }

  return (
    <View style={listarClientesStyles.container}>
      <Text style={listarClientesStyles.headerTitle}>Lista de Clientes</Text>
      <TextInput
        style={listarClientesStyles.searchInput}
        placeholder="Pesquisar cliente por nome..."
        value={termoPesquisaInput}
        onChangeText={setTermoPesquisaInput}
        onSubmitEditing={handleSearchSubmit}
        returnKeyType="search"
      />
      <FlatList
        data={clientes}
        renderItem={renderItem}
        keyExtractor={(item) => `cliente-${item.id}`} // Chave prefixada para garantir unicidade
        contentContainerStyle={listarClientesStyles.listContentContainer}
        onRefresh={handleRefresh}
        refreshing={isLoading && currentPageRef.current === 0 && !isLoadingMore}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter} // Tipo de retorno de renderFooter agora está correto
        ListEmptyComponent={
            !isLoading && !error && clientes.length === 0 ? (
                <View style={listarClientesStyles.centered}>
                    <Text style={listarClientesStyles.emptyDataText}>
                        Nenhum cliente encontrado {termoPesquisaAtivo ? `para "${termoPesquisaAtivo}".` : 'cadastrado.'}
                    </Text>
                </View>
            ) : null
        }
      />
    </View>
  );
}