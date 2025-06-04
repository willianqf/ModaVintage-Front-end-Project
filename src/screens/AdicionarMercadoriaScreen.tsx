import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
// import axios from 'axios'; // REMOVA esta linha
// import * as SecureStore from 'expo-secure-store'; // Não é mais necessário importar SecureStore diretamente aqui
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { styles } from './stylesAdicionarMercadoria'; //

// Importe a instância configurada do Axios e o helper isAxiosError
import axiosInstance from '../api/axiosInstance'; // Ajuste o caminho se necessário
import axios from 'axios'; // Para usar axios.isAxiosError

// const API_BASE_URL = 'http://192.168.1.5:8080'; // Esta constante não será mais usada diretamente nas chamadas

type AdicionarMercadoriaNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdicionarMercadoria'>;

export default function AdicionarMercadoriaScreen() {
  const navigation = useNavigation<AdicionarMercadoriaNavigationProp>();

  const [nome, setNome] = useState('');
  const [precoCusto, setPrecoCusto] = useState('');
  const [preco, setPreco] = useState(''); // Este é o preço de venda
  const [estoque, setEstoque] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [categoria, setCategoria] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdicionarMercadoria = async () => {
    if (!nome.trim() || !precoCusto.trim() || !preco.trim() || !estoque.trim()) {
      Alert.alert("Erro de Validação", "Nome, Preço de Custo, Preço de Venda e Estoque são obrigatórios.");
      return;
    }

    const precoCustoNum = parseFloat(precoCusto.replace(',', '.'));
    const precoVendaNum = parseFloat(preco.replace(',', '.')); // Corrigido para precoVendaNum
    const estoqueNum = parseInt(estoque, 10);

    if (isNaN(precoCustoNum) || precoCustoNum <= 0) {
      Alert.alert("Erro de Validação", "Preço de custo inválido. Deve ser um número maior que zero.");
      return;
    }
    if (isNaN(precoVendaNum) || precoVendaNum <= 0) {
      Alert.alert("Erro de Validação", "Preço de venda inválido. Deve ser um número maior que zero.");
      return;
    }
    if (isNaN(estoqueNum) || estoqueNum < 0) {
      Alert.alert("Erro de Validação", "Estoque inválido. Deve ser um número igual ou maior que zero.");
      return;
    }
    if (precoCustoNum > precoVendaNum) {
      Alert.alert("Atenção", "O preço de custo está maior que o preço de venda. Deseja continuar?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Continuar", onPress: () => cadastrarMercadoria(precoCustoNum, precoVendaNum, estoqueNum) }
      ]);
      return;
    }
    cadastrarMercadoria(precoCustoNum, precoVendaNum, estoqueNum);
  };

  const cadastrarMercadoria = async (precoCustoVal: number, precoVendaVal: number, estoqueVal: number) => {
    setIsLoading(true);
    try {
      // O token será adicionado automaticamente pelo interceptor do axiosInstance
      const produtoData = {
        nome: nome.trim(),
        precoCusto: precoCustoVal,
        preco: precoVendaVal, // Este é o preço de venda
        estoque: estoqueVal,
        tamanho: tamanho.trim() || undefined, // Envia undefined se vazio para ser omitido no JSON se o backend estiver configurado para ignorar nulos/undefined
        categoria: categoria.trim() || undefined,
      };

      // Use axiosInstance e apenas o endpoint
      await axiosInstance.post('/produtos', produtoData);

      Alert.alert("Sucesso", "Mercadoria adicionada com sucesso!");
      navigation.goBack();
    } catch (error: any) {
      console.error("AdicionarMercadoriaScreen: Erro ao adicionar mercadoria:", JSON.stringify(error.response?.data || error.message));
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // O interceptor já deve lidar com 401
          if (error.response.status !== 401) {
            const apiErrorMessage = error.response.data?.erro || error.response.data?.message || 'Não foi possível adicionar a mercadoria.';
            Alert.alert("Erro ao Adicionar", apiErrorMessage);
          } else {
            console.warn("AdicionarMercadoriaScreen: Erro 401, o interceptor deve ter deslogado.");
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
      <Text style={styles.headerTitle}>Adicionar Nova Mercadoria</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome da Mercadoria"
        value={nome}
        onChangeText={setNome}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Preço de Custo (ex: 39,90)"
        value={precoCusto}
        onChangeText={setPrecoCusto}
        keyboardType="numeric"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Preço de Venda (ex: 79,90)"
        value={preco} // Variável `preco` para preço de venda
        onChangeText={setPreco} // Função `setPreco`
        keyboardType="numeric"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Quantidade em Estoque"
        value={estoque}
        onChangeText={setEstoque}
        keyboardType="number-pad"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Tamanho (Opcional)"
        value={tamanho}
        onChangeText={setTamanho}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Categoria (Opcional)"
        value={categoria}
        onChangeText={setCategoria}
        placeholderTextColor="#888"
      />

      <TouchableOpacity 
        style={styles.imagePickerButton} //
        onPress={() => Alert.alert("Funcionalidade Pendente", "A seleção de fotos será implementada futuramente.")}
      >
        <Text style={styles.imagePickerText}>Adicionar Foto (Pendente)</Text> 
      </TouchableOpacity>

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