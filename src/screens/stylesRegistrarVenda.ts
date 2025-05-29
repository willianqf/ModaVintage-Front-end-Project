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
    padding: 10,
    marginBottom: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemListaTexto: {
    fontSize: 15,
    flex: 1,
  },
  itemRemoverButton: {
    paddingLeft: 10,
  },
  itemRemoverTexto: {
    color: 'red',
    fontWeight: 'bold',
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
  centeredView: { // Para Modais
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
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
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold"
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  modalItemText: {
    fontSize: 16,
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    width: 60,
    textAlign: 'center',
    marginHorizontal: 10,
    borderRadius: 5,
  },
  confirmAddItemButton: {
    backgroundColor: '#5DBEDD',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  confirmAddItemButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  }
});