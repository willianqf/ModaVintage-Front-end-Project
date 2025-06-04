import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
// import axios from 'axios'; // REMOVA esta linha
// import * as SecureStore from 'expo-secure-store'; // Não é mais necessário importar SecureStore diretamente aqui
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { styles } from './stylesEditarFornecedor';
import { Fornecedor } from './ListarFornecedoresScreen'; // Importar interface

// Importe a instância configurada do Axios e o helper isAxiosError
import axiosInstance from '../api/axiosInstance'; // Ajuste o caminho se necessário
import axios from 'axios'; // Para usar axios.isAxiosError

// const API_BASE_URL = 'http://192.168.1.5:8080'; // Esta constante não será mais usada diretamente nas chamadas

type EditarFornecedorRouteProp = RouteProp<RootStackParamList, 'EditarFornecedor'>;
type EditarFornecedorNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditarFornecedor'>;

export default function EditarFornecedorScreen() {
  const navigation = useNavigation<EditarFornecedorNavigationProp>();
  const route = useRoute<EditarFornecedorRouteProp>();
  const { fornecedorId } = route.params;

  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [contato, setContato] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);

  useEffect(() => {
    const fetchFornecedorData = async () => {
      setIsFetchingData(true);
      try {
        // O token será adicionado automaticamente pelo interceptor do axiosInstance
        // Use axiosInstance e apenas o endpoint relativo
        const response = await axiosInstance.get<Fornecedor>(`/fornecedores/${fornecedorId}`);
        const fornecedor = response.data;
        setNome(fornecedor.nome);
        setCnpj(fornecedor.cnpj || '');
        setContato(fornecedor.contato || '');
      } catch (error: any) {
        console.error("EditarFornecedorScreen: Erro ao buscar dados do fornecedor:", JSON.stringify(error.response?.data || error.message));
        if (axios.isAxiosError(error) && error.response?.status !== 401) {
          Alert.alert("Erro ao Carregar Dados", "Não foi possível carregar os dados do fornecedor.");
        } else if (!axios.isAxiosError(error)) {
           Alert.alert("Erro Desconhecido", "Ocorreu um erro inesperado ao carregar os dados.");
        }
        // Se for 401, o interceptor global deve deslogar.
        // navigation.goBack(); // Comentado, o logout global trata o redirecionamento
      } finally {
        setIsFetchingData(false);
      }
    };
    if (fornecedorId) {
      fetchFornecedorData();
    }
  }, [fornecedorId]);

  const handleSalvarAlteracoes = async () => {
    if (!nome.trim()) {
      Alert.alert("Erro de Validação", "O nome do fornecedor é obrigatório.");
      return;
    }
    setIsLoading(true);
    try {
      // O token será adicionado automaticamente pelo interceptor do axiosInstance
      const fornecedorDataAtualizado = {
        nome: nome.trim(),
        cnpj: cnpj.trim() || null,
        contato: contato.trim() || null,
      };

      // Use axiosInstance e apenas o endpoint relativo
      await axiosInstance.put(`/fornecedores/${fornecedorId}`, fornecedorDataAtualizado);
      Alert.alert("Sucesso", "Fornecedor atualizado com sucesso!");
      navigation.goBack();
    } catch (error: any) {
      console.error("EditarFornecedorScreen: Erro ao atualizar fornecedor:", JSON.stringify(error.response?.data || error.message));
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status !== 401) {
            const apiErrorMessage = error.response.data?.erro || error.response.data?.message || 'Não foi possível atualizar o fornecedor.';
            Alert.alert("Erro ao Salvar", apiErrorMessage);
          } else {
            console.warn("EditarFornecedorScreen: Erro 401, o interceptor deve ter deslogado.");
          }
        } else {
          Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor.");
        }
      } else {
        Alert.alert("Erro Desconhecido", "Ocorreu um erro inesperado ao salvar.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#323588" />
        <Text>Carregando dados do fornecedor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }} keyboardShouldPersistTaps="handled">
      <Text style={styles.headerTitle}>Editar Fornecedor</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do Fornecedor"
        value={nome}
        onChangeText={setNome}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="CNPJ (Opcional)"
        value={cnpj}
        onChangeText={setCnpj}
        keyboardType="numeric"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Contato (Opcional)"
        value={contato}
        onChangeText={setContato}
        placeholderTextColor="#888"
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSalvarAlteracoes}
          disabled={isLoading || isFetchingData}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SALVAR ALTERAÇÕES</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading || isFetchingData}
        >
          <Text style={styles.cancelButtonText}>CANCELAR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}