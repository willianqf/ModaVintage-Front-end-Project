import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Ajuste o caminho se necessário
import { styles } from './stylesEditarCliente';
import { Cliente } from './ListarClientesScreen'; // Importa a interface Cliente

const API_BASE_URL = 'http://192.168.1.5:8080'; // Sua API base

// Tipagem para os parâmetros da rota
type EditarClienteRouteProp = RouteProp<RootStackParamList, 'EditarCliente'>;

// Tipagem para a prop de navegação
type EditarClienteNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditarCliente'>;

export default function EditarClienteScreen() {
  const navigation = useNavigation<EditarClienteNavigationProp>();
  const route = useRoute<EditarClienteRouteProp>();
  const { clienteId } = route.params; // Pega o ID do cliente passado como parâmetro

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  const [isLoading, setIsLoading] = useState(false); // Para o botão de salvar
  const [isFetchingData, setIsFetchingData] = useState(true); // Para o carregamento inicial dos dados

  useEffect(() => {
    const fetchClienteData = async () => {
      setIsFetchingData(true);
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) {
          Alert.alert("Autenticação", "Token não encontrado. Faça login novamente.");
          navigation.navigate('Login'); // Ou outra ação de redirecionamento
          return;
        }

        const response = await axios.get<Cliente>(`${API_BASE_URL}/clientes/${clienteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const cliente = response.data;
        setNome(cliente.nome);
        setTelefone(cliente.telefone || ''); // Trata caso telefone seja null/undefined
        setEmail(cliente.email || '');     // Trata caso email seja null/undefined

      } catch (error: any) {
        console.error("Erro ao buscar dados do cliente:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados do cliente para edição.");
        navigation.goBack();
      } finally {
        setIsFetchingData(false);
      }
    };

    if (clienteId) {
      fetchClienteData();
    }
  }, [clienteId, navigation]);

  const handleSalvarAlteracoes = async () => {
    if (!nome.trim()) {
      Alert.alert("Erro de Validação", "O nome do cliente é obrigatório.");
      return;
    }
    // Adicione mais validações para email/telefone se desejar

    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert("Autenticação", "Token não encontrado. Faça login novamente.");
        setIsLoading(false);
        return;
      }

      const clienteDataAtualizado = {
        nome,
        telefone: telefone.trim() === '' ? null : telefone.trim(), // Envia null se vazio
        email: email.trim() === '' ? null : email.trim(),       // Envia null se vazio
      };

      await axios.put(`${API_BASE_URL}/clientes/${clienteId}`, clienteDataAtualizado, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Sucesso", "Cliente atualizado com sucesso!");
      navigation.goBack(); // Volta para a tela anterior (provavelmente a lista de clientes)
                           // A lista deve atualizar automaticamente devido ao useFocusEffect
    } catch (error: any) {
      console.error("Erro ao atualizar cliente:", error);
      let errorMessage = "Não foi possível atualizar o cliente.";
      if (axios.isAxiosError(error) && error.response) {
        //(tratamento de erro da API mais detalhado, como nos outros formulários)
        if (error.response.data?.message) errorMessage = error.response.data.message;
        else if (typeof error.response.data === 'string') errorMessage = error.response.data;
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert("Erro", errorMessage);
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.headerTitle}>Editar Cliente</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do Cliente"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Telefone"
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSalvarAlteracoes}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SALVAR ALTERAÇÕES</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>CANCELAR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}