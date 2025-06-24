import React, { useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, Modal, TextInput } from 'react-native';
import { styles } from './stylesListarVendas';
import { useFocusEffect } from '@react-navigation/native';
import axiosInstance from '../api/axiosInstance';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../global/themes';
import DateTimePickerModal from "react-native-modal-datetime-picker";

// --- Interfaces ---
interface Cliente { id: number; nome: string; }


interface ItemVenda { 
  id: number; 
  quantidade: number;
  nomeProdutoSnapshot: string; 
  precoUnitarioSnapshot: number; 
}

interface Venda { 
  id: number; 
  cliente: { id: number; nome: string } | null; 
  itens: ItemVenda[]; 
  totalVenda: number; 
  dataVenda: string; 
  nomeClienteSnapshot: string | null; 
}

interface PaginatedResponse<T> { 
  content: T[]; 
  last: boolean; 
  number: number; 
}

interface ActiveFilters { 
  cliente: Cliente | null; 
  dataInicio: Date | null; 
  dataFim: Date | null; 
}

const PAGE_SIZE = 10;

export default function ListarVendasScreen() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [filterCliente, setFilterCliente] = useState<Cliente | null>(null);
  const [filterDataInicio, setFilterDataInicio] = useState<Date | null>(null);
  const [filterDataFim, setFilterDataFim] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<'inicio' | 'fim' | null>(null);
  const [clienteModalVisible, setClienteModalVisible] = useState(false);
  const [listaClientes, setListaClientes] = useState<Cliente[]>([]);
  const [searchTermCliente, setSearchTermCliente] = useState('');

  const currentPageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const isFetchingRef = useRef(false);
  const activeFiltersRef = useRef<ActiveFilters>({ cliente: null, dataInicio: null, dataFim: null });

  const fetchVendas = async (pageToFetch: number, isNewSearchOrRefresh: boolean) => {
    if (isFetchingRef.current && !isNewSearchOrRefresh) return;
    if (!isNewSearchOrRefresh && !hasMoreRef.current) {
        setIsLoadingMore(false);
        return;
    }

    isFetchingRef.current = true;
    if (isNewSearchOrRefresh) setIsLoading(true); else setIsLoadingMore(true);
    setError(null);

    try {
        const url = '/vendas'; 
        const params: any = {
            page: pageToFetch,
            size: PAGE_SIZE,
            sort: 'dataVenda,desc'
        };

        const currentFilters = activeFiltersRef.current;
        if (currentFilters.cliente) {
            params.nomeCliente = currentFilters.cliente.nome;
        } else if (currentFilters.dataInicio && currentFilters.dataFim) {
            params.dataInicio = currentFilters.dataInicio.toISOString().split('T')[0];
            params.dataFim = currentFilters.dataFim.toISOString().split('T')[0];
        }

        const response = await axiosInstance.get<PaginatedResponse<Venda>>(url, { params });
        const paginatedData = response.data;
        
        setVendas(prev => isNewSearchOrRefresh ? paginatedData.content : [...prev, ...paginatedData.content]);
        hasMoreRef.current = !paginatedData.last;
        currentPageRef.current = paginatedData.number;

    } catch (err: any) {
        console.error("Erro ao buscar vendas:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Não foi possível carregar as vendas.");
    } finally {
        setIsLoading(false); 
        setIsLoadingMore(false); 
        isFetchingRef.current = false;
    }
  };

  const fetchClientesParaModal = async () => {
    try {
        const response = await axiosInstance.get<Cliente[]>('/clientes/todos');
        setListaClientes(response.data || []);
    } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar a lista de clientes para o filtro.");
        setListaClientes([]);
    }
  }

  useFocusEffect(useCallback(() => {
    handleClearFilters(true);
    fetchClientesParaModal();
  }, []));

  const handleClearFilters = (fetch = true) => {
    setFilterCliente(null);
    setFilterDataInicio(null);
    setFilterDataFim(null);
    activeFiltersRef.current = { cliente: null, dataInicio: null, dataFim: null };
    if (fetch) {
      fetchVendas(0, true);
    }
  };

  const handleApplyFilters = () => {
    if (filterDataInicio && filterDataFim && filterDataInicio > filterDataFim) {
        Alert.alert("Erro de Data", "A data de início não pode ser posterior à data de fim.");
        return;
    }
    if (filterCliente && (filterDataInicio || filterDataFim)) {
        Alert.alert("Filtro Inválido", "Filtre por cliente OU por período, não ambos.");
        return;
    }
    if ((filterDataInicio && !filterDataFim) || (!filterDataInicio && filterDataFim)) {
        Alert.alert("Período Incompleto", "Selecione data de início e fim.");
        return;
    }
    if (!filterCliente && !filterDataInicio && !filterDataFim) {
      handleClearFilters(true);
      return;
    }
    
    activeFiltersRef.current = { cliente: filterCliente, dataInicio: filterDataInicio, dataFim: filterDataFim };
    fetchVendas(0, true);
  };
  
  const showDatePickerFor = (target: 'inicio' | 'fim') => { setDatePickerTarget(target); setDatePickerVisibility(true); };
  const handleConfirmDate = (date: Date) => {
    if (datePickerTarget === 'inicio') setFilterDataInicio(date); else setFilterDataFim(date);
    setDatePickerVisibility(false);
  };
  const handleSelectCliente = (cliente: Cliente) => { setFilterCliente(cliente); setClienteModalVisible(false); }

  const confirmarDelecao = (vendaId: number) => { Alert.alert("Cancelar Venda", "Tem certeza? O estoque será estornado.", [{ text: "Não" }, { text: "Sim", onPress: () => handleDeletarVenda(vendaId) }]) };
  const handleDeletarVenda = async (vendaId: number) => {
    setIsDeleting(vendaId);
    try {
      await axiosInstance.delete(`/vendas/${vendaId}`);
      fetchVendas(0, true);
    } catch (error: any) {
      Alert.alert("Erro", error.response?.data?.erro || "Não foi possível cancelar a venda.");
    } finally {
      setIsDeleting(null);
    }
  };

  const formatarData = (dataISO: string) => new Date(dataISO).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });


  const renderVendaItem = ({ item }: { item: Venda }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}><Text style={styles.saleId}>Venda ID: {item.id}</Text><Text style={styles.saleDate}>{formatarData(item.dataVenda)}</Text></View>
      <Text style={styles.customerName}>Cliente: {item.nomeClienteSnapshot || 'Não informado'}</Text>
      <Text style={styles.itemsTitle}>Itens:</Text>
      {item.itens.slice(0, 3).map(iv => (
        <Text key={iv.id} style={styles.itemDetailText}>
          - {iv.quantidade || 0}x {iv.nomeProdutoSnapshot} (R$ {(iv.precoUnitarioSnapshot || 0).toFixed(2)} cada)
        </Text>
      ))}
      {item.itens.length > 3 && <Text style={styles.itemDetailText}>...e mais {item.itens.length - 3} item(ns)</Text>}
      <Text style={styles.totalSale}>Total: R$ {item.totalVenda.toFixed(2)}</Text>
      <View style={styles.actionsContainer}><TouchableOpacity style={styles.cancelSaleButton} onPress={() => confirmarDelecao(item.id)} disabled={isDeleting === item.id}>{isDeleting === item.id ? <ActivityIndicator size="small" color={theme.colors.error} /> : <Text style={styles.cancelSaleButtonText}>Cancelar Venda</Text>}</TouchableOpacity></View>
    </View>
  );

  const renderFiltros = () => (
    <View style={styles.filtersContainer}>
      <TouchableOpacity style={[styles.filterButton, filterCliente && styles.filterButtonActive]} onPress={() => setClienteModalVisible(true)}>
        <MaterialCommunityIcons name="account-outline" size={20} color={theme.colors.primary} />
        <Text style={styles.filterButtonText} numberOfLines={1}>{filterCliente ? filterCliente.nome : 'Filtrar por Cliente'}</Text>
      </TouchableOpacity>
      <View style={[styles.filterRow, {marginTop: theme.spacing.sm}]}>
        <TouchableOpacity style={[styles.filterButton, { marginRight: theme.spacing.sm }, filterDataInicio && styles.filterButtonActive]} onPress={() => showDatePickerFor('inicio')}>
          <MaterialCommunityIcons name="calendar-start" size={20} color={theme.colors.primary} />
          <Text style={styles.filterButtonText}>{filterDataInicio ? filterDataInicio.toLocaleDateString('pt-BR') : 'Data Início'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, filterDataFim && styles.filterButtonActive]} onPress={() => showDatePickerFor('fim')}>
          <MaterialCommunityIcons name="calendar-end" size={20} color={theme.colors.primary} />
          <Text style={styles.filterButtonText}>{filterDataFim ? filterDataFim.toLocaleDateString('pt-BR') : 'Data Fim'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.filterActions}>
        <TouchableOpacity style={styles.clearFilterButton} onPress={() => handleClearFilters(true)}><Text style={styles.clearFilterButtonText}>LIMPAR</Text></TouchableOpacity>
        <TouchableOpacity style={styles.applyFilterButton} onPress={handleApplyFilters}><Text style={styles.applyFilterButtonText}>APLICAR</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Histórico de Vendas</Text></View>
      <FlatList
        data={vendas}
        renderItem={renderVendaItem}
        keyExtractor={(item) => `venda-${item.id}`}
        ListHeaderComponent={renderFiltros}
        onRefresh={() => handleClearFilters(true)}
        refreshing={isLoading}
        onEndReached={() => {if (hasMoreRef.current) { fetchVendas(currentPageRef.current + 1, false); }}}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isLoadingMore ? <ActivityIndicator style={{ margin: 20 }} color={theme.colors.primary}/> : null}
        ListEmptyComponent={!isLoading ? <View style={styles.centered}><Text style={styles.emptyDataText}>{error || "Nenhuma venda encontrada."}</Text></View> : null}
      />
      <DateTimePickerModal isVisible={isDatePickerVisible} mode="date" onConfirm={handleConfirmDate} onCancel={() => setDatePickerVisibility(false)} />
      <Modal animationType="fade" transparent visible={clienteModalVisible} onRequestClose={() => setClienteModalVisible(false)}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Selecionar Cliente</Text>
                <TextInput style={styles.modalSearchInput} placeholder="Pesquisar..." value={searchTermCliente} onChangeText={setSearchTermCliente}/>
                <FlatList
                    data={listaClientes.filter(c => c.nome.toLowerCase().includes(searchTermCliente.toLowerCase()))}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({item}) => <TouchableOpacity style={styles.modalListItem} onPress={() => handleSelectCliente(item)}><Text style={styles.modalListItemText}>{item.nome}</Text></TouchableOpacity>}
                    ListEmptyComponent={<View style={{padding: 20}}><Text style={{textAlign: 'center'}}>Nenhum cliente encontrado</Text></View>}
                />
                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setClienteModalVisible(false)}><Text style={styles.modalCloseButtonText}>Fechar</Text></TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
}