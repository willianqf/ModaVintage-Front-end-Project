import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#F3F3F3',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#323588',
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  searchInput: { // Novo estilo
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    flexDirection: 'row', // Para alinhar nome e botões
    justifyContent: 'space-between', // Para espaçar nome e botões
    alignItems: 'center', // Para alinhar verticalmente
  },
  itemTextContainer: { // Container para os textos do cliente
    flex: 1, // Para ocupar o espaço disponível
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#545454',
    marginBottom: 3,
  },
  itemDetails: {
    fontSize: 14,
    color: '#777777', // Cor um pouco mais clara para detalhes
  },
  buttonsContainer: { // Container para os botões de ação (Editar, Deletar)
    flexDirection: 'row',
  },
  actionButton: { // Estilo para botões pequenos de Editar/Deletar
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#5DBEDD', // Azul
  },
  deleteButton: {
    backgroundColor: '#FF0000', // Vermelho
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
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
    marginTop: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  }
});