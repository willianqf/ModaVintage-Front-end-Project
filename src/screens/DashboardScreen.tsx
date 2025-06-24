import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Ajuste o caminho se o App.tsx estiver em outro lugar
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Importar ícones
import { theme } from '../global/themes';

interface DashboardScreenProps {
  onLogout: () => void;
}


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
    //{ title: 'Configurações', routeName: 'ConfiguracoesScreen' as keyof RootStackParamList, iconName: 'cog-outline' }, // Ainda não implementado
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Header Simulado Personalizado (opcional, pode ser substituído por um header de navegação) */}
        <View style={styles.headerPlaceholder}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.headerLogo} 
            resizeMode="contain" 
          />
          {/* : */}
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
              name={item.iconName as any}
              size={28}
              color={theme.colors.primary} // <--- Para esta nova cor
              style={styles.menuIcon} 
            />
            <Text style={styles.menuButtonText}>{item.title}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={22} color={theme.colors.surface} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background, // Cor de fundo do tema
  },
  headerPlaceholder: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerLogo: {
    width: 90,
    height: 90,
  },
  welcomeTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text, // Cor de texto do tema
    marginBottom: theme.spacing.lg,
  },
  // Estilo principal do botão, agora como um "card"
  menuButton: {
    backgroundColor: theme.colors.surface, // Fundo branco para o card
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    width: '100%', // Ocupa toda a largura do container
    flexDirection: 'row',
    alignItems: 'center',
    // Sombra
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  menuIcon: {
    marginRight: theme.spacing.md, // Espaçamento do tema
  },
  // Texto do botão agora com cor escura para ser legível no fundo branco
  menuButtonText: {
    color: theme.colors.text, // Cor do texto principal do tema
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    flex: 1,
  },
  logoutButtonContainer: {
    marginTop: theme.spacing.md,
    width: '100%',
  },
   logoutButton: {
  backgroundColor: theme.colors.error, // Cor de erro/perigo do seu tema
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: theme.borderRadius.md, // Mesma borda dos outros cards
  width: '100%',
  marginTop: theme.spacing.md,
  flexDirection: 'row', // Para alinhar ícone e texto
  alignItems: 'center',
  justifyContent: 'center',
  // Sombra
  elevation: 3,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 1.41,
},
logoutButtonText: {
  color: theme.colors.surface, // Cor branca para o texto
  fontSize: theme.fontSizes.md,
  fontWeight: 'bold',
  marginLeft: theme.spacing.sm, // Espaço entre o ícone e o texto
},
});