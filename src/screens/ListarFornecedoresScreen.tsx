import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { styles as listarFornecedoresStyles } from './stylesListarFornecedores'; // Seus estilos existentes
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Ajuste o caminho

// Reutilizando a interface Fornecedor, certifique-se que ela está exportada
// ou defina-a aqui se preferir.
// Assumindo que você tem uma interface Fornecedor exportada de outro lugar
// ou podemos definir aqui:
export interface Fornecedor {
  id: number;
  nome: string;
  cnpj?: string;
  contato?: string;
}

const API_BASE_URL = 'http://192.168.1.5:8080'; // Sua API base

type ListarFornecedoresNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListarFornecedores'>;

export default function ListarFornecedoresScreen() {
  const navigation = useNavigation<ListarFornecedoresNavigationProp>();
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [termoPesquisaDebounced, setTermoPesquisaDebounced] = useState('');

  // Debounce para a pesquisa
  useEffect(() => {
    const handler = setTimeout(() => {
      setTermoPesquisaDebounced(termoPesquisa);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [termoPesquisa]);

  const fetchFornecedores = useCallback(async (termoAtualDaPesquisa: string) => {
    console.log("Buscando fornecedores com termo:", termoAtualDaPesquisa);
    setIsLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        throw new Error("Token não encontrado. Faça login novamente.");
      }

      let url = `${API_BASE_URL}/fornecedores`;
      if (termoAtualDaPesquisa.trim() !== '') {
        url += `?nome=${encodeURIComponent(termoAtualDaPesquisa.trim())}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 204 || !response.data) {
        setFornecedores([]);
      } else {
        setFornecedores(response.data);
      }

    } catch (err: any) {
      console.error("Erro ao buscar fornecedores:", err);
      let errorMessage = "Não foi possível carregar os fornecedores.";
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
        setFornecedores([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFornecedores(termoPesquisaDebounced);
    }, [termoPesquisaDebounced, fetchFornecedores])
  );

  const confirmarDelecaoFornecedor = (fornecedorId: number, fornecedorNome: string) => {
    Alert.alert(
      "Confirmar Deleção",
      `Tem certeza que deseja deletar o fornecedor "${fornecedorNome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Deletar", onPress: () => handleDeletarFornecedor(fornecedorId), style: "destructive" }
      ]
    );
  };

  const handleDeletarFornecedor = async (fornecedorId: number) => {
    setIsProcessing(fornecedorId);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) throw new Error("Token não encontrado.");
      await axios.delete(`${API_BASE_URL}/fornecedores/${fornecedorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("Sucesso", "Fornecedor deletado com sucesso!");
      fetchFornecedores(termoPesquisaDebounced);
    } catch (error: any) {
      console.error("Erro ao deletar fornecedor:", error);
      Alert.alert("Erro", "Não foi possível deletar o fornecedor.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleSearchSubmit = () => {
    fetchFornecedores(termoPesquisa);
  };

  if (isLoading && fornecedores.length === 0 && termoPesquisaDebounced === '') {
    return (
      <View style={listarFornecedoresStyles.centered}>
        <ActivityIndicator size="large" color="#323588" />
        <Text>Carregando fornecedores...</Text>
      </View>
    );
  }

  if (error && !isLoading && fornecedores.length === 0) {
    return (
      <View style={listarFornecedoresStyles.centered}>
        <Text style={listarFornecedoresStyles.errorText}>Erro ao carregar: {error}</Text>
        <TouchableOpacity style={listarFornecedoresStyles.retryButton} onPress={() => fetchFornecedores(termoPesquisaDebounced)}>
          <Text style={listarFornecedoresStyles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Fornecedor }) => (
    <View style={listarFornecedoresStyles.itemContainer}>
      <View style={listarFornecedoresStyles.itemTextContainer}>
        <Text style={listarFornecedoresStyles.itemName}>{item.nome}</Text>
        {item.cnpj && <Text style={listarFornecedoresStyles.itemDetails}>CNPJ: {item.cnpj}</Text>}
        {item.contato && <Text style={listarFornecedoresStyles.itemDetails}>Contato: {item.contato}</Text>}
      </View>
      <View style={listarFornecedoresStyles.buttonsContainer}>
        <TouchableOpacity
          style={[listarFornecedoresStyles.actionButton, listarFornecedoresStyles.editButton]}
          onPress={() => navigation.navigate('EditarFornecedor', { fornecedorId: item.id })}
          disabled={isProcessing === item.id}
        >
          <Text style={listarFornecedoresStyles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[listarFornecedoresStyles.actionButton, listarFornecedoresStyles.deleteButton]}
          onPress={() => confirmarDelecaoFornecedor(item.id, item.nome)}
          disabled={isProcessing === item.id}
        >
          {isProcessing === item.id ? <ActivityIndicator size="small" color="#fff"/> : <Text style={listarFornecedoresStyles.actionButtonText}>Deletar</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={listarFornecedoresStyles.container}>
      <Text style={listarFornecedoresStyles.headerTitle}>Lista de Fornecedores</Text>
      <TextInput
        style={listarFornecedoresStyles.searchInput} // Adicione este estilo se não existir
        placeholder="Pesquisar fornecedor por nome..."
        value={termoPesquisa}
        onChangeText={setTermoPesquisa}
        onSubmitEditing={handleSearchSubmit}
        returnKeyType="search"
      />
      <FlatList
        data={fornecedores}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={listarFornecedoresStyles.listContentContainer}
        onRefresh={() => fetchFornecedores(termoPesquisaDebounced)}
        refreshing={isLoading}
        ListEmptyComponent={
            !isLoading && !error ? (
                <View style={listarFornecedoresStyles.centered}>
                    <Text>Nenhum fornecedor encontrado {termoPesquisaDebounced ? `para "${termoPesquisaDebounced}".` : 'cadastrado.'}</Text>
                </View>
            ) : null
        }
      />
    </View>
  );
}