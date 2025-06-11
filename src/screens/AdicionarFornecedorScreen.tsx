import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { styles } from './stylesAdicionarFornecedor'; // Certifique-se que o caminho está correto
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import { theme } from '../global/themes';

type AdicionarFornecedorNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdicionarFornecedor'>;

export default function AdicionarFornecedorScreen() {
  const navigation = useNavigation<AdicionarFornecedorNavigationProp>();

  // --- SEU BLOCO DE ESTADOS E LÓGICA (useState, handlers) ---
  // --- NENHUMA ALTERAÇÃO FOI FEITA AQUI ---
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
      const fornecedorData = {
        nome: nome.trim(),
        cnpj: cnpj.trim() || null,
        contato: contato.trim() || null,
      };
      await axiosInstance.post('/fornecedores', fornecedorData);
      Alert.alert("Sucesso", "Fornecedor adicionado com sucesso!");
      navigation.goBack();
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status !== 401) {
            const apiErrorMessage = error.response.data?.erro || error.response.data?.message || 'Não foi possível adicionar o fornecedor.';
            Alert.alert("Erro ao Adicionar", apiErrorMessage);
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
  // --- FIM DO BLOCO DE LÓGICA ---

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Adicionar Fornecedor</Text>
      </View>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome do Fornecedor</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Atacado de Roupas SP"
              value={nome}
              onChangeText={setNome}
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>CNPJ (Opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChangeText={setCnpj}
              keyboardType="numeric"
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Contato (Opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome, Telefone, Email..."
              value={contato}
              onChangeText={setContato}
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleAdicionarFornecedor}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>ADICIONAR FORNECEDOR</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}