import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { styles } from './stylesEditarFornecedor';
import { Fornecedor } from './ListarFornecedoresScreen'; // Importar interface

const API_BASE_URL = 'http://192.168.1.5:8080';

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
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) throw new Error("Token não encontrado.");

        const response = await axios.get<Fornecedor>(`${API_BASE_URL}/fornecedores/${fornecedorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fornecedor = response.data;
        setNome(fornecedor.nome);
        setCnpj(fornecedor.cnpj || '');
        setContato(fornecedor.contato || '');
      } catch (error) {
        console.error("Erro ao buscar dados do fornecedor:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados do fornecedor.");
        navigation.goBack();
      } finally {
        setIsFetchingData(false);
      }
    };
    if (fornecedorId) {
      fetchFornecedorData();
    }
  }, [fornecedorId, navigation]);

  const handleSalvarAlteracoes = async () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "O nome do fornecedor é obrigatório.");
      return;
    }
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) throw new Error("Token não encontrado.");

      const fornecedorDataAtualizado = { nome, cnpj, contato };

      await axios.put(`${API_BASE_URL}/fornecedores/${fornecedorId}`, fornecedorDataAtualizado, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("Sucesso", "Fornecedor atualizado com sucesso!");
      navigation.goBack();
    } catch (error: any) {
      console.error("Erro ao atualizar fornecedor:", error);
      Alert.alert("Erro", "Não foi possível atualizar o fornecedor.");
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.headerTitle}>Editar Fornecedor</Text>
      <TextInput style={styles.input} placeholder="Nome do Fornecedor" value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="CNPJ (Opcional)" value={cnpj} onChangeText={setCnpj} />
      <TextInput style={styles.input} placeholder="Contato (Opcional)" value={contato} onChangeText={setContato} />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleSalvarAlteracoes} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SALVAR ALTERAÇÕES</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={isLoading}>
          <Text style={styles.cancelButtonText}>CANCELAR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}