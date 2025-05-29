import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // ... (seus estilos container, centered, headerTitle, itemContainer, itemName, etc.) ...
  container: { // Ajuste o container para não ter padding horizontal se o FlatList tiver
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
    paddingHorizontal: 15, // Adicionado para não cortar o título
  },
  listContentContainer: {
     paddingHorizontal: 15,
     paddingBottom: 20, // Espaço no final da lista
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
    marginBottom: 8, // Espaço antes do botão deletar
  },
  statusVendido: {
    fontSize: 14,
    color: '#FF0000',
    fontWeight: 'bold',
    marginBottom: 8, // Espaço antes do botão deletar
  },
  deleteButton: { // Novo estilo para o botão deletar
    backgroundColor: '#FF0000', // Cor vermelha para deletar (Figma)
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start', // Ou 'center', 'flex-end' dependendo de onde quer
    marginTop: 10,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: { // Novo estilo para o texto do botão deletar
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
  searchInput: { // Novo estilo para a barra de pesquisa
    height: 45,
    borderColor: '#D0D0D0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginHorizontal: 15, // Para alinhar com o padding da lista
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  }
});