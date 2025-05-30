import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: '#f3f3f3',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#323588',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#545454',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    width: '100%', // Adicionado para garantir largura total quando necessário
  },
  pickerButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#555',
  },
  itemListaVenda: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12, // Ajustado padding
    marginBottom: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTextoContainer: { // Novo container para textos do item, para melhor layout com botões
    flex: 1, // Permite que o texto ocupe o espaço disponível
    marginRight: 5, // Espaço antes dos botões
  },
  itemListaTexto: {
    fontSize: 15,
  },
  itemSubDetalhes: { // Novo estilo para sub-detalhes como preço/subtotal
    fontSize: 12,
    color: 'gray',
  },
  itemActionsContainer: { // Novo container para botões de ação do item
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemEditarQtdButton: {
    paddingHorizontal: 8, // Ajustado
    paddingVertical: 6,   // Ajustado
    backgroundColor: '#a0d8ef',
    borderRadius: 5,
    marginRight: 8,
  },
  itemEditarQtdButtonTexto: {
    color: '#323588',
    fontSize: 12, // Um pouco menor para caber bem
    fontWeight: 'bold',
  },
  itemRemoverButton: {
    paddingHorizontal: 8, // Ajustado para ser um botão mais claro
    paddingVertical: 5,   // Ajustado
  },
  itemRemoverTexto: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 15,
    marginBottom: 20,
    color: '#323588',
  },
  button: {
    backgroundColor: '#5DBEDD',
    paddingVertical: 15,
    borderRadius: 20,
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
    backgroundColor: '#F8E0E0',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#545454',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Estilos para Modais (reutilizados e novos)
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.5)', // Fundo semi-transparente
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25, // Aumentado um pouco o padding
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '85%', // Aumentado um pouco
  },
  modalTitle: {
    marginBottom: 20, // Aumentado
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: '#323588',
  },
  modalSearchInput: { // Estilo para input de pesquisa dentro do modal
    height: 45,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  modalItem: {
    paddingVertical: 12, // Aumentado
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalButtonContainer: { // Container para botões no rodapé do modal
    marginTop: 20,
    width: '100%',
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15, // Aumentado
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 12, // Aumentado
    width: 70, // Aumentado
    textAlign: 'center',
    marginHorizontal: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  confirmAddItemButton: {
    backgroundColor: '#5DBEDD',
    paddingVertical: 12, // Ajustado
    paddingHorizontal: 20,
    borderRadius: 8, // Ajustado
    marginTop: 10,
    alignItems: 'center',
  },
  confirmAddItemButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  infoText: { // Para o modal de edição de quantidade
    fontSize: 16, // Aumentado
    color: '#545454',
    marginBottom: 8, // Reduzido
    textAlign: 'center',
  }
});