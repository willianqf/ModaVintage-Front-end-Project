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
  statusDisponivel: {
    fontSize: 14,
    color: 'green',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusVendido: {
    fontSize: 14,
    color: '#FF0000',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 10,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
     fontSize: 16,
     color: 'red',
     textAlign: 'center',
     marginBottom: 10,
  },
  retryButton: {
     backgroundColor: '#5DBEDD',
     paddingVertical: 10,
     paddingHorizontal: 20,
     borderRadius: 5,
     marginTop:10,
  },
  retryButtonText: {
     color: '#FFFFFF',
     fontSize: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#545454',
    marginTop: 10,
  },
  emptyDataText: { // <-- ESTILO ADICIONADO AQUI
    fontSize: 16,
    color: '#777777', // Cor um pouco mais suave para mensagens de lista vazia
    textAlign: 'center',
    marginTop: 20, // Espaçamento do topo se a lista estiver vazia
  }
});