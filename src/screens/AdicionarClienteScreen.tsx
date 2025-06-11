import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { styles } from './stylesAdicionarCliente'; // Certifique-se que o caminho está correto
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import { theme } from '../global/themes';

type AdicionarClienteNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdicionarCliente'>;
type AdicionarClienteRouteProp = RouteProp<RootStackParamList, 'AdicionarCliente'>;

export default function AdicionarClienteScreen() {
  const navigation = useNavigation<AdicionarClienteNavigationProp>();
  const route = useRoute<AdicionarClienteRouteProp>();

  // --- SEU BLOCO DE ESTADOS E LÓGICA (useState, handlers) ---
  // --- NENHUMA ALTERAÇÃO FOI FEITA AQUI ---
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdicionarCliente = async () => {
    if (!nome.trim()) {
      Alert.alert("Erro de Validação", "O nome do cliente é obrigatório.");
      return;
    }
    setIsLoading(true);
    try {
      const clienteData = {
        nome: nome.trim(),
        telefone: telefone.trim() || null,
        email: email.trim().toLowerCase() || null,
      };
      
      const response = await axiosInstance.post('/clientes', clienteData);

      Alert.alert("Sucesso", "Cliente adicionado com sucesso!");

      // Lógica para retornar para a tela de vendas com o novo cliente selecionado
      if (route.params?.originRoute === 'RegistrarVenda') {
        navigation.navigate('RegistrarVenda', { newlyAddedClient: response.data });
      } else {
        navigation.goBack();
      }

    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status !== 401) {
            const apiErrorMessage = error.response.data?.erro || error.response.data?.message || 'Não foi possível adicionar o cliente.';
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
        <Text style={styles.headerTitle}>Adicionar Novo Cliente</Text>
      </View>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome do Cliente</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Lília Dutra"
              value={nome}
              onChangeText={setNome}
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Telefone (Opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              value={telefone}
              onChangeText={setTelefone}
              keyboardType="phone-pad"
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>E-mail (Opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="exemplo@email.com"
              value={email}
              onChangeText={(text) => setEmail(text.toLowerCase())}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleAdicionarCliente}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>ADICIONAR CLIENTE</Text>}
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