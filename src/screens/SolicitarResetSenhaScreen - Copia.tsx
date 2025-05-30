import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { styles } from './stylesSolicitarReset'; // Seus estilos existentes
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Ajuste o caminho se necessário

const API_BASE_URL = 'http://192.168.1.5:8080'; // Sua API base

type SolicitarResetNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SolicitarResetSenha'>;

export default function SolicitarResetSenhaScreen() {
  const navigation = useNavigation<SolicitarResetNavigationProp>();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSolicitarReset = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert("Email Inválido", "Por favor, insira um endereço de email válido.");
      return;
    }
    setIsLoading(true);
    try {
      // A API agora retorna apenas uma mensagem genérica
      const response = await axios.post(`${API_BASE_URL}/auth/solicitar-reset-senha`, { email });

      Alert.alert(
        "Solicitação Enviada",
        response.data?.mensagem || "Se um email correspondente for encontrado, instruções e um código de recuperação serão enviados.",
        [
            { text: "OK", onPress: () => {
                // Navega para a tela de resetar senha, passando apenas o email (opcional)
                // O usuário precisará obter o token do "email" (console/Mailtrap)
                navigation.navigate('ResetarSenha', { email: email });
            }}
        ]
      );

    } catch (error: any) {
      console.error("Erro ao solicitar reset:", JSON.stringify(error.response?.data || error.message));
      // O backend já retorna uma mensagem genérica em caso de erro também, para não vazar info de email
      let errorMessage = "Não foi possível processar sua solicitação. Tente novamente.";
      if (axios.isAxiosError(error) && error.response?.data) {
        errorMessage = error.response.data.mensagem || error.response.data.erro || errorMessage;
      } else if (error.message) {
        // Não expor error.message diretamente se puder vazar info
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
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
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