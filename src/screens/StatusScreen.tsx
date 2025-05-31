import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Dimensions, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BarChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { styles, chartConfig as originalChartConfig } from './stylesStatus';

const API_BASE_URL = 'http://192.168.1.5:8080';
const screenWidth = Dimensions.get("window").width;

// Interfaces
interface RelatorioMensalDTO {
  mesAno: string;
  valor?: number; 
  totalVendido?: number;
}

interface RelatorioLucratividadeData {
  periodo: string;
  totalReceita: number;
  totalCmv: number;
  totalLucroBruto: number;
}

interface ChartDataset {
    data: number[];
    color?: (opacity: number) => string;
    legend?: string;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  legend?: string[];
}

const mesesAbreviados: { [key: string]: string } = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
};

const formatMesAnoParaLabel = (mesAno: string): string => {
    const [ano, mes] = mesAno.split('-');
    return `${mesesAbreviados[mes] || mes}/${ano.substring(2)}`;
};

const formatYLabelValue = (value: string): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(num % 1 === 0 ? 0 : 2);
};

const chartConfigWithYFormat = {
    ...originalChartConfig,
    formatYLabel: formatYLabelValue,
    decimalPlaces: 2, // Usado pela lib para arredondar valores no topo da barra se showValuesOnTopOfBars=true
    segments: 5, 
};


