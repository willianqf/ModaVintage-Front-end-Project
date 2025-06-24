import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { styles } from './stylesSolicitarReset'; //
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

// Importa instância configurada do Axios e o helper isAxiosError
import axiosInstance from '../api/axiosInstance'; 
import axios from 'axios'; // Para usar axios.isAxiosError

// const API_BASE_URL = 'http://192.168.1.5:8080'; 

type SolicitarResetNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SolicitarResetSenha'>;

export default function SolicitarResetSenhaScreen() {
  const navigation = useNavigation<SolicitarResetNavigationProp>();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSolicitarReset = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert("Email Inválido", "Por favor, insira um endereço de e-mail válido.");
      return;
    }
    setIsLoading(true);
    try {
      // Use axiosInstance. Esta rota é pública, mas usar axiosInstance é consistente.
      const response = await axiosInstance.post('/auth/solicitar-reset-senha', { email: email.trim().toLowerCase() }); //

      Alert.alert(
        "Solicitação Enviada",
        response.data?.mensagem || "Se um e-mail correspondente for encontrado, instruções e um código de recuperação serão enviados.",
        [
          {
            text: "OK", onPress: () => {
              navigation.navigate('ResetarSenha', { email: email.trim().toLowerCase() });
            }
          }
        ]
      );

    } catch (error: any) {
      console.error("SolicitarResetSenhaScreen: Erro ao solicitar reset:", JSON.stringify(error.response?.data || error.message));

      let errorMessage = "Não foi possível processar sua solicitação. Tente novamente mais tarde.";
      if (axios.isAxiosError(error) && error.response?.data) {
        errorMessage = error.response.data.mensagem || error.response.data.erro || errorMessage;
      } else if (!axios.isAxiosError(error) && error.message) {
      }
      Alert.alert("Erro na Solicitação", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Recuperar Senha</Text>
      <Text style={styles.instructions}>
        Digite seu endereço de e-mail abaixo.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Seu e-mail de cadastro"
        value={email}
        onChangeText={(text) => setEmail(text.toLowerCase())}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        placeholderTextColor="#888"
      />
      <TouchableOpacity style={styles.button} onPress={handleSolicitarReset} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>ENVIAR SOLICITAÇÃO</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} disabled={isLoading}>
        <Text style={styles.backButtonText}>VOLTAR AO LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
}