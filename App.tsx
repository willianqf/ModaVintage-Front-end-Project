import React, { useState, useEffect, useCallback } from 'react'; // Adicionado useCallback
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, View, StyleSheet, Alert } from 'react-native';

// Importe a instância do Axios e o configurador do logout handler
import axiosInstance, { setGlobalLogoutHandler } from './src/api/axiosInstance'; // Ajuste o caminho se necessário

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

import { Cliente } from './src/screens/ListarClientesScreen';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Mercadorias: undefined;
  ListarMercadorias: undefined;
  AdicionarMercadoria: undefined;
  EditarMercadoria: { produtoId: number };
  Clientes: undefined;
  ListarClientes: undefined;
  AdicionarCliente: { originRoute?: string };
  EditarCliente: { clienteId: number };
  VendasScreen: undefined;
  RegistrarVenda: { newlyAddedClient?: Cliente };
  ListarVendas: undefined;
  FornecedoresScreen: undefined;
  ListarFornecedores: undefined;
  AdicionarFornecedor: undefined;
  EditarFornecedor: { fornecedorId: number };
  StatusScreen: undefined;
  SolicitarResetSenha: undefined;
  ResetarSenha: { email?: string, token?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  // Usamos useCallback para garantir que a referência da função handleLogout não mude
  // a menos que suas dependências mudem (neste caso, não há dependências).
  const handleLogout = useCallback(async () => {
    console.log("Executando handleLogout no App.tsx para limpar o token.");
    await SecureStore.deleteItemAsync('userToken');
    setUserToken(null);
    // A mudança no estado userToken deve ser suficiente para o React Navigation
    // redirecionar para as telas de não autenticado.
  }, []); // Sem dependências, então a função é criada apenas uma vez.

  useEffect(() => {
    // Configura o handler de logout global para a instância Axios assim que o App montar.
    // Passamos a função `handleLogout` memoizada.
    setGlobalLogoutHandler(handleLogout);

    const bootstrapAsync = async () => {
      setIsLoading(true); // Garante que o loading seja exibido
      let token: string | null = null;
      try {
        token = await SecureStore.getItemAsync('userToken');
        if (token) {
          console.log("Token encontrado no SecureStore:", token);
          // Tenta validar o token fazendo uma chamada leve a um endpoint protegido.
          // O interceptor de request do axiosInstance adicionará o token ao header.
          try {
            console.log("App.tsx: Tentando validar token com o backend...");
            // Usaremos GET /clientes com paginação mínima como um endpoint protegido para teste.
            // O backend deve retornar 401 se o token for inválido.
            // O backend SecurityConfig protege GET /clientes
            await axiosInstance.get('/clientes?page=0&size=1');
            console.log("App.tsx: Token validado com sucesso pelo backend.");
            setUserToken(token);
          } catch (validationError: any) {
            // Se a chamada falhar com 401, o interceptor de response do axiosInstance
            // já deverá ter chamado `globalLogoutHandler` (que chama `handleLogout`).
            // Portanto, o estado `userToken` já deve ter sido atualizado para `null`.
            // Logamos o erro para depuração.
            console.warn("App.tsx: Erro durante a validação inicial do token:", validationError.message);
            // Não é estritamente necessário chamar handleLogout() aqui novamente,
            // pois o interceptor deve cuidar disso. Se o interceptor falhar,
            // esta seria uma segunda camada, mas pode causar chamadas duplicadas.
            // A lógica do interceptor já deve ter limpado o token.
            // Apenas para garantir, se por algum motivo o token não foi limpo pelo interceptor:
            if (await SecureStore.getItemAsync('userToken')) {
                console.warn("App.tsx: Token ainda no SecureStore após erro de validação, forçando logout.");
                await handleLogout();
            }
          }
        } else {
          console.log("App.tsx: Nenhum token encontrado no SecureStore. Definindo userToken como null.");
          setUserToken(null);
        }
      } catch (e) {
        console.error("App.tsx: Falha crítica ao restaurar ou validar token:", e);
        await handleLogout(); // Em caso de erro inesperado, desloga.
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, [handleLogout]); // handleLogout é agora uma dependência estável devido ao useCallback.

  const handleLoginSuccess = async (token: string) => {
    // O LoginScreen já salva o token no SecureStore.
    // Apenas atualizamos o estado aqui para forçar a re-renderização da navegação.
    setUserToken(token);
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
    backgroundColor: '#f3f3f3',
  }
});