export default function StatusScreen() {
  const [vendasChartData, setVendasChartData] = useState<ChartData | null>(null);
  const [entradaSaidaChartData, setEntradaSaidaChartData] = useState<ChartData | null>(null);
  const [lucratividadeChartData, setLucratividadeChartData] = useState<ChartData | null>(null);

  const [isLoadingVendas, setIsLoadingVendas] = useState(true);
  const [isLoadingEntradaSaida, setIsLoadingEntradaSaida] = useState(true);
  const [isLoadingLucratividade, setIsLoadingLucratividade] = useState(true);
  
  const [errorGeral, setErrorGeral] = useState<string | null>(null);
  const [errorLucratividade, setErrorLucratividade] = useState<string | null>(null);

  const fetchDadosGerais = async () => {
    setIsLoadingVendas(true);
    setIsLoadingEntradaSaida(true);
    setErrorGeral(null);
    
    let token: string | null = null;
    let fetchedVendasData: RelatorioMensalDTO[] = [];
    let fetchedEntradasData: RelatorioMensalDTO[] = [];
    let ocorreuErro = false;

    try {
      token = await SecureStore.getItemAsync('userToken');
      if (!token) throw new Error("Token não encontrado. Faça login.");

      try {
        const vendasRes = await axios.get<RelatorioMensalDTO[]>(`${API_BASE_URL}/vendas/relatorio/total-mensal`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchedVendasData = vendasRes.data || [];
        console.log("STATUS_SCREEN - Dados Brutos de Vendas (totalVendido):", JSON.stringify(fetchedVendasData, null, 2));

        if (fetchedVendasData.length > 0) {
            const labels = fetchedVendasData.map(item => formatMesAnoParaLabel(item.mesAno));
            const data = fetchedVendasData.map(item => parseFloat((item.totalVendido || 0).toFixed(2)));
            const dataForVendasChart = {
              labels,
              datasets: [{ data, color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})` }],
            };
            console.log("STATUS_SCREEN - Dados Formatados para Gráfico Vendas Mensais:", JSON.stringify(dataForVendasChart, null, 2));
            setVendasChartData(dataForVendasChart);
        } else {
            setVendasChartData(null);
        }
      } catch (err) {
        console.error("Erro ao buscar dados de vendas:", err);
        ocorreuErro = true;
        setVendasChartData(null);
      } finally {
        setIsLoadingVendas(false);
      }

      try {
        const tokenEntradas = token || await SecureStore.getItemAsync('userToken');
        if (!tokenEntradas) throw new Error("Token não encontrado para buscar entradas de estoque.");

        const entradasRes = await axios.get<RelatorioMensalDTO[]>(`${API_BASE_URL}/produtos/relatorio/valor-entrada-estoque-mensal`, {
          headers: { Authorization: `Bearer ${tokenEntradas}` },
        });
        fetchedEntradasData = entradasRes.data || [];
        console.log("STATUS_SCREEN - Dados Brutos de Entrada de Estoque (valor):", JSON.stringify(fetchedEntradasData, null, 2));
      } catch (err) {
        console.error("Erro ao buscar dados de entrada de estoque:", err);
        ocorreuErro = true;
      } finally {
        setIsLoadingEntradaSaida(false);
      }

      const allPeriodsSet = new Set<string>();
      fetchedVendasData.forEach(item => allPeriodsSet.add(item.mesAno));
      fetchedEntradasData.forEach(item => allPeriodsSet.add(item.mesAno));

      if (allPeriodsSet.size > 0) {
        const sortedPeriods = Array.from(allPeriodsSet).sort((a, b) => {
          const [aYear, aMonth] = a.split('-').map(Number);
          const [bYear, bMonth] = b.split('-').map(Number);
          if (aYear !== bYear) return aYear - bYear;
          return aMonth - bMonth;
        });
        
        const finalLabels = sortedPeriods.map(formatMesAnoParaLabel);

        const saidaValues = sortedPeriods.map(periodo => {
          const vendaItem = fetchedVendasData.find(item => item.mesAno === periodo);
          return parseFloat((vendaItem?.totalVendido || 0).toFixed(2));
        });

        const entradaValues = sortedPeriods.map(periodo => {
          const entradaItem = fetchedEntradasData.find(item => item.mesAno === periodo);
          return parseFloat((entradaItem?.valor || 0).toFixed(2));
        });
        
        const dataForEntradaSaidaChart = {
          labels: finalLabels,
          datasets: [
            { data: entradaValues, legend: "Entrada", color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})` },
            { data: saidaValues, legend: "Saída", color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})` }
          ],
          legend: ["Entrada", "Saída"]
        };
        console.log("STATUS_SCREEN - Dados Formatados para Gráfico Entrada x Saída:", JSON.stringify(dataForEntradaSaidaChart, null, 2));
        setEntradaSaidaChartData(dataForEntradaSaidaChart);
      } else {
        setEntradaSaidaChartData(null);
      }

      if(ocorreuErro && !errorGeral) {
        setErrorGeral("Falha ao carregar alguns dados dos relatórios.");
      }

    } catch (err: any) {
      console.error("Erro geral em fetchDadosGerais (possivelmente token):", err);
      setErrorGeral(err.message || "Erro ao buscar dados gerais.");
      setVendasChartData(null);
      setEntradaSaidaChartData(null);
      setIsLoadingVendas(false);
      setIsLoadingEntradaSaida(false);
    }
  };

  const fetchLucratividadeData = async () => {
    setIsLoadingLucratividade(true);
    setErrorLucratividade(null);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) throw new Error("Token não encontrado.");

      const response = await axios.get<RelatorioLucratividadeData[]>(
        `${API_BASE_URL}/vendas/relatorio/lucratividade-mensal`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("STATUS_SCREEN - Dados Brutos de Lucratividade:", JSON.stringify(response.data, null, 2));

      if (response.data && response.data.length > 0) {
        const labels = response.data.map(item => formatMesAnoParaLabel(item.periodo));
        const receitas = response.data.map(item => parseFloat(item.totalReceita.toFixed(2)));
        const cmvs = response.data.map(item => parseFloat(item.totalCmv.toFixed(2)));
        const lucros = response.data.map(item => parseFloat(item.totalLucroBruto.toFixed(2)));

        const datasets: ChartDataset[] = [];
        datasets.push({
            data: receitas,
            color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`, 
            legend: "Receita"
        });
        datasets.push({
            data: cmvs,
            color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, 
            legend: "CMV"
        });
        datasets.push({
            data: lucros,
            color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`, 
            legend: "Lucro Bruto"
        });
        
        const dataForLucratividadeChart = {
          labels: labels,
          datasets: datasets,
          legend: datasets.map(ds => ds.legend).filter(Boolean) as string[]
        };
        console.log("STATUS_SCREEN - Dados Formatados para Gráfico Lucratividade:", JSON.stringify(dataForLucratividadeChart, null, 2));
        setLucratividadeChartData(dataForLucratividadeChart);

      } else {
        setLucratividadeChartData(null);
      }
    } catch (err: any) {
      console.error("Erro ao buscar dados de lucratividade:", err.response?.data || err.message);
      setErrorLucratividade("Não foi possível carregar os dados de lucratividade.");
      setLucratividadeChartData(null);
    } finally {
      setIsLoadingLucratividade(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDadosGerais();
      fetchLucratividadeData();
    }, [])
  );

  const renderChart = (title: string, chartDataInput: ChartData | null, isLoadingFlag: boolean, specificError: string | null) => {
    if (isLoadingFlag) {
      return <View style={styles.centeredMessage}><ActivityIndicator size="large" color={originalChartConfig.color(1)} /><Text style={styles.loadingText}>Carregando {title.toLowerCase()}...</Text></View>;
    }
    if (specificError) {
        return <View style={styles.centeredMessage}><Text style={styles.errorText}>{specificError}</Text></View>;
    }
    // Condição de dados vazios ligeiramente ajustada para ser mais robusta
    if (!chartDataInput || !chartDataInput.labels || chartDataInput.labels.length === 0 || 
        !chartDataInput.datasets || chartDataInput.datasets.length === 0 || 
        chartDataInput.datasets.every(ds => !ds.data || ds.data.length === 0 || ds.data.every(val => val === 0))) {
      return <View style={styles.centeredMessage}><Text style={styles.emptyDataText}>Sem dados para exibir para {title}.</Text></View>;
    }
    
    // Não há necessidade de remapear 'finalChartData' se 'chartDataInput' já está no formato correto
    // A prop 'legend' no objeto de dados do BarChart é para a legenda geral abaixo do gráfico, se a lib suportar.
    // As legendas por dataset são definidas dentro de cada objeto no array 'datasets'.

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <BarChart
          // Passando chartDataInput diretamente, pois os logs confirmam que sua estrutura está correta
          data={chartDataInput} 
          width={screenWidth * 0.92}
          height={250}
          yAxisLabel="R$ "
          yAxisSuffix=""
          chartConfig={chartConfigWithYFormat}
          verticalLabelRotation={30}
          fromZero={true}
          showValuesOnTopOfBars={false} // Mantido como false para todos para consistência
        />
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Status e Relatórios</Text>
            
            {renderChart("Vendas Mensais (Valor)", vendasChartData, isLoadingVendas, errorGeral)}
            {renderChart("Entrada x Saída Mensal (Valor)", entradaSaidaChartData, isLoadingEntradaSaida, errorGeral)}
            {renderChart("Lucratividade Mensal", lucratividadeChartData, isLoadingLucratividade, errorLucratividade)}
        </View>
    </ScrollView>
  );
}