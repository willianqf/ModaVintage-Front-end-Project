import React, { useState } from 'react'; // Removido useEffect não utilizado
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios'; // Usando axios como nos outros arquivos
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native'; // Importado
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Importado
import { RootStackParamList } from '../../App'; // Ajuste o caminho se necessário
import { styles } from './stylesAdicionarMercadoria'; // CORRIGIDO: Importação direta de styles [origem: willianqf/modavintage_frontand_backand/modavintage_frontand_backand-master/Modavintage_Frontand/src/screens/stylesAdicionarMercadoria.ts]

const API_BASE_URL = 'http://192.168.1.5:8080'; // Sua API base

type AdicionarMercadoriaNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdicionarMercadoria'>;

export default function AdicionarMercadoriaScreen() {
  const navigation = useNavigation<AdicionarMercadoriaNavigationProp>();

  const [nome, setNome] = useState('');
  const [precoCusto, setPrecoCusto] = useState('');
  const [preco, setPreco] = useState('');
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
    const precoNum = parseFloat(preco.replace(',', '.'));
    const estoqueNum = parseInt(estoque, 10);

    if (isNaN(precoCustoNum) || precoCustoNum <= 0) {
        Alert.alert("Erro de Validação", "Preço de custo inválido. Deve ser um número maior que zero.");
        return;
    }
    if (isNaN(precoNum) || precoNum <= 0) {
        Alert.alert("Erro de Validação", "Preço de venda inválido. Deve ser um número maior que zero.");
        return;
    }
    if (isNaN(estoqueNum) || estoqueNum < 0) {
        Alert.alert("Erro de Validação", "Estoque inválido. Deve ser um número igual ou maior que zero.");
        return;
    }
    if (precoCustoNum > precoNum) {
        Alert.alert("Atenção", "O preço de custo está maior que o preço de venda. Deseja continuar?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Continuar", onPress: () => cadastrarMercadoria(precoCustoNum, precoNum, estoqueNum) }
        ]);
        return;
    }
    cadastrarMercadoria(precoCustoNum, precoNum, estoqueNum);
  };

  const cadastrarMercadoria = async (precoCustoVal: number, precoVendaVal: number, estoqueVal: number) => {
    setIsLoading(true);
    try {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) {
          Alert.alert("Autenticação", "Token não encontrado. Faça login novamente.");
          setIsLoading(false);
          return;
        }

        const produtoData = {
            nome: nome.trim(),
            precoCusto: precoCustoVal,
            preco: precoVendaVal,
            estoque: estoqueVal,
            tamanho: tamanho.trim() || undefined, // Enviar undefined se vazio para ser omitido pelo backend se configurado para ignorar nulos
            categoria: categoria.trim() || undefined,
        };

        await axios.post(`${API_BASE_URL}/produtos`, produtoData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        Alert.alert("Sucesso", "Mercadoria adicionada com sucesso!");
        navigation.goBack();
    } catch (error: any) {
        console.error("Erro ao adicionar mercadoria:", error.response?.data || error.message);
        let errorMessage = "Não foi possível adicionar a mercadoria.";
        if (axios.isAxiosError(error) && error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (axios.isAxiosError(error) && typeof error.response?.data === 'string') {
            errorMessage = error.response.data;
        }
        Alert.alert("Erro", errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  return (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
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
              value={preco}
              onChangeText={setPreco}
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

          {/* Placeholder para Adicionar Foto  */}
          <TouchableOpacity style={styles.imagePickerButton} onPress={() => Alert.alert("Funcionalidade Pendente", "A seleção de fotos será implementada futuramente.")}>
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