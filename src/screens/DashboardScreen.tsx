import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Ajuste o caminho se o App.tsx estiver em outro lugar
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Importar ícones

interface DashboardScreenProps {
  onLogout: () => void;
}

// Define o tipo para a propriedade de navegação da tela Dashboard
// Certifique-se que 'Dashboard' é uma chave válida em RootStackParamList
type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ onLogout }: DashboardScreenProps) {
  const navigation = useNavigation<DashboardNavigationProp>();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    onLogout(); // Esta função deve ser passada pelo App.tsx para atualizar o estado de autenticação
  };

  // Definição dos itens de menu com ícones e rotas
  const menuItems = [
    { title: 'Mercadorias', routeName: 'Mercadorias' as keyof RootStackParamList, iconName: 'hanger' },
    { title: 'Clientes', routeName: 'Clientes' as keyof RootStackParamList, iconName: 'account-outline' },
    { title: 'Vendas', routeName: 'VendasScreen' as keyof RootStackParamList, iconName: 'currency-usd' },
    { title: 'Fornecedores', routeName: 'FornecedoresScreen' as keyof RootStackParamList, iconName: 'truck-delivery-outline' },
    { title: 'Status/Relatórios', routeName: 'StatusScreen' as keyof RootStackParamList, iconName: 'chart-bar' },
    //{ title: 'Configurações', routeName: 'ConfiguracoesScreen' as keyof RootStackParamList, iconName: 'cog-outline' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Header Simulado Personalizado (opcional, pode ser substituído por um header de navegação) */}
        <View style={styles.headerPlaceholder}>
          <Image 
            source={require('../../assets/logo.png')} // VERIFIQUE ESTE CAMINHO!
            style={styles.headerLogo} 
            resizeMode="contain" 
          />
          {/* Se quiser o texto "Moda Vintage" ao lado do logo no header: */}
          {/* <Text style={styles.headerTitleText}>Moda Vintage</Text> */}
        </View>

        <Text style={styles.welcomeTitle}>Bem-vindo, Lília!</Text>

        {/* Mapeia os itens de menu para criar os botões */}
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.title} // Usar item.title ou item.routeName como chave
            style={styles.menuButton}
            onPress={() => {
              if (item.routeName) {
                try {
                  // Assegura que item.routeName seja um nome de rota válido
                  navigation.navigate(item.routeName as any); // O 'as any' pode ser necessário se a tipagem estiver complexa
                } catch (e) {
                    console.error("Erro de navegação para:", item.routeName, e);
                    Alert.alert("Navegação", `A tela para "${item.title}" ainda não foi configurada ou houve um erro.`);
                }
              } else {
                Alert.alert("Navegação", `Rota para "${item.title}" não definida.`);
              }
            }}
          >
            <MaterialCommunityIcons 
                name={item.iconName as any} // O 'as any' é devido ao tipo string do iconName
                size={28} // Tamanho do ícone
                color="#FFFFFF" // Cor do ícone
                style={styles.menuIcon} 
            />
            <Text style={styles.menuButtonText}>{item.title}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.logoutButtonContainer}>
          <Button title="Logout" onPress={handleLogout} color="#8B0000" />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center', // Centraliza o conteúdo se for menor que a tela
  },
  container: {
    flex: 1, // Garante que o container ocupe o espaço do ScrollView se o conteúdo for grande
    alignItems: 'center',
    justifyContent: 'center', // Centraliza o bloco de conteúdo verticalmente
    paddingVertical: 30, // Espaçamento vertical
    paddingHorizontal: 10,
    backgroundColor: '#F3F3F3',
  },
  headerPlaceholder: {
    flexDirection: 'row', // Se tiver texto ao lado do logo
    alignItems: 'center',
    marginBottom: 20, 
  },
  headerLogo: {
    width: 100, // Ajuste conforme o tamanho desejado para o logo no header
    height: 100, // Ajuste
    // marginBottom: 20, // Se não houver texto ao lado, pode usar marginBottom aqui
  },
  // headerTitleText: { // Se você adicionar o texto "Moda Vintage" ao lado do logo
  //   fontSize: 22,
  //   fontWeight: 'bold',
  //   color: '#323588',
  //   marginLeft: 10,
  // },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#323588', // Cor do Figma
    marginBottom: 25,
  },
  menuButton: {
    backgroundColor: '#5DBEDD', // Cor do Figma
    paddingVertical: 15, // Aumentado um pouco para mais altura
    paddingHorizontal: 15, // Ajustado
    borderRadius: 10,
    marginBottom: 15, // Aumentado o espaçamento entre botões
    width: '90%', // Aumentado para ocupar mais a largura
    flexDirection: 'row',
    alignItems: 'center', // Alinha ícone e texto verticalmente
  },
  menuIcon: {
    marginRight: 15, // Espaço entre o ícone e o texto
  },
  menuButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1, // Permite que o texto ocupe o espaço e quebra linha se necessário
  },
  logoutButtonContainer: {
    marginTop: 20, // Espaço acima do botão de logout
    width: '90%', // Consistente com os botões de menu
  }
});