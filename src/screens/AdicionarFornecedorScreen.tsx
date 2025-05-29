import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { styles } from './stylesAdicionarFornecedor';

const API_BASE_URL = 'http://192.168.1.5:8080';

type AdicionarFornecedorNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdicionarFornecedor'>;

export default function AdicionarFornecedorScreen() {
  const navigation = useNavigation<AdicionarFornecedorNavigationProp>();

  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [contato, setContato] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdicionarFornecedor = async () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "O nome do fornecedor é obrigatório.");
      return;
    }
    // Adicione validações para CNPJ e Contato 

    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) throw new Error("Token não encontrado.");

      const fornecedorData = { nome, cnpj, contato };

      await axios.post(`${API_BASE_URL}/fornecedores`, fornecedorData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Sucesso", "Fornecedor adicionado com sucesso!");
      navigation.goBack();
    } catch (error: any) {
      console.error("Erro ao adicionar fornecedor:", error);
      Alert.alert("Erro", "Não foi possível adicionar o fornecedor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.headerTitle}>Adicionar Fornecedor</Text>
      <TextInput style={styles.input} placeholder="Nome do Fornecedor" value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="CNPJ (Opcional)" value={cnpj} onChangeText={setCnpj} />
      <TextInput style={styles.input} placeholder="Contato (Nome, Telefone, Email - Opcional)" value={contato} onChangeText={setContato} />

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