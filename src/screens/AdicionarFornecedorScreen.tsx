import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
// import axios from 'axios'; // REMOVA esta linha
// import * as SecureStore from 'expo-secure-store'; // Não é mais necessário importar SecureStore diretamente aqui
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { styles } from './stylesAdicionarFornecedor';

// Importe a instância configurada do Axios e o helper isAxiosError
import axiosInstance from '../api/axiosInstance'; // Ajuste o caminho se necessário
import axios from 'axios'; // Para usar axios.isAxiosError

// const API_BASE_URL = 'http://192.168.1.5:8080'; // Esta constante não será mais usada diretamente nas chamadas

type AdicionarFornecedorNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdicionarFornecedor'>;

export default function AdicionarFornecedorScreen() {
  const navigation = useNavigation<AdicionarFornecedorNavigationProp>();

  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [contato, setContato] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdicionarFornecedor = async () => {
    if (!nome.trim()) {
      Alert.alert("Erro de Validação", "O nome do fornecedor é obrigatório.");
      return;
    }
    // Adicione validações para CNPJ e Contato se desejar

    setIsLoading(true);
    try {
      // O token será adicionado automaticamente pelo interceptor do axiosInstance
      const fornecedorData = {
        nome: nome.trim(),
        cnpj: cnpj.trim() || null, // Envia null se vazio, ajuste conforme backend
        contato: contato.trim() || null, // Envia null se vazio, ajuste conforme backend
      };

      // Use axiosInstance e apenas o endpoint
      await axiosInstance.post('/fornecedores', fornecedorData);

      Alert.alert("Sucesso", "Fornecedor adicionado com sucesso!");
      navigation.goBack();
    } catch (error: any) {
      console.error("AdicionarFornecedorScreen: Erro ao adicionar fornecedor:", JSON.stringify(error.response?.data || error.message));
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // O interceptor já deve lidar com 401
          if (error.response.status !== 401) {
            const apiErrorMessage = error.response.data?.erro || error.response.data?.message || 'Não foi possível adicionar o fornecedor.';
            Alert.alert("Erro ao Adicionar", apiErrorMessage);
          } else {
            console.warn("AdicionarFornecedorScreen: Erro 401, o interceptor deve ter deslogado.");
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
      <Text style={styles.headerTitle}>Adicionar Fornecedor</Text>
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
        keyboardType="numeric" // Ou default, dependendo do formato do CNPJ que você espera
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Contato (Nome, Telefone, Email - Opcional)"
        value={contato}
        onChangeText={setContato}
        placeholderTextColor="#888"
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleAdicionarFornecedor} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>ADICIONAR</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={isLoading}>
          <Text style={styles.cancelButtonText}>CANCELAR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}