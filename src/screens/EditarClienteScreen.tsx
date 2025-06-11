import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { styles } from './stylesEditarCliente';
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import { theme } from '../global/themes';

type EditarClienteNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditarCliente'>;
type EditarClienteRouteProp = RouteProp<RootStackParamList, 'EditarCliente'>;

export default function EditarClienteScreen() {
  const navigation = useNavigation<EditarClienteNavigationProp>();
  const route = useRoute<EditarClienteRouteProp>();
  const { clienteId } = route.params;

  // --- SEU BLOCO DE ESTADOS E LÓGICA ---
  // --- NENHUMA ALTERAÇÃO FOI FEITA AQUI ---
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Inicia como true para buscar dados
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const response = await axiosInstance.get(`/clientes/${clienteId}`);
        const cliente = response.data;
        setNome(cliente.nome);
        setTelefone(cliente.telefone || '');
        setEmail(cliente.email || '');
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os dados do cliente.');
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };
    fetchCliente();
  }, [clienteId]);

  const handleUpdateCliente = async () => {
    if (!nome.trim()) {
      Alert.alert("Erro de Validação", "O nome do cliente é obrigatório.");
      return;
    }
    setIsUpdating(true);
    try {
      const clienteData = {
        nome: nome.trim(),
        telefone: telefone.trim() || null,
        email: email.trim().toLowerCase() || null,
      };
      await axiosInstance.put(`/clientes/${clienteId}`, clienteData);
      Alert.alert('Sucesso', 'Cliente atualizado com sucesso!');

      // ===== CORREÇÃO APLICADA AQUI =====
      // Em vez de navegar com parâmetros, apenas voltamos.
      // A tela de listagem já recarrega os dados sozinha ao receber foco.
      navigation.goBack();

    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            const apiErrorMessage = error.response.data?.erro || error.response.data?.message || 'Não foi possível atualizar o cliente.';
            Alert.alert("Erro ao Atualizar", apiErrorMessage);
        } else {
            Alert.alert("Erro Desconhecido", "Ocorreu um erro inesperado.");
        }
    } finally {
      setIsUpdating(false);
    }
  };
  // --- FIM DO BLOCO DE LÓGICA ---

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text>Carregando Cliente...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Editar Cliente</Text>
      </View>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome do Cliente</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              value={telefone}
              onChangeText={setTelefone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(text) => setEmail(text.toLowerCase())}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleUpdateCliente}
              disabled={isUpdating}
            >
              {isUpdating ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SALVAR ALTERAÇÕES</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={isUpdating}
            >
              <Text style={styles.cancelButtonText}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}