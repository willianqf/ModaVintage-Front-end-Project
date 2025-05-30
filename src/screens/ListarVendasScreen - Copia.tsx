import React, { useState, useCallback } from 'react'; // Import useCallback
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { styles } from './stylesListarVendas';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Ajuste o caminho se necessário
import { Cliente } from './ListarClientesScreen'; // Ajuste o caminho se necessário
import { Produto } from './ListarMercadoriasScreen'; // Ajuste o caminho se necessário

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

const API_BASE_URL = 'http://192.168.1.5:8080'; // Sua API base

type ListarVendasNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListarVendas'>;

export default function ListarVendasScreen() {
  const navigation = useNavigation<ListarVendasNavigationProp>();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendas = async () => {
    console.log("ListarVendasScreen: Iniciando fetchVendas..."); // DEBUG
    setIsLoading(true);
    setError(null);
    let token: string | null = null; // Declarar token aqui para estar acessível no log de erro
    try {
      token = await SecureStore.getItemAsync('userToken');
      console.log("ListarVendasScreen: Token do SecureStore:", token); // DEBUG

      if (!token) {
        console.error("ListarVendasScreen: Token não encontrado no SecureStore."); // DEBUG
        Alert.alert("Autenticação", "Token não encontrado. Faça login novamente.");
        setIsLoading(false);
        // Considerar navegação para Login ou uma ação de logout
        // navigation.navigate('Login');
        return;
      }

      console.log("ListarVendasScreen: Fazendo requisição para GET /vendas com token."); // DEBUG
      const response = await axios.get<Venda[]>(`${API_BASE_URL}/vendas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("ListarVendasScreen: Resposta da API /vendas:", response.status); // DEBUG (response.data pode ser muito grande para logar inteiro)
      // console.log("ListarVendasScreen: Dados recebidos:", JSON.stringify(response.data, null, 2)); // DEBUG (se precisar ver os dados)
      setVendas(response.data);
    } catch (err: any) {
      console.error("ListarVendasScreen: Erro detalhado ao buscar vendas:", JSON.stringify(err)); // DEBUG MAIS DETALHADO
      if (axios.isAxiosError(err)) {
        console.error("ListarVendasScreen: Erro Axios Status:", err.response?.status); // DEBUG
        console.error("ListarVendasScreen: Erro Axios Data:", JSON.stringify(err.response?.data)); // DEBUG
      }

      let errorMessage = "Não foi possível carregar as vendas.";
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
            errorMessage = `Erro de Autenticação/Autorização (${err.response.status}). Verifique o token ou as permissões no backend.`;
            // Aqui você pode querer deslogar o usuário e navegar para o login
            // await SecureStore.deleteItemAsync('userToken');
            // navigation.navigate('Login');
        } else if (err.response.data?.message) {
            errorMessage = err.response.data.message;
        } else if (err.response.data && typeof err.response.data === 'string' && err.response.data.length < 200) { // Evita logar HTML de erro
            errorMessage = err.response.data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      Alert.alert("Erro ao Listar Vendas", errorMessage);
    } finally {
      setIsLoading(false);
      console.log("ListarVendasScreen: fetchVendas finalizado."); // DEBUG
    }
  };

  useFocusEffect(
    useCallback(() => { // Adicionado useCallback
      fetchVendas();
      return () => {
        // Opcional: Limpeza se a tela perder o foco e você precisar cancelar algo
      };
    }, []) // Array de dependências vazio para rodar apenas uma vez quando focado (ou quando desejar)
  );

  const formatarData = (dataISO: string) => {
    if (!dataISO) return 'Data indisponível';
    try {
        return new Date(dataISO).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            // hour: '2-digit', minute: '2-digit' // Descomente se quiser hora
        });
    } catch (e) {
        console.warn("Erro ao formatar data:", dataISO, e)
        return dataISO;
    }
  };

  if (isLoading && vendas.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#323588" />
        <Text>Carregando vendas...</Text>
      </View>
    );
  }

  if (error && vendas.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erro ao carregar: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchVendas}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

   if (!isLoading && vendas.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>Nenhuma venda registrada.</Text>
         <TouchableOpacity style={styles.retryButton} onPress={fetchVendas}>
            <Text style={styles.retryButtonText}>Recarregar Lista</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderVendaItem = ({ item }: { item: Venda }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.saleId}>Venda ID: {item.id}</Text>
        <Text style={styles.saleDate}>{formatarData(item.dataVenda)}</Text>
      </View>
      {item.cliente ? (
        <Text style={styles.customerName}>Cliente: {item.cliente.nome}</Text>
      ) : (
        <Text style={styles.customerName}>Cliente: Não informado</Text>
      )}
      <Text style={styles.itemsTitle}>Itens:</Text>
      {item.itens.map(itemVenda => (
        <Text key={itemVenda.id.toString()} style={styles.itemDetailText}>
          - {itemVenda.quantidadeVendida}x {itemVenda.produto.nome} (R$ {itemVenda.precoUnitario.toFixed(2)} un.)
        </Text>
      ))}
      <Text style={styles.totalSale}>Total: R$ {item.totalVenda.toFixed(2)}</Text>
      {/* Botão para deletar venda (opcional) */}
      {/*
      <TouchableOpacity
        style={{...styles.retryButton, backgroundColor: 'red', alignSelf: 'flex-end'}}
        onPress={() => {
            Alert.alert("Deletar Venda", `Deseja deletar a venda ID ${item.id}?`, [
                {text: "Cancelar"},
                {text: "Deletar", onPress: () => console.log("Deletar venda ID:", item.id), style: "destructive"}
            ])
        }}
      >
        <Text style={styles.retryButtonText}>Deletar</Text>
      </TouchableOpacity>
      */}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Histórico de Vendas</Text>
      <FlatList
        data={vendas}
        renderItem={renderVendaItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContentContainer}
        onRefresh={fetchVendas} // Permite "puxar para atualizar"
        refreshing={isLoading} // Controla o ícone de refresh
        ListEmptyComponent={ // Mostra quando a lista está vazia após o carregamento inicial
            !isLoading && !error && vendas.length === 0 ? (
                <View style={styles.centered}>
                    <Text>Nenhuma venda registrada.</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchVendas}>
                        <Text style={styles.retryButtonText}>Recarregar Lista</Text>
                    </TouchableOpacity>
                </View>
            ) : null
        }
      />
    </View>
  );
}