import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Ajuste o caminho se necessário
import { styles } from './stylesAdicionarMercadoria';



const API_BASE_URL = 'http://192.168.1.5:8080'; // Sua API base

type AdicionarMercadoriaNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdicionarMercadoria'>;

export default function AdicionarMercadoriaScreen() {
  const navigation = useNavigation<AdicionarMercadoriaNavigationProp>();

  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [categoria, setCategoria] = useState('');
  // const [fotoUri, setFotoUri] = useState<string | null>(null); // Para a funcionalidade de foto
  const [isLoading, setIsLoading] = useState(false);

  // Lógica para selecionar foto (simplificada por enquanto)
  const handleSelecionarFoto = () => {
    Alert.alert("Funcionalidade Pendente", "A seleção de fotos será implementada futuramente.");

  };

  const handleAdicionarMercadoria = async () => {
    if (!nome.trim() || !preco.trim() || !estoque.trim() || !tamanho.trim() || !categoria.trim()) {
      Alert.alert("Erro", "Todos os campos são obrigatórios.");
      return;
    }

    const precoNum = parseFloat(preco.replace(',', '.'));
    const estoqueNum = parseInt(estoque, 10);

    if (isNaN(precoNum) || precoNum <= 0) {
      Alert.alert("Erro", "Preço inválido.");
      return;
    }
    if (isNaN(estoqueNum) || estoqueNum < 0) {
      Alert.alert("Erro", "Quantidade em estoque inválida.");
      return;
    }

    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert("Erro", "Token de autenticação não encontrado. Faça login novamente.");
        setIsLoading(false);
        // Onavegar para a tela de login
        // navigation.navigate('Login');
        return;
      }

      const produtoData = {
        nome,
        preco: precoNum,
        estoque: estoqueNum,
        tamanho,
        categoria,
        // dataCadastro será definido pelo backend
      };

      await axios.post(`${API_BASE_URL}/produtos`, produtoData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("Sucesso", "Mercadoria adicionada com sucesso!");
      // Limpar campos e navegar de volta ou para a lista de mercadorias
      setNome('');
      setPreco('');
      setEstoque('');
      setTamanho('');
      setCategoria('');
      navigation.goBack(); //  navigation.navigate('ListarMercadorias');
    } catch (error: any) {
      console.error("Erro ao adicionar mercadoria:", error);
      let errorMessage = "Não foi possível adicionar a mercadoria.";
       if (axios.isAxiosError(error) && error.response) {
            if (error.response.data?.message) {
                errorMessage = error.response.data.message;
            } else if (typeof error.response.data === 'string' && error.response.data.length < 100) { // Evitar mensagens de erro HTML longas
                errorMessage = error.response.data;
            } else if (error.response.status === 401 || error.response.status === 403) {
                errorMessage = "Erro de autenticação. Faça login novamente.";
            }
         } else if (error.message) {
            errorMessage = error.message;
         }
      Alert.alert("Erro", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.headerTitle}>Adicionar Mercadoria</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome da Mercadoria"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Valor da Mercadoria (ex: 79.90)"
        value={preco}
        onChangeText={setPreco}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Quantidade em Estoque"
        value={estoque}
        onChangeText={setEstoque}
        keyboardType="number-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Tamanho (ex: P, M, G, 38, 40)"
        value={tamanho}
        onChangeText={setTamanho}
      />
      <TextInput
        style={styles.input}
        placeholder="Categoria (ex: Camisetas, Calças)"
        value={categoria}
        onChangeText={setCategoria}
      />

      {/* Placeholder para Adicionar Foto  */}
      <TouchableOpacity style={styles.imagePickerButton} onPress={handleSelecionarFoto}>
        <Text style={styles.imagePickerText}>Adicionar Foto (Pendente)</Text>
      </TouchableOpacity>
      {
        // Adicionar foto *EM ANALISE AINDA
      }


      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleAdicionarMercadoria}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>ADICIONAR</Text>}
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