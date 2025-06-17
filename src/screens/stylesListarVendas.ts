import { StyleSheet } from 'react-native';
import { theme } from '../global/themes';

export const styles = StyleSheet.create({
  // --- Layout e Cabeçalho ---
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: 40,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.surface,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  
  // --- Área de Filtros ---
  filtersContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.placeholder}40`,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  filterButtonText: {
    marginLeft: theme.spacing.xs,
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  applyFilterButton: {
    flex: 2, // Botão de aplicar maior
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  applyFilterButtonText: {
    color: theme.colors.surface,
    fontWeight: 'bold',
  },
  clearFilterButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.placeholder,
    padding: 10,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  clearFilterButtonText: {
    color: theme.colors.placeholder,
    fontWeight: 'bold',
  },

  // --- Card de Venda ---
  itemContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    padding: theme.spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  saleId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  saleDate: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  itemDetailText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  totalSale: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'right',
    marginTop: theme.spacing.md,
  },
  actionsContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    alignItems: 'flex-end',
  },
  cancelSaleButton: {
    backgroundColor: `${theme.colors.error}20`,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.sm,
  },
  cancelSaleButtonText: {
    color: theme.colors.error,
    fontWeight: 'bold',
    fontSize: 12,
  },
  
  // --- Estados da Lista (Loading, Erro, Vazio) ---
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.placeholder,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyDataText: {
    textAlign: 'center',
    color: theme.colors.placeholder,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    padding: 12,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.colors.surface,
    fontWeight: 'bold',
  },

  // --- Estilos do Modal de Seleção ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  modalSearchInput: {
    backgroundColor: theme.colors.background,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    fontSize: 16,
    marginBottom: theme.spacing.sm,
  },
  modalListItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  modalListItemText: {
    fontSize: 16,
  },
  modalCloseButton: {
    backgroundColor: theme.colors.background,
    marginTop: theme.spacing.md,
    padding: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
});