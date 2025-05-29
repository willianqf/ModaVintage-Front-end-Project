import React, { useState, useCallback, useEffect } from 'react'; // ADICIONE useEffect AQUI
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { styles as listarMercadoriasStyles } from './stylesListarMercadorias';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

export interface Produto {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
  tamanho?: string;
  categoria?: string;
  dataCadastro?: string;
}

const API_BASE_URL = 'http://192.168.1.5:8080';

type ListarMercadoriasNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListarMercadorias'>;

export default function ListarMercadoriasScreen() {
  const navigation = useNavigation<ListarMercadoriasNavigationProp>();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
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


  const fetchProdutos = useCallback(async (termoAtualDaPesquisa: string) => {
    console.log("Buscando produtos com termo:", termoAtualDaPesquisa);
    setIsLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        throw new Error("Token não encontrado. Faça login novamente.");
      }

      let url = `${API_BASE_URL}/produtos`;
      if (termoAtualDaPesquisa.trim() !== '') {
        url += `?nome=${encodeURIComponent(termoAtualDaPesquisa.trim())}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // O backend retorna 204 No Content se a lista estiver vazia.
      // Axios pode tratar isso como sucesso com response.data sendo undefined ou ""
      if (response.status === 204 || !response.data) {
        setProdutos([]);
      } else {
        setProdutos(response.data);
      }

    } catch (err: any) {
      console.error("Erro ao buscar produtos:", err);
      let errorMessage = "Não foi possível carregar os produtos.";
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          errorMessage = "Sessão expirada ou token inválido. Faça login novamente.";
        } else if (err.response.status !== 204 && err.response.data?.message) { // Ignora 204 para mensagem
            errorMessage = err.response.data.message;
        } else if (err.response.status !== 204 && err.response.data && typeof err.response.data === 'string') {
            errorMessage = err.response.data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      // Só define erro se não for uma resposta 204 (No Content) que pode ser tratada como lista vazia
      if (!(axios.isAxiosError(err) && err.response?.status === 204)) {
        setError(errorMessage);
        // Alert.alert("Erro", errorMessage); // Opcional
      } else {
        setProdutos([]); // Se 204, a lista está vazia
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // useCallback com array de dependências vazio, pois 'termoAtualDaPesquisa' é passado como argumento

  // useEffect para buscar produtos quando termoPesquisaDebounced muda ou a tela foca
  useFocusEffect(
    useCallback(() => {
      fetchProdutos(termoPesquisaDebounced); // Usa o termo com debounce
    }, [termoPesquisaDebounced, fetchProdutos]) // Adiciona fetchProdutos como dependência
  );

  const confirmarDelecao = (produtoId: number, produtoNome: string) => {
    Alert.alert(
      "Confirmar Deleção",
      `Tem certeza que deseja deletar a mercadoria "${produtoNome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Deletar", onPress: () => handleDeletarProduto(produtoId), style: "destructive" }
      ]
    );
  };

  const handleDeletarProduto = async (produtoId: number) => {
    setIsDeleting(produtoId);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) throw new Error("Token não encontrado.");
      await axios.delete(`${API_BASE_URL}/produtos/${produtoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("Sucesso", "Mercadoria deletada com sucesso!");
      fetchProdutos(termoPesquisaDebounced); // Recarrega com o termo de pesquisa atual
    } catch (error: any) {
      // ... (tratamento de erro para deleção) ...
      Alert.alert("Erro", "Não foi possível deletar a mercadoria.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSearchSubmit = () => {
    fetchProdutos(termoPesquisa); // Busca imediata ao submeter (Enter no teclado)
  };


  if (isLoading && produtos.length === 0 && termoPesquisaDebounced === '') {
    return (
      <View style={listarMercadoriasStyles.centered}>
        <ActivityIndicator size="large" color="#323588" />
        <Text>Carregando mercadorias...</Text>
      </View>
    );
  }

  // Não mostra erro se estiver carregando uma nova pesquisa
  if (error && !isLoading && produtos.length === 0) {
    return (
      <View style={listarMercadoriasStyles.centered}>
        <Text style={listarMercadoriasStyles.errorText}>Erro ao carregar: {error}</Text>
        <TouchableOpacity style={listarMercadoriasStyles.retryButton} onPress={() => fetchProdutos(termoPesquisaDebounced)}>
          <Text style={listarMercadoriasStyles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Produto }) => (
    <TouchableOpacity
      style={listarMercadoriasStyles.itemContainer}
      onPress={() => navigation.navigate('EditarMercadoria', { produtoId: item.id })}
    >
      <Text style={listarMercadoriasStyles.itemName}>{item.nome} {item.tamanho ? `- ${item.tamanho}` : ''}</Text>
      <Text style={listarMercadoriasStyles.itemDetails}>Categoria: {item.categoria || 'N/A'}</Text>
      <Text style={listarMercadoriasStyles.itemDetails}>Preço: R$ {item.preco.toFixed(2)}</Text>
      <Text style={listarMercadoriasStyles.itemDetails}>Estoque: {item.estoque}</Text>
      <Text style={item.estoque > 0 ? listarMercadoriasStyles.statusDisponivel : listarMercadoriasStyles.statusVendido}>
        Status: {item.estoque > 0 ? 'Disponível' : 'Sem Estoque'}
      </Text>
      <TouchableOpacity
        style={listarMercadoriasStyles.deleteButton}
        onPress={() => confirmarDelecao(item.id, item.nome)}
        disabled={isDeleting === item.id}
      >
        {isDeleting === item.id ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
            <Text style={listarMercadoriasStyles.deleteButtonText}>Deletar</Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={listarMercadoriasStyles.container}>
      <Text style={listarMercadoriasStyles.headerTitle}>Lista de Mercadorias</Text>
      <TextInput
        style={listarMercadoriasStyles.searchInput} // Você precisará adicionar este estilo
        placeholder="Pesquisar mercadoria por nome..."
        value={termoPesquisa}
        onChangeText={setTermoPesquisa} // Atualiza o termo para o debounce
        onSubmitEditing={handleSearchSubmit} // Opcional: busca ao pressionar "Enter"
        returnKeyType="search"
      />
      <FlatList
        data={produtos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={listarMercadoriasStyles.listContentContainer}
        onRefresh={() => fetchProdutos(termoPesquisaDebounced)} // Pull-to-refresh busca com o termo atual
        refreshing={isLoading}
        ListEmptyComponent={
            !isLoading && !error ? ( // Só mostra se não estiver carregando e não houver erro
                <View style={listarMercadoriasStyles.centered}>
                    <Text>Nenhuma mercadoria encontrada {termoPesquisaDebounced ? `para "${termoPesquisaDebounced}".` : 'cadastrada.'}</Text>
                </View>
            ) : null
        }
      />
    </View>
  );
}