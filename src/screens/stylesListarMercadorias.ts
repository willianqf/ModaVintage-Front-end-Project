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
  
  // --- ESTILOS DO ITEM DA LISTA MODIFICADOS ---
  itemContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    flexDirection: 'row', // Alinha imagem e detalhes horizontalmente
    alignItems: 'center', // Centraliza verticalmente
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  detailsContainer: {
    flex: 1, // Faz com que o container de detalhes ocupe o espaço restante
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
  },
  statusVendido: {
    fontSize: 14,
    color: '#FF0000',
    fontWeight: 'bold',
  },

  // --- BOTÃO DE DELETAR MODIFICADO ---
  deleteButtonContainer: {
    marginLeft: 10, // Espaço entre os detalhes e o botão
  },
  deleteButton: {
    backgroundColor: '#FF0000',
    padding: 8,
    borderRadius: 20, // Deixa o botão redondo
    justifyContent: 'center',
    alignItems: 'center',
    width: 36, // Tamanho fixo
    height: 36, // Tamanho fixo
  },
  deleteButtonText: { // Este estilo não é mais usado, pois trocamos por um ícone
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // --- ESTILOS DE FEEDBACK (ERRO, LOADING) ---
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
  emptyDataText: {
    fontSize: 16,
    color: '#777777',
    textAlign: 'center',
    marginTop: 20,
  }
});