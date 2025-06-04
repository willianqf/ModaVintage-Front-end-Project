import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
// import axios from 'axios'; // REMOVA esta linha
import * as SecureStore from 'expo-secure-store'; // Mantenha, pois SecureStore é usado indiretamente pelo axiosInstance
import { useNavigation, RouteProp } from '@react-navigation/native'; // Adicionado RouteProp
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { styles } from './stylesAdicionarCliente';

// Importe a instância configurada do Axios e o helper isAxiosError
import axiosInstance from '../api/axiosInstance'; // Ajuste o caminho se necessário
import axios from 'axios'; // Para usar axios.isAxiosError

const API_BASE_URL = 'http://192.168.1.5:8080'; // Esta constante não será mais usada diretamente nas chamadas

type AdicionarClienteNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdicionarCliente'>;
type AdicionarClienteRouteProp = RouteProp<RootStackParamList, 'AdicionarCliente'>; // Para os parâmetros da rota

export default function AdicionarClienteScreen() {
  // Ajuste para usar AdicionarClienteNavigationProp e AdicionarClienteRouteProp
  const navigation = useNavigation<AdicionarClienteNavigationProp>();
  // const route = useRoute<AdicionarClienteRouteProp>(); // Descomente se precisar de route.params

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdicionarCliente = async () => {
    if (!nome.trim()) {
      Alert.alert("Erro de Validação", "O nome do cliente é obrigatório.");
      return;
    }
    // Validações adicionais para email e telefone podem ser adicionadas aqui

    setIsLoading(true);
    try {
      // O token será adicionado automaticamente pelo interceptor do axiosInstance
      const clienteData = {
        nome: nome.trim(),
        // Envie null se o campo estiver vazio para que o backend possa interpretá-lo corretamente
        // se a lógica de negócios permitir campos opcionais como nulos.
        telefone: telefone.trim() || null,
        email: email.trim().toLowerCase() || null,
      };

      // Use axiosInstance e apenas o endpoint
      const response = await axiosInstance.post('/clientes', clienteData);

      Alert.alert("Sucesso", "Cliente adicionado com sucesso!");

      // Verifica se a navegação deve voltar ou ir para uma rota específica
      // (se você implementou a lógica de 'originRoute' em AdicionarCliente)
      // Exemplo: if (route.params?.originRoute === 'RegistrarVenda') {
      // navigation.navigate('RegistrarVenda', { newlyAddedClient: response.data });
      // } else {
      navigation.goBack();
      // }
    } catch (error: any) {
      console.error("AdicionarClienteScreen: Erro ao adicionar cliente:", JSON.stringify(error.response?.data || error.message));
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // O interceptor já deve lidar com 401
          if (error.response.status !== 401) {
            const apiErrorMessage = error.response.data?.erro || error.response.data?.message || 'Não foi possível adicionar o cliente.';
            Alert.alert("Erro ao Adicionar", apiErrorMessage);
          } else {
            console.warn("AdicionarClienteScreen: Erro 401, o interceptor deve ter deslogado.");
          }
        } else {
          Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor.");
        }
      } else {
        Alert.alert("Erro Desconhecido", "Ocorreu um erro inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }} keyboardShouldPersistTaps="handled">
      <Text style={styles.headerTitle}>Adicionar Cliente</Text>
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
        onChangeText={(text) => setEmail(text.toLowerCase())} // Garante minúsculas para email
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#888"
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleAdicionarCliente} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>ADICIONAR</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={isLoading}>
          <Text style={styles.cancelButtonText}>CANCELAR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}