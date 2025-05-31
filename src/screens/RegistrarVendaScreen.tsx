import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, ScrollView,
  FlatList, Modal, ActivityIndicator, Button as RNButton, Keyboard
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Ajuste o caminho se necessário
import { styles } from './stylesRegistrarVenda';
import { Cliente } from './ListarClientesScreen'; // Certifique-se que este caminho está correto
import { Produto } from './ListarMercadoriasScreen'; // Certifique-se que este caminho está correto

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
  const [isLoading, setIsLoading] = useState(false); // Para o botão "Registrar Venda"
  const [isFetchingModalData, setIsFetchingModalData] = useState(false); // Novo estado para loading dos modais

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

  const fetchDataForModals = async () => {
    setIsFetchingModalData(true); // Inicia loading dos dados do modal
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert("Autenticação", "Token não encontrado. Faça login novamente.");
        setIsFetchingModalData(false);
        return; // Interrompe se não houver token
      }

      console.log("Buscando todos os clientes para modal via /clientes/todos...");
      console.log("Buscando todos os produtos para modal via /produtos/todos...");

      const [clientesRes, produtosRes] = await Promise.all([
        axios.get<Cliente[]>(`${API_BASE_URL}/clientes/todos`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get<Produto[]>(`${API_BASE_URL}/produtos/todos`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const clientesData = clientesRes.data || []; // API agora retorna array diretamente
      console.log("Clientes recebidos para modal:", clientesData.length);
      setListaClientesMaster(clientesData);
      setListaClientesFiltrada(clientesData);

      const produtosData = produtosRes.data || []; // API agora retorna array diretamente
      console.log("Produtos recebidos para modal:", produtosData.length);
      const produtosComEstoque = produtosData.filter((p: Produto) => p.estoque > 0);
      setListaProdutosMaster(produtosComEstoque);
      setListaProdutosFiltrada(produtosComEstoque);

    } catch (error: any) {
      console.error("Erro ao buscar dados para modais:", JSON.stringify(error.response?.data || error.message));
      Alert.alert("Erro", "Não foi possível carregar dados de clientes ou produtos para seleção.");
    } finally {
      setIsFetchingModalData(false); // Finaliza loading dos dados do modal
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDataForModals();
      // Resetar o formulário de venda ao focar na tela
      setSelectedCliente(null);
      setItensVenda([]);
      setDataVenda(new Date());
      setSearchTermCliente('');
      setSearchTermProduto('');
      setProdutoParaAdicionar(null);
      setQuantidadeProdutoInput('1');
      console.log("RegistrarVendaScreen focado, formulário resetado e dados dos modais buscados.");
      return () => {};
    }, [])
  );

  useEffect(() => {
    const novoTotal = itensVenda.reduce((sum, item) => sum + (item.precoUnitario * item.quantidadeVendida), 0);
    setTotalVenda(novoTotal);
  }, [itensVenda]);

  useEffect(() => {
    if (searchTermCliente === '') {
      setListaClientesFiltrada(listaClientesMaster);
    } else {
      setListaClientesFiltrada(
        listaClientesMaster.filter(c => c.nome.toLowerCase().includes(searchTermCliente.toLowerCase()))
      );
    }
  }, [searchTermCliente, listaClientesMaster]);

  useEffect(() => {
    if (searchTermProduto === '') {
      setListaProdutosFiltrada(listaProdutosMaster);
    } else {
      setListaProdutosFiltrada(
        listaProdutosMaster.filter(p => p.nome.toLowerCase().includes(searchTermProduto.toLowerCase()))
      );
    }
  }, [searchTermProduto, listaProdutosMaster]);

  const handleSelecionarCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setClienteModalVisible(false);
    setSearchTermCliente('');
  };

  const handleSelecionarProdutoParaAdicionar = (produto: Produto) => {
    setProdutoParaAdicionar(produto);
    setQuantidadeProdutoInput('1');
  };

  const handleConfirmarAdicaoItem = () => {
    if (!produtoParaAdicionar) return;
    const quantidade = parseInt(quantidadeProdutoInput, 10);
    if (isNaN(quantidade) || quantidade <= 0) {
      Alert.alert("Quantidade Inválida", "Insira uma quantidade válida."); return;
    }
    if (quantidade > produtoParaAdicionar.estoque) {
      Alert.alert("Estoque Insuficiente", `Disponível para "${produtoParaAdicionar.nome}": ${produtoParaAdicionar.estoque}.`); return;
    }
    const itemExistenteIndex = itensVenda.findIndex(item => item.produto.id === produtoParaAdicionar.id);
    let novosItens = [...itensVenda];
    if (itemExistenteIndex > -1) {
      const qtdTotalNova = novosItens[itemExistenteIndex].quantidadeVendida + quantidade;
      if (qtdTotalNova > produtoParaAdicionar.estoque) {
        Alert.alert("Estoque Insuficiente", `Você já tem ${novosItens[itemExistenteIndex].quantidadeVendida} no carrinho. Estoque total para "${produtoParaAdicionar.nome}": ${produtoParaAdicionar.estoque}.`); return;
      }
      novosItens[itemExistenteIndex].quantidadeVendida = qtdTotalNova;
    } else {
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
    if (isNaN(quantidade) || quantidade <= 0) {
      Alert.alert("Quantidade Inválida", "Insira uma quantidade válida (maior que zero)."); return;
    }
    if (quantidade > itemParaEditarQuantidade.produto.estoque) {
      Alert.alert("Estoque Insuficiente", `Estoque disponível para "${itemParaEditarQuantidade.produto.nome}": ${itemParaEditarQuantidade.produto.estoque}.`); return;
    }
    setItensVenda(prevItens =>
      prevItens.map(item =>
        item.produto.id === itemParaEditarQuantidade.produto.id
          ? { ...item, quantidadeVendida: quantidade }
          : item
      )
    );
    setEditQuantityModalVisible(false);
    setItemParaEditarQuantidade(null);
    setNovaQuantidadeInput('');
    Keyboard.dismiss();
  };

 const handleRegistrarVenda = async () => {
    if (itensVenda.length === 0) {
      Alert.alert("Venda Vazia", "Adicione pelo menos um produto à venda."); return;
    }
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) throw new Error("Token não encontrado.");

      const payload = {
        cliente: selectedCliente ? { id: selectedCliente.id } : null,
        itens: itensVenda.map(item => ({
          produto: { id: item.produto.id },
          // CORREÇÃO AQUI: mudar de 'quantidadeVendida' para 'quantidade'
          quantidade: item.quantidadeVendida, 
        // precoUnitario será definido pelo backend baseado no produto.preco, 
        // então não precisamos enviá-lo explicitamente aqui se essa for a lógica.
        // Se você PRECISAR enviar o precoUnitario do frontend (ex: promoções), 
        // o backend ItemVenda precisaria de um campo para isso e VendaService usaria ele.
        // Por ora, vamos focar na quantidade.
        })),
        // dataVenda e totalVenda são geralmente definidos pelo backend.
      };

      console.log("Enviando payload da venda:", JSON.stringify(payload, null, 2)); // Para depuração

      await axios.post(`${API_BASE_URL}/vendas`, payload, { headers: { Authorization: `Bearer ${token}` } });
      Alert.alert("Sucesso", "Venda registrada com sucesso!");
      navigation.goBack(); 
    } catch (error: any) {
      // ... (seu tratamento de erro existente) ...
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

  const renderItemVendaNaTela = ({ item }: { item: ItemVendaInput }) => (
    <View style={styles.itemListaVenda}>
      <View style={styles.itemTextoContainer}>
        <Text style={styles.itemListaTexto} numberOfLines={1} ellipsizeMode="tail">
            {item.produto.nome}
        </Text>
        <Text style={styles.itemSubDetalhes}>
            {item.quantidadeVendida}x R$ {item.precoUnitario.toFixed(2)} = R$ {(item.precoUnitario * item.quantidadeVendida).toFixed(2)}
        </Text>
      </View>
      <View style={styles.itemActionsContainer}>
        <TouchableOpacity
            style={styles.itemEditarQtdButton}
            onPress={() => handleAbrirModalEditarQuantidade(item)}
        >
          <Text style={styles.itemEditarQtdButtonTexto}>Editar Qtd</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={styles.itemRemoverButton}
            onPress={() => handleRemoverItemVenda(item.produto.id)}
        >
          <Text style={styles.itemRemoverTexto}>X</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingBottom: 30}}>
      <Text style={styles.headerTitle}>Registrar Nova Venda</Text>

      <Text style={styles.sectionTitle}>Cliente (Opcional)</Text>
      <TouchableOpacity 
        style={styles.pickerButton} 
        onPress={() => { 
            setSearchTermCliente(''); // Limpa a pesquisa ao abrir o modal
            setListaClientesFiltrada(listaClientesMaster); // Mostra todos os clientes inicialmente
            setClienteModalVisible(true); 
        }}
      >
        <Text style={styles.pickerButtonText}>{selectedCliente ? selectedCliente.nome : "Selecionar Cliente"}</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Data da Venda</Text>
      <TextInput style={styles.input} value={dataVenda.toLocaleDateString('pt-BR')} editable={false} />

      <Text style={styles.sectionTitle}>Itens da Venda</Text>
      <TouchableOpacity 
        style={styles.pickerButton} 
        onPress={() => { 
            setProdutoParaAdicionar(null); 
            setQuantidadeProdutoInput("1"); 
            setSearchTermProduto(''); // Limpa a pesquisa ao abrir o modal
            setListaProdutosFiltrada(listaProdutosMaster.filter(p => p.estoque > 0)); // Mostra todos com estoque
            setProdutoModalVisible(true); 
        }}
      >
        <Text style={styles.pickerButtonText}>+ Adicionar Produto à Venda</Text>
      </TouchableOpacity>

      {isFetchingModalData && <ActivityIndicator style={{marginVertical: 10}} size="small" color="#323588" />}

      {itensVenda.length > 0 && (
        <FlatList
          data={itensVenda}
          scrollEnabled={false}
          keyExtractor={(item, index) => `${item.produto.id}_${index}_${item.quantidadeVendida}`}
          renderItem={renderItemVendaNaTela}
          style={{ maxHeight: 250, marginTop: 10, width: '100%' }}
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
      <Modal animationType="slide" transparent={true} visible={clienteModalVisible} onRequestClose={() => {setClienteModalVisible(false); setSearchTermCliente('');}}>
        <View style={styles.centeredView}><View style={styles.modalView}>
            <Text style={styles.modalTitle}>Selecione um Cliente</Text>
            <TextInput style={styles.modalSearchInput} placeholder="Pesquisar cliente..." value={searchTermCliente} onChangeText={setSearchTermCliente}/>
            <FlatList data={listaClientesFiltrada} renderItem={renderClienteItemModal} keyExtractor={(item) => item.id.toString()} style={{width: '100%', maxHeight: '60%'}} ListEmptyComponent={<Text>Nenhum cliente encontrado.</Text>} />
            <View style={styles.modalButtonContainer}><RNButton title="Fechar" onPress={() => {setClienteModalVisible(false); setSearchTermCliente('');}} color="#8B0000" /></View>
        </View></View>
      </Modal>

      {/* Modal para Selecionar Produto e Quantidade */}
      <Modal animationType="slide" transparent={true} visible={produtoModalVisible} onRequestClose={() => {setProdutoModalVisible(false); setProdutoParaAdicionar(null); setSearchTermProduto('');}}>
        <View style={styles.centeredView}><View style={styles.modalView}>
            {!produtoParaAdicionar ? (
              <>
                <Text style={styles.modalTitle}>Selecione um Produto</Text>
                <TextInput style={styles.modalSearchInput} placeholder="Pesquisar produto..." value={searchTermProduto} onChangeText={setSearchTermProduto} />
                <FlatList data={listaProdutosFiltrada} renderItem={renderProdutoItemModal} keyExtractor={(item) => item.id.toString()} style={{width: '100%', maxHeight: '50%'}} ListEmptyComponent={<Text>Nenhum produto encontrado ou com estoque.</Text>} />
              </>
            ) : ( 
              <>
                <Text style={styles.modalTitle}>Adicionar: {produtoParaAdicionar.nome}</Text>
                <Text style={styles.infoText}>Preço Unit.: R$ {produtoParaAdicionar.preco.toFixed(2)}</Text>
                <Text style={styles.infoText}>(Estoque Disponível: {produtoParaAdicionar.estoque})</Text>
                <View style={styles.quantityInputContainer}>
                    <Text style={{fontSize: 16, marginRight: 5}}>Quantidade:</Text>
                    <TextInput style={styles.quantityInput} value={quantidadeProdutoInput} onChangeText={setQuantidadeProdutoInput} keyboardType="number-pad" maxLength={3} autoFocus={true} />
                </View>
                <TouchableOpacity style={styles.confirmAddItemButton} onPress={handleConfirmarAdicaoItem}>
                    <Text style={styles.confirmAddItemButtonText}>Adicionar Item à Venda</Text>
                </TouchableOpacity>
              </>
            )}
            <View style={styles.modalButtonContainer}>
                <RNButton title={produtoParaAdicionar ? "Voltar para Lista de Produtos" : "Fechar"} onPress={() => {
                    if (produtoParaAdicionar) { setProdutoParaAdicionar(null); /* Não limpa searchTermProduto aqui para manter o filtro */ }
                    else { setProdutoModalVisible(false); setSearchTermProduto('');}
                }} color="#8B0000"/>
            </View>
        </View></View>
      </Modal>

      {/* Modal para Editar Quantidade do Item na Venda */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editQuantityModalVisible}
        onRequestClose={() => { setEditQuantityModalVisible(false); setItemParaEditarQuantidade(null); setNovaQuantidadeInput(''); }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {itemParaEditarQuantidade && (
              <>
                <Text style={styles.modalTitle}>Editar Quantidade</Text>
                <Text style={styles.infoText}>Produto: {itemParaEditarQuantidade.produto.nome}</Text>
                <Text style={styles.infoText}>(Estoque Atual: {itemParaEditarQuantidade.produto.estoque})</Text>
                <View style={styles.quantityInputContainer}>
                  <Text style={{fontSize: 16, marginRight: 5}}>Nova Quantidade:</Text>
                  <TextInput
                    style={styles.quantityInput}
                    value={novaQuantidadeInput}
                    onChangeText={setNovaQuantidadeInput}
                    keyboardType="number-pad"
                    maxLength={3}
                    autoFocus={true}
                  />
                </View>
                <TouchableOpacity style={styles.confirmAddItemButton} onPress={handleConfirmarNovaQuantidade}>
                  <Text style={styles.confirmAddItemButtonText}>CONFIRMAR QUANTIDADE</Text>
                </TouchableOpacity>
                <View style={styles.modalButtonContainer}>
                  <RNButton title="Cancelar Edição" onPress={() => {
                    setEditQuantityModalVisible(false);
                    setItemParaEditarQuantidade(null);
                    setNovaQuantidadeInput('');
                  }} color="#8B0000" />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}