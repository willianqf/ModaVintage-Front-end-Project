import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator 
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios, { AxiosError } from 'axios';

import { stylesLogin } from './stylesLogin'; 
import { theme } from '../global/themes';

// CORREÇÃO: Importando o tipo do novo arquivo centralizado
import { RootStackParamList } from '../navigation/types'; 
import axiosInstance from '../api/axiosInstance';


type LoginScreenNavProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
interface CustomLoginScreenProps {
  onLoginSuccess: (token: string) => void;
}
type Props = LoginScreenNavProps & CustomLoginScreenProps;

export default function LoginScreen({ navigation, onLoginSuccess }: Props) {

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email || !senha) {
      setLoginError('Informe os campos obrigatórios: e-mail e senha.');
      return;
    }
    setIsLoading(true);
    setLoginError(null); 

    try {
      const response = await axiosInstance.post('/auth/login', { email, senha });

      if (response.data && response.data.token) {
        const token = response.data.token;
        await SecureStore.setItemAsync('userToken', token);
        onLoginSuccess(token);
      } else {
        if (response.data?.K_custom_interceptor_logout_triggered) {
          console.log("LoginScreen: Logout acionado pelo interceptor de sessão inválida.");
        } else {
          setLoginError("Resposta inesperada do servidor durante o login.");
        }
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const apiErrorMessage = error.response.data?.erro || error.response.data?.message || 'Ocorreu um problema na autenticação.';
          setLoginError(apiErrorMessage);
        } else {
          setLoginError("Não foi possível conectar ao servidor. Verifique sua conexão com a internet.");
        }
      } else {
        setLoginError("Ocorreu um erro inesperado. Tente novamente.");
      }
      console.error("LoginScreen: Erro no login:", error.message || error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={stylesLogin.container}>
      <Image
        source={require('../../assets/logo.png')} 
        style={stylesLogin.logo}
        resizeMode="contain"
      />
      <Text style={stylesLogin.title}>Bem-vindo(a)!</Text>

      {loginError && (
        <View style={stylesLogin.errorContainer}>
          <Text style={stylesLogin.errorText}>{loginError}</Text>
        </View>
      )}

      <TextInput
        placeholder="Digite seu e-mail"
        placeholderTextColor={theme.colors.placeholder}
        style={stylesLogin.input}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (loginError) setLoginError(null);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Senha"
        placeholderTextColor={theme.colors.placeholder}
        secureTextEntry
        style={stylesLogin.input}
        value={senha}
        onChangeText={(text) => {
          setSenha(text);
          if (loginError) setLoginError(null);
        }}
      />
      <TouchableOpacity
        style={[stylesLogin.button, isLoading && stylesLogin.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.colors.surface} />
        ) : (
          <Text style={stylesLogin.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>
      
      <View style={stylesLogin.linksContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('SolicitarResetSenha')}>
          <Text style={stylesLogin.linkText}>Recuperar Senha</Text>
        </TouchableOpacity>
        
        {/* Esta linha agora funcionará sem erros de tipo */}
      </View>
    </View>
  );
}