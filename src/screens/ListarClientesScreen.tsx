import React, { useState, useCallback, useEffect } from 'react'; // Adicionado useEffect
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native'; // Adicionado TextInput
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { styles as listarClientesStyles } from './stylesListarClientes'; // Seus estilos existentes
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Ajuste o caminho

export interface Cliente {
  id: number;
  nome: string;
  telefone?: string;
  email?: string;
}

const API_BASE_URL = 'http://192.168.1.5:8080'; // Sua API base

type ListarClientesNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListarClientes'>;

export default function ListarClientesScreen() {
  const navigation = useNavigation<ListarClientesNavigationProp>();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null); // Para feedback de deleção/edição
  const [error, setError] = useState<string | null>(null);

  const [termoPesquisa, setTermoPesquisa] = useState(''); // Estado para o termo de pesquisa
  const [termoPesquisaDebounced, setTermoPesquisaDebounced] = useState(''); // Para debounce

  // Debounce para a pesquisa
  useEffect(() => {
    const handler = setTimeout(() => {
      setTermoPesquisaDebounced(termoPesquisa);
    }, 500); // Executa a busca 500ms após o usuário parar de digitar

    return () => {
      clearTimeout(handler);
    };
  }, [termoPesquisa]);

  const fetchClientes = useCallback(async (termoAtualDaPesquisa: string) => {
    console.log("Buscando clientes com termo:", termoAtualDaPesquisa);
    setIsLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        throw new Error("Token não encontrado. Faça login novamente.");
      }

      let url = `${API_BASE_URL}/clientes`;
      if (termoAtualDaPesquisa.trim() !== '') {
        url += `?nome=${encodeURIComponent(termoAtualDaPesquisa.trim())}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 204 || !response.data) {
        setClientes([]);
      } else {
        setClientes(response.data);
      }

    } catch (err: any) {
      console.error("Erro ao buscar clientes:", err);
      let errorMessage = "Não foi possível carregar os clientes.";
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          errorMessage = "Sessão expirada ou token inválido. Faça login novamente.";
        } else if (err.response.status !== 204 && err.response.data?.message) {
            errorMessage = err.response.data.message;
        } else if (err.response.status !== 204 && err.response.data && typeof err.response.data === 'string') {
            errorMessage = err.response.data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      if (!(axios.isAxiosError(err) && err.response?.status === 204)) {
        setError(errorMessage);
      } else {
        setClientes([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // useCallback com array de dependências vazio

  useFocusEffect(
    useCallback(() => {
      fetchClientes(termoPesquisaDebounced); // Usa o termo com debounce
    }, [termoPesquisaDebounced, fetchClientes]) // Adiciona fetchClientes como dependência
  );

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
      fetchClientes(termoPesquisaDebounced); // Recarrega com o termo de pesquisa atual
    } catch (error: any) {
      console.error("Erro ao deletar cliente:", error);
      Alert.alert("Erro", "Não foi possível deletar o cliente.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleSearchSubmit = () => {
    fetchClientes(termoPesquisa); // Busca imediata ao submeter
  };

  if (isLoading && clientes.length === 0 && termoPesquisaDebounced === '') {
    return (
      <View style={listarClientesStyles.centered}>
        <ActivityIndicator size="large" color="#323588" />
        <Text>Carregando clientes...</Text>
      </View>
    );
  }

  if (error && !isLoading && clientes.length === 0) {
    return (
      <View style={listarClientesStyles.centered}>
        <Text style={listarClientesStyles.errorText}>Erro ao carregar: {error}</Text>
        <TouchableOpacity style={listarClientesStyles.retryButton} onPress={() => fetchClientes(termoPesquisaDebounced)}>
          <Text style={listarClientesStyles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

  return (
    <View style={listarClientesStyles.container}>
      <Text style={listarClientesStyles.headerTitle}>Lista de Clientes</Text>
      <TextInput
        style={listarClientesStyles.searchInput} // Adicione este estilo em stylesListarClientes.ts
        placeholder="Pesquisar cliente por nome..."
        value={termoPesquisa}
        onChangeText={setTermoPesquisa}
        onSubmitEditing={handleSearchSubmit}
        returnKeyType="search"
      />
      <FlatList
        data={clientes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={listarClientesStyles.listContentContainer}
        onRefresh={() => fetchClientes(termoPesquisaDebounced)}
        refreshing={isLoading}
        ListEmptyComponent={
            !isLoading && !error ? (
                <View style={listarClientesStyles.centered}>
                    <Text>Nenhum cliente encontrado {termoPesquisaDebounced ? `para "${termoPesquisaDebounced}".` : 'cadastrado.'}</Text>
                </View>
            ) : null
        }
      />
    </View>
  );
}