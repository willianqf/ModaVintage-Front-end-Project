import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image 
        source={require('../../assets/logo.png')} // Coloque sua imagem nessa pasta ou ajuste o caminho
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Nome da Loja */}
      <Text style={styles.title}>Moda Vintage</Text>

      {/* Campo Usuário */}
      <TextInput 
        placeholder="usuário"
        placeholderTextColor="#555"
        style={styles.input}
      />

      {/* Campo Senha */}
      <TextInput 
        placeholder="senha"
        placeholderTextColor="#555"
        secureTextEntry
        style={styles.input}
      />

      {/* Botão Entrar */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      {/* Botão Recuperar Senha */}
      <TouchableOpacity style={styles.recoverButton}>
        <Text style={styles.recoverText}>Recuperar Senha</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#5ac6f0',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 20,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  recoverButton: {
    backgroundColor: '#f7b5b5',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  recoverText: {
    color: '#fff',
    fontSize: 16,
  },
});