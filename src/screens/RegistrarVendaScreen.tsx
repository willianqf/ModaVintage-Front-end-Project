import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, ScrollView,
  FlatList, Modal, ActivityIndicator, Button as RNButton, Keyboard
} from 'react-native';
// import axios from 'axios'; // REMOVA esta linha
// import * as SecureStore from 'expo-secure-store'; // Não é mais necessário aqui
import { useNavigation, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { styles } from './stylesRegistrarVenda'; //
import { Cliente } from './ListarClientesScreen'; //
import { Produto } from './ListarMercadoriasScreen'; //

// Importe a instância configurada do Axios e o helper isAxiosError
import axiosInstance from '../api/axiosInstance'; // Ajuste o caminho se necessário
import axios from 'axios'; // Para usar axios.isAxiosError

// const API_BASE_URL = 'http://192.168.1.5:8080'; // Não é mais necessário

interface ItemVendaInput {
  produto: Produto; // Mantém a estrutura original, o backend espera o ID do produto
  quantidadeVendida: number;
  precoUnitario: number; // Este é o preço de venda do produto no momento da adição ao carrinho
}

type RegistrarVendaNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegistrarVenda'>;
type RegistrarVendaScreenRouteProp = RouteProp<RootStackParamList, 'RegistrarVenda'>;

export default function RegistrarVendaScreen() {
  const navigation = useNavigation<RegistrarVendaNavigationProp>();
  const route = useRoute<RegistrarVendaScreenRouteProp>();

  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [itensVenda, setItensVenda] = useState<ItemVendaInput[]>([]);
  const [dataVenda, setDataVenda] = useState(new Date());
  const [totalVenda, setTotalVenda] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Para o botão de registrar venda
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
      // O token é adicionado automaticamente pelo axiosInstance
      // As chamadas para /clientes/todos e /produtos/todos retornam listas, não respostas paginadas.
      // Se forem paginadas no backend, esta lógica precisaria mudar para carregar todas as páginas ou implementar paginação no modal.
      // O ClienteController e ProdutoController têm endpoints /todos que listam todos os ativos
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
      console.error("RegistrarVendaScreen: Erro ao buscar dados para modais:", JSON.stringify(error.response?.data || error.message));
      if (axios.isAxiosError(error) && error.response?.status !== 401) {
        Alert.alert("Erro de Carregamento", "Não foi possível carregar dados de clientes ou produtos.");
      } else if(!axios.isAxiosError(error)) {
        Alert.alert("Erro Desconhecido", "Ocorreu um erro inesperado ao carregar dados.");
      }
      // Se for 401, o interceptor global trata.
    } finally {
      setIsFetchingModalData(false);
    }
  }, []); // useCallback sem dependências, pois não usa nada do escopo externo que muda

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

  useFocusEffect(
    useCallback(() => {
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
      console.log("RegistrarVendaScreen focado.");
      return () => { };
    }, [fetchDataForModals, route.params?.newlyAddedClient])
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
      // O precoUnitario aqui é o preço de venda do produto no momento da adição.
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
      // O token é adicionado automaticamente pelo axiosInstance
      const payload = {
        cliente: selectedCliente ? { id: selectedCliente.id } : null,
        // O backend espera 'quantidade' e não 'quantidadeVendida' no item.
        // O backend também espera o ID do produto.
        // VendaService.java: itemRequest.getProduto().getId() e itemRequest.getQuantidade()
        itens: itensVenda.map(item => ({
          produto: { id: item.produto.id }, // Envia apenas o ID do produto
          quantidade: item.quantidadeVendida, // Mapeia quantidadeVendida para quantidade
          // O backend irá buscar o preço do produto e outros detalhes para criar os snapshots.
          // O precoUnitario do ItemVendaInput é usado apenas para cálculo de total no frontend.
        })),
        // dataVenda e totalVenda são calculados/definidos pelo backend.
      };

      console.log("RegistrarVendaScreen: Enviando payload da venda:", JSON.stringify(payload, null, 2));

      // Use axiosInstance
      await axiosInstance.post('/vendas', payload); //
      Alert.alert("Sucesso", "Venda registrada com sucesso!");
      navigation.goBack();
    } catch (error: any) {
      console.error("RegistrarVendaScreen: Erro ao registrar venda:", JSON.stringify(error.response?.data || error.message));
      let errorMessage = "Não foi possível registrar a venda.";
      if (axios.isAxiosError(error) && error.response) {
         if (error.response.status !== 401) { // 401 é tratado globalmente
            errorMessage = error.response.data?.erro || error.response.data?.message || errorMessage;
            if (typeof error.response.data === 'string' && error.response.data.length < 200) errorMessage = error.response.data;
         } else {
             console.warn("RegistrarVendaScreen: Erro 401, o interceptor deve ter deslogado.");
             // O alerta de erro 401 pode ser suprimido aqui, pois o usuário será deslogado.
             return; // Interrompe a execução para evitar Alert após logout.
         }
      } else if (!axios.isAxiosError(error) && error.message) {
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
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.headerTitle}>Registrar Nova Venda</Text>

      <Text style={styles.sectionTitle}>Cliente (Opcional)</Text>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => {
          setSearchTermCliente('');
          // Garante que a lista filtrada é resetada para a master ao abrir o modal
          setListaClientesFiltrada(listaClientesMaster); 
          setClienteModalVisible(true);
        }}
      >
        <Text style={styles.pickerButtonText}>{selectedCliente ? selectedCliente.nome : "Selecionar Cliente"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.pickerButton, styles.cadastrarNovoButton]} //
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
          // Garante que a lista filtrada é resetada para a master (com estoque) ao abrir
          setListaProdutosFiltrada(listaProdutosMaster.filter(p => p.estoque > 0)); 
          setProdutoModalVisible(true);
        }}
      >
        <Text style={styles.pickerButtonText}>+ Adicionar Produto à Venda</Text>
      </TouchableOpacity>

      {isFetchingModalData && <ActivityIndicator style={{ marginVertical: 10 }} size="small" color="#323588" />}

      {itensVenda.length > 0 && (
        <FlatList
          data={itensVenda}
          scrollEnabled={false}
          keyExtractor={(item, index) => `${item.produto.id}_${index}`}
          renderItem={renderItemVendaNaTela}
          style={{ maxHeight: 300, marginTop: 10, width: '100%' }}
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
      <Modal animationType="slide" transparent={true} visible={clienteModalVisible} onRequestClose={() => { setClienteModalVisible(false); setSearchTermCliente(''); }}>
        <View style={styles.centeredView}><View style={styles.modalView}>
          <Text style={styles.modalTitle}>Selecione um Cliente</Text>
          <TextInput style={styles.modalSearchInput} placeholder="Pesquisar cliente..." value={searchTermCliente} onChangeText={setSearchTermCliente} placeholderTextColor="#888" />
          {isFetchingModalData && listaClientesFiltrada.length === 0 ?
            <ActivityIndicator style={{ marginVertical: 20 }} size="small" /> :
            <FlatList data={listaClientesFiltrada} renderItem={renderClienteItemModal} keyExtractor={(item) => item.id.toString()} style={{ width: '100%', maxHeight: '60%' }} ListEmptyComponent={<Text style={styles.emptyModalText}>Nenhum cliente encontrado.</Text>} />
          }
          <View style={styles.modalButtonContainer}><RNButton title="Fechar" onPress={() => { setClienteModalVisible(false); setSearchTermCliente(''); }} color="#8B0000" /></View>
        </View></View>
      </Modal>

      {/* Modal para Selecionar Produto e Quantidade */}
      <Modal animationType="slide" transparent={true} visible={produtoModalVisible} onRequestClose={() => { setProdutoModalVisible(false); setProdutoParaAdicionar(null); setSearchTermProduto(''); }}>
        <View style={styles.centeredView}><View style={styles.modalView}>
          {!produtoParaAdicionar ? (
            <>
              <Text style={styles.modalTitle}>Selecione um Produto</Text>
              <TextInput style={styles.modalSearchInput} placeholder="Pesquisar produto..." value={searchTermProduto} onChangeText={setSearchTermProduto} placeholderTextColor="#888"/>
              {isFetchingModalData && listaProdutosFiltrada.length === 0 ?
                <ActivityIndicator style={{ marginVertical: 20 }} size="small" /> :
                <FlatList data={listaProdutosFiltrada} renderItem={renderProdutoItemModal} keyExtractor={(item) => item.id.toString()} style={{ width: '100%', maxHeight: '50%' }} ListEmptyComponent={<Text style={styles.emptyModalText}>Nenhum produto encontrado ou com estoque.</Text>} />
              }
            </>
          ) : (
            <>
              <Text style={styles.modalTitle}>Adicionar: {produtoParaAdicionar.nome}</Text>
              <Text style={styles.infoText}>Preço Unit.: R$ {produtoParaAdicionar.preco.toFixed(2)}</Text>
              <Text style={styles.infoText}>(Estoque Disponível: {produtoParaAdicionar.estoque})</Text>
              <View style={styles.quantityInputContainer}>
                <Text style={{ fontSize: 16, marginRight: 5 }}>Quantidade:</Text>
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
              else { setProdutoModalVisible(false); setSearchTermProduto(''); }
            }} color="#8B0000" />
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
                  <Text style={{ fontSize: 16, marginRight: 5 }}>Nova Quantidade:</Text>
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