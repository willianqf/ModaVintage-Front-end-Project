import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, ScrollView,
  FlatList, Modal, ActivityIndicator, Button as RNButton, Keyboard
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { styles } from './stylesRegistrarVenda'; // Seus estilos
import { Cliente } from './ListarClientesScreen';
import { Produto } from './ListarMercadoriasScreen';

const API_BASE_URL = 'http://192.168.1.5:8080';

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
  const [isLoading, setIsLoading] = useState(false);

  const [clienteModalVisible, setClienteModalVisible] = useState(false);
  const [produtoModalVisible, setProdutoModalVisible] = useState(false);
  
  const [listaClientesMaster, setListaClientesMaster] = useState<Cliente[]>([]); // Lista original
  const [listaClientesFiltrada, setListaClientesFiltrada] = useState<Cliente[]>([]); // Lista para o modal
  const [searchTermCliente, setSearchTermCliente] = useState('');

  const [listaProdutosMaster, setListaProdutosMaster] = useState<Produto[]>([]); // Lista original
  const [listaProdutosFiltrada, setListaProdutosFiltrada] = useState<Produto[]>([]); // Lista para o modal
  const [searchTermProduto, setSearchTermProduto] = useState('');
  
  const [produtoParaAdicionar, setProdutoParaAdicionar] = useState<Produto | null>(null);
  const [quantidadeProdutoInput, setQuantidadeProdutoInput] = useState('1');

  const fetchDataForModals = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) throw new Error("Token não encontrado.");

      const [clientesRes, produtosRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/clientes`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/produtos`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setListaClientesMaster(clientesRes.data || []);
      setListaClientesFiltrada(clientesRes.data || []);

      const produtosComEstoque = (produtosRes.data || []).filter((p: Produto) => p.estoque > 0);
      setListaProdutosMaster(produtosComEstoque);
      setListaProdutosFiltrada(produtosComEstoque);

    } catch (error) {
      console.error("Erro ao buscar dados para modais:", error);
      Alert.alert("Erro", "Não foi possível carregar dados de clientes ou produtos para seleção.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDataForModals();
      setSelectedCliente(null);
      setItensVenda([]);
      setDataVenda(new Date());
      setSearchTermCliente(''); // Limpa pesquisa ao focar
      setSearchTermProduto(''); // Limpa pesquisa ao focar
      return () => {};
    }, [])
  );

  useEffect(() => {
    const novoTotal = itensVenda.reduce((sum, item) => sum + (item.precoUnitario * item.quantidadeVendida), 0);
    setTotalVenda(novoTotal);
  }, [itensVenda]);

  // Filtrar Clientes
  useEffect(() => {
    if (searchTermCliente === '') {
      setListaClientesFiltrada(listaClientesMaster);
    } else {
      setListaClientesFiltrada(
        listaClientesMaster.filter(cliente =>
          cliente.nome.toLowerCase().includes(searchTermCliente.toLowerCase())
        )
      );
    }
  }, [searchTermCliente, listaClientesMaster]);

  // Filtrar Produtos
  useEffect(() => {
    if (searchTermProduto === '') {
      setListaProdutosFiltrada(listaProdutosMaster);
    } else {
      setListaProdutosFiltrada(
        listaProdutosMaster.filter(produto =>
          produto.nome.toLowerCase().includes(searchTermProduto.toLowerCase())
        )
      );
    }
  }, [searchTermProduto, listaProdutosMaster]);


  const handleSelecionarCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setClienteModalVisible(false);
    setSearchTermCliente(''); // Limpa pesquisa do modal de cliente
  };

  const handleSelecionarProdutoParaAdicionar = (produto: Produto) => {
    setProdutoParaAdicionar(produto);
    setQuantidadeProdutoInput('1');
  };

  const handleConfirmarAdicaoItem = () => {
    if (!produtoParaAdicionar) return;
    const quantidade = parseInt(quantidadeProdutoInput, 10);
    if (isNaN(quantidade) || quantidade <= 0) {
      Alert.alert("Quantidade Inválida", "Insira uma quantidade válida.");
      return;
    }
    if (quantidade > produtoParaAdicionar.estoque) {
      Alert.alert("Estoque Insuficiente", `Disponível para "${produtoParaAdicionar.nome}": ${produtoParaAdicionar.estoque}.`);
      return;
    }

    const itemExistenteIndex = itensVenda.findIndex(item => item.produto.id === produtoParaAdicionar.id);
    let novosItens = [...itensVenda];
    if (itemExistenteIndex > -1) {
      const qtdTotalNova = novosItens[itemExistenteIndex].quantidadeVendida + quantidade;
      if (qtdTotalNova > produtoParaAdicionar.estoque) {
        Alert.alert("Estoque Insuficiente", `Você já tem ${novosItens[itemExistenteIndex].quantidadeVendida}. Estoque total para "${produtoParaAdicionar.nome}": ${produtoParaAdicionar.estoque}.`);
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
    setSearchTermProduto(''); // Limpa pesquisa do modal de produto
    // setProdutoModalVisible(false); // Descomente se quiser fechar o modal após adicionar um item
    Keyboard.dismiss();
  };

  const handleRemoverItemVenda = (produtoId: number) => {
    setItensVenda(prevItens => prevItens.filter(item => item.produto.id !== produtoId));
  };

  const handleRegistrarVenda = async () => {
    // ... (lógica de registrar venda como antes) ...
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
      navigation.navigate('Dashboard');
    } catch (error: any) {
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
      <TouchableOpacity style={styles.pickerButton} onPress={() => { setSearchTermCliente(''); setClienteModalVisible(true); }}>
        <Text style={styles.pickerButtonText}>
          {selectedCliente ? selectedCliente.nome : "Selecionar Cliente"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Data da Venda</Text>
      <TextInput style={styles.input} value={dataVenda.toLocaleDateString('pt-BR')} editable={false} />

      <Text style={styles.sectionTitle}>Itens da Venda</Text>
      <TouchableOpacity style={styles.pickerButton} onPress={() => { setProdutoParaAdicionar(null); setQuantidadeProdutoInput("1"); setSearchTermProduto(''); setProdutoModalVisible(true); }}>
        <Text style={styles.pickerButtonText}>+ Adicionar Produto à Venda</Text>
      </TouchableOpacity>

      {itensVenda.length > 0 && (
        <FlatList
          data={itensVenda}
          scrollEnabled={false}
          keyExtractor={(item, index) => `${item.produto.id}_${index}`}
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
        onRequestClose={() => {setClienteModalVisible(false); setSearchTermCliente('');}}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Selecione um Cliente</Text>
            <TextInput
                style={styles.input} // Reutilize o estilo de input ou crie um específico para modal
                placeholder="Pesquisar cliente por nome..."
                value={searchTermCliente}
                onChangeText={setSearchTermCliente}
            />
            <FlatList
              data={listaClientesFiltrada}
              renderItem={renderClienteItemModal}
              keyExtractor={(item) => item.id.toString()}
              style={{width: '100%', maxHeight: '60%'}} // Ajuste maxHeight
              ListEmptyComponent={<Text>Nenhum cliente encontrado.</Text>}
            />
            <View style={{marginTop:15}}>
                <RNButton title="Fechar" onPress={() => {setClienteModalVisible(false); setSearchTermCliente('');}} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para Selecionar Produto e Quantidade */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={produtoModalVisible}
        onRequestClose={() => {setProdutoModalVisible(false); setProdutoParaAdicionar(null); setSearchTermProduto('');}}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {!produtoParaAdicionar ? (
              <>
                <Text style={styles.modalTitle}>Selecione um Produto</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Pesquisar produto por nome..."
                    value={searchTermProduto}
                    onChangeText={setSearchTermProduto}
                />
                <FlatList
                  data={listaProdutosFiltrada} // Usa a lista filtrada
                  renderItem={renderProdutoItemModal}
                  keyExtractor={(item) => item.id.toString()}
                  style={{width: '100%', maxHeight: '50%'}} // Ajuste maxHeight
                  ListEmptyComponent={<Text>Nenhum produto encontrado ou com estoque.</Text>}
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
                        autoFocus={true}
                    />
                </View>
                <TouchableOpacity style={styles.confirmAddItemButton} onPress={handleConfirmarAdicaoItem}>
                    <Text style={styles.confirmAddItemButtonText}>Confirmar Item</Text>
                </TouchableOpacity>
              </>
            )}
            <View style={{marginTop:15}}>
                <RNButton title={produtoParaAdicionar ? "Voltar para Lista de Produtos" : "Fechar Modal"} onPress={() => {
                    if (produtoParaAdicionar) {
                        setProdutoParaAdicionar(null); // Volta para a lista de produtos
                        setSearchTermProduto(''); // Limpa a pesquisa ao voltar para a lista
                    } else {
                        setProdutoModalVisible(false);
                        setSearchTermProduto('');
                    }
                }} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}