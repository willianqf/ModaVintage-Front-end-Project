import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { styles as originalStyles, chartConfig as originalChartConfig } from './stylesStatus';

import axiosInstance from '../api/axiosInstance';
import axios from 'axios';

const screenWidth = Dimensions.get("window").width;

interface RelatorioLucratividadeData {
  periodo: string;
  totalReceita: number; // Corresponde à resposta da API
  cmv?: number;         // CMV é opcional, pois não vem da API
  totalLucroBruto: number; // Corresponde à resposta da API
}
// --- Outras Interfaces ---
interface RelatorioMensalDTO {
  mesAno: string;
  valor?: number;
  totalVendido?: number;
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
// --- Fim Interfaces ---

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
  decimalPlaces: 2,
  segments: 5,
};

const styles = StyleSheet.create({
    ...originalStyles,
    debugContainer: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    debugTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    debugText: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#333',
    }
});

export default function StatusScreen() {
  const [vendasChartData, setVendasChartData] = useState<ChartData | null>(null);
  const [entradaSaidaChartData, setEntradaSaidaChartData] = useState<ChartData | null>(null);
  const [lucratividadeChartData, setLucratividadeChartData] = useState<ChartData | null>(null);

  const [isLoadingVendas, setIsLoadingVendas] = useState(true);
  const [isLoadingEntradaSaida, setIsLoadingEntradaSaida] = useState(true);
  const [isLoadingLucratividade, setIsLoadingLucratividade] = useState(true);

  const [errorGeral, setErrorGeral] = useState<string | null>(null);
  const [errorLucratividade, setErrorLucratividade] = useState<string | null>(null);

  const [rawLucroData, setRawLucroData] = useState<any>(null);

  const fetchDadosGerais = useCallback(async () => {
    setIsLoadingVendas(true);
    setIsLoadingEntradaSaida(true);
    setErrorGeral(null);
    let fetchedVendasData: RelatorioMensalDTO[] = [];
    let fetchedEntradasData: RelatorioMensalDTO[] = [];
    try {
      const vendasRes = await axiosInstance.get<RelatorioMensalDTO[]>('/vendas/relatorio/total-mensal');
      fetchedVendasData = vendasRes.data || [];
      if (fetchedVendasData.length > 0) {
        const labels = fetchedVendasData.map(item => formatMesAnoParaLabel(item.mesAno));
        const data = fetchedVendasData.map(item => parseFloat((item.totalVendido || 0).toFixed(2)));
        setVendasChartData({ labels, datasets: [{ data, color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})` }] });
      } else {
        setVendasChartData(null);
      }
    } catch (err) {
      setErrorGeral("Falha ao carregar dados de vendas.");
      setVendasChartData(null);
    } finally {
      setIsLoadingVendas(false);
    }
    try {
      const entradasRes = await axiosInstance.get<RelatorioMensalDTO[]>('/produtos/relatorio/valor-entrada-estoque-mensal');
      fetchedEntradasData = entradasRes.data || [];
    } catch (err) {
      if (!errorGeral) setErrorGeral("Falha ao carregar dados de entrada.");
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
      const saidaValues = sortedPeriods.map(p => parseFloat((fetchedVendasData.find(item => item.mesAno === p)?.totalVendido || 0).toFixed(2)));
      const entradaValues = sortedPeriods.map(p => parseFloat((fetchedEntradasData.find(item => item.mesAno === p)?.valor || 0).toFixed(2)));
      setEntradaSaidaChartData({
        labels: finalLabels,
        datasets: [
          { data: entradaValues, legend: "Entrada", color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})` },
          { data: saidaValues, legend: "Saída", color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})` }
        ],
        legend: ["Entrada", "Saída"]
      });
    } else {
      setEntradaSaidaChartData(null);
    }
  }, []);

  const fetchLucratividadeData = useCallback(async () => {
    setIsLoadingLucratividade(true);
    setErrorLucratividade(null);
    setRawLucroData(null);
    try {
      const response = await axiosInstance.get<RelatorioLucratividadeData[]>('/vendas/relatorio/lucratividade-mensal');
      setRawLucroData(response.data);

      if (response.data && response.data.length > 0) {
        const labels = response.data.map(item => formatMesAnoParaLabel(item.periodo));
        
        const receitas = response.data.map(item => parseFloat((item.totalReceita || 0).toFixed(2)));
        const lucros = response.data.map(item => parseFloat((item.totalLucroBruto || 0).toFixed(2)));
        // Calcula o CMV se ele não vier da API
        const cmvs = response.data.map(item => {
            if (item.cmv !== undefined) {
                return parseFloat(item.cmv.toFixed(2));
            }
            // Fallback: calcula o CMV a partir da receita e lucro
            const receita = item.totalReceita || 0;
            const lucro = item.totalLucroBruto || 0;
            return parseFloat((receita - lucro).toFixed(2));
        });
        
        const datasets: ChartDataset[] = [
          { data: receitas, color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`, legend: "Receita" },
          { data: cmvs, color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, legend: "CMV" },
          { data: lucros, color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`, legend: "Lucro Bruto" }
        ];
        setLucratividadeChartData({ labels, datasets, legend: datasets.map(ds => ds.legend).filter(Boolean) as string[] });
      } else {
        setLucratividadeChartData(null);
      }
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
          const errorMsg = err.response?.data?.erro || err.response?.data?.message || "Não foi possível carregar os dados de lucratividade.";
          setErrorLucratividade(errorMsg);
          setRawLucroData({ error: errorMsg, status: err.response?.status, data: err.response?.data });
      } else {
          setErrorLucratividade("Ocorreu um erro inesperado.");
          setRawLucroData({ error: "Erro não-axios", message: (err as Error).message });
      }
      setLucratividadeChartData(null);
    } finally {
      setIsLoadingLucratividade(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDadosGerais();
      fetchLucratividadeData();
    }, [fetchDadosGerais, fetchLucratividadeData])
  );

  const renderChart = (title: string, chartDataInput: ChartData | null, isLoadingFlag: boolean, specificError: string | null) => {
    if (isLoadingFlag) {
      return <View style={styles.centeredMessage}><ActivityIndicator size="large" color={originalChartConfig.color(1)} /><Text style={styles.loadingText}>Carregando {title.toLowerCase()}...</Text></View>;
    }
    
    const errorToDisplay = title === "Lucratividade Mensal" ? errorLucratividade : errorGeral;
    if (errorToDisplay) {
      return <View style={styles.centeredMessage}><Text style={styles.errorText}>{errorToDisplay}</Text></View>;
    }
    
    const isDataEmpty = !chartDataInput || !chartDataInput.labels || chartDataInput.labels.length === 0 ||
      !chartDataInput.datasets || chartDataInput.datasets.length === 0 ||
      chartDataInput.datasets.every(ds => !ds.data || ds.data.length === 0 || ds.data.every(val => val === 0));

    if (isDataEmpty) {
        if (title === "Lucratividade Mensal" && rawLucroData) {
            return (
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>{title}</Text>
                    <View style={styles.debugContainer}>
                        <Text style={styles.debugTitle}>Sem dados para exibir o gráfico. Resposta da API:</Text>
                        <Text style={styles.debugText} selectable={true}>{JSON.stringify(rawLucroData, null, 2)}</Text>
                    </View>
                </View>
            );
        }
      return <View style={styles.centeredMessage}><Text style={styles.emptyDataText}>Sem dados para exibir para {title}.</Text></View>;
    }

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <BarChart
          data={chartDataInput}
          width={screenWidth * 0.92}
          height={250}
          yAxisLabel="R$ "
          yAxisSuffix=""
          chartConfig={chartConfigWithYFormat}
          verticalLabelRotation={30}
          fromZero={true}
          showValuesOnTopOfBars={false}
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
