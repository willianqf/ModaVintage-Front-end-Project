import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, FlatList, Modal, ActivityIndicator, Keyboard } from 'react-native';
import { useNavigation, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { styles } from './stylesRegistrarVenda';
import { Cliente } from './ListarClientesScreen';
import { Produto } from './ListarMercadoriasScreen';
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../global/themes';

// Seus tipos de interface e navegação
interface ItemVendaInput { produto: Produto; quantidadeVendida: number; precoUnitario: number; }
type RegistrarVendaNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegistrarVenda'>;
type RegistrarVendaScreenRouteProp = RouteProp<RootStackParamList, 'RegistrarVenda'>;

export default function RegistrarVendaScreen() {
  const navigation = useNavigation<RegistrarVendaNavigationProp>();
  const route = useRoute<RegistrarVendaScreenRouteProp>();

  // --- SEU BLOCO DE ESTADOS E LÓGICA (useState, useEffect, useCallback, handlers) ---
  // --- NENHUMA ALTERAÇÃO FOI FEITA AQUI ---
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [itensVenda, setItensVenda] = useState<ItemVendaInput[]>([]);
  const [dataVenda, setDataVenda] = useState(new Date());
  const [totalVenda, setTotalVenda] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingModalData, setIsFetchingModalData] = useState(false);
  const [clienteModalVisible, setClienteModalVisible] = useState(false);
  const [produtoModalVisible, setProdutoModalVisible] = useState(false);
  const [listaClientesMaster, setListaClientesMaster] = useState<Cliente[]>([]);
  const [listaClientesFiltrada, setListaClientesFiltrada] = useState<Cliente[]>([]);
  const [searchTermCliente, setSearchTermCliente] = useState('');
  const [listaProdutosMaster, setListaProdutosMaster] = useState<Produto[]>([]);
  const [listaProdutosFiltrada, setListaProdutosFiltrada] = useState<Produto[]>([]);
  const [searchTermProduto, setSearchTermProduto] = useState('');
  const [produtoParaAdicionar, setProdutoParaAdicionar] = useState<Produto | null>(null);
  const [quantidadeProdutoInput, setQuantidadeProdutoInput] = useState('1');
  const [itemParaEditarQuantidade, setItemParaEditarQuantidade] = useState<ItemVendaInput | null>(null);
  const [novaQuantidadeInput, setNovaQuantidadeInput] = useState('');
  const [editQuantityModalVisible, setEditQuantityModalVisible] = useState(false);

  const fetchDataForModals = useCallback(async () => {
    setIsFetchingModalData(true);
    try {
      const [clientesRes, produtosRes] = await Promise.all([
        axiosInstance.get<Cliente[]>('/clientes/todos'),
        axiosInstance.get<Produto[]>('/produtos/todos')
      ]);
      const clientesData = clientesRes.data || [];
      const clientesOrdenados = clientesData.sort((a, b) => a.nome.localeCompare(b.nome));
      setListaClientesMaster(clientesOrdenados);
      setListaClientesFiltrada(clientesOrdenados);
      const produtosData = produtosRes.data || [];
      const produtosComEstoque = produtosData.filter((p: Produto) => p.estoque > 0)
        .sort((a, b) => a.nome.localeCompare(b.nome));
      setListaProdutosMaster(produtosComEstoque);
      setListaProdutosFiltrada(produtosComEstoque);
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status !== 401) { Alert.alert("Erro", "Não foi possível carregar dados."); } 
      else if (!axios.isAxiosError(error)) { Alert.alert("Erro", "Ocorreu um erro inesperado."); }
    } finally {
      setIsFetchingModalData(false);
    }
  }, []);

  useEffect(() => {
    if (route.params?.newlyAddedClient) {
      const novoCliente = route.params.newlyAddedClient;
      setSelectedCliente(novoCliente);
      setListaClientesMaster(prev => {
        const existe = prev.find(c => c.id === novoCliente.id);
        const updatedList = existe ? prev.map(c => c.id === novoCliente.id ? novoCliente : c) : [novoCliente, ...prev];
        return updatedList.sort((a, b) => a.nome.localeCompare(b.nome));
      });
      navigation.setParams({ newlyAddedClient: undefined });
    }
  }, [route.params?.newlyAddedClient, navigation]);

  useFocusEffect(useCallback(() => {
    fetchDataForModals();
    if (!route.params?.newlyAddedClient) {
      setSelectedCliente(null);
      setItensVenda([]);
      setTotalVenda(0);
      setDataVenda(new Date());
    }
    setSearchTermCliente('');
    setSearchTermProduto('');
    setProdutoParaAdicionar(null);
    setQuantidadeProdutoInput('1');
    return () => {};
  }, [fetchDataForModals, route.params?.newlyAddedClient]));

  useEffect(() => {
    const novoTotal = itensVenda.reduce((sum, item) => sum + (item.precoUnitario * item.quantidadeVendida), 0);
    setTotalVenda(novoTotal);
  }, [itensVenda]);

  useEffect(() => {
    setListaClientesFiltrada(searchTermCliente === '' ? listaClientesMaster : listaClientesMaster.filter(c => c.nome.toLowerCase().includes(searchTermCliente.toLowerCase())));
  }, [searchTermCliente, listaClientesMaster]);
  
  useEffect(() => {
    setListaProdutosFiltrada(searchTermProduto === '' ? listaProdutosMaster : listaProdutosMaster.filter(p => p.nome.toLowerCase().includes(searchTermProduto.toLowerCase())));
  }, [searchTermProduto, listaProdutosMaster]);

  const handleSelecionarCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setClienteModalVisible(false);
    setSearchTermCliente('');
  };

  const handleSelecionarProdutoParaAdicionar = (produto: Produto) => {
    setProdutoModalVisible(false);
    setProdutoParaAdicionar(produto);
    setQuantidadeProdutoInput('1');
  };

