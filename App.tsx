import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Importação telas
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MercadoriasScreen from './src/screens/MercadoriasScreen';
import ListarMercadoriasScreen from './src/screens/ListarMercadoriasScreen';
import AdicionarMercadoriaScreen from './src/screens/AdicionarMercadoriaScreen';
import EditarMercadoriaScreen from './src/screens/EditarMercadoriaScreen';
import ClientesScreen from './src/screens/ClientesScreen';
import ListarClientesScreen from './src/screens/ListarClientesScreen';
import AdicionarClienteScreen from './src/screens/AdicionarClienteScreen';
import EditarClienteScreen from './src/screens/EditarClienteScreen';
import VendasScreen from './src/screens/VendasScreen';
import RegistrarVendaScreen from './src/screens/RegistrarVendaScreen';
import ListarVendasScreen from './src/screens/ListarVendasScreen';
import FornecedoresScreen from './src/screens/FornecedoresScreen';
import ListarFornecedoresScreen from './src/screens/ListarFornecedoresScreen';
import AdicionarFornecedorScreen from './src/screens/AdicionarFornecedorScreen';
import EditarFornecedorScreen from './src/screens/EditarFornecedorScreen';
import StatusScreen from './src/screens/StatusScreen';
import SolicitarResetSenhaScreen from './src/screens/SolicitarResetSenhaScreen';
import ResetarSenhaScreen from './src/screens/ResetarSenhaScreen';

// Importe a interface Cliente do local onde ela está definida
// Geralmente, é exportada da tela de listagem ou de um arquivo de tipos dedicado.
import { Cliente } from './src/screens/ListarClientesScreen'; // Ajuste este caminho se necessário

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Mercadorias: undefined;
  ListarMercadorias: undefined;
  AdicionarMercadoria: undefined;
  EditarMercadoria: { produtoId: number };
  Clientes: undefined;
  ListarClientes: undefined;
  // MODIFICADO: AdicionarCliente pode receber 'originRoute' como parâmetro opcional
  AdicionarCliente: { originRoute?: string }; 
  EditarCliente: { clienteId: number };
  VendasScreen: undefined; // Nome da rota como no seu Stack.Screen
  // MODIFICADO: RegistrarVenda pode receber 'newlyAddedClient' como parâmetro opcional
  RegistrarVenda: { newlyAddedClient?: Cliente }; 
  ListarVendas: undefined;
  FornecedoresScreen: undefined; // Nome da rota como no seu Stack.Screen
  ListarFornecedores: undefined;
  AdicionarFornecedor: undefined;
  EditarFornecedor: { fornecedorId: number };
  StatusScreen: undefined; // Nome da rota como no seu Stack.Screen
  SolicitarResetSenha: undefined;
  ResetarSenha: { email?: string, token?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let token: string | null = null;
      try {
        token = await SecureStore.getItemAsync('userToken');
      } catch (e) {
        console.error("Falha ao restaurar token do SecureStore", e);
      }
      setUserToken(token);
      setIsLoading(false);
    };
    bootstrapAsync();
  }, []);

  const handleLoginSuccess = (token: string) => {
    setUserToken(token);
  };

  const handleLogout = () => {
    setUserToken(null);
    SecureStore.deleteItemAsync('userToken');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#323588" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          // Telas acessíveis sem login
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />}
            </Stack.Screen>
            <Stack.Screen name="SolicitarResetSenha" component={SolicitarResetSenhaScreen} />
            <Stack.Screen name="ResetarSenha" component={ResetarSenhaScreen} />
          </>
        ) : (
          // Telas acessíveis após login
          <>
            <Stack.Screen name="Dashboard">
              {(props) => <DashboardScreen {...props} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen name="Mercadorias" component={MercadoriasScreen} />
            <Stack.Screen name="ListarMercadorias" component={ListarMercadoriasScreen} />
            <Stack.Screen name="AdicionarMercadoria" component={AdicionarMercadoriaScreen} />
            <Stack.Screen name="EditarMercadoria" component={EditarMercadoriaScreen} />
            <Stack.Screen name="Clientes" component={ClientesScreen} />
            <Stack.Screen name="ListarClientes" component={ListarClientesScreen} />
            <Stack.Screen name="AdicionarCliente" component={AdicionarClienteScreen} />
            <Stack.Screen name="EditarCliente" component={EditarClienteScreen} />
            {/* Mantive os nomes das rotas como estavam no seu código original para consistência */}
            <Stack.Screen name="VendasScreen" component={VendasScreen} /> 
            <Stack.Screen name="RegistrarVenda" component={RegistrarVendaScreen} />
            <Stack.Screen name="ListarVendas" component={ListarVendasScreen} />
            <Stack.Screen name="FornecedoresScreen" component={FornecedoresScreen} />
            <Stack.Screen name="ListarFornecedores" component={ListarFornecedoresScreen} />
            <Stack.Screen name="AdicionarFornecedor" component={AdicionarFornecedorScreen} />
            <Stack.Screen name="EditarFornecedor" component={EditarFornecedorScreen} />
            <Stack.Screen name="StatusScreen" component={StatusScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f3f3', // Cor de fundo consistente
  }
});