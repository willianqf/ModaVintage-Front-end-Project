import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { styles as screenStyles } from './stylesLogin'; // Seus estilos de tela
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

import axiosInstance from '../api/axiosInstance';
import axios, { AxiosError } from 'axios'; // Necessário para axios.isAxiosError

type LoginScreenNavProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
interface CustomLoginScreenProps {
  onLoginSuccess: (token: string) => void;
}
type Props = LoginScreenNavProps & CustomLoginScreenProps;

export default function LoginScreen({ navigation, onLoginSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null); // Estado para mensagem de erro

  async function handleLogin() {
    if (!email || !senha) {
      setLoginError('Informe os campos obrigatórios: e-mail e senha.');
      return;
    }
    setIsLoading(true);
    setLoginError(null); // Limpa erros anteriores

    try {
      const response = await axiosInstance.post('/auth/login', { email, senha });

      if (response.data && response.data.token) {
        const token = response.data.token;
        await SecureStore.setItemAsync('userToken', token);
        onLoginSuccess(token);
      } else {
        // Este caso é para respostas 2xx inesperadas sem token ou se o interceptor de logout já atuou
        if (response.data?.K_custom_interceptor_logout_triggered) {
          // O logout já foi acionado pelo interceptor, não faz nada aqui.
          console.log("LoginScreen: Logout acionado pelo interceptor de sessão inválida.");
        } else {
          setLoginError("Resposta inesperada do servidor durante o login.");
        }
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const apiErrorMessage = error.response.data?.erro || error.response.data?.message || 'Ocorreu um problema na autenticação.';
          setLoginError(apiErrorMessage); // Define o erro para ser exibido na tela
        } else {
          setLoginError("Não foi possível conectar ao servidor. Verifique sua conexão com a internet.");
        }
      } else {
        setLoginError("Ocorreu um erro inesperado. Tente novamente.");
      }
      // Log do erro no console para depuração do desenvolvedor, mas não mostra mais Alert aqui.
      console.error("LoginScreen: Erro no login:", error.message || error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={screenStyles.container}>
      <Image
        source={require('../../assets/logo.png')}
        style={screenStyles.logo}
        resizeMode="contain"
      />
      <Text style={screenStyles.title}>Moda Vintage</Text>

      {/* Campo para exibir a mensagem de erro estilizada */}
      {loginError && (
        <View style={localStyles.errorContainer}>
          <Text style={localStyles.errorText}>{loginError}</Text>
        </View>
      )}

      <TextInput
        placeholder="Digite seu e-mail"
        placeholderTextColor="#555"
        style={screenStyles.input}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (loginError) setLoginError(null); // Limpa o erro ao começar a digitar
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Senha"
        placeholderTextColor="#555"
        secureTextEntry
        style={screenStyles.input}
        value={senha}
        onChangeText={(text) => {
          setSenha(text);
          if (loginError) setLoginError(null); // Limpa o erro ao começar a digitar
        }}
      />
      <TouchableOpacity
        style={isLoading ? [screenStyles.button, screenStyles.buttonDisabled] : screenStyles.button}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={screenStyles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={screenStyles.recoverButton}
        onPress={() => navigation.navigate('SolicitarResetSenha')}
      >
        <Text style={screenStyles.recoverText}>Recuperar Senha</Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilos locais para a mensagem de erro
const localStyles = StyleSheet.create({
  errorContainer: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#F8D7DA',
    borderColor: '#F5C6CB',
    borderWidth: 1,
    borderRadius: 10, // Consistente com screenStyles.input
    marginBottom: 15,
  },
  errorText: {
    color: '#721C24',
    fontSize: 14,
    textAlign: 'center',
  },
});