const handleConfirmarAdicaoItem = () => {
    if (!produtoParaAdicionar) return;
    const quantidade = parseInt(quantidadeProdutoInput, 10);

    if (isNaN(quantidade) || quantidade <= 0) {
      Alert.alert("Quantidade Inválida", "Insira uma quantidade válida (maior que zero)."); return;
    }
    if (quantidade > produtoParaAdicionar.estoque) {
      Alert.alert("Estoque Insuficiente", `Disponível para "${produtoParaAdicionar.nome}": ${produtoParaAdicionar.estoque}.`); return;
    }

    const itemExistenteIndex = itensVenda.findIndex(item => item.produto.id === produtoParaAdicionar.id);
    let novosItens = [...itensVenda];

    if (itemExistenteIndex > -1) {
      const qtdTotalNova = novosItens[itemExistenteIndex].quantidadeVendida + quantidade;
      if (qtdTotalNova > produtoParaAdicionar.estoque) {
        Alert.alert("Estoque Insuficiente", `Você já tem ${novosItens[itemExistenteIndex].quantidadeVendida} no carrinho. Estoque total para "${produtoParaAdicionar.nome}": ${produtoParaAdicionar.estoque}. Não é possível adicionar ${quantidade} unidade(s).`); return;
      }
      novosItens[itemExistenteIndex].quantidadeVendida = qtdTotalNova;
    } else {
      // ===== CORREÇÃO APLICADA AQUI =====
      // Voltamos a usar 'produtoParaAdicionar.preco' para o precoUnitario,
      // que é a propriedade correta na sua interface 'Produto'.
      novosItens.push({ produto: produtoParaAdicionar, quantidadeVendida: quantidade, precoUnitario: produtoParaAdicionar.preco });
    }
    setItensVenda(novosItens);
    setProdutoParaAdicionar(null);
    setQuantidadeProdutoInput('1');
    setSearchTermProduto('');
    Keyboard.dismiss();
  };

  const handleRemoverItemVenda = (produtoId: number) => {
    setItensVenda(prevItens => prevItens.filter(item => item.produto.id !== produtoId));
  };

  const handleAbrirModalEditarQuantidade = (item: ItemVendaInput) => {
    setItemParaEditarQuantidade(item);
    setNovaQuantidadeInput(item.quantidadeVendida.toString());
    setEditQuantityModalVisible(true);
  };

  const handleConfirmarNovaQuantidade = () => {
    if (!itemParaEditarQuantidade) return;
    const quantidade = parseInt(novaQuantidadeInput, 10);
    if (isNaN(quantidade) || quantidade <= 0) { Alert.alert("Quantidade Inválida", "Insira uma quantidade válida."); return; }
    if (quantidade > itemParaEditarQuantidade.produto.estoque) { Alert.alert("Estoque Insuficiente", `Estoque disponível: ${itemParaEditarQuantidade.produto.estoque}.`); return; }
    setItensVenda(prevItens =>
      prevItens.map(item =>
        item.produto.id === itemParaEditarQuantidade.produto.id ? { ...item, quantidadeVendida: quantidade } : item
      )
    );
    setEditQuantityModalVisible(false);
    setItemParaEditarQuantidade(null);
    setNovaQuantidadeInput('');
    Keyboard.dismiss();
  };

  const handleRegistrarVenda = async () => {
    if (itensVenda.length === 0) { Alert.alert("Venda Vazia", "Adicione pelo menos um produto."); return; }
    setIsLoading(true);
    try {
      const payload = {
        cliente: selectedCliente ? { id: selectedCliente.id } : null,
        itens: itensVenda.map(item => ({ produto: { id: item.produto.id }, quantidade: item.quantidadeVendida })),
      };
      await axiosInstance.post('/vendas', payload);
      Alert.alert("Sucesso", "Venda registrada com sucesso!");
      navigation.goBack();
    } catch (error: any) {
      let errorMessage = "Não foi possível registrar a venda.";
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status !== 401) {
          errorMessage = error.response.data?.erro || error.response.data?.message || errorMessage;
        } else { return; }
      } else if (!axios.isAxiosError(error) && error.message) { errorMessage = error.message; }
      Alert.alert("Erro ao Registrar", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  // --- FIM DO BLOCO DE LÓGICA ---
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Registrar Nova Venda</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Cliente</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setClienteModalVisible(true)}>
              <MaterialCommunityIcons name="account-circle-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.pickerButtonText, !selectedCliente && styles.pickerButtonTextPlaceholder]}>
                {selectedCliente ? selectedCliente.nome : 'Selecionar cliente (opcional)'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={24} color={theme.colors.placeholder} />
            </TouchableOpacity>
          </View>
          <View style={styles.formGroup}>
            <TouchableOpacity style={[styles.pickerButton, {backgroundColor: 'transparent', elevation: 0, borderWidth: 1, borderStyle: 'dashed'}]} onPress={() => navigation.navigate('AdicionarCliente', { originRoute: 'RegistrarVenda' })}>
                <MaterialCommunityIcons name="account-plus-outline" size={24} color={theme.colors.primary} />
                <Text style={[styles.pickerButtonText, {color: theme.colors.primary}]}>Cadastrar novo cliente</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Data da Venda</Text>
            <TextInput style={styles.readOnlyInput} value={dataVenda.toLocaleDateString('pt-BR')} editable={false} />
          </View>
          <View style={styles.formGroup}>
            <View style={styles.cartHeader}>
              <Text style={styles.label}>Itens</Text>
              <TouchableOpacity style={styles.addItemButton} onPress={() => setProdutoModalVisible(true)}>
                <MaterialCommunityIcons name="plus" size={20} color={theme.colors.primary} />
                <Text style={styles.addItemButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cartListContainer}>
              {itensVenda.length > 0 ? (
                <FlatList
                  data={itensVenda}
                  keyExtractor={(item, i) => `${item.produto.id}-${i}`}
                  renderItem={({ item }) => (
                    <View style={styles.cartItem}>
                        <View style={styles.itemIconContainer}>
                            <MaterialCommunityIcons name="hanger" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName} numberOfLines={1}>{item.produto.nome}</Text>
                            <Text style={styles.itemDetails}>{item.quantidadeVendida} x R$ {item.precoUnitario.toFixed(2)}</Text>
                        </View>
                        <Text style={styles.itemTotal}>R$ {(item.precoUnitario * item.quantidadeVendida).toFixed(2)}</Text>
                        <View style={styles.itemActions}>
                            <TouchableOpacity style={styles.iconButton} onPress={() => handleAbrirModalEditarQuantidade(item)}><MaterialCommunityIcons name="pencil-outline" size={22} color={theme.colors.placeholder} /></TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton} onPress={() => handleRemoverItemVenda(item.produto.id)}><MaterialCommunityIcons name="close-circle-outline" size={22} color={theme.colors.error} /></TouchableOpacity>
                        </View>
                    </View>
                  )}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyCart}>
                  <MaterialCommunityIcons name="cart-outline" size={48} color={theme.colors.placeholder} />
                  <Text style={styles.emptyCartText}>Ainda não há itens na venda.</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>R$ {totalVenda.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={handleRegistrarVenda} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color={theme.colors.surface} /> : <Text style={styles.confirmButtonText}>CONCLUIR VENDA</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={isLoading}><Text style={styles.cancelButtonText}>Cancelar</Text></TouchableOpacity>
      </View>
      
      {/* Modais */}
      <Modal animationType="fade" transparent visible={clienteModalVisible} onRequestClose={() => setClienteModalVisible(false)}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Selecionar Cliente</Text>
                <TextInput style={styles.modalSearchInput} placeholder="Pesquisar..." value={searchTermCliente} onChangeText={setSearchTermCliente}/>
                <FlatList
                    data={listaClientesFiltrada}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({item}) => <TouchableOpacity style={styles.modalListItem} onPress={() => handleSelecionarCliente(item)}><Text style={styles.modalListItemText}>{item.nome}</Text></TouchableOpacity>}
                    ListEmptyComponent={<Text style={{padding: 20, textAlign: 'center'}}>Nenhum cliente encontrado</Text>}
                />
                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setClienteModalVisible(false)}><Text style={styles.modalCloseButtonText}>Fechar</Text></TouchableOpacity>
            </View>
        </View>
      </Modal>

      <Modal animationType="fade" transparent visible={produtoModalVisible} onRequestClose={() => setProdutoModalVisible(false)}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Selecionar Produto</Text>
                <TextInput style={styles.modalSearchInput} placeholder="Pesquisar..." value={searchTermProduto} onChangeText={setSearchTermProduto}/>
                <FlatList
                    data={listaProdutosFiltrada}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({item}) => <TouchableOpacity style={styles.modalListItem} onPress={() => handleSelecionarProdutoParaAdicionar(item)}><Text style={styles.modalListItemText}>{item.nome}</Text></TouchableOpacity>}
                    ListEmptyComponent={<Text style={{padding: 20, textAlign: 'center'}}>Nenhum produto encontrado</Text>}
                />
                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setProdutoModalVisible(false)}><Text style={styles.modalCloseButtonText}>Fechar</Text></TouchableOpacity>
            </View>
        </View>
      </Modal>

      <Modal animationType="fade" transparent visible={!!produtoParaAdicionar || editQuantityModalVisible} onRequestClose={() => { setProdutoParaAdicionar(null); setEditQuantityModalVisible(false); }}>
        <View style={styles.modalOverlay}>
          <View style={styles.quantityModalView}>
             <Text style={styles.quantityModalTitle}>{editQuantityModalVisible ? "Editar Quantidade" : "Definir Quantidade"}</Text>
             <Text style={styles.quantityModalSubtitle}>{itemParaEditarQuantidade?.produto.nome || produtoParaAdicionar?.nome}</Text>
             <View style={styles.quantityControls}>
                <TouchableOpacity style={styles.iconButton} onPress={() => editQuantityModalVisible ? setNovaQuantidadeInput(q => String(Math.max(1, Number(q) - 1))) : setQuantidadeProdutoInput(q => String(Math.max(1, Number(q) - 1)))}>
                    <MaterialCommunityIcons name="minus-circle" size={50} color={theme.colors.placeholder} />
                </TouchableOpacity>
                <TextInput style={styles.quantityInput} value={editQuantityModalVisible ? novaQuantidadeInput : quantidadeProdutoInput} onChangeText={editQuantityModalVisible ? setNovaQuantidadeInput : setQuantidadeProdutoInput} keyboardType="number-pad" autoFocus/>
                <TouchableOpacity style={styles.iconButton} onPress={() => editQuantityModalVisible ? setNovaQuantidadeInput(q => String(Number(q) + 1)) : setQuantidadeProdutoInput(q => String(Number(q) + 1))}>
                    <MaterialCommunityIcons name="plus-circle" size={50} color={theme.colors.primary} />
                </TouchableOpacity>
             </View>
             <TouchableOpacity style={[styles.confirmButton, {width: '100%'}]} onPress={editQuantityModalVisible ? handleConfirmarNovaQuantidade : handleConfirmarAdicaoItem}>
                <Text style={styles.confirmButtonText}>{editQuantityModalVisible ? "CONFIRMAR" : "ADICIONAR"}</Text>
             </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}