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
    marginBottom: 20,
    paddingHorizontal: 15,
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  saleId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#545454',
  },
  saleDate: {
    fontSize: 14,
    color: '#777',
  },
  customerName: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#545454',
    marginBottom: 8,
  },
  itemsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginTop: 5,
    marginBottom: 3,
  },
  itemDetailText: {
    fontSize: 14,
    color: '#545454',
    marginLeft: 10, // Para indentar itens da venda
  },
  totalSale: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#323588',
    marginTop: 8,
    textAlign: 'right',
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