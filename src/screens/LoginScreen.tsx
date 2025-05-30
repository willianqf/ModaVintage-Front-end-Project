import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, StyleSheet as LoginStyles } from 'react-native'; // Renomear import de StyleSheet
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { styles as screenStyles } from './stylesLogin'; // Seus estilos para esta tela
import { useNavigation } from '@react-navigation/native'; // Importar useNavigation
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

const API_BASE_URL = 'http://192.168.1.5:8080';

// Tipagem para as props de navegação + props customizadas
type LoginScreenNavProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
interface CustomLoginScreenProps {
  onLoginSuccess: (token: string) => void;
}
type Props = LoginScreenNavProps & CustomLoginScreenProps;


export default function LoginScreen({ navigation, onLoginSuccess }: Props) { // Adicionado navigation
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
        console.log('Token:', token);
        onLoginSuccess(token);
      } else {
        Alert.alert("Erro", "Resposta inesperada do servidor.");
      }
    } catch (error: any) {
      console.error("Erro no login:", JSON.stringify(error.response?.data || error.message));
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
    <View style={screenStyles.container}>
      <Image
        source={require('../../assets/logo.png')}
        style={screenStyles.logo}
        resizeMode="contain"
      />
      <Text style={screenStyles.title}>Moda Vintage</Text>
      <TextInput
        placeholder="Digite seu e-mail"
        placeholderTextColor="#555"
        style={screenStyles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Senha"
        placeholderTextColor="#555"
        secureTextEntry
        style={screenStyles.input}
        value={senha}
        onChangeText={setSenha}
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
        onPress={() => navigation.navigate('SolicitarResetSenha')} // NAVEGAÇÃO ADICIONADA AQUI
      >
        <Text style={screenStyles.recoverText}>Recuperar Senha</Text>
      </TouchableOpacity>
      {/* <StatusBar style="auto" /> // StatusBar é importado de 'expo-status-bar' */}
    </View>
  );
}