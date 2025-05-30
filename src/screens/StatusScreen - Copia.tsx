import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Dimensions, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BarChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { styles, chartConfig } from './stylesStatus'; // Importa estilos e config do gráfico

const API_BASE_URL = 'http://192.168.1.5:8080'; // Sua API base
const screenWidth = Dimensions.get("window").width;

interface RelatorioMensalDTO {
  mesAno: string; // "YYYY-MM"
  valor?: number; // Para valor de entrada
  totalVendido?: number; // Para total de vendas
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    colors?: ((opacity: number) => string)[]; // Para barras coloridas individualmente
    color?: (opacity: number) => string; // Para uma cor única no dataset
    legend?: string; // Para o segundo gráfico
  }[];
  legend?: string[]; // Para o segundo gráfico
}

const mesesAbreviados: { [key: string]: string } = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
};

const formatMesAnoParaLabel = (mesAno: string): string => { // "YYYY-MM" -> "Mês/YY"
    const [ano, mes] = mesAno.split('-');
    return `${mesesAbreviados[mes] || mes}/${ano.substring(2)}`;
};


export default function StatusScreen() {
  const [vendasChartData, setVendasChartData] = useState<ChartData | null>(null);
  const [entradaSaidaChartData, setEntradaSaidaChartData] = useState<ChartData | null>(null);
  const [isLoadingVendas, setIsLoadingVendas] = useState(true);
  const [isLoadingEntradaSaida, setIsLoadingEntradaSaida] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoadingVendas(true);
    setIsLoadingEntradaSaida(true);
    setError(null);
    let token: string | null = null;

    try {
      token = await SecureStore.getItemAsync('userToken');
      if (!token) throw new Error("Token não encontrado. Faça login.");

      // Buscar dados de vendas mensais
      const vendasRes = await axios.get<RelatorioMensalDTO[]>(`${API_BASE_URL}/vendas/relatorio/total-mensal`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (vendasRes.data && vendasRes.data.length > 0) {
        const labels = vendasRes.data.map(item => formatMesAnoParaLabel(item.mesAno));
        const data = vendasRes.data.map(item => item.totalVendido || 0);
        setVendasChartData({
          labels,
          datasets: [{ data, color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})` }], // Cor roxa para exemplo
        });
        // Usaremos os mesmos dados de "totalVendido" para a "Saída" no segundo gráfico
        // Se você quiser uma cor diferente para as barras de saída:
        // const saidaColors = data.map(() => (opacity = 1) => `rgba(255, 0, 0, ${opacity})`); // Vermelho para saída

        setEntradaSaidaChartData(prevData => ({
            ...(prevData || { labels: [], datasets: [] }), // Mantem dados de entrada se já existirem
            labels: labels.length > 0 ? labels : (prevData?.labels || []), // Usa labels de vendas ou anteriores
            datasets: [
                ...(prevData?.datasets.filter(ds => ds.legend === 'Entrada') || []), // Mantem dataset de Entrada
                { data, legend: "Saída", color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})` } // Adiciona/atualiza Saída (vermelho)
            ]
        }));

      } else {
        setVendasChartData(null); // Nenhum dado de venda
         setEntradaSaidaChartData(prevData => ({
            ...(prevData || { labels: [], datasets: [] }),
            datasets: [
                ...(prevData?.datasets.filter(ds => ds.legend === 'Entrada') || []),
                { data: [], legend: "Saída" } // Saída vazia
            ]
        }));
      }
    } catch (err) {
      console.error("Erro ao buscar dados de vendas:", err);
      setError("Não foi possível carregar dados de vendas.");
    } finally {
      setIsLoadingVendas(false);
    }

    try {
        if (!token) token = await SecureStore.getItemAsync('userToken'); // Garante que o token existe
        if (!token) throw new Error("Token não encontrado após tentativa de recarga.");

      // Buscar dados de entrada de estoque mensal
      const entradasRes = await axios.get<RelatorioMensalDTO[]>(`${API_BASE_URL}/produtos/relatorio/valor-entrada-estoque-mensal`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (entradasRes.data && entradasRes.data.length > 0) {
        // Precisamos alinhar os labels se os meses forem diferentes entre vendas e entradas
        // Por simplicidade, vamos assumir que usaremos os labels das vendas se existirem,
        // ou criaremos novos labels se as entradas tiverem meses que as vendas não têm.
        // Uma abordagem mais robusta uniria todos os meses de ambas as fontes.
        const labelsEntrada = entradasRes.data.map(item => formatMesAnoParaLabel(item.mesAno));
        const dataEntrada = entradasRes.data.map(item => item.valor || 0);

        setEntradaSaidaChartData(prevData => {
            const todosLabels = Array.from(new Set([...(prevData?.labels || []), ...labelsEntrada])).sort();
            const dataEntradaAlinhada = todosLabels.map(label => {
                const index = labelsEntrada.indexOf(label);
                return index !== -1 ? dataEntrada[index] : 0;
            });
            const dataSaidaAlinhada = todosLabels.map(label => {
                const saidaDataset = prevData?.datasets.find(ds => ds.legend === 'Saída');
                if (saidaDataset && prevData?.labels) {
                    const index = prevData.labels.indexOf(label);
                    return index !== -1 ? saidaDataset.data[index] : 0;
                }
                return 0;
            });

            return {
                labels: todosLabels,
                datasets: [
                    { data: dataEntradaAlinhada, legend: "Entrada", color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})` }, // Verde para entrada
                    { data: dataSaidaAlinhada, legend: "Saída", color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})` }   // Vermelho para saída
                ],
                legend: ["Entrada", "Saída"]
            };
        });

      } else {
         setEntradaSaidaChartData(prevData => ({
            ...(prevData || { labels: [], datasets: [] }),
            datasets: [
                { data: [], legend: "Entrada" },
                ...(prevData?.datasets.filter(ds => ds.legend === 'Saída') || [{ data: [], legend: "Saída"}])
            ]
        }));
      }
    } catch (err) {
      console.error("Erro ao buscar dados de entrada:", err);
      // Não sobrescreve o erro de vendas, apenas loga ou adiciona a uma lista de erros
      if (!error) setError("Não foi possível carregar dados de entrada de estoque.");
    } finally {
      setIsLoadingEntradaSaida(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const renderChart = (title: string, data: ChartData | null, isLoadingFlag: boolean) => {
    if (isLoadingFlag) {
      return <View style={styles.centeredMessage}><ActivityIndicator size="large" /><Text style={styles.loadingText}>Carregando {title.toLowerCase()}...</Text></View>;
    }
    if (!data || data.labels.length === 0 || data.datasets.every(ds => ds.data.length === 0)) {
      return <Text style={styles.emptyDataText}>Sem dados para exibir para {title}.</Text>;
    }
    // Garante que todos os datasets tenham a mesma quantidade de labels
    const maxLength = data.labels.length;
    const datasets = data.datasets.map(ds => ({
        ...ds,
        data: ds.data.concat(Array(Math.max(0, maxLength - ds.data.length)).fill(0))
    }));


    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <BarChart
          data={{...data, datasets}}
          width={screenWidth * 0.9} // 90% da largura da tela
          height={220}
          yAxisLabel="R$ "
          yAxisSuffix=""
          chartConfig={chartConfig} // Usando a config de stylesStatus.ts
          verticalLabelRotation={30}
          fromZero={true} // Garante que o eixo Y comece em 0
          showValuesOnTopOfBars={true}
        />
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Status Entrada/Saída</Text>
            {error && <Text style={styles.errorText}>{error}</Text>}

            {renderChart("Vendas Mensais (Valor)", vendasChartData, isLoadingVendas)}
            {renderChart("Entrada x Saída Mensal (Valor)", entradaSaidaChartData, isLoadingEntradaSaida || isLoadingVendas)}
        </View>
    </ScrollView>
  );
}