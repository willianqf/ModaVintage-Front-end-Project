import { StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get("window").width;

export const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#f3f3f3',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#323588',
    marginBottom: 20,
  },
  chartContainer: {
    marginVertical: 15,
    alignItems: 'center', // Centraliza o gráfico se ele for menor que a largura
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#545454',
    marginBottom: 10,
    textAlign: 'center',
  },
  centeredMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#545454',
    marginTop: 10,
  },
  emptyDataText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  }
});

// Configuração para os gráficos
export const chartConfig = {
  backgroundColor: "#e26a00", // Cor de fundo do gráfico (não do container)
  backgroundGradientFrom: "#323588", // Cor do Figma
  backgroundGradientTo: "#5DBEDD",   // Cor do Figma
  decimalPlaces: 2, // casas decimais para valores no gráfico
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Cor do texto, linhas, pontos
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Cor dos labels
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: "#ffa726"
  },
  barPercentage: 0.7, // Largura das barras
};