import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { styles } from '../screens/stylesLogin'; // Ajuste para o novo arquivo de estilos

const API_BASE_URL = 'http://192.168.1.5:8080'; // Mantenha seu IP correto

interface LoginScreenProps {
  onLoginSuccess: (token: string) => void; // Callback para quando o login for bem-sucedido
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    if (!email || !senha) {
      Alert.alert("Atenção", 'Informe os campos obrigatórios: e-mail e senha.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, senha });
      if (response.data && response.data.token) {
        const token = response.data.token;
        await SecureStore.setItemAsync('userToken', token);
        Alert.alert('Sucesso!', 'Login realizado com sucesso!');
        console.log('Token:', token);
        onLoginSuccess(token); // Chama o callback para atualizar o estado no AppNavigator/App.tsx
      } else {
        Alert.alert("Erro", "Resposta inesperada do servidor.");
      }
    } catch (error: any) {
      console.error("Erro no login:", JSON.stringify(error));
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          Alert.alert("Falha no Login", error.response.data?.message || error.response.data || "Email ou senha inválidos.");
        } else {
          Alert.alert("Erro no Login", `Erro ${error.response.status}: ${error.response.data?.message || error.response.data || 'Não foi possível conectar.'}`);
        }
      } else {
        Alert.alert("Erro", "Não foi possível realizar o login. Verifique sua conexão.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/logo.png')} // Ajuste o caminho relativo
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Moda Vintage</Text>
      <TextInput
        placeholder="Digite seu e-mail"
        placeholderTextColor="#555"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Senha"
        placeholderTextColor="#555"
        secureTextEntry
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
      />
      <TouchableOpacity
        style={isLoading ? [styles.button, styles.buttonDisabled] : styles.button}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.recoverButton}>
        <Text style={styles.recoverText}>Recuperar Senha</Text>
      </TouchableOpacity>
    </View>
  );
}