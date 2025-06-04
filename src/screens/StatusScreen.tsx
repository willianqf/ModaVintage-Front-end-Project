import React, { useState, useCallback, useEffect } from 'react'; // Adicionado useEffect para uma possível melhoria futura, mas não usado nesta correção.
import { View, Text, ScrollView, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { styles, chartConfig as originalChartConfig } from './stylesStatus';

import axiosInstance from '../api/axiosInstance';
import axios from 'axios'; // Para usar axios.isAxiosError

const screenWidth = Dimensions.get("window").width;

// --- Interfaces (mantidas) ---
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

export default function StatusScreen() {
  const [vendasChartData, setVendasChartData] = useState<ChartData | null>(null);
  const [entradaSaidaChartData, setEntradaSaidaChartData] = useState<ChartData | null>(null);
  const [lucratividadeChartData, setLucratividadeChartData] = useState<ChartData | null>(null);

  const [isLoadingVendas, setIsLoadingVendas] = useState(true);
  const [isLoadingEntradaSaida, setIsLoadingEntradaSaida] = useState(true);
  const [isLoadingLucratividade, setIsLoadingLucratividade] = useState(true);

  const [errorGeral, setErrorGeral] = useState<string | null>(null);
  const [errorLucratividade, setErrorLucratividade] = useState<string | null>(null);

  // CORREÇÃO: Removidas as dependências que causam o loop de 'fetchDadosGerais'
  const fetchDadosGerais = useCallback(async () => {
    console.log("StatusScreen: fetchDadosGerais INICIADO");
    setIsLoadingVendas(true);
    setIsLoadingEntradaSaida(true);
    setErrorGeral(null); // Limpa erro anterior ao tentar buscar novamente

    let fetchedVendasData: RelatorioMensalDTO[] = [];
    let fetchedEntradasData: RelatorioMensalDTO[] = [];
    let ocorreuErroLocal = false; // Usar variável local para não depender do estado errorGeral no mesmo ciclo

    try {
      const vendasRes = await axiosInstance.get<RelatorioMensalDTO[]>('/vendas/relatorio/total-mensal');
      fetchedVendasData = vendasRes.data || [];
      console.log("STATUS_SCREEN - Dados Brutos de Vendas:", JSON.stringify(fetchedVendasData, null, 2));
      if (fetchedVendasData.length > 0) {
        const labels = fetchedVendasData.map(item => formatMesAnoParaLabel(item.mesAno));
        const data = fetchedVendasData.map(item => parseFloat((item.totalVendido || 0).toFixed(2)));
        setVendasChartData({ labels, datasets: [{ data, color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})` }] });
      } else {
        setVendasChartData(null);
      }
    } catch (err: any) {
      console.error("StatusScreen: Erro ao buscar dados de vendas:", JSON.stringify(err.response?.data || err.message));
      ocorreuErroLocal = true;
      setVendasChartData(null);
      if (axios.isAxiosError(err) && err.response?.status !== 401) {
        setErrorGeral(err.response?.data?.erro || err.response?.data?.message || "Falha ao carregar dados de vendas.");
      } else if (!axios.isAxiosError(err)) {
        setErrorGeral("Falha ao carregar dados de vendas.");
      }
    } finally {
      setIsLoadingVendas(false);
    }

    try {
      const entradasRes = await axiosInstance.get<RelatorioMensalDTO[]>('/produtos/relatorio/valor-entrada-estoque-mensal');
      fetchedEntradasData = entradasRes.data || [];
      console.log("STATUS_SCREEN - Dados Brutos de Entrada:", JSON.stringify(fetchedEntradasData, null, 2));
    } catch (err: any) {
      console.error("StatusScreen: Erro ao buscar dados de entrada de estoque:", JSON.stringify(err.response?.data || err.message));
      ocorreuErroLocal = true;
      // Atualiza errorGeral apenas se ainda não houver um erro mais específico de vendas
      if (axios.isAxiosError(err) && err.response?.status !== 401) {
        if (!errorGeral) setErrorGeral(err.response?.data?.erro || err.response?.data?.message || "Falha ao carregar dados de entrada de estoque.");
      } else if (!axios.isAxiosError(err)) {
        if (!errorGeral) setErrorGeral("Falha ao carregar dados de entrada de estoque.");
      }
    } finally {
      setIsLoadingEntradaSaida(false);
    }

    // Processamento para o gráfico de Entrada x Saída
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

    if (ocorreuErroLocal && !errorGeral) { // Se um erro local ocorreu mas não foi setado em errorGeral (ex: erro apenas em entradas)
        setErrorGeral("Falha ao carregar alguns dados dos relatórios gerais.");
    }
    console.log("StatusScreen: fetchDadosGerais FINALIZADO");
  }, []); // Removidas as dependências problemáticas. Ele agora só é criado uma vez.

  const fetchLucratividadeData = useCallback(async () => {
    console.log("StatusScreen: fetchLucratividadeData INICIADO");
    setIsLoadingLucratividade(true);
    setErrorLucratividade(null); // Limpa erro anterior
    try {
      const response = await axiosInstance.get<RelatorioLucratividadeData[]>('/vendas/relatorio/lucratividade-mensal');
      console.log("STATUS_SCREEN - Dados Brutos de Lucratividade:", JSON.stringify(response.data, null, 2));
      if (response.data && response.data.length > 0) {
        const labels = response.data.map(item => formatMesAnoParaLabel(item.periodo));
        const receitas = response.data.map(item => parseFloat(item.totalReceita.toFixed(2)));
        const cmvs = response.data.map(item => parseFloat(item.totalCmv.toFixed(2)));
        const lucros = response.data.map(item => parseFloat(item.totalLucroBruto.toFixed(2)));
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
      console.error("StatusScreen: Erro ao buscar dados de lucratividade:", JSON.stringify(err.response?.data || err.message));
      if (axios.isAxiosError(err) && err.response?.status !== 401) {
        setErrorLucratividade(err.response?.data?.erro || err.response?.data?.message || "Não foi possível carregar os dados de lucratividade.");
      } else if (!axios.isAxiosError(err)) {
        setErrorLucratividade("Não foi possível carregar os dados de lucratividade.");
      }
      setLucratividadeChartData(null);
    } finally {
      setIsLoadingLucratividade(false);
    }
    console.log("StatusScreen: fetchLucratividadeData FINALIZADO");
  }, []); // Este já estava correto com dependências vazias.

  useFocusEffect(
    useCallback(() => {
      console.log("StatusScreen: TELA EM FOCO - Chamando fetches...");
      // Chamamos as funções que agora têm referências estáveis
      fetchDadosGerais();
      fetchLucratividadeData();

      // Função de limpeza opcional (não estritamente necessária aqui,
      // mas boa prática se houvesse listeners ou subscriptions)
      return () => {
        console.log("StatusScreen: TELA PERDEU FOCO");
      };
    }, [fetchDadosGerais, fetchLucratividadeData]) // Agora as dependências são estáveis
  );

  const renderChart = (title: string, chartDataInput: ChartData | null, isLoadingFlag: boolean, specificError: string | null) => {
    if (isLoadingFlag) {
      return <View style={styles.centeredMessage}><ActivityIndicator size="large" color={originalChartConfig.color(1)} /><Text style={styles.loadingText}>Carregando {title.toLowerCase()}...</Text></View>;
    }
    // Exibe o erro específico do gráfico se houver
    const errorToDisplay = title === "Lucratividade Mensal" ? errorLucratividade : errorGeral;
    if (errorToDisplay) {
      return <View style={styles.centeredMessage}><Text style={styles.errorText}>{errorToDisplay}</Text></View>;
    }
    // Se não há erro específico mas há um erro geral e o gráfico não é de lucratividade
    if (!errorToDisplay && errorGeral && title !== "Lucratividade Mensal"){
        return <View style={styles.centeredMessage}><Text style={styles.errorText}>{errorGeral}</Text></View>;
    }

    if (!chartDataInput || !chartDataInput.labels || chartDataInput.labels.length === 0 ||
      !chartDataInput.datasets || chartDataInput.datasets.length === 0 ||
      chartDataInput.datasets.every(ds => !ds.data || ds.data.length === 0 || ds.data.every(val => val === 0))) {
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
        {/* Ajustado o specificError passado para renderChart */}
        {renderChart("Vendas Mensais (Valor)", vendasChartData, isLoadingVendas, errorGeral)}
        {renderChart("Entrada x Saída Mensal (Valor)", entradaSaidaChartData, isLoadingEntradaSaida, errorGeral)}
        {renderChart("Lucratividade Mensal", lucratividadeChartData, isLoadingLucratividade, errorLucratividade)}
      </View>
    </ScrollView>
  );
}