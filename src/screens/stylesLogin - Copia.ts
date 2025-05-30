import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
    color: '#8B0000', // Exemplo, use sua cor #323588 se preferir
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
    backgroundColor: '#5ac6f0', // Sua cor #5DBEDD
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 20,
    marginBottom: 10,
    alignItems: 'center', // Para centralizar o ActivityIndicator
    justifyContent: 'center', // Para centralizar o ActivityIndicator
    minHeight: 48, // Altura mínima para o botão
  },
  buttonDisabled: {
    backgroundColor: '#a0d8ef',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  recoverButton: {
    backgroundColor: '#f7b5b5', // Sua cor #F8E0E0
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  recoverText: {
    color: '#fff',
    fontSize: 16,
  },
});