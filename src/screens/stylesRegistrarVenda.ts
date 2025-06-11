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
  content: {
    padding: theme.spacing.md,
  },

  // --- Seções e Rótulos ---
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  
  // --- Botões e Entradas ---
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  pickerButtonTextPlaceholder: {
    color: theme.colors.placeholder,
  },
  readOnlyInput: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    fontSize: 16,
    color: theme.colors.text,
    elevation: 2,
  },

  // --- Itens da Venda (Carrinho) ---
  cartHeader: { // CORRIGIDO
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  addItemButton: { // CORRIGIDO
    backgroundColor: `${theme.colors.primary}20`,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addItemButtonText: { // CORRIGIDO
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginLeft: theme.spacing.xs,
  },
  cartListContainer: { // CORRIGIDO
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  itemIconContainer: {
    width: 45,
    height: 45,
    backgroundColor: `${theme.colors.primary}20`,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDetails: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
  itemTotal: { // CORRIGIDO
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  itemActions: {
    flexDirection: 'row',
    marginLeft: theme.spacing.sm,
  },
  iconButton: {
    padding: 5,
    marginLeft: 5,
  },
  emptyCart: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyCartText: {
    marginTop: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.placeholder,
  },
  
  // --- Rodapé ---
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
    backgroundColor: theme.colors.surface,
    elevation: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  confirmButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: 15,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: theme.spacing.sm,
    padding: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.colors.error,
    fontWeight: 'bold',
  },
  
  // --- Modal Geral ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '90%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  modalSearchInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: 12,
    fontSize: 16,
    marginBottom: theme.spacing.sm,
  },
  modalListItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  modalListItemText: {
    fontSize: 16,
  },
  modalCloseButton: {
    backgroundColor: `${theme.colors.error}20`,
    marginTop: theme.spacing.md,
    padding: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.error,
  },

  // --- Modal de Quantidade ---
  quantityModalView: { // CORRIGIDO
    width: '90%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  quantityModalTitle: { // CORRIGIDO
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityModalSubtitle: { // CORRIGIDO
    textAlign: 'center',
    fontSize: 16,
    color: theme.colors.placeholder,
    marginBottom: 20,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  quantityInput: {
    borderBottomWidth: 2,
    borderColor: theme.colors.primary,
    width: 80,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
});