import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: '#f3f3f3', // Cor de fundo do Figma
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#323588', // Cor do título do Figma
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    backgroundColor: '#e0e0e0', // Cor de input do Figma
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#5DBEDD', // Cor de botão ADICIONAR do Figma
    paddingVertical: 15,
    borderRadius: 20, // Figma parece ter bordas mais arredondadas
    alignItems: 'center',
    marginBottom: 10,
    minHeight: 48,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#F8E0E0', // Cor de botão CANCELAR do Figma
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#545454', // Cor do texto do Figma para cancelar
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Estilo para um placeholder de "Adicionar foto"
  imagePickerButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: 16,
    color: '#555',
  },
  // Adicione mais estilos conforme necessário (ex: para o checkbox de foto)
});