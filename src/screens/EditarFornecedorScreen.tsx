import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { styles } from './stylesEditarFornecedor';
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import { theme } from '../global/themes';

type EditarFornecedorNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditarFornecedor'>;
type EditarFornecedorRouteProp = RouteProp<RootStackParamList, 'EditarFornecedor'>;

export default function EditarFornecedorScreen() {
  const navigation = useNavigation<EditarFornecedorNavigationProp>();
  const route = useRoute<EditarFornecedorRouteProp>();
  const { fornecedorId } = route.params;

  // --- SEU BLOCO DE ESTADOS E LÓGICA ---
  // --- NENHUMA ALTERAÇÃO FOI FEITA AQUI ---
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [contato, setContato] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchFornecedor = async () => {
      try {
        const response = await axiosInstance.get(`/fornecedores/${fornecedorId}`);
        const fornecedor = response.data;
        setNome(fornecedor.nome);
        setCnpj(fornecedor.cnpj || '');
        setContato(fornecedor.contato || '');
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os dados do fornecedor.');
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };
    fetchFornecedor();
  }, [fornecedorId]);

  const handleUpdateFornecedor = async () => {
    if (!nome.trim()) {
      Alert.alert("Erro de Validação", "O nome do fornecedor é obrigatório.");
      return;
    }
    setIsUpdating(true);
    try {
      const fornecedorData = {
        nome: nome.trim(),
        cnpj: cnpj.trim() || null,
        contato: contato.trim() || null,
      };
      await axiosInstance.put(`/fornecedores/${fornecedorId}`, fornecedorData);
      Alert.alert('Sucesso', 'Fornecedor atualizado com sucesso!');
      navigation.goBack();
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
          const apiErrorMessage = error.response.data?.erro || error.response.data?.message || 'Não foi possível atualizar o fornecedor.';
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
        <Text>Carregando Fornecedor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Editar Fornecedor</Text>
      </View>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome do Fornecedor</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>CNPJ</Text>
            <TextInput
              style={styles.input}
              value={cnpj}
              onChangeText={setCnpj}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Contato</Text>
            <TextInput
              style={styles.input}
              value={contato}
              onChangeText={setContato}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleUpdateFornecedor}
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