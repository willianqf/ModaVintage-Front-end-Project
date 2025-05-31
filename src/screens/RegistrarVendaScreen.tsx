import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, ScrollView,
  FlatList, Modal, ActivityIndicator, Button as RNButton, Keyboard
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Ajuste o caminho se necessário
import { styles } from './stylesRegistrarVenda';
import { Cliente } from './ListarClientesScreen'; 
import { Produto } from './ListarMercadoriasScreen'; 

const API_BASE_URL = 'http://192.168.1.5:8080';

interface ItemVendaInput {
  produto: Produto;
  quantidadeVendida: number;
  precoUnitario: number;
}

type RegistrarVendaNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegistrarVenda'>;
type RegistrarVendaScreenRouteProp = RouteProp<RootStackParamList, 'RegistrarVenda'>;

export default function RegistrarVendaScreen() {
  const navigation = useNavigation<RegistrarVendaNavigationProp>();
  const route = useRoute<RegistrarVendaScreenRouteProp>();

  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [itensVenda, setItensVenda] = useState<ItemVendaInput[]>([]);
  const [dataVenda, setDataVenda] = useState(new Date()); // Data atual por padrão
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

  const fetchDataForModals = async () => {
    setIsFetchingModalData(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert("Autenticação", "Token não encontrado. Faça login novamente.");
        setIsFetchingModalData(false);
        return;
      }

      const [clientesRes, produtosRes] = await Promise.all([
        axios.get<Cliente[]>(`${API_BASE_URL}/clientes/todos`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get<Produto[]>(`${API_BASE_URL}/produtos/todos`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const clientesData = clientesRes.data || [];
      // Ordenar clientes alfabeticamente
      const clientesOrdenados = clientesData.sort((a, b) => a.nome.localeCompare(b.nome));
      setListaClientesMaster(clientesOrdenados);
      setListaClientesFiltrada(clientesOrdenados); // Inicializa filtrada com todos ordenados

      const produtosData = produtosRes.data || [];
      const produtosComEstoque = produtosData.filter((p: Produto) => p.estoque > 0)
                                         .sort((a,b) => a.nome.localeCompare(b.nome)); // Ordenar produtos
      setListaProdutosMaster(produtosComEstoque);
      setListaProdutosFiltrada(produtosComEstoque); // Inicializa filtrada com todos ordenados

    } catch (error: any) {
      console.error("Erro ao buscar dados para modais:", JSON.stringify(error.response?.data || error.message));
      Alert.alert("Erro de Carregamento", "Não foi possível carregar dados de clientes ou produtos.");
    } finally {
      setIsFetchingModalData(false);
    }
  };

  // Efeito para processar cliente recém-adicionado
  useEffect(() => {
    if (route.params?.newlyAddedClient) {
      const novoCliente = route.params.newlyAddedClient;
      setSelectedCliente(novoCliente);
      // Adiciona o novo cliente à lista local (master e filtrada) para que apareça no modal sem novo fetch
      setListaClientesMaster(prev => {
          const existe = prev.find(c => c.id === novoCliente.id);
          const updatedList = existe ? prev.map(c => c.id === novoCliente.id ? novoCliente : c) : [novoCliente, ...prev];
          return updatedList.sort((a,b) => a.nome.localeCompare(b.nome));
      });
      // Limpa o parâmetro da rota para evitar reprocessamento
      navigation.setParams({ newlyAddedClient: undefined });
    }
  }, [route.params?.newlyAddedClient, navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchDataForModals();
      // Resetar o formulário apenas se não estivermos voltando de uma adição de cliente bem-sucedida
      if (!route.params?.newlyAddedClient) {
        setSelectedCliente(null);
        setItensVenda([]);
        setTotalVenda(0); // Reseta total da venda
        setDataVenda(new Date()); // Reseta data da venda
      }
      // Sempre resetar termos de pesquisa e seleção de produto para adicionar
      setSearchTermCliente('');
      setSearchTermProduto('');
      setProdutoParaAdicionar(null);
      setQuantidadeProdutoInput('1');
      console.log("RegistrarVendaScreen focado.");
      return () => {};
    }, [route.params?.newlyAddedClient]) // Dependência para reavaliar o reset
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
    setQuantidadeProdutoInput('1'); // Reseta quantidade ao selecionar novo produto
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
      novosItens.push({ produto: produtoParaAdicionar, quantidadeVendida: quantidade, precoUnitario: produtoParaAdicionar.preco });
    }
    setItensVenda(novosItens);
    setProdutoParaAdicionar(null); // Reseta seleção de produto para permitir nova escolha
    setQuantidadeProdutoInput('1');
    // Não fecha o modal de produto automaticamente, permite adicionar mais ou fechar manualmente
    // setProdutoModalVisible(false); 
    setSearchTermProduto(''); // Limpa pesquisa de produto
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
          quantidade: item.quantidadeVendida, // Já corrigido anteriormente
        })),
      };

      console.log("Enviando payload da venda:", JSON.stringify(payload, null, 2));

      await axios.post(`${API_BASE_URL}/vendas`, payload, { headers: { Authorization: `Bearer ${token}` } });
      Alert.alert("Sucesso", "Venda registrada com sucesso!");
      navigation.goBack(); 
    } catch (error: any) {
      console.error("Erro ao registrar venda:", JSON.stringify(error.response?.data || error.message));
      let errorMessage = "Não foi possível registrar a venda.";
       if (axios.isAxiosError(error) && error.response) {
            if (error.response.data?.message) errorMessage = error.response.data.message;
            else if (typeof error.response.data === 'string' && error.response.data.length < 200) errorMessage = error.response.data; // Evitar HTML longo
            else if (error.response.status === 401 || error.response.status === 403) errorMessage = "Erro de autenticação.";
           } else if (error.message) {
               errorMessage = error.message;
           }
      Alert.alert("Erro ao Registrar", errorMessage);
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
            setSearchTermCliente(''); 
            setListaClientesFiltrada(listaClientesMaster); 
            setClienteModalVisible(true); 
        }}
      >
        <Text style={styles.pickerButtonText}>{selectedCliente ? selectedCliente.nome : "Selecionar Cliente"}</Text>
      </TouchableOpacity>

      {/* NOVO BOTÃO PARA CADASTRAR CLIENTE */}
      <TouchableOpacity
        style={[styles.pickerButton, styles.cadastrarNovoButton]} // Você precisará criar este estilo
        onPress={() => navigation.navigate('AdicionarCliente', { originRoute: 'RegistrarVenda' })}
      >
        <Text style={styles.pickerButtonText}>+ Cadastrar Novo Cliente</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Data da Venda</Text>
      <TextInput style={styles.input} value={dataVenda.toLocaleDateString('pt-BR')} editable={false} />

      <Text style={styles.sectionTitle}>Itens da Venda</Text>
      <TouchableOpacity 
        style={styles.pickerButton} 
        onPress={() => { 
            setProdutoParaAdicionar(null); 
            setQuantidadeProdutoInput("1"); 
            setSearchTermProduto(''); 
            setListaProdutosFiltrada(listaProdutosMaster.filter(p => p.estoque > 0)); 
            setProdutoModalVisible(true); 
        }}
      >
        <Text style={styles.pickerButtonText}>+ Adicionar Produto à Venda</Text>
      </TouchableOpacity>

      {isFetchingModalData && <ActivityIndicator style={{marginVertical: 10}} size="small" color="#323588" />}

      {itensVenda.length > 0 && (
        <FlatList
          data={itensVenda}
          scrollEnabled={false} // Para evitar scroll dentro de scroll
          keyExtractor={(item, index) => `${item.produto.id}_${index}`} // Chave mais estável
          renderItem={renderItemVendaNaTela}
          style={{ maxHeight: 300, marginTop: 10, width: '100%' }} // Aumentei um pouco o maxHeight
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
            {isFetchingModalData && listaClientesFiltrada.length === 0 ? 
                <ActivityIndicator style={{marginVertical: 20}} size="small" /> :
                <FlatList data={listaClientesFiltrada} renderItem={renderClienteItemModal} keyExtractor={(item) => item.id.toString()} style={{width: '100%', maxHeight: '60%'}} ListEmptyComponent={<Text style={styles.emptyModalText}>Nenhum cliente encontrado.</Text>} />
            }
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
                {isFetchingModalData && listaProdutosFiltrada.length === 0 ?
                    <ActivityIndicator style={{marginVertical: 20}} size="small" /> :
                    <FlatList data={listaProdutosFiltrada} renderItem={renderProdutoItemModal} keyExtractor={(item) => item.id.toString()} style={{width: '100%', maxHeight: '50%'}} ListEmptyComponent={<Text style={styles.emptyModalText}>Nenhum produto encontrado ou com estoque.</Text>} />
                }
              </>
            ) : ( 
              <>
                <Text style={styles.modalTitle}>Adicionar: {produtoParaAdicionar.nome}</Text>
                <Text style={styles.infoText}>Preço Unit.: R$ {produtoParaAdicionar.preco.toFixed(2)}</Text>
                <Text style={styles.infoText}>(Estoque Disponível: {produtoParaAdicionar.estoque})</Text>
                <View style={styles.quantityInputContainer}>
                    <Text style={{fontSize: 16, marginRight: 5}}>Quantidade:</Text>
                    <TextInput style={styles.quantityInput} value={quantidadeProdutoInput} onChangeText={setQuantidadeProdutoInput} keyboardType="number-pad" maxLength={3} autoFocus={true} returnKeyType="done" onSubmitEditing={handleConfirmarAdicaoItem} />
                </View>
                <TouchableOpacity style={styles.confirmAddItemButton} onPress={handleConfirmarAdicaoItem}>
                    <Text style={styles.confirmAddItemButtonText}>Adicionar Item à Venda</Text>
                </TouchableOpacity>
              </>
            )}
            <View style={styles.modalButtonContainer}>
                <RNButton title={produtoParaAdicionar ? "Voltar para Lista de Produtos" : "Fechar"} onPress={() => {
                    if (produtoParaAdicionar) { setProdutoParaAdicionar(null); }
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
                    returnKeyType="done"
                    onSubmitEditing={handleConfirmarNovaQuantidade}
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