import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
// import axios from 'axios'; // REMOVA esta linha
// import * as SecureStore from 'expo-secure-store'; // Não é mais necessário importar SecureStore diretamente aqui
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { styles } from './stylesEditarCliente';
import { Cliente } from './ListarClientesScreen'; // Importa a interface Cliente

// Importe a instância configurada do Axios e o helper isAxiosError
import axiosInstance from '../api/axiosInstance'; // Ajuste o caminho se necessário
import axios from 'axios'; // Para usar axios.isAxiosError

// const API_BASE_URL = 'http://192.168.1.5:8080'; // Esta constante não será mais usada diretamente nas chamadas

type EditarClienteRouteProp = RouteProp<RootStackParamList, 'EditarCliente'>;
type EditarClienteNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditarCliente'>;

export default function EditarClienteScreen() {
  const navigation = useNavigation<EditarClienteNavigationProp>();
  const route = useRoute<EditarClienteRouteProp>();
  const { clienteId } = route.params;

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);

  useEffect(() => {
    const fetchClienteData = async () => {
      setIsFetchingData(true);
      try {
        // O token será adicionado automaticamente pelo interceptor do axiosInstance
        // Use axiosInstance e apenas o endpoint relativo
        const response = await axiosInstance.get<Cliente>(`/clientes/${clienteId}`);

        const cliente = response.data;
        setNome(cliente.nome);
        setTelefone(cliente.telefone || '');
        setEmail(cliente.email || '');

      } catch (error: any) {
        console.error("EditarClienteScreen: Erro ao buscar dados do cliente:", JSON.stringify(error.response?.data || error.message));
        // O interceptor já deve lidar com 401
        if (axios.isAxiosError(error) && error.response?.status !== 401) {
          Alert.alert("Erro ao Carregar Dados", "Não foi possível carregar os dados do cliente para edição.");
        } else if (!axios.isAxiosError(error)) {
           Alert.alert("Erro Desconhecido", "Ocorreu um erro inesperado ao carregar os dados.");
        }
        // Se for 401, o interceptor global deve deslogar o usuário.
        // A navegação de volta pode ser desnecessária se o logout já redireciona para Login.
        // navigation.goBack(); // Comentado pois o logout global deve tratar o redirecionamento
      } finally {
        setIsFetchingData(false);
      }
    };

    if (clienteId) {
      fetchClienteData();
    }
  }, [clienteId]); // Removida a dependência de navigation para evitar re-execuções desnecessárias

  const handleSalvarAlteracoes = async () => {
    if (!nome.trim()) {
      Alert.alert("Erro de Validação", "O nome do cliente é obrigatório.");
      return;
    }

    setIsLoading(true);
    try {
      // O token será adicionado automaticamente pelo interceptor do axiosInstance
      const clienteDataAtualizado = {
        nome: nome.trim(),
        telefone: telefone.trim() || null,
        email: email.trim().toLowerCase() || null,
      };

      // Use axiosInstance e apenas o endpoint relativo
      await axiosInstance.put(`/clientes/${clienteId}`, clienteDataAtualizado);

      Alert.alert("Sucesso", "Cliente atualizado com sucesso!");
      navigation.goBack();
    } catch (error: any) {
      console.error("EditarClienteScreen: Erro ao atualizar cliente:", JSON.stringify(error.response?.data || error.message));
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // O interceptor já deve lidar com 401
          if (error.response.status !== 401) {
            const apiErrorMessage = error.response.data?.erro || error.response.data?.message || 'Não foi possível atualizar o cliente.';
            Alert.alert("Erro ao Salvar", apiErrorMessage);
          } else {
            console.warn("EditarClienteScreen: Erro 401, o interceptor deve ter deslogado.");
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
        <Text>Carregando dados do cliente...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }} keyboardShouldPersistTaps="handled">
      <Text style={styles.headerTitle}>Editar Cliente</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do Cliente"
        value={nome}
        onChangeText={setNome}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Telefone (Opcional)"
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail (Opcional)"
        value={email}
        onChangeText={(text) => setEmail(text.toLowerCase())}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#888"
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSalvarAlteracoes}
          disabled={isLoading || isFetchingData} // Desabilita também se estiver buscando dados
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