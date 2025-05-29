import React, { useState, useEffect, useCallback } from 'react'; // Adicionado useCallback
import {
  View, Text, TextInput, TouchableOpacity, Alert, ScrollView,
  FlatList, Modal, ActivityIndicator, Button as RNButton, Keyboard
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Ajuste o caminho
import { styles } from './stylesRegistrarVenda'; // Seus estilos
import { Cliente } from './ListarClientesScreen';
import { Produto } from './ListarMercadoriasScreen';

const API_BASE_URL = 'http://192.168.1.5:8080'; // Sua API base

interface ItemVendaInput {
  produto: Produto;
  quantidadeVendida: number;
  precoUnitario: number;
}

type RegistrarVendaNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegistrarVenda'>;

export default function RegistrarVendaScreen() {
  const navigation = useNavigation<RegistrarVendaNavigationProp>();

  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [itensVenda, setItensVenda] = useState<ItemVendaInput[]>([]);
  const [dataVenda, setDataVenda] = useState(new Date());
  const [totalVenda, setTotalVenda] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Para o botão "Registrar Venda"

  // Estados para os Modais
  const [clienteModalVisible, setClienteModalVisible] = useState(false);
  const [produtoModalVisible, setProdutoModalVisible] = useState(false);
  const [listaClientes, setListaClientes] = useState<Cliente[]>([]);
  const [listaProdutosDisponiveis, setListaProdutosDisponiveis] = useState<Produto[]>([]);
  
  const [produtoParaAdicionar, setProdutoParaAdicionar] = useState<Produto | null>(null); // Produto pré-selecionado no modal
  const [quantidadeProdutoInput, setQuantidadeProdutoInput] = useState('1'); // Quantidade para o produtoParaAdicionar

  const fetchDataForModals = async () => {
    // setIsLoading(true); // Pode ter um loading para os dados dos modais
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) throw new Error("Token não encontrado.");

      const [clientesRes, produtosRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/clientes`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/produtos`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setListaClientes(clientesRes.data);
      setListaProdutosDisponiveis(produtosRes.data.filter((p: Produto) => p.estoque > 0));
    } catch (error) {
      console.error("Erro ao buscar dados para modais:", error);
      Alert.alert("Erro", "Não foi possível carregar dados de clientes ou produtos para seleção.");
    } finally {
      // setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDataForModals();
      setSelectedCliente(null);
      setItensVenda([]);
      setDataVenda(new Date());
      return () => { /* Limpeza opcional */ };
    }, [])
  );

  useEffect(() => {
    const novoTotal = itensVenda.reduce((sum, item) => sum + (item.precoUnitario * item.quantidadeVendida), 0);
    setTotalVenda(novoTotal);
  }, [itensVenda]);

  const handleSelecionarCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setClienteModalVisible(false);
  };

  const handleSelecionarProdutoParaAdicionar = (produto: Produto) => {
    setProdutoParaAdicionar(produto);
    setQuantidadeProdutoInput('1'); // Reseta quantidade para 1 ao selecionar novo produto
  };

  const handleConfirmarAdicaoItem = () => {
    if (!produtoParaAdicionar) return;

    const quantidade = parseInt(quantidadeProdutoInput, 10);
    if (isNaN(quantidade) || quantidade <= 0) {
      Alert.alert("Quantidade Inválida", "Por favor, insira uma quantidade válida (maior que zero).");
      return;
    }
    if (quantidade > produtoParaAdicionar.estoque) {
      Alert.alert("Estoque Insuficiente", `Estoque disponível para "${produtoParaAdicionar.nome}": ${produtoParaAdicionar.estoque}.`);
      return;
    }

    const itemExistenteIndex = itensVenda.findIndex(item => item.produto.id === produtoParaAdicionar.id);
    let novosItens = [...itensVenda];

    if (itemExistenteIndex > -1) {
      const qtdTotalNova = novosItens[itemExistenteIndex].quantidadeVendida + quantidade;
      if (qtdTotalNova > produtoParaAdicionar.estoque) {
        Alert.alert("Estoque Insuficiente", `Você já tem ${novosItens[itemExistenteIndex].quantidadeVendida} no carrinho. Estoque total para "${produtoParaAdicionar.nome}": ${produtoParaAdicionar.estoque}.`);
        return;
      }
      novosItens[itemExistenteIndex].quantidadeVendida = qtdTotalNova;
    } else {
      novosItens.push({
        produto: produtoParaAdicionar,
        quantidadeVendida: quantidade,
        precoUnitario: produtoParaAdicionar.preco,
      });
    }
    setItensVenda(novosItens);
    setProdutoParaAdicionar(null); // Volta para a lista de produtos no modal
    setQuantidadeProdutoInput('1');
    // Não fecha o modal de produto aqui, permitindo adicionar mais itens.
    // Para fechar, adicione: setProdutoModalVisible(false);
    Keyboard.dismiss();
  };

  const handleRemoverItemVenda = (produtoId: number) => {
    setItensVenda(prevItens => prevItens.filter(item => item.produto.id !== produtoId));
  };

  const handleRegistrarVenda = async () => {
    if (itensVenda.length === 0) {
      Alert.alert("Venda Vazia", "Adicione pelo menos um produto à venda.");
      return;
    }
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) throw new Error("Token não encontrado.");

      const payload = {
        cliente: selectedCliente ? { id: selectedCliente.id } : null,
        itens: itensVenda.map(item => ({
          produto: { id: item.produto.id },
          quantidadeVendida: item.quantidadeVendida,
        })),
      };

      await axios.post(`${API_BASE_URL}/vendas`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("Sucesso", "Venda registrada com sucesso!");
      navigation.navigate('Dashboard'); // Ou VendasScreen
    } catch (error: any) {
        // ... (seu tratamento de erro robusto) ...
        console.error("Erro ao registrar venda:", JSON.stringify(error.response?.data || error.message));
        let errorMessage = "Não foi possível registrar a venda.";
         if (axios.isAxiosError(error) && error.response) {
              if (error.response.data?.message) errorMessage = error.response.data.message;
              else if (typeof error.response.data === 'string') errorMessage = error.response.data;
              else if (error.response.status === 401 || error.response.status === 403) errorMessage = "Erro de autenticação.";
           } else if (error.message) {
              errorMessage = error.message;
           }
        Alert.alert("Erro", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderClienteItemModal = ({ item }: { item: Cliente }) => (
    <TouchableOpacity style={styles.modalItem} onPress={() => handleSelecionarCliente(item)}>
      <Text style={styles.modalItemText}>{item.nome}</Text>
    </TouchableOpacity>
  );

  const renderProdutoItemModal = ({ item }: { item: Produto }) => (
    <TouchableOpacity style={styles.modalItem} onPress={() => handleSelecionarProdutoParaAdicionar(item)}>
      <Text style={styles.modalItemText}>{item.nome} (Est: {item.estoque}) - R$ {item.preco.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.headerTitle}>Registrar Nova Venda</Text>

      <Text style={styles.sectionTitle}>Cliente (Opcional)</Text>
      <TouchableOpacity style={styles.pickerButton} onPress={() => setClienteModalVisible(true)}>
        <Text style={styles.pickerButtonText}>
          {selectedCliente ? selectedCliente.nome : "Selecionar Cliente"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Data da Venda</Text>
      <TextInput style={styles.input} value={dataVenda.toLocaleDateString('pt-BR')} editable={false} />

      <Text style={styles.sectionTitle}>Itens da Venda</Text>
      <TouchableOpacity style={styles.pickerButton} onPress={() => { setProdutoParaAdicionar(null); setQuantidadeProdutoInput("1"); setProdutoModalVisible(true); }}>
        <Text style={styles.pickerButtonText}>+ Adicionar Produto à Venda</Text>
      </TouchableOpacity>

      {itensVenda.length > 0 && (
        <FlatList
          data={itensVenda}
          scrollEnabled={false} // Se dentro de ScrollView, desabilitar rolagem da FlatList
          keyExtractor={(item, index) => `${item.produto.id}_${index}`} // Chave mais robusta
          renderItem={({ item }) => (
            <View style={styles.itemListaVenda}>
              <View style={{flex: 1}}>
                <Text style={styles.itemListaTexto} numberOfLines={1} ellipsizeMode="tail">
                    {item.quantidadeVendida}x {item.produto.nome}
                </Text>
                <Text style={{fontSize: 12, color: 'gray'}}>
                    R$ {item.precoUnitario.toFixed(2)} un. / Subtotal: R$ {(item.precoUnitario * item.quantidadeVendida).toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity style={styles.itemRemoverButton} onPress={() => handleRemoverItemVenda(item.produto.id)}>
                <Text style={styles.itemRemoverTexto}>X</Text>
              </TouchableOpacity>
            </View>
          )}
          style={{ maxHeight: 250, marginTop: 10 }}
        />
      )}

      <Text style={styles.totalText}>Total da Venda: R$ {totalVenda.toFixed(2)}</Text>

      <TouchableOpacity style={styles.button} onPress={handleRegistrarVenda} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>REGISTRAR VENDA</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={isLoading}>
        <Text style={styles.cancelButtonText}>CANCELAR</Text>
      </TouchableOpacity>

      {/* Modal para Selecionar Cliente */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={clienteModalVisible}
        onRequestClose={() => setClienteModalVisible(false)}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Selecione um Cliente</Text>
            <FlatList
              data={listaClientes}
              renderItem={renderClienteItemModal}
              keyExtractor={(item) => item.id.toString()}
              style={{width: '100%'}}
            />
            <RNButton title="Fechar" onPress={() => setClienteModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Modal para Selecionar Produto e Quantidade */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={produtoModalVisible}
        onRequestClose={() => {setProdutoModalVisible(false); setProdutoParaAdicionar(null);}}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {!produtoParaAdicionar ? (
              <>
                <Text style={styles.modalTitle}>Selecione um Produto</Text>
                <FlatList
                  data={listaProdutosDisponiveis}
                  renderItem={renderProdutoItemModal}
                  keyExtractor={(item) => item.id.toString()}
                  style={{width: '100%', maxHeight: '70%'}}
                />
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Adicionar: {produtoParaAdicionar.nome}</Text>
                <Text>Preço Unit.: R$ {produtoParaAdicionar.preco.toFixed(2)} (Estoque: {produtoParaAdicionar.estoque})</Text>
                <View style={styles.quantityInputContainer}>
                    <Text>Quantidade:</Text>
                    <TextInput
                        style={styles.quantityInput}
                        value={quantidadeProdutoInput}
                        onChangeText={setQuantidadeProdutoInput}
                        keyboardType="number-pad"
                        maxLength={3}
                        autoFocus={true} // Foca no input de quantidade
                    />
                </View>
                <TouchableOpacity style={styles.confirmAddItemButton} onPress={handleConfirmarAdicaoItem}>
                    <Text style={styles.confirmAddItemButtonText}>Adicionar Item à Venda</Text>
                </TouchableOpacity>
              </>
            )}
            <View style={{marginTop:15}}>
                <RNButton title="Voltar / Fechar Modal" onPress={() => {
                    if (produtoParaAdicionar) {
                        setProdutoParaAdicionar(null); // Volta para a lista de produtos se um produto estava selecionado
                    } else {
                        setProdutoModalVisible(false); // Fecha o modal se estiver na lista de produtos
                    }
                }} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}