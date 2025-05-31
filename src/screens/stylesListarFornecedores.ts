import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#F3F3F3',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#323588',
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  searchInput: {
    height: 45,
    borderColor: '#D0D0D0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  listContentContainer: {
     paddingHorizontal: 15,
     paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#545454', 
    marginBottom: 5,
  },
  itemDetails: {
    fontSize: 14,
    color: '#545454', 
    marginBottom: 3,
  },
  deleteButton: {
    backgroundColor: '#FF6347', // Cor tomate para deletar
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  // ADICIONAR ESTES ESTILOS ABAIXO:
  deleteButtonText: { 
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: { // Você já tem este, mas certifique-se que está correto
     fontSize: 16,
     color: 'red',
     textAlign: 'center',
     marginBottom: 10,
  },
  retryButton: { // Você já tem este
     backgroundColor: '#5DBEDD',
     paddingVertical: 10,
     paddingHorizontal: 20,
     borderRadius: 5,
     marginTop:10,
  },
  retryButtonText: { // Você já tem este
     color: '#FFFFFF',
     fontSize: 16,
  },
  loadingText: { // ADICIONAR ESTE
    fontSize: 16,
    color: '#545454', // Pode ajustar a cor se desejar
    marginTop: 10,
    textAlign: 'center', // Adicionado para centralizar com o ActivityIndicator
  },
  emptyDataText: { // ADICIONAR ESTE
    fontSize: 16,
    color: '#777777',
    textAlign: 'center',
    marginTop: 20,
  }
  // Certifique-se de que a vírgula final está correta se adicionar mais estilos depois
});