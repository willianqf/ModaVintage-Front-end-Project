import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { styles } from './stylesResetarSenha'; //
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

// Importar a instância configurada do Axios e o helper isAxiosError
import axiosInstance from '../api/axiosInstance'; 
import axios from 'axios'; // usar axios.isAxiosError

// const API_BASE_URL = 'http://192.168.1.5:8080'; // Não é mais necesario mas vai que.. né

type ResetarSenhaRouteProp = RouteProp<RootStackParamList, 'ResetarSenha'>;
type ResetarSenhaNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResetarSenha'>;

export default function ResetarSenhaScreen() {
  const navigation = useNavigation<ResetarSenhaNavigationProp>();
  const route = useRoute<ResetarSenhaRouteProp>();

  const emailRecebido = route.params?.email;

  const [tokenInput, setTokenInput] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleResetarSenha = async () => {
    if (!tokenInput.trim() || tokenInput.trim().length !== 6) {
      Alert.alert("Token Inválido", "Por favor, insira o código de 6 dígitos recebido por e-mail.");
      return;
    }
    if (!novaSenha) {
      Alert.alert("Erro", "A nova senha é obrigatória.");
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }
    if (novaSenha.length < 6) {
      Alert.alert("Senha Fraca", "A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        token: tokenInput.trim(),
        novaSenha: novaSenha,
      };
      const response = await axiosInstance.post('/auth/resetar-senha', payload); //
      
      Alert.alert(
        "Sucesso",
        response.data?.mensagem || "Senha redefinida com sucesso! Faça login com sua nova senha.",
        [{ text: "OK", onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      console.error("ResetarSenhaScreen: Erro ao resetar senha:", JSON.stringify(error.response?.data || error.message));
      let errorMessage = "Não foi possível redefinir sua senha. Verifique o token e tente novamente.";
      if (axios.isAxiosError(error) && error.response?.data) {
        // O backend retorna {erro: "Token inválido..."} ou {mensagem: "Senha redefinida..."}
        errorMessage = error.response.data.erro || error.response.data.message || errorMessage;
      } else if (!axios.isAxiosError(error) && error.message) {
        // Não expor error.message diretamente pra não vazar informações kkkk
      }
      Alert.alert("Erro ao Redefinir", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.headerTitle}>Redefinir Senha</Text>
      {emailRecebido && (
        <Text style={styles.infoText}>
          Redefinindo senha para: {emailRecebido}
        </Text>
      )}
      <Text style={styles.instructions}>
        Insira o código de 6 dígitos recebido por e-mail e defina sua nova senha.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Código de 6 dígitos"
        value={tokenInput}
        onChangeText={setTokenInput}
        keyboardType="number-pad"
        maxLength={6}
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Nova Senha (mínimo 6 caracteres)"
        value={novaSenha}
        onChangeText={setNovaSenha}
        secureTextEntry
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar Nova Senha"
        value={confirmarNovaSenha}
        onChangeText={setConfirmarNovaSenha}
        secureTextEntry
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={styles.button} onPress={handleResetarSenha} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>REDEFINIR SENHA</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')} disabled={isLoading}>
        <Text style={styles.backButtonText}>CANCELAR E VOLTAR AO LOGIN</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}