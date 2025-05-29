import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { styles } from './stylesListarFornecedores';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

export interface Fornecedor { // Interface para Fornecedor
  id: number;
  nome: string;
  cnpj?: string;
  contato?: string;
}

const API_BASE_URL = 'http://192.168.1.5:8080';

type ListarFornecedoresNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListarFornecedores'>;

export default function ListarFornecedoresScreen() {
  const navigation = useNavigation<ListarFornecedoresNavigationProp>();
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFornecedores = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) throw new Error("Token não encontrado.");

      const response = await axios.get(`${API_BASE_URL}/fornecedores`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFornecedores(response.data);
    } catch (err: any) {
      console.error("Erro ao buscar fornecedores:", err);
      setError("Não foi possível carregar os fornecedores.");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFornecedores();
    }, [])
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
      fetchFornecedores();
    } catch (error: any) {
      console.error("Erro ao deletar fornecedor:", error);
      Alert.alert("Erro", "Não foi possível deletar o fornecedor.");
    } finally {
      setIsProcessing(null);
    }
  };

  // ... (Blocos if isLoading, if error, if lista vazia, como em ListarClientesScreen) ...
  if (isLoading && fornecedores.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#323588" />
        <Text>Carregando fornecedores...</Text>
      </View>
    );
  }

  if (error && fornecedores.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erro ao carregar: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchFornecedores}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

   if (!isLoading && fornecedores.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>Nenhum fornecedor cadastrado.</Text>
         <TouchableOpacity style={styles.retryButton} onPress={fetchFornecedores}>
            <Text style={styles.retryButtonText}>Recarregar Lista</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Fornecedor }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemName}>{item.nome}</Text>
        {item.cnpj && <Text style={styles.itemDetails}>CNPJ: {item.cnpj}</Text>}
        {item.contato && <Text style={styles.itemDetails}>Contato: {item.contato}</Text>}
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('EditarFornecedor', { fornecedorId: item.id })}
          disabled={isProcessing === item.id}
        >
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => confirmarDelecaoFornecedor(item.id, item.nome)}
          disabled={isProcessing === item.id}
        >
          {isProcessing === item.id ? <ActivityIndicator size="small" color="#fff"/> : <Text style={styles.actionButtonText}>Deletar</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Lista de Fornecedores</Text>
      <FlatList
        data={fornecedores}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContentContainer}
        onRefresh={fetchFornecedores}
        refreshing={isLoading}
      />
    </View>
  );
}