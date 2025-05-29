import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60, // Mais espaço no topo
    paddingHorizontal: 20,
    backgroundColor: '#f3f3f3',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#323588',
    textAlign: 'center',
    marginBottom: 30,
  },
  instructions: {
    fontSize: 16,
    color: '#545454',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  input: {
    width: '100%',
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#5DBEDD',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
    minHeight: 48,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#F8E0E0', // Cor diferente para voltar
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
  },
  backButtonText: {
    color: '#545454',
    fontSize: 18,
    fontWeight: 'bold',
  },
});