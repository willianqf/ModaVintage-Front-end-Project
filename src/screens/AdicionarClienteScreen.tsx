import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { styles } from './stylesAdicionarCliente';

const API_BASE_URL = 'http://192.168.1.5:8080';

type AdicionarClienteNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdicionarCliente'>;

export default function AdicionarClienteScreen() {
  const navigation = useNavigation<AdicionarClienteNavigationProp>();

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdicionarCliente = async () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "O nome do cliente é obrigatório.");
      return;
    }
    // Validações adicionais para email e telefone podem ser adicionadas aqui

    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) throw new Error("Token não encontrado.");

      const clienteData = { nome, telefone, email };

      await axios.post(`${API_BASE_URL}/clientes`, clienteData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Sucesso", "Cliente adicionado com sucesso!");
      navigation.goBack(); // Ou para a lista de clientes
    } catch (error: any) {
      console.error("Erro ao adicionar cliente:", error);
      // ... (tratamento de erro similar) ...
      Alert.alert("Erro", "Não foi possível adicionar o cliente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.headerTitle}>Adicionar Cliente</Text>
      {/* Figma Pág 12: Nome, Telefone, Email */}
      <TextInput style={styles.input} placeholder="Nome do Cliente" value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="Telefone (Opcional)" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="E-mail (Opcional)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

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