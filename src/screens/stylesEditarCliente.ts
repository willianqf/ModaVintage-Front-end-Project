import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: '#f3f3f3', // Cor de fundo
  },
  loadingContainer: { // Para o loading inicial
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#323588', // Cor do título
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    backgroundColor: '#e0e0e0', // Cor de input
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#5DBEDD', // Cor do botão principal
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
    minHeight: 48, // Para acomodar o ActivityIndicator
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#F8E0E0', // Cor do botão cancelar
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#545454', // Cor do texto do cancelar
    fontSize: 18,
    fontWeight: 'bold',
  },
});